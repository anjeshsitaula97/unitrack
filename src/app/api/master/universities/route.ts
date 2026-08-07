import { NextRequest, NextResponse } from "next/server";
import { getSession, apiError } from "@/lib/api-utils";
import { fetchMasterUniversities, isConfigured } from "@/lib/master-api";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    if (!isConfigured()) {
      return NextResponse.json({ error: "Master API not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const result = await fetchMasterUniversities({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
      country: searchParams.get("country") || undefined,
    });

    if (!result) {
      return NextResponse.json({ error: "Failed to fetch from Master API" }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Master universities fetch error:", error);
    return apiError("Failed to fetch universities from Master API");
  }
}
