import crypto from "crypto";
import { baseDb } from "./base-db";
import { hashResetToken, timingSafeEqualDigest } from "./reset-token";
import type { ActiveSessionState, SessionSubject } from "./session-registry";
import { ALREADY_LOGGED_IN_ERROR, isSessionOtpTakeoverEnabled } from "./session-policy";
import { logError } from "./logger";

/**
 * Ownership codes for reclaiming a session that is stuck at another location.
 *
 * When a sign-in is refused with "already logged in elsewhere", the person in
 * front of the form has already proven they know the password. The missing proof
 * is that they *also* own the account, rather than having bought a leaked
 * credential: that is what a code delivered to the registered mailbox answers.
 *
 * The window is deliberately short (two minutes) because the code is the only
 * thing standing between a password thief and an active account, and because the
 * person is sitting at the screen waiting for it.
 *
 * These rows live in their own table, never in `PasswordResetToken`. That table
 * is consumed by `/api/auth/verify-otp`, which turns any unverified row it finds
 * for an address into a password-reset token, so a session code stored there
 * would quietly become a password change.
 */

export const SESSION_OTP_TTL_MS = 2 * 60_000;
export const SESSION_OTP_LENGTH = 6;
/** Wrong codes accepted per issue. Past this the code dies and must be re-sent. */
export const SESSION_OTP_MAX_ATTEMPTS = 5;
/**
 * Minimum spacing between two sends to the same address. Without it a caller
 * could keep the form open and mail-bomb a mailbox, and each send is also a
 * chance to guess against a fresh code.
 */
export const SESSION_OTP_RESEND_COOLDOWN_MS = 30_000;

/** Machine-readable reasons the API turns into HTTP codes. */
export type SessionOtpFailure =
  "RESEND_TOO_FAST" | "NOT_FOUND" | "EXPIRED" | "TOO_MANY_ATTEMPTS" | "INVALID";

export type SessionOtpIssueResult =
  | {
      ok: true;
      otp: string;
      expiresAt: Date;
      /** Seconds left, so the form can count them down instead of guessing. */
      ttlSeconds: number;
    }
  | { ok: false; failure: SessionOtpFailure; error: string };

export type SessionOtpVerifyResult =
  { ok: true } | { ok: false; failure: SessionOtpFailure; error: string; attemptsLeft?: number };

/**
 * Hides most of the address that the code was sent to. The form already knows
 * what was typed, so this is not a secret from the caller — it is the shape the
 * caller is *entitled* to see when the account belongs to somebody else, and it
 * keeps a shoulder-surfing reader from confirming a full address.
 */
export function maskEmail(email: string): string {
  const value = String(email || "").trim();
  const [local, domain] = value.split("@");
  if (!local || !domain) return value ? `${value.slice(0, 1)}•••` : "";
  const visible = local.slice(0, 1);
  const hidden = "•".repeat(Math.max(3, Math.min(local.length - 1, 12)));
  return `${visible}${hidden}@${domain}`;
}

