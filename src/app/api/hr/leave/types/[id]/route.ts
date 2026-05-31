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

    const [{ id }, body] = await Promise.all([
      params,
      req.json()
    ]);

    const existing = await db.leaveType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Leave type not found" }, { status: 404 });
    }

    const leaveType = await db.leaveType.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.daysPerYear !== undefined && { daysPerYear: parseInt(body.daysPerYear) }),
      },
    });
    return NextResponse.json(leaveType);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "A leave type with this name already exists" }, { status: 400 });
    }
    console.error("Update Leave Type Error:", error);
    return NextResponse.json({ error: "Failed to update leave type" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.leaveType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Leave Type Error:", error);
    return NextResponse.json({ error: "Failed to delete leave type" }, { status: 500 });
  }
}
