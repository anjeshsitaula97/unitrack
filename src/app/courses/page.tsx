import React, { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import CoursesContent from "./components/CoursesContent";
import { db } from "@/lib/db";
import { getSession } from "@/lib/api-utils";
import { safeParseArray } from "@/lib/json";
import { Prisma } from "@prisma/client";

export const metadata = {
  title: "Courses | UniTrack",
  description: "UniTrack administration - Courses",
};

async function getCourses() {
  try {
    // Establish the tenancy scope for this request; without a session the
    // Prisma extension would fall back to platform scope and list every
    // consultancy's courses.
    const session = await getSession();
    if (!session) return [];

    const courses = await db.course.findMany({
      where: { status: { not: "Deleted" } },
      orderBy: { name: "asc" },
      include: { university: true },
    });

    return courses.map((course) => ({
      ...course,
      university: course.university?.name || "Unknown",
      universityLogo: course.university?.logo || null,
      country: course.university?.country || null,
      faculty: course.faculty || "General",
      degreeType: course.degreeType || "None",
      prerequisites: safeParseArray<string>(course.prerequisites),
      quickFilters: safeParseArray<string>(course.quickFilters),
      requirements: safeParseArray<string>(course.requirements),
      englishTests: safeParseArray<{
        type?: string;
        overall?: string;
        reading?: string;
        writing?: string;
        listening?: string;
        speaking?: string;
      }>(course.englishTests),
      startDate: course.startDate?.toISOString() || null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }));
  } catch (err) {
    unstable_rethrow(err);
    console.error("Database error in getCourses:", err);
    return [];
  }
}

async function getCourseFilters() {
  try {
    const [allUniversities, allCountries] = await Promise.all([
      db.university.findMany({
        where: { status: { not: "Deleted" } },
        select: { name: true, country: true },
        orderBy: { name: "asc" },
      }),
      db.university.findMany({
        where: { status: { not: "Deleted" } },
        select: { country: true },
        distinct: ["country"],
        orderBy: { country: "asc" },
      }),
    ]);

    const universitiesByCountry: Record<string, string[]> = {};
    for (const u of allUniversities) {
      const country = u.country || "Unknown";
      (universitiesByCountry[country] ??= []).push(u.name);
    }
    for (const key of Object.keys(universitiesByCountry)) {
      universitiesByCountry[key].sort();
    }

    return {
      universities: allUniversities.map((u) => u.name),
      universitiesByCountry,
      countries: allCountries.map((c) => c.country).filter(Boolean),
    };
  } catch (err) {
    console.error("Database error in getCourseFilters:", err);
    return { universities: [], universitiesByCountry: {}, countries: [] };
  }
}

export default async function CoursesPage() {
  const [initialCourses, filterOptions] = await Promise.all([getCourses(), getCourseFilters()]);

  return (
    <AppLayoutWrapper>
      <Suspense fallback={<div className="p-8 text-center">Loading courses catalog…</div>}>
        <CoursesContent initialData={initialCourses} filterOptions={filterOptions} />
      </Suspense>
    </AppLayoutWrapper>
  );
}
