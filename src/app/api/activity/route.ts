import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/session';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch (err) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const activities = await db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const formatted = activities.map(act => {
      const now = new Date();
      const diffMs = now.getTime() - act.createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeStr = 'just now';
      if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      else if (diffHours > 0) timeStr = `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
      else if (diffMins > 0) timeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

      return {
        id: act.id,
        actor: act.actorName,
        actorInitials: act.actorInitials,
        actorColor: act.actorColor,
        action: act.action,
        target: act.target,
        targetBy: act.targetBy,
        time: timeStr,
        createdAt: act.createdAt,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch Activities Error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
