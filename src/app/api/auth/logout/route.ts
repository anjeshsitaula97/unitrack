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
        // replayed after the cookie is cleared.
        await endSession("user", session.id);
      } catch {
        // Token invalid or already expired — skip logout logging.
      }
    }

    cookieStore.delete("auth_token");
    cookieStore.delete("enabled_modules");
    // The student portal authenticates with its own cookie; without this a
    // student who logs out stays signed in.
    cookieStore.delete("student_token");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logError("Logout Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
