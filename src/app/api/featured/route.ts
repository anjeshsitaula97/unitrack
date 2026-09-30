import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { checkPermission, getSession } from "@/lib/api-utils";

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

    const featuredCourses = await prisma.course.findMany({
      where: { isFeatured: true },
      include: { university: true },
    });

    return NextResponse.json({
      universities: featuredUniversities,
      courses: featuredCourses,
    });
  } catch (error) {
    logError("Fetch featured content", error);
    return NextResponse.json({ error: "Failed to fetch featured content" }, { status: 500 });
  }
}
