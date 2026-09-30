import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity, getActorName } from "@/lib/activity";
import { checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, { url: "/api/documents", method: "GET" });
    if (deniedGET) return deniedGET;
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await db.scannedDocument.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    logError("Fetch documents", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/documents", method: "POST" });
    if (deniedPOST) return deniedPOST;
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, filename, fileSize, dpi } = await req.json();

    if (!url || !filename) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const document = await db.scannedDocument.create({
      data: {
        userId: session.id,
        url,
        filename,
        fileSize: fileSize || 0,
        dpi: dpi || 200,
        pageCount: 1,
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a document",
      target: document.filename,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    logError("Create document", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, { url: "/api/documents", method: "DELETE" });
    if (deniedDELETE) return deniedDELETE;
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    const doc = await db.scannedDocument.findUnique({ where: { id: Number(id) } });
    if (!doc || doc.userId !== session.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.scannedDocument.delete({ where: { id: Number(id) } });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a document",
      target: doc.filename,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete document", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
