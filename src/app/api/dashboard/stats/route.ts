import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const [
      totalUniversities,
      universitiesLastMonth,
      totalCourses,
      coursesLastMonth,
      enrollmentResult,
      activeCourses,
      totalLeads,
      totalStudents,
      universities,
      totalApplications,
      totalTasks,
    ] = await Promise.all([
      db.university.count(),
      db.university.count({
        where: {
          createdAt: { gte: lastMonth },
        },
      }),
      db.course.count(),
      db.course.count({
        where: {
          createdAt: { gte: lastMonth },
        },
      }),
      db.course.aggregate({
        _sum: { enrolled: true },
      }),
      db.course.count({
        where: { status: 'Active' },
      }),
      db.lead.count(),
      db.student.count(),
      db.university.findMany({
        select: { country: true },
        distinct: ['country'],
      }),
      db.application.count(),
      db.task.count(),
    ]);

    const totalEnrolled = enrollmentResult._sum.enrolled || 0;
    const countriesCount = universities.length;

    return NextResponse.json({
      totalUniversities,
      universitiesLastMonth,
      totalCourses,
      coursesLastMonth,
      totalEnrolled,
      activeCourses,
      countriesCount,
      totalLeads,
      totalStudents,
      totalApplications,
      totalTasks,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
