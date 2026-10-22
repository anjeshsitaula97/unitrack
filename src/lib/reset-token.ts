import crypto from "crypto";

/**
 * Reset-token handling.
 *
 * Reset tokens used to be stored verbatim in `PasswordResetToken.otp`, so any
 * read of that table — SQL injection, a backup export, a stolen database dump —
 * handed out immediately usable reset links. Only the digest is stored now.
 *
 * SHA-256 is the right primitive here: the token is 32 bytes of cryptographic
 * randomness, so there is nothing to brute-force and no need for a slow KDF.
 * (bcrypt would be pointless work for a high-entropy secret, and would make
 * every lookup a 100ms+ comparison.)
 */

const RESET_TOKEN_BYTES = 32;

/** The digest that is stored in the database in place of the secret. */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

/** A reset token is a 64-character hex string (32 random bytes). */
export function isResetTokenFormat(token: unknown): token is string {
  return typeof token === "string" && /^[0-9a-f]{64}$/i.test(token);
}

/** Mints a fresh reset token and returns both the secret and its digest. */
export function createResetToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  return { token, hash: hashResetToken(token) };
}

/** Constant-time comparison of two stored digests. */
export function timingSafeEqualDigest(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
