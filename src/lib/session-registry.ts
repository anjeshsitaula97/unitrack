import { randomUUID } from "crypto";
import { baseDb } from "./base-db";

/**
 * Server-side registry of the single active session per account.
 *
 * The JWT alone cannot express "one login per account": every token stays
 * valid until it expires, so signing in on a second device would leave the
 * first one working. The database therefore holds the id of the session that is
 * currently allowed to act, and every request is checked against it.
 *
 * The id lives in the token as the `sid` claim and in the account row as
 * `activeSessionId`. Signing in rotates the stored id, which invalidates the
 * previous token immediately; signing out rotates it as well so the discarded
 * token cannot be replayed.
 */

const SESSION_CACHE_TTL_MS = 5_000;

/** Which account table the session belongs to. */
export type SessionSubject = "user" | "student";

interface CachedSessionState {
  activeSessionId: string | null;
  expires: number;
}

const sessionCache = new Map<string, CachedSessionState>();

const cacheKey = (subject: SessionSubject, accountId: number) => `${subject}:${accountId}`;

export function invalidateSessionCache(subject?: SessionSubject, accountId?: number): void {
  if (subject && typeof accountId === "number") {
    sessionCache.delete(cacheKey(subject, accountId));
  } else {
    sessionCache.clear();
  }
  // The tenancy resolver caches the consultancy a token maps to. Once a session
  // is rotated the old token must stop resolving to a tenancy, so its cached
  // entry has to go too.
  void import("./request-tenancy")
    .then((mod) => mod.invalidateRequestTenancyCache())
    .catch(() => {});
}

/**
 * Reads the currently allowed session id for an account. Cached briefly so a
 * burst of requests does not hit the database once per call; the cache is
 * invalidated explicitly whenever this process rotates a session.
 */
export async function getActiveSessionId(
  subject: SessionSubject,
  accountId: number
): Promise<string | null> {
  const key = cacheKey(subject, accountId);
  const cached = sessionCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.activeSessionId;

  try {
    const account =
      subject === "student"
        ? await baseDb.student.findUnique({
            where: { id: accountId },
            select: { activeSessionId: true },
          })
        : await baseDb.user.findUnique({
            where: { id: accountId },
            select: { activeSessionId: true },
          });
    const activeSessionId = account?.activeSessionId ?? null;
    sessionCache.set(key, { activeSessionId, expires: Date.now() + SESSION_CACHE_TTL_MS });
    return activeSessionId;
  } catch {
    // If the lookup fails we cannot prove the session is current. Deny rather
    // than let an unverifiable token through.
    return null;
  }
}

/**
 * Starts a new session for an account and returns its id. Any previously
 * stored id is replaced, which is what revokes the session that was active
 * before this login.
 */
export async function startSession(params: {
  subject: SessionSubject;
  accountId: number;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<string> {
  const sid = randomUUID();
  const data = {
    activeSessionId: sid,
    activeSessionAt: new Date(),
    activeSessionIp: params.ip ?? null,
    activeSessionUserAgent: params.userAgent?.slice(0, 191) ?? null,
  };

  if (params.subject === "student") {
    await baseDb.student.update({ where: { id: params.accountId }, data });
  } else {
    await baseDb.user.update({ where: { id: params.accountId }, data });
  }

  invalidateSessionCache(params.subject, params.accountId);
  return sid;
}

/**
 * Ends the session that is currently stored for an account. The stored id is
 * rotated to a fresh random value rather than cleared, so a token that was
 * issued before the logout can never be accepted again.
 */
export async function endSession(subject: SessionSubject, accountId: number): Promise<void> {
  try {
    const data = {
      activeSessionId: randomUUID(),
      activeSessionAt: new Date(),
      activeSessionIp: null,
      activeSessionUserAgent: null,
    };
    if (subject === "student") {
      await baseDb.student.update({ where: { id: accountId }, data });
    } else {
      await baseDb.user.update({ where: { id: accountId }, data });
    }
  } catch {
    // The session is being discarded anyway; the cookie is cleared regardless.
  }
  invalidateSessionCache(subject, accountId);
}

/**
 * True when the presented token still matches the session the account is
 * allowed to use. Tokens issued before this feature existed carry no `sid`
 * and are therefore rejected: they cannot be tied to a single session.
 */
export async function isSessionCurrent(
  subject: SessionSubject,
  accountId: number,
  sessionId: string | undefined | null
): Promise<boolean> {
  if (!sessionId) return false;
  const activeSessionId = await getActiveSessionId(subject, accountId);
  if (!activeSessionId) return false;
  return activeSessionId === sessionId;
}
