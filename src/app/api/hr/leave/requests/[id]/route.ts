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

    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'Approved' or 'Rejected'" },
        { status: 400 }
      );
    }

    const existing = await db.leaveRequest.findUnique({
      where: { id: Number(id) },
      include: { leaveType: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    if (existing.status !== "Pending") {
      return NextResponse.json({ error: "Leave request already processed" }, { status: 400 });
    }

    const leaveRequest = await db.leaveRequest.update({
      where: { id: Number(id) },
      data: {
        status,
        approvedBy: session.id,
        notes: notes || null,
      },
      include: {
        user: { select: { id: true, name: true } },
        leaveType: { select: { id: true, name: true, daysPerYear: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a leave request",
      target: leaveRequest.user?.name || String(existing.id),
      changes: diffChanges(existing, leaveRequest, ["user", "leaveType", "approver"]),
    });

    if (status === "Approved") {
      const year = existing.startDate.getFullYear();
      const diffTime = Math.abs(existing.endDate.getTime() - existing.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const balance = await db.leaveBalance.findUnique({
        where: {
          userId_leaveTypeId_year: {
            userId: existing.userId,
            leaveTypeId: existing.leaveTypeId,
            year,
          },
        },
      });

      if (balance) {
        await db.leaveBalance.update({
          where: { id: balance.id },
          data: { usedDays: balance.usedDays + diffDays },
        });
      }
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    logError("Update Leave Request Error:", error);
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 });
  }
}
