import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await getSession();
    const deniedPATCH = checkPermission(session, "students:update");
    if (deniedPATCH) return deniedPATCH;
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { documentId } = await params;
    const { status } = (await req.json()) as { status?: string };

    if (!status || !["Approved", "Rejected", "In Review"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required (Approved, Rejected, In Review)" },
        { status: 400 }
      );
    }

    const doc = await db.studentDocument.findUnique({ where: { id: Number(documentId) } });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const updated = await db.studentDocument.update({
      where: { id: Number(documentId) },
      data: { status },
    });

    const changes = diffChanges(doc, updated);
    await logActivity({
      actorName: await getActorName(undefined),
      userId: undefined,
      action: "updated a document status",
      target: doc.name,
      changes,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError("Document status update error:", error);
    return NextResponse.json({ error: "Failed to update document status" }, { status: 500 });
  }
}
