import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const data = (await req.json()) as {
      name: string;
      url: string;
      fileSize?: number;
      fileType?: string;
    };

    if (!data.name || !data.url) {
      return NextResponse.json({ error: "Document name and URL are required" }, { status: 400 });
    }

    const document = await db.studentDocument.create({
      data: {
        studentId: Number(id),
        name: data.name,
        url: data.url,
        fileSize: data.fileSize,
        fileType: data.fileType,
        status: "In Review",
      },
    });

    await logActivity({
      actorName: await getActorName(undefined),
      userId: undefined,
      action: "created a document",
      target: data.name,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "Missing documentId parameter" }, { status: 400 });
    }

    const existing = await db.studentDocument.findUnique({
      where: { id: Number(documentId) },
    });

    await db.studentDocument.delete({
      where: { id: Number(documentId) },
    });

    if (existing) {
      await logActivity({
        actorName: await getActorName(undefined),
        userId: undefined,
        action: "deleted a document",
        target: existing.name,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
