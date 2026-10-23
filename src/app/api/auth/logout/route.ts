import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { logActivity, getActorName } from "@/lib/activity";
import { logError } from "@/lib/logger";
import { endSession } from "@/lib/session-registry";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
      try {
        const session = await verifyAuth(token);
        const actorName = await getActorName(session.id);
        await logActivity({
          actorName,
          userId: session.id,
          action: "logged out",
          target: session.email as string,
        });
        // Rotate the stored session id so the discarded token cannot be
        // replayed after the cookie is cleared. Guarded by `sid`: a browser that
        // already lost its session to a sign-in elsewhere must not be able to
        // end the session that replaced it.
        await endSession("user", session.id, session.sid);
      } catch {
        // Token invalid or already expired — skip logout logging.
      }
    }

    // The student portal authenticates with its own cookie. Its session has to
    // be released here as well, not just discarded client-side: while it is
    // recorded as live the account is refused its next sign-in, so a student who
    // signed out properly must never have to wait for the idle window.
    const studentToken = cookieStore.get("student_token")?.value;
    if (studentToken) {
      try {
        const session = await verifyAuth(studentToken);
        if (session.subject === "student") await endSession("student", session.id, session.sid);
      } catch {
        // Token invalid or already expired — the cookie is cleared regardless.
      }
    }

    cookieStore.delete("auth_token");
    cookieStore.delete("enabled_modules");
    cookieStore.delete("student_token");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logError("Logout Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
