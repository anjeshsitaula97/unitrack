import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";
import { checkPermission, checkRoutePermission, getSession } from "@/lib/api-utils";

/** The delivery modes offered on the Add Course form. Keep in sync with it. */
const COURSE_MODES = ["Online", "In-person", "Hybrid"] as const;

/** GET /api/settings/academics — course-related defaults shown on the Academics tab. */
export async function GET() {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "settings:read");
    if (denied) return denied;

    const settings = await db.systemSettings.findFirst();
    return NextResponse.json({ defaultCourseMode: settings?.defaultCourseMode ?? "Online" });
  } catch (error) {
    logError("Academics settings", error);
    return NextResponse.json({ error: "Failed to load academics settings" }, { status: 500 });
  }
}

/** POST /api/settings/academics — update course-related defaults. */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const denied = checkRoutePermission(session, {
      url: "/api/settings/academics",
      method: "POST",
    });
    if (denied) return denied;

    const data = await req.json();
    const mode = typeof data?.defaultCourseMode === "string" ? data.defaultCourseMode.trim() : "";
    if (!(COURSE_MODES as readonly string[]).includes(mode)) {
      return NextResponse.json(
        { error: `Default course mode must be one of: ${COURSE_MODES.join(", ")}` },
        { status: 400 }
      );
    }

    // Same one-row-per-consultancy upsert as the localization route.
    const existing = await db.systemSettings.findFirst();
    const settings = existing
      ? await db.systemSettings.update({
          where: { id: existing.id },
          data: { defaultCourseMode: mode },
        })
      : await db.systemSettings.create({ data: { defaultCourseMode: mode } });

    if (existing && existing.defaultCourseMode !== mode) {
      await logActivity({
        actorName: await getActorName(session?.id),
        userId: session?.id,
        action: "updated the default course delivery mode",
        target: `Course defaults (${existing.defaultCourseMode} → ${mode})`,
      }).catch(() => {});
    }

    return NextResponse.json({ defaultCourseMode: settings.defaultCourseMode });
  } catch (error) {
    logError("Academics settings", error);
    return NextResponse.json({ error: "Failed to update academics settings" }, { status: 500 });
  }
}
