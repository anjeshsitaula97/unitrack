import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity, getActorName } from "@/lib/activity";
import { getSession, checkPermission } from "@/lib/api-utils";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkPermission(session, "hr:update");
    if (deniedDELETE) return deniedDELETE;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.attendance.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
    }

    await db.attendance.delete({ where: { id: Number(id) } });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted attendance",
      target: String(existing.userId),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete Attendance Error:", error);
    return NextResponse.json({ error: "Failed to delete attendance record" }, { status: 500 });
  }
}
