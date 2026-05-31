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
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const records = await db.attendance.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true } },
      },
      orderBy: [{ userId: 'asc' }, { date: 'asc' }],
    });

    const summary: Record<string, { present: number; absent: number; late: number; halfDay: number; total: number; name: string }> = {};

    for (const r of records) {
      if (!summary[r.userId]) {
        summary[r.userId] = { present: 0, absent: 0, late: 0, halfDay: 0, total: 0, name: r.user.name };
      }
      summary[r.userId].total++;
      if (r.status === 'Present') summary[r.userId].present++;
      else if (r.status === 'Absent') summary[r.userId].absent++;
      else if (r.status === 'Late') summary[r.userId].late++;
      else if (r.status === 'Half-Day') summary[r.userId].halfDay++;
    }

    return NextResponse.json({
      summary,
      totalDays: endDate.getDate(),
      month,
      year,
    });
  } catch (error) {
    console.error("Attendance Summary Error:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
