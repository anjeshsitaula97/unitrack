import { baseDb } from "./base-db";

/**
 * Platform-wide session policy.
 *
 * Two rules depend on the same number: how long an account may sit idle before
 * it is signed out, and how long a session therefore counts as "still open at
 * another location" when someone tries to sign in again. Keeping both here means
 * a login cannot be refused over a session the server has already expired.
 */

export const DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES = 15;
export const MIN_SESSION_IDLE_TIMEOUT_MINUTES = 1;
export const MAX_SESSION_IDLE_TIMEOUT_MINUTES = 720;
/** Fallback for a platform row that predates the column. */
export const DEFAULT_SESSION_OTP_TAKEOVER_ENABLED = true;

/** Shown verbatim when a sign-in is refused because the account is live elsewhere. */
export const ALREADY_LOGGED_IN_ERROR =
  "The user is already logged in at another location. Please logout from the location before logging in to the system.";

/** Query flag the login pages read to explain an auto sign-out. */
export const IDLE_LOGOUT_REASON = "idle";

/** Shown on the login form after the shell signed the account out for inactivity. */
export const IDLE_LOGOUT_MESSAGE =
  "You were signed out because of inactivity. Please sign in again.";

/**
 * Query flag the login pages read when the session ended because the account
 * signed in somewhere else. Telling this apart from an idle timeout matters: an
 * account that was just taken over is a security event, while an idle sign-out
 * is a normal Tuesday, and the same wording for both would send people to support.
 */
export const REPLACED_LOGOUT_REASON = "elsewhere";

/** Shown when another location signed in and superseded this session. */
export const REPLACED_LOGOUT_MESSAGE =
  "Your account signed in at another location, so this session has ended.";

/**
 * The notice a login form should show for an automatic sign-out, given the
 * `reason` flag in its URL. Empty for a plain visit, and for anything unrecognised
 * rather than guessing at a security event that did not happen.
 */
export function getSessionEndNotice(reason?: string): string {
  if (reason === IDLE_LOGOUT_REASON) return IDLE_LOGOUT_MESSAGE;
  if (reason === REPLACED_LOGOUT_REASON) return REPLACED_LOGOUT_MESSAGE;
  return "";
}

/**
 * The value lives on the platform `SystemSettings` row (`consultancyId IS NULL`)
 * so one Super Admin decision applies to every consultancy. Read often — every
 * session check needs it — and cached briefly, the same way the session registry
 * caches the active session id.
 */
const POLICY_CACHE_TTL_MS = 30_000;

let cachedTimeout: { minutes: number; expires: number } | null = null;
let cachedTakeoverFlag: { enabled: boolean; expires: number } | null = null;

export function clampIdleTimeoutMinutes(value: unknown): number {
  // An absent value means "no decision recorded", which is the default, not zero
  // minutes; Number(null) would otherwise evaluate to 0 and clamp to the minimum.
  if (value == null || value === "") return DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES;
  return Math.min(
    MAX_SESSION_IDLE_TIMEOUT_MINUTES,
    Math.max(MIN_SESSION_IDLE_TIMEOUT_MINUTES, Math.round(parsed))
  );
}

export async function getSessionIdleTimeoutMinutes(): Promise<number> {
  if (cachedTimeout && cachedTimeout.expires > Date.now()) return cachedTimeout.minutes;

  try {
    const row = await baseDb.systemSettings.findFirst({
      where: { consultancyId: null },
      select: { sessionIdleTimeoutMinutes: true },
      orderBy: { id: "asc" },
    });
    const minutes =
      row?.sessionIdleTimeoutMinutes == null
        ? DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES
        : clampIdleTimeoutMinutes(row.sessionIdleTimeoutMinutes);
    cachedTimeout = { minutes, expires: Date.now() + POLICY_CACHE_TTL_MS };
    return minutes;
  } catch {
    // With no readable policy the built-in default still protects the account;
    // failing open (never expiring) would be the worse mistake.
    return DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES;
  }
}

export async function getSessionIdleTimeoutMs(): Promise<number> {
  return (await getSessionIdleTimeoutMinutes()) * 60_000;
}

/**
 * Whether an account owner may reclaim their own session with an emailed code.
 *
 * Read on the public login endpoints, so it is cached exactly like the idle
 * window. When the platform row is missing — a fresh install that never opened
 * Settings — the feature is on, because the refusal it relieves is already live
 * and a hidden escape hatch would leave people stuck behind an Admin.
 */
export async function isSessionOtpTakeoverEnabled(): Promise<boolean> {
  if (cachedTakeoverFlag && cachedTakeoverFlag.expires > Date.now()) {
    return cachedTakeoverFlag.enabled;
  }
  try {
    const row = await baseDb.systemSettings.findFirst({
      where: { consultancyId: null },
      select: { sessionOtpTakeoverEnabled: true },
      orderBy: { id: "asc" },
    });
    const enabled = row?.sessionOtpTakeoverEnabled ?? DEFAULT_SESSION_OTP_TAKEOVER_ENABLED;
    cachedTakeoverFlag = { enabled, expires: Date.now() + POLICY_CACHE_TTL_MS };
    return enabled;
  } catch {
    // Same reasoning as the idle window: an unreadable policy keeps the
    // built-in behaviour instead of silently disabling a relief route.
    return DEFAULT_SESSION_OTP_TAKEOVER_ENABLED;
  }
}

/** Called after the policy is saved so the new value applies immediately. */
export function invalidateSessionPolicyCache(): void {
  cachedTimeout = null;
  cachedTakeoverFlag = null;
}
