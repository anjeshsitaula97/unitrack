import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity, getActorName } from "@/lib/activity";
import { deleteStoredFile } from "@/lib/upload-security";
import { checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, { url: "/api/files", method: "GET" });
    if (deniedGET) return deniedGET;
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      return NextResponse.json({ error: "Missing folderId parameter" }, { status: 400 });
    }

    const folder = await db.fileFolder.findUnique({ where: { id: Number(folderId) } });
    if (!folder || folder.userId !== session.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const files = await db.fileItem.findMany({
      where: { folderId: Number(folderId) },
      include: {
        academicDocument: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    logError("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, { url: "/api/files", method: "DELETE" });
    if (deniedDELETE) return deniedDELETE;
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    const file = await db.fileItem.findUnique({ where: { id: Number(id) } });
    if (!file || file.userId !== session.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.fileItem.delete({ where: { id: Number(id) } });

    // Drop the stored blob as well, otherwise deleting the row just leaves the
    // file orphaned on disk forever. The row is already gone at this point, so a
    // failure here must not turn a successful delete into an error.
    try {
      deleteStoredFile(file.url);
    } catch (cleanupError) {
      logError("Error removing stored file:", cleanupError);
    }

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a file",
      target: file.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
