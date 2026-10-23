import { randomUUID } from "crypto";
import { baseDb } from "./base-db";
import { getSessionIdleTimeoutMs } from "./session-policy";

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
 *
 * `activeSessionLastSeenAt` records when that session was last seen doing
 * something. It is what lets the platform refuse a second sign-in while the
 * account is busy elsewhere, and what expires an abandoned session instead of
 * letting it live for the full token lifetime.
 */

const SESSION_CACHE_TTL_MS = 5_000;

/** Which account table the session belongs to. */
export type SessionSubject = "user" | "student";

export interface ActiveSessionState {
  activeSessionId: string | null;
  /** Epoch ms of the last seen activity, or null when nothing is recorded. */
  lastSeenAt: number | null;
  ip: string | null;
  userAgent: string | null;
}

interface CachedSessionState extends ActiveSessionState {
  expires: number;
}

const sessionCache = new Map<string, CachedSessionState>();

/** Accounts touched in this process, so the write is not repeated per request. */
const touchCache = new Map<string, number>();
const TOUCH_MIN_INTERVAL_MS = 20_000;

const cacheKey = (subject: SessionSubject, accountId: number) => `${subject}:${accountId}`;

export function invalidateSessionCache(subject?: SessionSubject, accountId?: number): void {
  if (subject && typeof accountId === "number") {
    sessionCache.delete(cacheKey(subject, accountId));
    touchCache.delete(cacheKey(subject, accountId));
  } else {
    sessionCache.clear();
    touchCache.clear();
  }
  // The tenancy resolver caches the consultancy a token maps to. Once a session
  // is rotated the old token must stop resolving to a tenancy, so its cached
  // entry has to go too.
  void import("./request-tenancy")
    .then((mod) => mod.invalidateRequestTenancyCache())
    .catch(() => {});
}

/**
 * Reads the session currently allowed to act for an account, together with the
 * last activity recorded for it. Cached briefly so a burst of requests does not
 * hit the database once per call; the cache is invalidated explicitly whenever
 * this process rotates or touches a session.
 */
export async function getActiveSession(
  subject: SessionSubject,
  accountId: number
): Promise<ActiveSessionState | null> {
  const key = cacheKey(subject, accountId);
  const cached = sessionCache.get(key);
  if (cached && cached.expires > Date.now()) {
    const { activeSessionId, lastSeenAt, ip, userAgent } = cached;
    return { activeSessionId, lastSeenAt, ip, userAgent };
  }

  const select = {
    activeSessionId: true,
    activeSessionLastSeenAt: true,
    activeSessionAt: true,
    activeSessionIp: true,
    activeSessionUserAgent: true,
  };

  try {
    const account =
      subject === "student"
        ? await baseDb.student.findUnique({ where: { id: accountId }, select })
        : await baseDb.user.findUnique({ where: { id: accountId }, select });
    if (!account) {
      sessionCache.delete(key);
      return null;
    }

    // A session that has never sent a heartbeat is still dated by its login, so
    // an idle policy can be enforced for accounts that predate this column.
    const stamp = account.activeSessionLastSeenAt ?? account.activeSessionAt ?? null;
    const state: CachedSessionState = {
      activeSessionId: account.activeSessionId ?? null,
      lastSeenAt: stamp ? new Date(stamp).getTime() : null,
      ip: account.activeSessionIp ?? null,
      userAgent: account.activeSessionUserAgent ?? null,
      expires: Date.now() + SESSION_CACHE_TTL_MS,
    };
    sessionCache.set(key, state);
    return state;
  } catch {
    // If the lookup fails we cannot prove the session is current. Deny rather
    // than let an unverifiable token through.
    return null;
  }
}

