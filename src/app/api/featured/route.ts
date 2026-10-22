import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { checkPermission, getSession } from "@/lib/api-utils";
import { toCourseCredits } from "@/lib/course-credits";

const prisma = db;

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "learning:read");
    if (deniedGET) return deniedGET;
    const featuredUniversities = await prisma.university.findMany({
      where: { isFeatured: true },
      include: { courses: true },
    });
    const universities = featuredUniversities.map((university) => ({
      ...university,
      courses: university.courses.map((course) => ({
        ...course,
        credits: toCourseCredits(course.credits),
      })),
    }));

    const featuredCourses = (
      await prisma.course.findMany({
        where: { isFeatured: true },
        include: { university: true },
      })
    ).map((course) => ({ ...course, credits: toCourseCredits(course.credits) }));

    return NextResponse.json({
      universities,
      courses: featuredCourses,
    });
  } catch (error) {
    logError("Fetch featured content", error);
    return NextResponse.json({ error: "Failed to fetch featured content" }, { status: 500 });
  }
}
