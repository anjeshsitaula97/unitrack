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

function toRad(deg: number) {
  return deg * (Math.PI / 180);
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function validateLocation(lat: number, lng: number, userId?: string) {
  let refLat: number | null = null;
  let refLng: number | null = null;
  let radius = 100;

  // Check user's branch first
  if (userId) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { branch: { select: { latitude: true, longitude: true } } },
    });
    if (user?.branch?.latitude && user?.branch?.longitude) {
      refLat = user.branch.latitude;
      refLng = user.branch.longitude;
    }
  }

  // Fall back to main office location
  if (refLat == null) {
    const settings = await db.systemSettings.findUnique({ where: { id: 'system-config' } });
    refLat = settings?.officeLatitude ?? null;
    refLng = settings?.officeLongitude ?? null;
    radius = settings?.officeRadius || 100;
  }

  if (refLat == null || refLng == null) {
    return { valid: true, distance: 0 };
  }

  const distance = haversineDistance(lat, lng, refLat, refLng);
  return { valid: distance <= radius, distance: Math.round(distance), radius };
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'date';
    const order = searchParams.get('order') || 'desc';

    const where: any = {};

    if (date) {
      const [y, m, d] = date.split('-').map(Number);
      const start = new Date(Date.UTC(y, m - 1, d));
      const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
      where.date = { gte: start, lte: end };
    } else if (fromDate || toDate) {
      where.date = {};
      if (fromDate) {
        const [y, m, d] = fromDate.split('-').map(Number);
        where.date.gte = new Date(Date.UTC(y, m - 1, d));
      }
      if (toDate) {
        const [y, m, d] = toDate.split('-').map(Number);
        where.date.lte = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
      }
    }

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { employeeId: { contains: search } },
        ],
      };
    }

    const orderBy: any = {};
    const sortField = sort === 'checkIn' || sort === 'checkOut' ? sort : 'date';
    orderBy[sortField] = order;

    const records = await db.attendance.findMany({
      where,
      orderBy,
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true, avatar: true } },
      },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("Fetch Attendance Error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    if (body.action === 'checkin') {
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      const existing = await db.attendance.findUnique({
        where: { userId_date: { userId: session.id, date: today } },
      });

      if (existing) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
      }

      if (!body.photo) {
        return NextResponse.json({ error: 'Photo is required for check-in' }, { status: 400 });
      }
      if (body.latitude == null || body.longitude == null) {
        return NextResponse.json({ error: 'Location is required for check-in' }, { status: 400 });
      }

      const loc = await validateLocation(body.latitude, body.longitude, session.id);
      if (!loc.valid) {
        return NextResponse.json({
          error: `You are ${loc.distance}m away from the office. Please check in from the office location (max ${loc.radius}m).`
        }, { status: 403 });
      }

      const record = await db.attendance.create({
        data: {
          userId: session.id,
          date: today,
          checkIn: new Date(),
          status: 'Present',
          checkInPhoto: body.photo,
          checkInLat: body.latitude,
          checkInLng: body.longitude,
        },
      });
      return NextResponse.json(record);
    }

    if (body.action === 'checkout') {
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      const existing = await db.attendance.findUnique({
        where: { userId_date: { userId: session.id, date: today } },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Not checked in today' }, { status: 400 });
      }

      if (existing.checkOut) {
        return NextResponse.json({ error: 'Already checked out today' }, { status: 400 });
      }

      if (!body.photo) {
        return NextResponse.json({ error: 'Photo is required for check-out' }, { status: 400 });
      }
      if (body.latitude == null || body.longitude == null) {
        return NextResponse.json({ error: 'Location is required for check-out' }, { status: 400 });
      }

      const loc = await validateLocation(body.latitude, body.longitude, session.id);
      if (!loc.valid) {
        return NextResponse.json({
          error: `You are ${loc.distance}m away from the office. Please check out from the office location (max ${loc.radius}m).`
        }, { status: 403 });
      }

      const record = await db.attendance.update({
        where: { id: existing.id },
        data: {
          checkOut: new Date(),
          checkOutPhoto: body.photo,
          checkOutLat: body.latitude,
          checkOutLng: body.longitude,
        },
      });
      return NextResponse.json(record);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error("Attendance Action Error:", error);
    return NextResponse.json({ error: "Failed to process attendance" }, { status: 500 });
  }
}