/** Newest row for this address, whatever its state; expired rows are swept first. */
async function currentRow(subject: SessionSubject, email: string) {
  return baseDb.sessionOtpToken.findFirst({
    where: { subject, email },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Creates a fresh code for an address. Any pending code is dropped first, so
 * only the last one sent can ever be spent.
 */
export async function issueSessionOtp(params: {
  subject: SessionSubject;
  email: string;
  consultancyId?: number | null;
}): Promise<SessionOtpIssueResult> {
  const email = String(params.email || "")
    .trim()
    .toLowerCase();
  const previous = await currentRow(params.subject, email);
  if (
    previous &&
    Date.now() - new Date(previous.createdAt).getTime() < SESSION_OTP_RESEND_COOLDOWN_MS
  ) {
    const wait = Math.ceil(
      (SESSION_OTP_RESEND_COOLDOWN_MS - (Date.now() - new Date(previous.createdAt).getTime())) /
        1000
    );
    return {
      ok: false,
      failure: "RESEND_TOO_FAST",
      error: `Please wait ${wait} second${wait === 1 ? "" : "s"} before requesting another code.`,
    };
  }

  const otp = String(crypto.randomInt(10 ** (SESSION_OTP_LENGTH - 1), 10 ** SESSION_OTP_LENGTH));
  const expiresAt = new Date(Date.now() + SESSION_OTP_TTL_MS);

  // One code per address and purpose: an older outstanding code must stop
  // working the moment a new one is issued, or two codes would be guessable.
  await baseDb.sessionOtpToken.deleteMany({
    where: { subject: params.subject, email },
  });

  await baseDb.sessionOtpToken.create({
    data: {
      consultancyId: params.consultancyId ?? null,
      subject: params.subject,
      email,
      // Only the digest is stored. The plaintext exists in this request's memory
      // and in the email, never at rest.
      tokenHash: hashResetToken(otp),
      expiresAt,
    },
  });

  void sweepExpiredOtps();

  return { ok: true, otp, expiresAt, ttlSeconds: Math.floor(SESSION_OTP_TTL_MS / 1000) };
}

/**
 * Checks a submitted code and spends it on success.
 *
 * A correct code is deleted rather than flagged, which makes it single-use: a
 * replay of the same request cannot log anybody in twice.
 */
export async function verifySessionOtp(params: {
  subject: SessionSubject;
  email: string;
  otp: string;
}): Promise<SessionOtpVerifyResult> {
  const email = String(params.email || "")
    .trim()
    .toLowerCase();
  const row = await currentRow(params.subject, email);

  if (!row) {
    return {
      ok: false,
      failure: "NOT_FOUND",
      error: "No pending verification code. Please request a new one.",
    };
  }

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await baseDb.sessionOtpToken
      .deleteMany({ where: { subject: params.subject, email } })
      .catch(() => {});
    return {
      ok: false,
      failure: "EXPIRED",
      error: "That code has expired. Please request a new one.",
    };
  }

  if (row.attempts >= SESSION_OTP_MAX_ATTEMPTS) {
    await baseDb.sessionOtpToken
      .deleteMany({ where: { subject: params.subject, email } })
      .catch(() => {});
    return {
      ok: false,
      failure: "TOO_MANY_ATTEMPTS",
      error: "Too many incorrect codes. Please request a new one.",
    };
  }

  // The row holds the digest, so the digest of what was typed is what gets
  // compared, in constant time: a 6-digit code is otherwise guessable by timing.
  if (!timingSafeEqualDigest(row.tokenHash, hashResetToken(String(params.otp || "").trim()))) {
    const attempts = row.attempts + 1;
    await baseDb.sessionOtpToken
      .update({ where: { id: row.id }, data: { attempts } })
      .catch(() => {});
    const attemptsLeft = Math.max(0, SESSION_OTP_MAX_ATTEMPTS - attempts);
    return {
      ok: false,
      failure: "INVALID",
      error: `That code is not correct. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.`,
      attemptsLeft,
    };
  }

  await baseDb.sessionOtpToken.deleteMany({ where: { subject: params.subject, email } });
  return { ok: true };
}

/** Drops any outstanding code for an address, e.g. when a takeover completes. */
export async function consumeSessionOtps(subject: SessionSubject, email: string): Promise<void> {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  try {
    await baseDb.sessionOtpToken.deleteMany({ where: { subject, email: normalized } });
  } catch (error) {
    logError("Clear session OTP", error);
  }
}

/**
 * Expired codes are useless but they are never read again by anything, so they
 * would accumulate for as long as people mistype them. Swept at most once an
 * hour per process, from the path that already writes to the table.
 */
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;
let lastSweepAt = 0;

export async function sweepExpiredOtps(): Promise<void> {
  if (Date.now() - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = Date.now();
  try {
    await baseDb.sessionOtpToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  } catch (error) {
    logError("Sweep session OTPs", error);
  }
}

/**
 * What a refused sign-in tells the form, so the form knows what to offer.
 *
 * The refusal text itself is fixed wording, but next to it the person needs to
 * know *which* session is holding their account (so a stale phone can be found
 * and signed out) and whether an email code is available as a way through. When
 * a Super Admin has switched codes off, the answer is the same refusal with no
 * offer, and nothing else about the response changes.
 */
export async function sessionBlockedPayload(
  email: string,
  state: ActiveSessionState | null
): Promise<{
  error: string;
  code: "SESSION_ACTIVE_ELSEWHERE";
  session: { ip: string | null; userAgent: string | null; lastSeenAt: number | null };
  relogin: {
    otpEnabled: boolean;
    maskedEmail: string;
    otpSeconds: number;
    maxAttempts: number;
    resendSeconds: number;
  };
}> {
  const otpEnabled = await isSessionOtpTakeoverEnabled();
  return {
    error: ALREADY_LOGGED_IN_ERROR,
    code: "SESSION_ACTIVE_ELSEWHERE",
    session: {
      ip: state?.ip ?? null,
      userAgent: state?.userAgent ?? null,
      lastSeenAt: state?.lastSeenAt ?? null,
    },
    relogin: {
      otpEnabled,
      maskedEmail: otpEnabled ? maskEmail(email) : "",
      otpSeconds: Math.floor(SESSION_OTP_TTL_MS / 1000),
      maxAttempts: SESSION_OTP_MAX_ATTEMPTS,
      // Sent to the form so its countdown matches the server's rule instead of
      // hard-coding a number that can drift out of sync with this file.
      resendSeconds: Math.ceil(SESSION_OTP_RESEND_COOLDOWN_MS / 1000),
    },
  };
}
