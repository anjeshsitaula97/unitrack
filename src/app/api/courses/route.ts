import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { safeParseArray } from "@/lib/json";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";
import { getPaginationParams, paginatedResponse, apiError, getSession, checkRoutePermission } from "@/lib/api-utils";
import { logError } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    const { searchParams } = new URL(req.url);
    const params = getPaginationParams(searchParams);
    const statusFilter = searchParams.get("status") || "";
    const universityId = searchParams.get("universityId") || "";
    const levelFilter = searchParams.get("level") || "";
    const facultyFilter = searchParams.get("faculty") || "";
    const degreeTypeFilter = searchParams.get("degreeType") || "";

    const where: Record<string, unknown> = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { instructor: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    if (statusFilter) {
      where.status = statusFilter;
    } else {
      where.status = { not: "Deleted" };
    }
    if (universityId) where.universityId = Number(universityId);
    if (levelFilter) where.level = levelFilter;
    if (facultyFilter) where.faculty = facultyFilter;
    if (degreeTypeFilter) where.degreeType = degreeTypeFilter;

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where: where as Prisma.CourseWhereInput,
        orderBy: { name: "asc" },
        include: { university: true },
        skip: params.skip,
        take: params.perPage,
      }),
      db.course.count({ where: where as Prisma.CourseWhereInput }),
    ]);

    const transformed = courses.map((course) => ({
      ...course,
      university: course.university?.name || "Unknown",
      universityLogo: course.university?.logo || null,
      faculty: course.faculty || "General",
      degreeType: course.degreeType || "None",
      prerequisites: safeParseArray(course.prerequisites),
      quickFilters: safeParseArray(course.quickFilters),
      requirements: safeParseArray(course.requirements),
      applicationDeadline: course.applicationDeadline,
    }));

    return NextResponse.json(paginatedResponse(transformed, total, params));
  } catch (error) {
    logError("Fetch Courses", error);
    return apiError("Failed to fetch courses");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    const data = await req.json();
    const newCourse = await db.course.create({
      data: {
        name: data.name || data.title,
        universityId: Number(data.universityId),
        faculty: data.faculty || "General",
        degreeType: data.degreeType || "None",
        level: data.studyLevel || "Undergraduate",
        credits: parseInt(data.credits) || 0,
        duration: data.duration || "0",
        startDate:
          data.startDate && !isNaN(new Date(data.startDate).getTime())
            ? new Date(data.startDate)
            : null,
        color: data.color || "#6366f1",
        initials: data.initials || data.name?.substring(0, 2).toUpperCase() || "CX",
        instructor: data.instructor || "TBA",
        description: data.description || "",
        prerequisites: JSON.stringify(data.prerequisites || []),
        intake: data.intake || "",
        language: data.language || "English",
        mode: data.mode || "Online",
        academicRequirement: data.academicRequirement || "",
        percentageRequired: data.percentageRequired || "",
        gpaRequired: data.gpaRequired || "",
        englishLanguageType: data.englishLanguageType || "IELTS",
        englishOverallScore: data.englishOverallScore || "",
        englishReadingScore: data.englishReadingScore || "",
        englishWritingScore: data.englishWritingScore || "",
        englishListeningScore: data.englishListeningScore || "",
        englishSpeakingScore: data.englishSpeakingScore || "",
        tuitionFee: data.tuitionFee || "",
        applicationFee: data.applicationFee || "",
        applicationFeeCurrency: data.applicationFeeCurrency || "",
        currency: data.currency || "",
        quickFilters: JSON.stringify(data.quickFilters || []),
        requirements: JSON.stringify(data.requirements || []),
        applicationDeadline:
          data.applicationDeadline && !isNaN(new Date(data.applicationDeadline).getTime())
            ? new Date(data.applicationDeadline)
            : null,
        courseCode: data.courseCode || null,
        englishTests:
          typeof data.englishTests === "string"
            ? data.englishTests
            : JSON.stringify(data.englishTests || []),
        commissionType: data.commissionType || "Percentage",
        commissionValue:
          data.commissionValue !== undefined &&
          data.commissionValue !== "" &&
          data.commissionValue !== null
            ? parseFloat(data.commissionValue)
            : null,
        commissionCurrency: data.commissionCurrency || null,
      },
    });

    if (session) {
      const user = await db.user.findUnique({ where: { id: session.id } });
      await logActivity({
        actorName: user?.name || "System",
        action: "created a new course",
        target: newCourse.name,
      });
    }

    await createNotification({
      userId: String(session!.id),
      title: "Course Created",
      message: `Course "${newCourse.name}" has been added.`,
      type: "Success",
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    logError("Create Course", error);
    return NextResponse.json(
      {
        error: "Failed to create course",
      },
      { status: 400 }
    );
  }
}
