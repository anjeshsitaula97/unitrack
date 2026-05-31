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
    const expenses = await db.expense.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const [session, data] = await Promise.all([
      getSession(),
      req.json()
    ]);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { category, amount, currency, date, description, paidTo, method, billNo, transactionNo, screenshot } = data;

    if (!category || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newExpense, user] = await Promise.all([
      db.expense.create({
        data: {
          category,
          amount: parseFloat(amount),
          currency: currency || 'NPR',
          date: date ? new Date(date) : new Date(),
          description,
          paidTo,
          method,
          billNo,
          transactionNo,
          screenshot
        }
      }),
      db.user.findUnique({ where: { id: session.id as string } })
    ]);

    await logActivity({
      actorName: user?.name || 'System',
      action: 'recorded an expense',
      target: `${newExpense.category} - ${newExpense.currency} ${newExpense.amount}`,
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}
