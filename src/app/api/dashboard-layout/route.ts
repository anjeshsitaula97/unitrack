import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const layout = await db.dashboardLayout.findUnique({ where: { userId: String(session.id) } });
    return NextResponse.json({ layout: layout ? JSON.parse(layout.layout) : null });
  } catch (error) {
    logError("Dashboard layout fetch", error);
    return apiError("Failed to fetch layout");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const body = await req.json();
    const updates = body?.layout;
    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "Invalid layout data" }, { status: 400 });
    }

    const existing = await db.dashboardLayout.findUnique({ where: { userId: String(session.id) } });

    let merged: Record<string, unknown> = {};
    if (existing) {
      try {
        merged = JSON.parse(existing.layout);
      } catch {
        merged = {};
      }
    }
    merged = { ...merged, ...updates };

    if (existing) {
      await db.dashboardLayout.update({
        where: { id: existing.id },
        data: { layout: JSON.stringify(merged) },
      });
    } else {
      await db.dashboardLayout.create({
        data: { userId: String(session.id), layout: JSON.stringify(merged) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Dashboard layout save", error);
    const msg = error instanceof Error ? error.message : "Failed to save layout";
    return apiError(process.env.NODE_ENV === "development" ? msg : "Failed to save layout");
  }
}
