import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { getSession, apiError } from "@/lib/api-utils";
import { deleteUploadedFile } from "@/lib/marketing-files";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const material = await db.marketingMaterial.findUnique({
      where: { id: parseInt(id) },
      include: { request: true },
    });

    if (!material) {
      return apiError("Marketing material not found", 404);
    }

    deleteUploadedFile(material.fileUrl);

    await db.marketingMaterial.delete({ where: { id: parseInt(id) } });

    const user = await db.user.findUnique({ where: { id: session.id } });
    await logActivity({
      actorName: user?.name || "System",
      userId: session.id,
      action: "deleted marketing material",
      target: material.fileName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete marketing material", error);
    return apiError("Failed to delete marketing material", 400);
  }
}
