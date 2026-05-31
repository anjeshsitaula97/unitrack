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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const payroll = await db.payroll.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, employeeId: true,
            basicSalary: true, bankName: true, bankAccount: true, panNumber: true,
            department: { select: { name: true } },
            designation: { select: { title: true } },
          },
        },
        items: true,
      },
    });

    if (!payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 });
    }
    return NextResponse.json(payroll);
  } catch (error) {
    console.error("Fetch Payroll Error:", error);
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
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

    const existing = await db.payroll.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 });
    }

    if (body.status === 'Paid') {
      const data: any = { status: 'Paid', paidAt: new Date() };
      if (body.paymentMethod) data.paymentMethod = body.paymentMethod;
      if (body.notes !== undefined) data.notes = body.notes;

      const payroll = await db.payroll.update({
        where: { id },
        data,
        include: { user: { select: { id: true, name: true, employeeId: true } }, items: true },
      });
      return NextResponse.json(payroll);
    }

    if (body.status === 'Approved') {
      const payroll = await db.payroll.update({
        where: { id },
        data: { status: 'Approved' },
        include: { user: { select: { id: true, name: true, employeeId: true } }, items: true },
      });
      return NextResponse.json(payroll);
    }

    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  } catch (error) {
    console.error("Update Payroll Error:", error);
    return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 });
  }
}
