import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity, getActorName } from "@/lib/activity";
import { deleteStoredFile } from "@/lib/upload-security";
import { checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, { url: "/api/files/folders", method: "GET" });
    if (deniedGET) return deniedGET;
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [folders, students] = await Promise.all([
      db.fileFolder.findMany({
        where: { userId: session.id },
        include: { _count: { select: { files: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      db.student.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { documents: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const studentFolders = students.map((s) => ({
      id: `student_${s.id}`,
      name: s.name,
      userId: session.id,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      _count: { files: s._count.documents },
      __studentId: s.id,
    }));

    return NextResponse.json([...folders, ...studentFolders]);
  } catch (error) {
    logError("Error fetching folders:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/files/folders", method: "POST" });
    if (deniedPOST) return deniedPOST;
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folder = await db.fileFolder.create({
      data: {
        name: name.trim(),
        userId: session.id,
      },
      include: { _count: { select: { files: true } } },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a folder",
      target: folder.name,
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    logError("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, {
      url: "/api/files/folders",
      method: "DELETE",
    });
    if (deniedDELETE) return deniedDELETE;
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing folder ID" }, { status: 400 });
    }

    const folder = await db.fileFolder.findUnique({ where: { id: Number(id) } });
    if (!folder || folder.userId !== session.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Collect the stored paths first: deleting the folder cascades its file rows
    // away, after which there is nothing left to tell us what to clean up.
    const files = await db.fileItem.findMany({
      where: { folderId: Number(id) },
      select: { url: true },
    });

    await db.fileFolder.delete({ where: { id: Number(id) } });

    for (const file of files) {
      try {
        deleteStoredFile(file.url);
      } catch (cleanupError) {
        logError("Error removing stored file:", cleanupError);
      }
    }

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a folder",
      target: folder.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
