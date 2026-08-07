import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const documents = await db.studentDocument.findMany({
      where: { studentId: Number(session.id) },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Student documents error:", error);
    return apiError("Failed to fetch documents");
  }
}
