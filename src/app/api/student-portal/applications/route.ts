import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getStudentSession, apiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) return apiError("Unauthorized", 401);

    const studentId = Number(session.id);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { studentId };
    if (status) where.status = status;

    const applications = await db.application.findMany({
      where: where as Prisma.ApplicationWhereInput,
      include: {
        university: { select: { name: true, country: true, logo: true } },
        course: {
          select: { name: true, level: true, duration: true, tuitionFee: true, currency: true },
        },
      },
      orderBy: { appliedDate: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    logError("Student applications error:", error);
    return apiError("Failed to fetch applications");
  }
}
