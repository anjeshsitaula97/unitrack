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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: "Status must be 'Approved' or 'Rejected'" }, { status: 400 });
    }

    const existing = await db.leaveRequest.findUnique({
      where: { id },
      include: { leaveType: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    if (existing.status !== 'Pending') {
      return NextResponse.json({ error: "Leave request already processed" }, { status: 400 });
    }

    const leaveRequest = await db.leaveRequest.update({
      where: { id },
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

    if (status === 'Approved') {
      const year = existing.startDate.getFullYear();
      const diffTime = Math.abs(existing.endDate.getTime() - existing.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const balance = await db.leaveBalance.findUnique({
        where: { userId_leaveTypeId_year: { userId: existing.userId, leaveTypeId: existing.leaveTypeId, year } },
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
    console.error("Update Leave Request Error:", error);
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 });
  }
}
