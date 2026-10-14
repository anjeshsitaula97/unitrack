export const TUITION_PERIOD_YEAR = "Year";
export const TUITION_PERIOD_SEMESTER = "Semester";

/** Parses a currency-ish string ("15,000", "$15k" -> number) into a number. */
export function parseAmount(value?: string | number | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

/**
 * Returns the yearly tuition for a course. A per-semester fee is annualised
 * by assuming two semesters per academic year.
 */
export function annualTuition(fee?: string | number | null, period?: string | null): number | null {
  const n = parseAmount(fee);
  if (n === null) return null;
  return period === TUITION_PERIOD_SEMESTER ? n * 2 : n;
}

export function tuitionPeriodLabel(period?: string | null): string {
  return period === TUITION_PERIOD_SEMESTER ? "per semester" : "per year";
}

export function isSemesterPeriod(period?: string | null): boolean {
  return period === TUITION_PERIOD_SEMESTER;
}
