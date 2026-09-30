import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { getSession, checkPermission } from "@/lib/api-utils";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedPUT = checkPermission(session, "hr:leave");
    if (deniedPUT) return deniedPUT;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ id }, body] = await Promise.all([params, req.json()]);

    const existing = await db.leaveType.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Leave type not found" }, { status: 404 });
    }

    const leaveType = await db.leaveType.update({
      where: { id: Number(id) },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.daysPerYear !== undefined && { daysPerYear: parseInt(body.daysPerYear) }),
      },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a leave type",
      target: existing.name,
      changes: diffChanges(existing, leaveType),
    });
    return NextResponse.json(leaveType);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A leave type with this name already exists" },
        { status: 400 }
      );
    }
    logError("Update Leave Type Error:", error);
    return NextResponse.json({ error: "Failed to update leave type" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkPermission(session, "hr:leave");
    if (deniedDELETE) return deniedDELETE;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.leaveType.findUnique({ where: { id: Number(id) } });

    await db.leaveType.delete({ where: { id: Number(id) } });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a leave type",
      target: existing?.name || id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete Leave Type Error:", error);
    return NextResponse.json({ error: "Failed to delete leave type" }, { status: 500 });
  }
}
