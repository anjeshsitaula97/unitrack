import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("studentId"));
    if (!studentId || Number.isNaN(studentId)) {
      return apiError("Student ID is required", 400);
    }

    const progress = await db.onboardingProgress.findMany({ where: { studentId } });
    return NextResponse.json(progress);
  } catch (error) {
    logError("Onboarding fetch error:", error);
    return apiError("Failed to fetch progress");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { studentId, step, completed, data } = await req.json();
    if (!studentId) return apiError("Student ID is required", 400);

    const progress = await db.onboardingProgress.upsert({
      where: { studentId },
      update: {
        step: step || 1,
        completed: completed || false,
        data: data ? JSON.stringify(data) : undefined,
      },
      create: {
        studentId,
        step: step || 1,
        completed: completed || false,
        data: data ? JSON.stringify(data) : null,
      },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated onboarding",
      target: `Student ${studentId}`,
    });

    return NextResponse.json(progress);
  } catch (error) {
    logError("Onboarding save error:", error);
    return apiError("Failed to save progress");
  }
}
