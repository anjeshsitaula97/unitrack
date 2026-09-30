import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/comparison", method: "POST" });
    if (deniedPOST) return deniedPOST;
    if (!session) return apiError("Unauthorized", 401);

    const { type, ids } = await req.json();
    if (!type || !ids?.length) {
      return NextResponse.json({ error: "type and ids[] required" }, { status: 400 });
    }

    const numericIds = ids.map(Number);

    let data: unknown[] = [];

    if (type === "universities") {
      data = await db.university.findMany({
        where: { id: { in: numericIds } },
        include: { _count: { select: { courses: true } }, partner: true },
      });
    } else if (type === "courses") {
      data = await db.course.findMany({
        where: { id: { in: numericIds } },
        include: { university: true },
      });
    } else if (type === "students") {
      data = await db.student.findMany({
        where: { id: { in: numericIds } },
        include: { _count: { select: { applications: true, payments: true } } },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    logError("Comparison", error);
    return apiError("Failed to fetch comparison data");
  }
}
