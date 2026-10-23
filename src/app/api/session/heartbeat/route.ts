import { NextResponse } from "next/server";
import { getSessionCurrency, touchSession } from "@/lib/session-registry";
import { getSessionIdleTimeoutMinutes, REPLACED_LOGOUT_MESSAGE } from "@/lib/session-policy";
import { logError } from "@/lib/logger";
import { resolveSessionCaller } from "../session-caller";

/**
 * Keeps the caller's session alive.
 *
 * The browser only sends this while the person is actually interacting, so a
 * stamped session means "seen recently" rather than "cookie not yet expired".
 * The response carries the inactivity budget so the client timer and the server
 * rule can never drift apart.
 *
 * A 401 here is the authoritative expiry: the token belongs to a superseded
 * login or the session has passed the inactivity window, and the caller must
 * sign out instead of pretending to still be logged in. The two cases carry
 * different `code` values so the shell can say which one happened.
 */
export async function POST() {
  try {
    const caller = await resolveSessionCaller();
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { current, reason } = await getSessionCurrency(caller.subject, caller.id, caller.sid);
    if (!current) {
      // Two different losses, and the browser has to say the right one: timing
      // out is routine, being signed out by another location is not.
      const replaced = reason === "superseded";
      return NextResponse.json(
        {
          error: replaced
            ? REPLACED_LOGOUT_MESSAGE
            : "Your session has ended. Please sign in again.",
          code: replaced ? "SESSION_REPLACED" : "SESSION_EXPIRED",
        },
        { status: 401 }
      );
    }

    await touchSession(caller.subject, caller.id);

    return NextResponse.json({
      success: true,
      idleTimeoutMinutes: await getSessionIdleTimeoutMinutes(),
    });
  } catch (error) {
    logError("Session heartbeat", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
