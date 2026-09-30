import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";
import {
  getApplicationStatuses,
  isValidApplicationStatusList,
  normalizeApplicationStatusesJson,
} from "@/lib/application-statuses";

export async function GET() {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "settings:read");
    if (deniedGET) return deniedGET;
    const settings = await db.systemSettings.findFirst();
    return NextResponse.json({
      statuses: getApplicationStatuses(settings?.applicationStatuses),
    });
  } catch (error) {
    logError("Fetch application statuses", error);
    return apiError("Failed to fetch application statuses");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPUT = checkPermission(session, "settings:update");
    if (deniedPUT) return deniedPUT;
    if (!session) return apiError("Unauthorized", 401);
    if (!["admin", "super admin"].includes((session.role as string).toLowerCase())) {
      return apiError("Forbidden: insufficient permissions", 403);
    }

    const body = await req.json();
    const statuses = body?.statuses;

    if (!isValidApplicationStatusList(statuses)) {
      return apiError(
        "Each status needs a name and a process stage label, with no duplicate names.",
        400
      );
    }

    const applicationStatuses = normalizeApplicationStatusesJson(JSON.stringify(statuses));

    const existing = await db.systemSettings.findFirst();

    await db.systemSettings.upsert({
      where: { id: 1 },
      update: { applicationStatuses },
      create: { applicationStatuses },
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated application statuses",
      target: "System settings",
      details: JSON.stringify([
        {
          field: "applicationStatuses",
          from: existing?.applicationStatuses || "",
          to: applicationStatuses,
        },
      ]),
    });

    return NextResponse.json({ statuses: getApplicationStatuses(applicationStatuses) });
  } catch (error) {
    logError("Update application statuses", error);
    return apiError("Failed to update application statuses");
  }
}
