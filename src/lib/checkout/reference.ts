import { randomInt } from "crypto";

/**
 * Transaction references are shared with both gateways:
 * - eSewa requires alphanumeric + hyphen only.
 * - connectIPS caps TXNID at 20 characters.
 * Confusable characters (0/O, 1/I) are excluded.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReference(): string {
  const now = new Date();
  const ymd = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  let suffix = "";
  for (let index = 0; index < 6; index += 1) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }

  return `UT-${ymd}-${suffix}`; // e.g. UT-260921-K7M2QF
}
