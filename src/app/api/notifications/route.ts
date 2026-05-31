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

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: {
        OR: [
          { userId: session.id },
          { userId: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = notifications.map(n => {
      const now = new Date();
      const diffMs = now.getTime() - n.createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeStr = 'just now';
      if (diffDays > 0) timeStr = `${diffDays}d ago`;
      else if (diffHours > 0) timeStr = `${diffHours}h ago`;
      else if (diffMins > 0) timeStr = `${diffMins}m ago`;

      return {
        ...n,
        time: timeStr
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, read } = body;

    if (id) {
      await db.notification.update({
        where: { id },
        data: { read: read ?? true }
      });
    } else {
      // Mark all as read
      await db.notification.updateMany({
        where: {
          OR: [
            { userId: session.id },
            { userId: null }
          ],
          read: false
        },
        data: { read: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Notification Error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
