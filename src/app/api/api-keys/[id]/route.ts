import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";
import { logError } from "@/lib/logger";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkPermission(session, "admin:access");
    if (deniedDELETE) return deniedDELETE;
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.apiKey.findUnique({ where: { id: Number(id) } });

    await db.apiKey.delete({
      where: { id: Number(id) },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted an API key",
      target: existing?.name || id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete API Key", error);
    return NextResponse.json({ error: "Failed to delete API Key" }, { status: 500 });
  }
}
