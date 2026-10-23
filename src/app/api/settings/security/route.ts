import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import {
  DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES,
  DEFAULT_SESSION_OTP_TAKEOVER_ENABLED,
  MIN_SESSION_IDLE_TIMEOUT_MINUTES,
  MAX_SESSION_IDLE_TIMEOUT_MINUTES,
  clampIdleTimeoutMinutes,
  invalidateSessionPolicyCache,
} from "@/lib/session-policy";
import { runWithConsultancy } from "@/lib/consultancy";
import { apiError, checkPermission, checkRoutePermission, getSession } from "@/lib/api-utils";

/**
 * Reads / writes the platform-wide session policy.
 *
 * The idle timeout lives on the platform `SystemSettings` row (`consultancyId IS
 * NULL`) so one Super Admin decision applies to every consultancy; tenant users
 * may read the effective value but never change it. All access to that row is
 * taken at platform scope with an explicit `consultancyId: null` filter, because
 * the scoped client applies no filtering of its own once the platform is
 * selected and would otherwise return the first row it finds.
 *
 * The same row carries the email-code relogin switch. It belongs here because it
 * governs the same refusal: the window decides how long "already logged in
 * elsewhere" lasts, the switch decides whether the person may cut that wait short
 * by proving they own the account.
 */
async function readPlatformRow() {
  return runWithConsultancy({ consultancyId: null }, () =>
    db.systemSettings.findFirst({
      where: { consultancyId: null },
      orderBy: { id: "asc" },
    })
  );
}

export async function GET() {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "settings:read");
    if (denied) return denied;

    const existing = await readPlatformRow();
    return NextResponse.json({
      sessionIdleTimeoutMinutes:
        existing?.sessionIdleTimeoutMinutes ?? DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES,
      minSessionIdleTimeoutMinutes: MIN_SESSION_IDLE_TIMEOUT_MINUTES,
      maxSessionIdleTimeoutMinutes: MAX_SESSION_IDLE_TIMEOUT_MINUTES,
      // A row that predates the column reads as the default rather than false,
      // so an existing install does not lose its relogin option on upgrade.
      sessionOtpTakeoverEnabled:
        existing?.sessionOtpTakeoverEnabled ?? DEFAULT_SESSION_OTP_TAKEOVER_ENABLED,
      // The value is shared by every consultancy and only the platform owner
      // may change it, so the UI can show it read-only instead of hiding it.
      canManage: isSuperAdminRole(session?.role),
    });
  } catch (error) {
    logError("Security settings read", error);
    return apiError("Failed to fetch security settings");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const denied = checkRoutePermission(session, {
      url: "/api/settings/security",
      method: "POST",
    });
    if (denied) return denied;
    if (!isSuperAdminRole(session?.role)) {
      return apiError("Forbidden: Super Admin only", 403);
    }

    const body = (await req.json().catch(() => null)) as {
      sessionIdleTimeoutMinutes?: unknown;
      sessionOtpTakeoverEnabled?: unknown;
    } | null;
    // Both controls live on one endpoint and one platform row, but each is saved
    // on its own: flipping the switch must not require resending the timeout, and
    // saving the timeout must not decide the switch. Absent means "not part of
    // this save". A non-boolean is refused rather than coerced — `"false"` from a
    // careless caller would otherwise switch a security control *on*.
    const takeover = body?.sessionOtpTakeoverEnabled;
    if (takeover != null && typeof takeover !== "boolean") {
      return apiError("Email code relogin setting must be true or false", 400);
    }
    const hasTakeover = typeof takeover === "boolean";

    const raw = body?.sessionIdleTimeoutMinutes;
    if (raw == null && !hasTakeover) {
      return apiError("An idle timeout in minutes is required", 400);
    }

    let minutes: number | null = null;
    if (raw != null && raw !== "") {
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) return apiError("Idle timeout must be a number", 400);
      if (parsed < MIN_SESSION_IDLE_TIMEOUT_MINUTES || parsed > MAX_SESSION_IDLE_TIMEOUT_MINUTES) {
        return apiError(
          `Idle timeout must be between ${MIN_SESSION_IDLE_TIMEOUT_MINUTES} and ${MAX_SESSION_IDLE_TIMEOUT_MINUTES} minutes`,
          400
        );
      }
      minutes = clampIdleTimeoutMinutes(parsed);
    }

    const settingsValues: {
      sessionIdleTimeoutMinutes?: number;
      sessionOtpTakeoverEnabled?: boolean;
    } = {};
    if (minutes != null) settingsValues.sessionIdleTimeoutMinutes = minutes;
    if (typeof takeover === "boolean") settingsValues.sessionOtpTakeoverEnabled = takeover;
    const existing = await readPlatformRow();
    // One platform row; never upsert against a hardcoded id.
    const saved = await runWithConsultancy({ consultancyId: null }, () =>
      existing
        ? db.systemSettings.update({ where: { id: existing.id }, data: settingsValues })
        : db.systemSettings.create({ data: { consultancyId: null, ...settingsValues } })
    );
    // Apply immediately instead of waiting for the cached policy to expire.
    invalidateSessionPolicyCache();

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated session policy",
      target: "Security settings",
      details: JSON.stringify([
        ...(minutes != null
          ? [
              {
                field: "sessionIdleTimeoutMinutes",
                from: String(
                  existing?.sessionIdleTimeoutMinutes ?? DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES
                ),
                to: String(minutes),
              },
            ]
          : []),
        ...(hasTakeover
          ? [
              {
                field: "sessionOtpTakeoverEnabled",
                from: String(
                  existing?.sessionOtpTakeoverEnabled ?? DEFAULT_SESSION_OTP_TAKEOVER_ENABLED
                ),
                to: String(takeover),
              },
            ]
          : []),
      ]),
    });

    return NextResponse.json(saved);
  } catch (error) {
    logError("Security settings update", error);
    return apiError("Failed to update security settings");
  }
}
