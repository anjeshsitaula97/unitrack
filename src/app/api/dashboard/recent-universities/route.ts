import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, {
      url: "/api/dashboard/recent-universities",
      method: "GET",
    });
    if (deniedGET) return deniedGET;
    if (!session) return apiError("Unauthorized", 401);

    const universities = await db.university.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const transformed = universities.map((u) => ({
      id: u.id,
      name: u.name,
      status: u.status || "Active",
      country: u.country,
      website: u.website,
      addedDate: u.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      // Mocking some fields for UI consistency
      completion: Math.floor(Math.random() * 60) + 40, // 40-100
      assignees: ["#6366f1", "#8b5cf6", "#ec4899"].slice(0, Math.floor(Math.random() * 3) + 1),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    logError("Recent universities", error);
    return NextResponse.json({ error: "Failed to fetch recent universities" }, { status: 500 });
  }
}
