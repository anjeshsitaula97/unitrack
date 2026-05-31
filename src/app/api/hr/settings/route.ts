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

    const settings = await db.systemSettings.findUnique({ where: { id: 'system-config' } });

    return NextResponse.json({
      officeLatitude: settings?.officeLatitude ?? null,
      officeLongitude: settings?.officeLongitude ?? null,
      officeRadius: settings?.officeRadius ?? 100,
    });
  } catch (error) {
    console.error("Fetch Office Settings Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    await db.systemSettings.upsert({
      where: { id: 'system-config' },
      update: {
        officeLatitude: body.officeLatitude != null ? parseFloat(body.officeLatitude) : null,
        officeLongitude: body.officeLongitude != null ? parseFloat(body.officeLongitude) : null,
        officeRadius: body.officeRadius != null ? parseFloat(body.officeRadius) : 100,
      },
      create: {
        id: 'system-config',
        officeLatitude: body.officeLatitude != null ? parseFloat(body.officeLatitude) : null,
        officeLongitude: body.officeLongitude != null ? parseFloat(body.officeLongitude) : null,
        officeRadius: body.officeRadius != null ? parseFloat(body.officeRadius) : 100,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Office Settings Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
