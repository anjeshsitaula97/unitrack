import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import type { SessionSubject } from "@/lib/session-registry";

export interface SessionCaller {
  subject: SessionSubject;
  id: number;
  sid?: string;
}

/**
 * Identifies whichever account — staff or student — owns this request.
 *
 * The session endpoints serve both portals, and a browser can legitimately hold
 * both cookies, so each cookie is only considered for its own subject: a staff
 * token must never refresh a student session or the other way round.
 */
export async function resolveSessionCaller(): Promise<SessionCaller | null> {
  const cookieStore = await cookies();
  const candidates: Array<{ token: string | undefined; subject: SessionSubject }> = [
    { token: cookieStore.get("auth_token")?.value, subject: "user" },
    { token: cookieStore.get("student_token")?.value, subject: "student" },
  ];

  for (const candidate of candidates) {
    if (!candidate.token) continue;
    try {
      const payload = await verifyAuth(candidate.token);
      const isStudent = payload.subject === "student";
      if (isStudent !== (candidate.subject === "student")) continue;
      return { subject: candidate.subject, id: payload.id, sid: payload.sid };
    } catch {
      // Try the other cookie.
    }
  }
  return null;
}
