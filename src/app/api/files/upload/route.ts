import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { verifyAuth } from "@/lib/session";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch {
    return null;
  }
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "untitled"
  );
}

function buildDisplayName(
  baseName: string,
  academicDocName: string | null,
  originalName: string
): string {
  if (academicDocName) {
    return `${baseName} - ${academicDocName}`;
  }
  return originalName;
}

async function writeFileWithName(
  baseDir: string,
  displayName: string,
  fileExtension: string,
  buffer: Buffer
): Promise<string> {
  const safeName = sanitizeFilename(displayName);
  let storedFileName = `${safeName}.${fileExtension}`;
  let filePath = join(baseDir, storedFileName);
  let counter = 1;
  while (true) {
    try {
      await writeFile(filePath, buffer, { flag: "wx" });
      return storedFileName;
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "EEXIST") {
        storedFileName = `${safeName} (${counter}).${fileExtension}`;
        filePath = join(baseDir, storedFileName);
        counter++;
      } else {
        throw err;
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      return NextResponse.json({ error: "Missing folderId parameter" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 20MB." }, { status: 400 });
    }

    const detectedMime = file.type || `application/${file.name.split(".").pop()}`;
    if (!ALLOWED_MIME_TYPES.has(detectedMime)) {
      return NextResponse.json({ error: "File type not allowed." }, { status: 400 });
    }

    const academicDocumentId = formData.get("academicDocumentId") as string | null;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExtension = file.name.split(".").pop() || "bin";
    const uploadsDir = join(process.cwd(), "public", "uploads");

    if (folderId.startsWith("student_")) {
      const studentId = folderId.replace("student_", "");
      const academicDocumentIdNum = academicDocumentId ? Number(academicDocumentId) : null;
      const [student, academicDoc] = await Promise.all([
        db.student.findUnique({ where: { id: Number(studentId) } }),
        academicDocumentIdNum
          ? db.academicDocument.findUnique({ where: { id: academicDocumentIdNum } })
          : Promise.resolve(null),
      ]);
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      const displayName = buildDisplayName(student.name, academicDoc?.name ?? null, file.name);
      const storedFileName = await writeFileWithName(
        uploadsDir,
        displayName,
        fileExtension,
        buffer
      );
      const url = `/uploads/${storedFileName}`;

      const document = await db.studentDocument.create({
        data: {
          studentId: Number(studentId),
          name: displayName,
          url,
          fileSize: file.size,
          fileType: file.type || `application/${fileExtension}`,
          academicDocumentId: academicDocumentIdNum,
        },
        include: { academicDocument: { select: { id: true, name: true } } },
      });

      return NextResponse.json({ ...document, __studentId: studentId }, { status: 201 });
    }

    const academicDocumentIdNum = academicDocumentId ? Number(academicDocumentId) : null;
    const [folder, academicDoc] = await Promise.all([
      db.fileFolder.findUnique({ where: { id: Number(folderId) } }),
      academicDocumentIdNum
        ? db.academicDocument.findUnique({ where: { id: academicDocumentIdNum } })
        : Promise.resolve(null),
    ]);
    if (!folder || folder.userId !== session.id) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const displayName = buildDisplayName(folder.name, academicDoc?.name ?? null, file.name);
    const storedFileName = await writeFileWithName(uploadsDir, displayName, fileExtension, buffer);
    const url = `/uploads/${storedFileName}`;

    const fileItem = await db.fileItem.create({
      data: {
        name: displayName,
        url,
        fileSize: file.size,
        fileType: file.type || `application/${fileExtension}`,
        folderId: Number(folderId),
        userId: session.id,
        academicDocumentId: academicDocumentIdNum,
      },
    });

    return NextResponse.json(fileItem, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
