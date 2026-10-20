import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";
import { getSession, apiError, checkPermission, checkRoutePermission } from "@/lib/api-utils";

/** Reads or updates the "show news popup on login" system setting. */

async function currentSettings() {
  return db.systemSettings.findFirst({ orderBy: { updatedAt: "desc" } });
}

export async function GET() {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "settings:read");
    if (denied) return denied;

    const settings = await currentSettings();
    return NextResponse.json({ showNewsOnLogin: settings?.showNewsOnLogin ?? true });
  } catch (error) {
    logError("Fetch news settings", error);
    return apiError("Failed to fetch news settings");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const denied = checkRoutePermission(session, { url: "/api/settings/news", method: "PATCH" });
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const body = await req.json();
    if (typeof body?.showNewsOnLogin !== "boolean") {
      return apiError("showNewsOnLogin must be a boolean", 400);
    }

    const existing = await currentSettings();
    const value = body.showNewsOnLogin;

    if (existing) {
      await db.systemSettings.update({
        where: { id: existing.id },
        data: { showNewsOnLogin: value },
      });
    } else {
      await db.systemSettings.create({ data: { showNewsOnLogin: value } });
    }

    await logActivity({
      actorName: await getActorName(session.id),
      userId: session.id,
      action: value ? "enabled the login news popup" : "disabled the login news popup",
      target: "System settings",
    });

    return NextResponse.json({ showNewsOnLogin: value });
  } catch (error) {
    logError("Update news settings", error);
    return apiError("Failed to update news settings");
  }
}
