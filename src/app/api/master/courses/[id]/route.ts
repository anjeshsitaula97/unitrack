import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";
import { fetchMasterCourse, isConfigured } from "@/lib/master-api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    if (!isConfigured()) {
      return NextResponse.json({ error: "Master API not configured" }, { status: 503 });
    }

    const { id } = await params;
    const result = await fetchMasterCourse(Number(id));

    if (!result) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logError("Master course fetch error:", error);
    return apiError("Failed to fetch course from Master API");
  }
}
