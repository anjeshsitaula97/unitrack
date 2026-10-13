import crypto from "crypto";

const LOWER = "abcdefghijkmnopqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*";
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

/**
 * Length of auto-generated temporary passwords.
 *
 * Must stay comfortably above the 6-character minimum enforced by the access
 * and auth schemas, so a generated credential is never rejected as too short.
 */
export const DEFAULT_PASSWORD_LENGTH = 12;

const pick = (chars: string): string => chars[crypto.randomInt(chars.length)];

const shuffle = (chars: string[]): string[] => {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars;
};

/**
 * Generate a cryptographically strong password guaranteed to contain at least
 * one lowercase letter, uppercase letter, digit and symbol.
 *
 * The previous implementations either used `Math.random` (student portal) or
 * produced a password that callers could accidentally replace with a stale,
 * too-short value (access invites). This centralises a safe default.
 */
export function generateStrongPassword(length: number = DEFAULT_PASSWORD_LENGTH): string {
  const size = Math.max(length, 8);
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  const rest = Array.from({ length: size - required.length }, () => pick(ALL));
  return shuffle([...required, ...rest]).join("");
}
