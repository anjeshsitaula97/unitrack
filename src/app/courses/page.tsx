import React, { Suspense } from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import CoursesContent from "./components/CoursesContent";
import { db } from "@/lib/db";
import { safeParseArray } from "@/lib/json";

export const metadata = {
  title: "Courses | UniTrack",
  description: "UniTrack administration - Courses",
};

async function getCourses() {
  try {
    const courses = await db.course.findMany({
      orderBy: { name: "asc" },
      include: { university: true },
    });

    return courses.map((course) => ({
      ...course,
      university: course.university?.name || "Unknown",
      universityLogo: course.university?.logo || null,
      faculty: course.faculty || "General",
      degreeType: course.degreeType || "None",
      prerequisites: safeParseArray<string>(course.prerequisites),
      quickFilters: safeParseArray<string>(course.quickFilters),
      requirements: safeParseArray<string>(course.requirements),
      startDate: course.startDate?.toISOString() || null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("Database error in getCourses:", err);
    return [];
  }
}

export default async function CoursesPage() {
  const initialCourses = await getCourses();

  return (
    <AppLayoutWrapper>
      <Suspense fallback={<div className="p-8 text-center">Loading courses catalog…</div>}>
        <CoursesContent initialData={initialCourses} />
      </Suspense>
    </AppLayoutWrapper>
  );
}