/** Returns the id of the session allowed to act, or `null` when there is none. */
export async function getActiveSessionId(
  subject: SessionSubject,
  accountId: number
): Promise<string | null> {
  const state = await getActiveSession(subject, accountId);
  return state?.activeSessionId ?? null;
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
  const now = new Date();
  const data = {
    activeSessionId: sid,
    activeSessionAt: now,
    activeSessionLastSeenAt: now,
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
 *
 * The activity stamp is dropped as well: a released session must stop counting
 * as "still open at another location", otherwise signing out would leave the
 * account unable to sign back in until the idle window passes.
 *
 * `sessionId` is the id claimed by the token asking to sign out. When it no
 * longer matches the stored one the account is already live somewhere else — a
 * browser whose session was taken over is calling logout — and rotating would
 * sign out the *newer* location instead. Such a request becomes a no-op.
 */
export async function endSession(
  subject: SessionSubject,
  accountId: number,
  sessionId?: string | null
): Promise<void> {
  try {
    if (sessionId) {
      const state = await getActiveSession(subject, accountId);
      if (state?.activeSessionId && state.activeSessionId !== sessionId) {
        invalidateSessionCache(subject, accountId);
        return;
      }
    }
    const data = {
      activeSessionId: randomUUID(),
      activeSessionAt: new Date(),
      activeSessionLastSeenAt: null,
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
 * Records that the active session was just used, which is what keeps it alive
 * against the inactivity timeout.
 *
 * Called on every heartbeat, so the write is throttled per account: refreshing
 * a timestamp once every few seconds of browsing has no security value and does
 * have a database cost.
 */
export async function touchSession(
  subject: SessionSubject,
  accountId: number,
  opts: { force?: boolean } = {}
): Promise<void> {
  const key = cacheKey(subject, accountId);
  const last = touchCache.get(key) ?? 0;
  if (!opts.force && Date.now() - last < TOUCH_MIN_INTERVAL_MS) return;
  touchCache.set(key, Date.now());

  try {
    if (subject === "student") {
      await baseDb.student.update({
        where: { id: accountId },
        data: { activeSessionLastSeenAt: new Date() },
      });
    } else {
      await baseDb.user.update({
        where: { id: accountId },
        data: { activeSessionLastSeenAt: new Date() },
      });
    }
  } catch {
    // A failed stamp must not sign anybody out; the next heartbeat retries once
    // the throttle window has passed.
    touchCache.delete(key);
  }

  // The fresh timestamp has to be visible immediately, otherwise a session kept
  // alive at the very edge of the timeout could be expired from cached data.
  sessionCache.delete(key);
}

/**
 * True while another location is actively using this account's session.
 *
 * Only a session seen within the idle window counts as live: a laptop that was
 * closed days ago must not keep the account out of the system, and the same
 * window is what `isSessionCurrent` uses to expire sessions, so the two rules
 * can never contradict each other.
 */
export async function isSessionLiveElsewhere(
  subject: SessionSubject,
  accountId: number
): Promise<{ live: boolean; state: ActiveSessionState | null }> {
  const state = await getActiveSession(subject, accountId);
  if (!state?.activeSessionId || state.lastSeenAt == null) return { live: false, state };
  const timeoutMs = await getSessionIdleTimeoutMs();
  return { live: Date.now() - state.lastSeenAt <= timeoutMs, state };
}

/**
 * True when the presented token still matches the session the account is
 * allowed to use. Tokens issued before this feature existed carry no `sid`
 * and are therefore rejected: they cannot be tied to a single session.
 *
 * A session that has not been seen within the configured inactivity window is
 * rejected too, which is the server-side half of the automatic sign-out: a
 * stale cookie cannot keep calling the API even if the browser never logs out.
 * A session with no recorded activity at all is left alone, so an account can
 * never be locked out by a missing timestamp.
 */
export async function isSessionCurrent(
  subject: SessionSubject,
  accountId: number,
  sessionId: string | undefined | null
): Promise<boolean> {
  return (await getSessionCurrency(subject, accountId, sessionId)).current;
}

/**
 * Why a session was refused, in the few words the browser needs to say something
 * true. "Signed out because you were away" and "signed out because somebody else
 * logged in" look identical to a caller that only sees a 401, and only the second
 * one is an incident worth reporting.
 */
export type SessionLossReason = "ok" | "missing" | "none" | "superseded" | "idle";

export async function getSessionCurrency(
  subject: SessionSubject,
  accountId: number,
  sessionId: string | undefined | null
): Promise<{ current: boolean; reason: SessionLossReason }> {
  // No claim at all: a token minted before the registry existed.
  if (!sessionId) return { current: false, reason: "missing" };

  const state = await getActiveSession(subject, accountId);
  if (!state?.activeSessionId) return { current: false, reason: "none" };
  // The stored id moved on, which is what a sign-in elsewhere (or a logout)
  // does to this token: it no longer represents the current session.
  if (state.activeSessionId !== sessionId) return { current: false, reason: "superseded" };
  if (state.lastSeenAt == null) return { current: true, reason: "ok" };

  const timeoutMs = await getSessionIdleTimeoutMs();
  return Date.now() - state.lastSeenAt <= timeoutMs
    ? { current: true, reason: "ok" }
    : { current: false, reason: "idle" };
}
