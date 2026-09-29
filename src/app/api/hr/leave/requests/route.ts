import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { logActivity, getActorName } from "@/lib/activity";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (!["Admin", "Super Admin"].includes(session.role)) where.userId = session.id;

    const requests = await db.leaveRequest.findMany({
      where: where as Prisma.LeaveRequestWhereInput,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true, avatar: true } },
        leaveType: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(requests);
  } catch (error) {
    logError("Fetch Leave Requests Error:", error);
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { leaveTypeId, startDate, endDate, reason } = body;

    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const leaveRequest = await db.leaveRequest.create({
      data: {
        userId: session.id,
        leaveTypeId: Number(leaveTypeId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
      include: {
        user: { select: { id: true, name: true } },
        leaveType: { select: { id: true, name: true } },
      },
    });
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a leave request",
      target: leaveRequest.user?.name || String(leaveRequest.id),
    });
    return NextResponse.json(leaveRequest);
  } catch (error) {
    logError("Create Leave Request Error:", error);
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}
