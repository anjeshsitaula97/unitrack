import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, checkPermission, getSession } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";
import { logError } from "@/lib/logger";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import { endSession, getActiveSession, isSessionLiveElsewhere } from "@/lib/session-registry";

/**
 * Release another account's session.
 *
 * A sign-in is refused while the account is live elsewhere, so an Admin needs a
 * way to free somebody whose other device is unreachable (closed browser, phone
 * left at home). Ending the session rotates its id, which invalidates the
 * outstanding token at once and drops the activity stamp, so the account can
 * immediately sign in from the new location.
 */

async function requireAccessManager() {
  const session = await getSession();
  const denied = checkPermission(session, "admin:access");
  if (denied) return { session: null, error: denied };
  if (!session || !["Admin", "Super Admin"].includes(session.role as string)) {
    return { session: null, error: apiError("Unauthorized", 401) };
  }
  return { session, error: null };
}

/** Reads the session currently held by an account, for the Access row action. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireAccessManager();
    if (error) return error;

    const { id } = await params;
    const userId = Number(id);
    if (!Number.isInteger(userId)) return apiError("Invalid user id", 400);

    // Scoped read: an Admin can only ever see an account from their consultancy.
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) return apiError("User not found", 404);

    const state = await getActiveSession("user", userId);
    const { live } = await isSessionLiveElsewhere("user", userId);
    return NextResponse.json({
      sessionId: state?.activeSessionId ?? null,
      lastSeenAt: state?.lastSeenAt ?? null,
      ip: state?.ip ?? null,
      userAgent: state?.userAgent ?? null,
      // Only a live session blocks a new sign-in, so only that is worth acting on.
      active: live,
      // Ending a Super Admin's session is a Super Admin decision.
      canEnd: isSuperAdminRole(session?.role) || user.role !== "Super Admin",
    });
  } catch (error) {
    logError("Read user session", error);
    return apiError("Failed to read user session");
  }
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireAccessManager();
    if (!session) return error;

    const { id } = await params;
    const userId = Number(id);
    if (!Number.isInteger(userId)) return apiError("Invalid user id", 400);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return apiError("User not found", 404);

    if (isSuperAdminRole(user.role) && !isSuperAdminRole(session.role)) {
      return apiError("Only a Super Admin can sign out a Super Admin account", 403);
    }

    await endSession("user", userId);

    await logActivity({
      actorName: await getActorName(session.id),
      userId: session.id,
      action: "signed out a user's session",
      target: user.name || user.email,
      details: JSON.stringify([{ field: "session", from: "active", to: "ended" }]),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("End user session", error);
    return apiError("Failed to sign out the session");
  }
}
