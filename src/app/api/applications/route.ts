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
    const studentId = searchParams.get('studentId');

    const where: any = {};
    if (studentId) {
      where.studentId = studentId;
    }

    const applications = await db.application.findMany({
      where,
      include: {
        student: {
          select: { firstName: true, lastName: true, email: true }
        },
        university: {
          select: { name: true, country: true }
        },
        course: {
          select: { name: true, level: true }
        }
      },
      orderBy: { appliedDate: 'desc' }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { studentId, universityId, courseId } = data;

    if (!studentId || !universityId || !courseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newApplication, user] = await Promise.all([
      db.application.create({
        data: {
          studentId,
          universityId,
          courseId,
          status: 'Submitted'
        },
        include: {
          student: true,
          course: true
        }
      }),
      db.user.findUnique({ where: { id: session.id as string } })
    ]);
    await logActivity({
      actorName: user?.name || 'System',
      action: 'created an application',
      target: `${newApplication.student.firstName} ${newApplication.student.lastName} for ${newApplication.course.name}`,
    });

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
