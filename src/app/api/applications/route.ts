import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { logActivity } from "@/lib/activity";
import { getPaginationParams, paginatedResponse, apiError, getSession, checkRoutePermission } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    const { searchParams } = new URL(req.url);
    const params = getPaginationParams(searchParams);
    const studentId = searchParams.get("studentId");
    const statusFilter = searchParams.get("status") || "";
    const universityId = searchParams.get("universityId") || "";

    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = Number(studentId);
    if (statusFilter) where.status = statusFilter;
    if (universityId) where.universityId = Number(universityId);

    if (params.search) {
      where.student = {
        OR: [
          { firstName: { contains: params.search } },
          { lastName: { contains: params.search } },
          { email: { contains: params.search } },
        ],
      };
    }

    const [applications, total] = await Promise.all([
      db.application.findMany({
        where: where as Prisma.ApplicationWhereInput,
        include: {
          student: { select: { firstName: true, lastName: true, email: true } },
          university: { select: { name: true, country: true } },
          course: {
            select: {
              name: true,
              level: true,
              duration: true,
              intake: true,
              mode: true,
              language: true,
              academicRequirement: true,
              percentageRequired: true,
              gpaRequired: true,
              englishLanguageType: true,
              englishOverallScore: true,
              englishReadingScore: true,
              englishWritingScore: true,
              englishListeningScore: true,
              englishSpeakingScore: true,
              prerequisites: true,
              requirements: true,
              tuitionFee: true,
              currency: true,
            },
          },
        },
        orderBy: { appliedDate: "desc" },
        skip: params.skip,
        take: params.perPage,
      }),
      db.application.count({ where: where as Prisma.ApplicationWhereInput }),
    ]);

    return NextResponse.json(paginatedResponse(applications, total, params));
  } catch (error) {
    logError("Fetch applications", error);
    return apiError("Failed to fetch applications");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    const data = await req.json();
    const studentId = Number(data.studentId);
    const { universityId, courseId } = data;

    if (!studentId || !universityId || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newApplication, user] = await Promise.all([
      db.application.create({
        data: {
          studentId,
          universityId: Number(universityId),
          courseId: Number(courseId),
          status: "Submitted",
        },
        include: { student: true, course: true },
      }),
      db.user.findUnique({ where: { id: session!.id } }),
    ]);

    await logActivity({
      actorName: user?.name || "System",
      action: "created an application",
      target: `${newApplication.student.firstName} ${newApplication.student.lastName} for ${newApplication.course.name}`,
    });

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    logError("Create application", error);
    return apiError("Failed to create application");
  }
}
