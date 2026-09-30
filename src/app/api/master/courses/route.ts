import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";
import { fetchMasterCourses, isConfigured } from "@/lib/master-api";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, { url: "/api/master/courses", method: "GET" });
    if (deniedGET) return deniedGET;
    if (!session) return apiError("Unauthorized", 401);

    if (!isConfigured()) {
      return NextResponse.json({ error: "Master API not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const result = await fetchMasterCourses({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
      level: searchParams.get("level") || undefined,
      faculty: searchParams.get("faculty") || undefined,
      country: searchParams.get("country") || undefined,
      university: searchParams.get("university") || undefined,
    });

    if (!result) {
      return NextResponse.json({ error: "Failed to fetch from Master API" }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logError("Master courses fetch error:", error);
    return apiError("Failed to fetch courses from Master API");
  }
}
