import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import { logError } from "@/lib/logger";
import { runWithConsultancy } from "@/lib/consultancy";

/**
 * Platform-wide metrics for the Super Admin console. Everything is read at the
 * platform scope (`consultancyId: null`) so the numbers are never narrowed by
 * whichever consultancy the operator currently has selected.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);
    if (!isSuperAdminRole(session.role)) {
      return apiError("Forbidden: Super Admin only", 403);
    }

    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [consultancies, userCounts, totals] = await Promise.all([
      db.consultancy.findMany({ orderBy: { createdAt: "desc" } }),
      runWithConsultancy({ consultancyId: null }, () =>
        db.user.groupBy({ by: ["consultancyId"], _count: { _all: true } })
      ),
      runWithConsultancy({ consultancyId: null }, async () => {
        const [students, universities, courses] = await Promise.all([
          db.student.count({ where: { status: { not: "Deleted" } } }),
          db.university.count({ where: { status: { not: "Deleted" } } }),
          db.course.count({ where: { status: { not: "Deleted" } } }),
        ]);
        return { students, universities, courses };
      }),
    ]);

    const countMap = new Map(userCounts.map((row) => [row.consultancyId ?? 0, row._count._all]));
    const totalUsers = userCounts.reduce((sum, row) => sum + row._count._all, 0);

    const enriched = consultancies.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      status: c.status,
      logoUrl: c.logoUrl,
      packageName: c.packageName,
      packageStartDate: c.packageStartDate,
      packageExpiryDate: c.packageExpiryDate,
      maxUsers: c.maxUsers,
      createdAt: c.createdAt,
      userCount: countMap.get(c.id) ?? 0,
    }));

    const active = enriched.filter((c) => c.status === "Active").length;
    const expiringSoon = enriched.filter((c) => {
      if (!c.packageExpiryDate) return false;
      const d = new Date(c.packageExpiryDate);
      return d >= now && d <= soon;
    }).length;

    return NextResponse.json({
      consultancies: {
        total: enriched.length,
        active,
        inactive: enriched.length - active,
        expiringSoon,
      },
      totals: {
        users: totalUsers,
        students: totals.students,
        universities: totals.universities,
        courses: totals.courses,
      },
      recentConsultancies: enriched.slice(0, 5),
    });
  } catch (error) {
    logError("Super Admin console stats", error);
    return apiError("Failed to fetch platform stats");
  }
}
