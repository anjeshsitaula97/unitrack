import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";

    const courseWhere = query
      ? {
          OR: [
            { name: { contains: query } },
            { university: { name: { contains: query } } },
            { faculty: { contains: query } },
            { instructor: { contains: query } },
            { description: { contains: query } },
          ],
        }
      : {};

    const uniWhere = query
      ? {
          OR: [
            { name: { contains: query } },
            { country: { contains: query } },
            { city: { contains: query } },
          ],
        }
      : {};

    // Courses search
    const courses = await db.course.findMany({
      where: courseWhere,
      include: { university: true },
      take: 20,
    });

    // Universities search
    const universities = await db.university.findMany({
      where: uniWhere,
      take: 10,
    });

    // Aggregated filter options (across all data, independent of query)
    const [allUniversities, allCountries, intakeRecords] = await Promise.all([
      db.university.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
      db.university.findMany({
        select: { country: true },
        distinct: ["country"],
        orderBy: { country: "asc" },
      }),
      db.course.findMany({ where: { intake: { not: null } }, select: { intake: true } }),
    ]);

    const allIntakes = [
      ...new Set(
        intakeRecords.flatMap((r) => {
          const val = r.intake || "";
          if (val.startsWith("["))
            try {
              return JSON.parse(val)
                .map((s: string) => s.trim())
                .filter(Boolean);
            } catch {}
          return val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        })
      ),
    ].sort();

    const transformedCourses = courses.map((c) => ({
      id: c.id,
      universityId: c.universityId,
      name: c.name,
      university: c.university.name,
      category: c.faculty,
      level: c.level,
      credits: c.credits,
      duration: c.duration,
      enrolled: c.enrolled,
      status: c.status,
      startDate: c.startDate ? c.startDate.toISOString() : null,
      color: c.color,
      initials: c.initials,
      instructor: c.instructor,
      description: c.description,
      prerequisites: c.prerequisites
        ? c.prerequisites.startsWith("[")
          ? JSON.parse(c.prerequisites)
          : c.prerequisites.split(",").map((s) => s.trim())
        : [],
      quickFilters: c.quickFilters ? JSON.parse(c.quickFilters) : [],
      intake: c.intake,
      tuitionFee: c.tuitionFee,
      applicationFee: c.applicationFee,
      currency: c.currency,
      country: c.university.country,
      requirements: c.requirements ? JSON.parse(c.requirements) : [],
      gpaRequired: c.gpaRequired,
      englishOverallScore: c.englishOverallScore,
      englishLanguageType: c.englishLanguageType,
      applicationDeadline: c.applicationDeadline ? c.applicationDeadline.toISOString() : null,
      capacity: 5000,
    }));

    const transformedUniversities = universities.map((u) => ({
      id: u.id,
      name: u.name,
      country: u.country,
      city: u.city,
      website: u.website,
      logo: u.logo,
      requirements: u.requirements
        ? u.requirements.startsWith("[")
          ? JSON.parse(u.requirements)
          : [u.requirements]
        : [],
      initials: u.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
      color: `hsl(${(u.name.length * 137) % 360}, 70%, 50%)`,
    }));

    return NextResponse.json({
      courses: transformedCourses,
      universities: transformedUniversities,
      filters: {
        universities: allUniversities.map((u) => u.name),
        countries: allCountries.map((c) => c.country),
        intakes: allIntakes,
      },
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
