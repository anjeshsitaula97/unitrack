import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/session';
import { logActivity } from '@/lib/activity';

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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, color, permissions } = body;

    const data: any = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (color) data.color = color;
    if (permissions) data.permissions = JSON.stringify(permissions);

    const role = await db.role.update({
      where: { id },
      data,
    });

    await logActivity({
      actorName: session.name,
      action: 'updated role',
      target: role.name,
      targetBy: 'Admin'
    });

    return NextResponse.json({
      ...role,
      permissions: JSON.parse(role.permissions || '[]'),
      userCount: 0
    });
  } catch (error) {
    console.error("Update Role Error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const role = await db.role.findUnique({ where: { id } });
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

    await db.role.delete({ where: { id } });

    await logActivity({
      actorName: session.name,
      action: 'deleted role',
      target: role.name,
      targetBy: 'Admin'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Role Error:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
