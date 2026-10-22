import { cookies } from "next/headers";
import { verifyAuth } from "./session";
import { baseDb } from "./base-db";
import { isSessionCurrent } from "./session-registry";

/**
 * Resolves the consultancy a request should be scoped to, directly from the
 * request cookies. This runs inside the Prisma extension (see `db.ts`) rather
 * than relying on an AsyncLocalStorage context, because the Prisma query hook
 * does not reliably inherit contexts entered via `enterWith()` from a caller.
 *
 * Precedence:
 *  - no session token           -> platform scope (`null`, unfiltered)
 *  - student session token      -> the student's consultancy
 *  - Super Admin session        -> `active_consultancy` cookie, else platform
 *  - any other staff session    -> the account's own consultancy
 *
 * Results are cached briefly (keyed by token + consultancy selection) so the
 * per-query hook does not hit the database on every operation.
 */
const TTL_MS = 30_000;

/**
 * Sentinel consultancy id used when a session token is present but cannot be
 * trusted (expired, forged, or the account no longer exists). No row ever
 * carries this id, so scoped queries resolve to nothing rather than leaking the
 * unfiltered platform view.
 */
const DENIED = -1;

const cache = new Map<string, { cid: number | null; exp: number }>();

export function invalidateRequestTenancyCache(): void {
  cache.clear();
}

export async function resolveRequestConsultancyId(): Promise<number | null> {
  let store: Awaited<ReturnType<typeof cookies>>;
  try {
    store = await cookies();
  } catch {
    // Not inside a request scope (seed scripts, CLI, background jobs).
    return null;
  }

  const staffToken = store.get("auth_token")?.value;
  const studentToken = store.get("student_token")?.value;
  const token = staffToken ?? studentToken;
  if (!token) return null;

  const isStudent = !staffToken && Boolean(studentToken);
  const active = store.get("active_consultancy")?.value ?? "";
  const key = `${isStudent ? "s" : "u"}:${token}:${active}`;

  const cached = cache.get(key);
  if (cached && cached.exp > Date.now()) return cached.cid;

  let cid: number | null = null;
  try {
    const payload = await verifyAuth(token);
    if (payload.subject === "student" || isStudent) {
      const student = await baseDb.student.findUnique({
        where: { id: payload.id },
        select: { consultancyId: true },
      });
      if (!student) {
        cid = DENIED;
      } else if (!(await isSessionCurrent("student", payload.id, payload.sid))) {
        // The token was superseded by a newer login for the same account, so it
        // no longer grants access to any tenancy.
        cid = DENIED;
      } else {
        cid = student.consultancyId ?? null;
      }
    } else {
      const user = await baseDb.user.findUnique({
        where: { id: payload.id },
        select: { role: true, consultancyId: true },
      });
      if (!user) {
        cid = DENIED;
      } else if (!(await isSessionCurrent("user", payload.id, payload.sid))) {
        // The token was superseded by a newer login for the same account, so it
        // no longer grants access to any tenancy.
        cid = DENIED;
      } else if (user.role === "Super Admin") {
        if (active && active !== "all") {
          const parsed = Number(active);
          cid = Number.isInteger(parsed) && parsed > 0 ? parsed : null;
        } else {
          cid = null;
        }
      } else {
        cid = user.consultancyId ?? null;
      }
    }
  } catch {
    // A token was supplied but failed verification: deny rather than expose all.
    cid = DENIED;
  }

  cache.set(key, { cid, exp: Date.now() + TTL_MS });
  return cid;
}
