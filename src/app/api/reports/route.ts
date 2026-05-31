import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const start = searchParams.get('startDate');
    const end = searchParams.get('endDate');

    // Build the Prisma 'where' clause for createdAt filtering
    const dateFilter: any = {};
    if (start || end) {
      dateFilter.createdAt = {};
      if (start) dateFilter.createdAt.gte = new Date(start);
      // Set end date boundary to the end of the day or exact match
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = endDate;
      }
    }

    let data;

    switch (type) {
      case 'universities':
        data = await db.university.findMany({
          where: dateFilter,
          orderBy: { createdAt: 'desc' }
        });
        break;
      case 'courses':
        data = await db.course.findMany({
          where: dateFilter,
          include: { university: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        });
        // Flatten for excel
        data = data.map((c: any) => ({
          ...c,
          universityName: c.university?.name || 'Unknown',
          prerequisites: undefined, // removing raw JSON from report
          university: undefined,
        }));
        break;
      case 'users':
        data = await db.user.findMany({
          where: dateFilter,
          orderBy: { createdAt: 'desc' }
        });
        break;
      case 'applications':
        data = await db.application.findMany({
          where: {
            appliedDate: dateFilter.createdAt
          },
          include: {
            student: { select: { name: true, email: true } },
            university: { select: { name: true } },
            course: { select: { name: true } }
          },
          orderBy: { appliedDate: 'desc' }
        });
        data = data.map((a: any) => ({
          'Application ID': a.id,
          'Student Name': a.student?.name || 'N/A',
          'Student Email': a.student?.email || 'N/A',
          'University': a.university?.name || 'N/A',
          'Course': a.course?.name || 'N/A',
          'Status': a.status,
          'Date Applied': a.appliedDate,
        }));
        break;
      case 'payments':
        data = await db.payment.findMany({
          where: {
            date: dateFilter.createdAt
          },
          include: {
            student: { select: { name: true, email: true } }
          },
          orderBy: { date: 'desc' }
        });
        data = data.map((p: any) => ({
          'Payment ID': p.id,
          'Student Name': p.student?.name || 'N/A',
          'Student Email': p.student?.email || 'N/A',
          'Amount': p.amount,
          'Currency': p.currency,
          'Method': p.method,
          'Status': p.status,
          'Transaction Date': p.date,
          'Description': p.description,
          'Proof Link': p.proofUrl || 'No attachment'
        }));
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
