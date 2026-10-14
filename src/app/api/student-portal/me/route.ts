import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { getStudentSession, apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getStudentSession();
    if (!session) return apiError("Unauthorized", 401);

    const student = await db.student.findUnique({
      where: { id: Number(session.id) },
      include: {
        _count: {
          select: { applications: true, payments: true, documents: true },
        },
      },
    });

    if (!student) return apiError("Student not found", 404);

    // Neither the portal login hash nor the staff-facing application-email
    // password should be exposed through the student portal.
    const {
      studentPassword: _studentPassword,
      applicationEmailPassword: _applicationEmailPassword,
      ...safeStudent
    } = student;
    return NextResponse.json(safeStudent);
  } catch (error) {
    logError("Student fetch error:", error);
    return apiError("Failed to fetch student data");
  }
}
