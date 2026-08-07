import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    // 1. Courses per University (Top 8)
    const coursesPerUniversity = await db.university.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: {
        courses: {
          _count: "desc",
        },
      },
      take: 8,
    });

    const cpuData = coursesPerUniversity.map((u, i) => ({
      id: `cpu-${u.id}`,
      university: u.name.length > 10 ? u.name.substring(0, 8) + "..." : u.name,
      courses: u._count.courses,
      color: i < 3 ? "#6366f1" : i < 6 ? "#818cf8" : "#a5b4fc",
    }));

    // 2. Faculty Distribution
    const facultyCounts = await db.course.groupBy({
      by: ["faculty"],
      _count: {
        faculty: true,
      },
    });

    const facultyData = facultyCounts.map((f) => ({
      name: f.faculty,
      value: f._count.faculty,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random but stable enough
    }));

    // 3. Enrollment Trend (Actually "Courses Added Trend")
    // Simplified: group by month of createdAt
    const courses = await db.course.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const trendMap: Record<string, number> = {};
    courses.forEach((c) => {
      const date = new Date(c.createdAt);
      const month = date.toLocaleString("default", { month: "short" });
      trendMap[month] = (trendMap[month] || 0) + 1;
    });

    const trendData = Object.entries(trendMap).map(([month, count]) => ({
      name: month,
      courses: count,
    }));

    return NextResponse.json({
      coursesPerUniversity: cpuData,
      facultyDistribution: facultyData,
      coursesTrend: trendData,
    });
  } catch (error) {
    logError("Dashboard charts", error);
    return NextResponse.json({ error: "Failed to fetch dashboard charts" }, { status: 500 });
  }
}
