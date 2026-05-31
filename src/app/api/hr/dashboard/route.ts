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

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const [
      totalEmployees,
      departments,
      designations,
      pendingLeaves,
      todayAttendance,
      payrollThisMonth,
    ] = await Promise.all([
      db.user.count({ where: { NOT: { role: 'Admin' } } }),
      db.department.count(),
      db.designation.count(),
      db.leaveRequest.count({ where: { status: 'Pending' } }),
      db.attendance.findMany({
        where: {
          date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), lte: endOfMonth },
        },
        include: { user: { select: { id: true, name: true, avatar: true, employeeId: true } } },
        take: 10,
      }),
      db.payroll.count({ where: { month, year, status: { not: 'Draft' } } }),
    ]);

    const todayPresent = await db.attendance.count({
      where: {
        date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), lte: endOfMonth },
        status: 'Present',
      },
    });

    return NextResponse.json({
      totalEmployees,
      departments,
      designations,
      pendingLeaves,
      todayPresent,
      totalPayrolls: payrollThisMonth,
      recentAttendance: todayAttendance,
    });
  } catch (error) {
    console.error("HR Dashboard Error:", error);
    return NextResponse.json({ error: "Failed to fetch HR dashboard" }, { status: 500 });
  }
}
