import { Prisma } from "@prisma/client";

/**
 * Course credits are stored as DECIMAL(6,2) so a fractional credit value such
 * as 22.5 is stored exactly instead of being truncated by an integer column.
 *
 * Prisma surfaces DECIMAL columns as `Prisma.Decimal` instances. Those are
 * class instances, not plain objects, so they cannot cross the
 * server-component boundary to a client component, and they serialise to a
 * string over JSON. Both problems are avoided by converting to a plain
 * number at every boundary, which is what these helpers are for.
 */

/** Convert a stored credits value into a plain number for the wire. */
export function toCourseCredits(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Parse a credits value coming from a form or an import. Fractional values are
 * allowed, negative values are not, and the result is rounded to the two
 * decimal places the column can hold.
 */
export function parseCourseCredits(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;

  const raw = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(raw)) return 0;
  if (raw < 0) return 0;

  return Math.round(raw * 100) / 100;
}

/** True when the supplied value is a usable credits amount. */
export function isValidCourseCredits(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  if (text === "") return false;
  const parsed = Number(text);
  return Number.isFinite(parsed) && parsed >= 0;
}
