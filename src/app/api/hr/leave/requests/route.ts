import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/session';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try { return await verifyAuth(token); } catch { return null; }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;
    if (session.role !== 'Admin') where.userId = session.id;

    const requests = await db.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true, avatar: true } },
        leaveType: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Fetch Leave Requests Error:", error);
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { leaveTypeId, startDate, endDate, reason } = body;

    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const leaveRequest = await db.leaveRequest.create({
      data: {
        userId: session.id,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
      include: {
        user: { select: { id: true, name: true } },
        leaveType: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("Create Leave Request Error:", error);
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}
