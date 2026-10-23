import { NextResponse } from "next/server";
import { getSessionIdleTimeoutMinutes } from "@/lib/session-policy";
import { logError } from "@/lib/logger";
import { resolveSessionCaller } from "../session-caller";

/**
 * The inactivity budget the signed-in account must obey.
 *
 * Both app shells read this on load so their local countdown matches the server
 * rule that expires the session; it is deliberately readable by any signed-in
 * subject because every account is subject to it.
 */
export async function GET() {
  try {
    const caller = await resolveSessionCaller();
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({
      idleTimeoutMinutes: await getSessionIdleTimeoutMinutes(),
    });
  } catch (error) {
    logError("Session policy", error);
    return NextResponse.json({ error: "Failed to read session policy" }, { status: 500 });
  }
}
