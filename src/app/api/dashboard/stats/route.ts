import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

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
      db.university.count({ where: { status: { not: "Deleted" } } }),
      db.university.count({
        where: {
          createdAt: { gte: lastMonth },
          status: { not: "Deleted" },
        },
      }),
      db.course.count({ where: { status: { not: "Deleted" } } }),
      db.course.count({
        where: {
          createdAt: { gte: lastMonth },
          status: { not: "Deleted" },
        },
      }),
      db.course.aggregate({
        _sum: { enrolled: true },
        where: { status: { not: "Deleted" } },
      }),
      db.course.count({
        where: { status: "Active" },
      }),
      db.lead.count({ where: { status: { not: "Deleted" } } }),
      db.student.count({ where: { status: { not: "Deleted" } } }),
      db.university.findMany({
        select: { country: true },
        distinct: ["country"],
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
    logError("Dashboard stats", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
