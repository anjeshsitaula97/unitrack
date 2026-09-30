import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkRoutePermission(session, { url: "/api/reports/saved", method: "GET" });
    if (deniedGET) return deniedGET;
    if (!session) return apiError("Unauthorized", 401);

    const reports = await db.savedReport.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json(reports);
  } catch (error) {
    logError("Fetch saved reports", error);
    return apiError("Failed to fetch saved reports");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/reports/saved", method: "POST" });
    if (deniedPOST) return deniedPOST;
    if (!session) return apiError("Unauthorized", 401);

    const data = await req.json();
    const report = await db.savedReport.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type || "tabular",
        config: JSON.stringify(data.config || {}),
        createdBy: String(session.id),
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    logError("Save report", error);
    return apiError("Failed to save report");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPUT = checkRoutePermission(session, { url: "/api/reports/saved", method: "PUT" });
    if (deniedPUT) return deniedPUT;
    if (!session) return apiError("Unauthorized", 401);

    const data = await req.json();
    const report = await db.savedReport.update({
      where: { id: Number(data.id) },
      data: {
        name: data.name,
        description: data.description,
        config: JSON.stringify(data.config || {}),
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    logError("Update report", error);
    return apiError("Failed to update report");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, {
      url: "/api/reports/saved",
      method: "DELETE",
    });
    if (deniedDELETE) return deniedDELETE;
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Report ID required" }, { status: 400 });

    await db.savedReport.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete report", error);
    return apiError("Failed to delete report");
  }
}
