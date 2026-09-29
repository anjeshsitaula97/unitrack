import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyAuth } from "@/lib/session";
import { readUploadedFile, writeUploadedBuffer, UploadError } from "@/lib/upload-security";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

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

    const uploaded = await readUploadedFile(file, MAX_FILE_SIZE);
    const academicDocumentId = formData.get("academicDocumentId") as string | null;

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
      const stored = writeUploadedBuffer(uploaded.buffer, uploaded.ext);
      const url = stored.fileUrl;

      const document = await db.studentDocument.create({
        data: {
          studentId: Number(studentId),
          name: displayName,
          url,
          fileSize: file.size,
          fileType: uploaded.mime,
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
    const stored = writeUploadedBuffer(uploaded.buffer, uploaded.ext);
    const url = stored.fileUrl;

    const fileItem = await db.fileItem.create({
      data: {
        name: displayName,
        url,
        fileSize: file.size,
        fileType: uploaded.mime,
        folderId: Number(folderId),
        userId: session.id,
        academicDocumentId: academicDocumentIdNum,
      },
    });

    return NextResponse.json(fileItem, { status: 201 });
  } catch (error) {
    logError("Error uploading file:", error);
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
