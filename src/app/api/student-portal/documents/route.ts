import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { getStudentSession, apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getStudentSession();
    if (!session) return apiError("Unauthorized", 401);

    const documents = await db.studentDocument.findMany({
      where: { studentId: Number(session.id) },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    logError("Student documents error:", error);
    return apiError("Failed to fetch documents");
  }
}
