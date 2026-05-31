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

    const payments = await db.payment.findMany({
      where,
      include: {
        student: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { studentId, amount, currency, status, method, date, description, proofUrl } = data;

    if (!studentId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newPayment, user] = await Promise.all([
      db.payment.create({
        data: {
          studentId,
          amount: parseFloat(amount),
          currency: currency || 'NPR',
          status: status || 'Pending',
          method: method || 'Cash',
          date: date ? new Date(date) : new Date(),
          description: description || '',
          proofUrl: proofUrl || null
        },
        include: {
          student: true
        }
      }),
      db.user.findUnique({ where: { id: session.id as string } })
    ]);
    await logActivity({
      actorName: user?.name || 'System',
      action: 'recorded a payment',
      target: `${newPayment.currency} ${newPayment.amount} for ${newPayment.student.firstName} ${newPayment.student.lastName}`,
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('Failed to record payment:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
