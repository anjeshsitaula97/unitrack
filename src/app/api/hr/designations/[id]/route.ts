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

    const existing = await db.designation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Designation not found" }, { status: 404 });
    }

    const desig = await db.designation.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });
    return NextResponse.json(desig);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "A designation with this title already exists" }, { status: 400 });
    }
    console.error("Update Designation Error:", error);
    return NextResponse.json({ error: "Failed to update designation" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.designation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Designation not found" }, { status: 404 });
    }

    await db.designation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Designation Error:", error);
    return NextResponse.json({ error: "Failed to delete designation" }, { status: 500 });
  }
}
