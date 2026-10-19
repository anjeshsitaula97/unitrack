import { NextRequest, NextResponse } from "next/server";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";
import { getAutoStatusEmailsEnabled, setAutoStatusEmailsEnabled } from "@/lib/email-templates";

export async function GET() {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "email:read");
    if (denied) return denied;

    return NextResponse.json({ enabled: await getAutoStatusEmailsEnabled() });
  } catch (error) {
    logError("Fetch automatic status email setting", error);
    return apiError("Failed to fetch automatic email setting");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "email:update");
    if (denied) return denied;

    const body = await req.json();
    if (typeof body?.enabled !== "boolean") {
      return apiError("enabled must be a boolean", 400);
    }

    await setAutoStatusEmailsEnabled(body.enabled);

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: body.enabled
        ? "enabled automatic status-change emails"
        : "disabled automatic status-change emails",
      target: "Email templates",
    });

    return NextResponse.json({ enabled: body.enabled });
  } catch (error) {
    logError("Update automatic status email setting", error);
    return apiError("Failed to update automatic email setting");
  }
}
