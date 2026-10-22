/**
 * Shared intake parsing.
 *
 * A course's `intake` column is a JSON string, but it has accumulated several
 * shapes over the years:
 *
 *   - `[{ name, openDate, deadline, startDate }]` — the current format
 *   - `["Spring 2026", "Autumn 2026"]` — legacy list of plain names
 *   - `"Spring 2026"` — a single legacy name
 *   - `"Spring 2026, Autumn 2026"` — a legacy comma-separated list
 *   - a JSON string that was double-encoded (`"[...]"`)
 *   - a *corrupted* array of index-keyed objects, produced when a string was
 *     spread with `{...value}` and then re-serialised
 *
 * Every reader has to cope with all of them, otherwise the UI shows raw JSON.
 * This module is the single place that knows how to normalise them.
 */

export interface IntakeEntry {
  /** Display name, e.g. "Spring 2026". */
  name: string;
  /** ISO date the applications open. */
  openDate: string;
  /** ISO date the applications close. */
  deadline: string;
  /** Optional ISO date the course itself starts. */
  startDate?: string;
}

/** The shapes a stored `intake` value may take. */
export type RawIntake = unknown;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (source: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
};

/**
 * Detects the corrupted "spread a string into an object" shape:
 * `{ "0": "[", "1": "{", ... }` — an object whose keys are character indexes.
 */
const isSpreadGarbage = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((key) => /^\d+$/.test(key));
};

/** Turns one raw value into an intake entry, or `null` when it is not usable. */
function toEntry(value: unknown): IntakeEntry | null {
  if (typeof value === "string") {
    const name = value.trim();
    if (!name) return null;
    return { name, openDate: "", deadline: "", startDate: "" };
  }

  if (Array.isArray(value)) {
    // A corrupted entry is an array of index-keyed objects; treat it as garbage.
    if (value.length > 0 && value.every(isSpreadGarbage)) return null;
    return null;
  }

  if (!isObject(value)) return null;
  if (isSpreadGarbage(value)) return null;

  const name = readString(value, ["name", "intake", "label", "title"]);
  if (!name) return null;

  // An explicitly stored (but empty) `openDate` means "not set" — only fall
  // back to `startDate` when the key is absent altogether.
  const hasExplicitOpenDate = "openDate" in value || "open_date" in value;
  const openDate = hasExplicitOpenDate
    ? readString(value, ["openDate", "open_date"])
    : readString(value, ["startDate", "start_date"]);

  return {
    name,
    openDate,
    deadline: readString(value, ["deadline", "closeDate", "close_date", "endDate"]),
    startDate: readString(value, ["startDate", "start_date"]),
  };
}

/** Splits a legacy comma/semicolon separated list of intake names. */
function splitLegacyNames(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Normalises any stored `intake` value into a list of intake entries.
 *
 * Never throws and never returns a partially-parsed raw value.
 */
export function parseIntakes(raw: RawIntake): IntakeEntry[] {
  if (raw === null || raw === undefined) return [];

  let value: unknown = raw;

  // Unwrap JSON strings repeatedly. A stored value may be JSON-encoded once
  // (the normal case) or twice (a value that was stringified again on save).
  let guard = 0;
  while (typeof value === "string" && guard < 4) {
    guard += 1;
    const trimmed = value.trim();
    if (!trimmed) return [];

    const looksLikeJson =
      trimmed.startsWith("[") || trimmed.startsWith("{") || trimmed.startsWith('"');
    if (!looksLikeJson) {
      // A plain legacy name (or a comma-separated list of them).
      return splitLegacyNames(trimmed).map((name) => ({
        name,
        openDate: "",
        deadline: "",
        startDate: "",
      }));
    }

    try {
      value = JSON.parse(trimmed);
    } catch {
      // It looked like JSON but is not — broken JSON is garbage, not a name.
      return [];
    }
  }

  if (Array.isArray(value)) {
    const entries: IntakeEntry[] = [];
    for (const item of value) {
      const entry = toEntry(item);
      if (entry) entries.push(entry);
    }
    return entries;
  }

  const single = toEntry(value);
  return single ? [single] : [];
}

/** Serialises intake entries back to the stored JSON representation. */
export function serializeIntakes(entries: IntakeEntry[]): string {
  return JSON.stringify(
    entries.map((entry) => ({
      name: entry.name.trim(),
      openDate: entry.openDate || "",
      deadline: entry.deadline || "",
      startDate: entry.startDate || "",
    }))
  );
}

export interface IntakeStatus {
  label: "Upcoming" | "Open" | "Closed";
  className: string;
}

/** Status of a single intake relative to today. */
export function getIntakeStatus(
  intake: { openDate?: string; deadline?: string },
  now: Date = new Date()
): IntakeStatus | null {
  if (!intake.openDate || !intake.deadline) return null;
  const open = new Date(intake.openDate);
  const deadline = new Date(intake.deadline);
  if (Number.isNaN(open.getTime()) || Number.isNaN(deadline.getTime())) return null;

  if (now < open) return { label: "Upcoming", className: "text-amber-600 bg-amber-50" };
  if (now > deadline) return { label: "Closed", className: "text-rose-600 bg-rose-50" };
  return {
    label: "Open",
    className: "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-500/20",
  };
}

/**
 * The short label shown on a course card: the open intake when there is one,
 * otherwise the first intake plus a count of the remaining ones.
 */
export function formatIntakeLabel(raw: RawIntake, now: Date = new Date()): string {
  const intakes = parseIntakes(raw);
  if (intakes.length === 0) return "TBA";

  const openIntake = intakes.find((intake) => {
    const status = getIntakeStatus(intake, now);
    return status?.label === "Open";
  });

  if (openIntake) return `${openIntake.name} (Open)`;

  const first = intakes[0];
  return `${first.name}${intakes.length > 1 ? ` (+${intakes.length - 1})` : ""}`;
}
