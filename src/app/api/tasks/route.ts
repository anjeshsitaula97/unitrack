import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const visaType = searchParams.get('visaType');

    const where: any = {};
    if (country) where.country = country;
    if (visaType) where.visaType = visaType;

    const tasks = await db.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { title, description, status, priority, dueDate, assignee, country, visaType } = data;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const [newTask, user] = await Promise.all([
      db.task.create({
        data: {
          title,
          description,
          status: status || 'Todo',
          priority: priority || 'Medium',
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId: data.assigneeId || assignee || null,
          country,
          visaType
        }
      }),
      db.user.findUnique({ where: { id: session.id as string } })
    ]);
    await logActivity({
      actorName: user?.name || 'System',
      action: 'created a task',
      target: newTask.title,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);

    const updatedTask = await db.task.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await db.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
