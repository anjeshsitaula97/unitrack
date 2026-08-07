export interface ApplicationStatus {
  name: string;
  /** Free-form process stage label shown in the progress tracker. */
  stage: string;
}

export const DEFAULT_APPLICATION_STATUSES: ApplicationStatus[] = [
  { name: "Pending", stage: "Created" },
  { name: "Submitted", stage: "Application Started" },
  { name: "Processing", stage: "Reviewed (By UniTrack)" },
  { name: "Rejected", stage: "Submitted to School" },
  { name: "Approved", stage: "Offer received" },
];

/** Stage labels historically tied to the old fixed 1-5 process steps. */
const LEGACY_STAGE_BY_STEP = [
  "Created",
  "Application Started",
  "Reviewed (By UniTrack)",
  "Submitted to School",
  "Offer received",
];

function normalizeStatusName(name: string): string {
  return name.trim();
}

function normalizeStage(stage: unknown): string {
  if (typeof stage === "string" && stage.trim().length > 0) return stage.trim();
  if (typeof stage === "number" && Number.isFinite(stage)) {
    return LEGACY_STAGE_BY_STEP[Math.round(stage) - 1] || `Stage ${Math.round(stage)}`;
  }
  return "";
}

/**
 * Returns a valid, non-empty JSON array of application statuses.
 * Empty / invalid / unset values are normalized to the defaults so a
 * "no configuration" state never means "no statuses available".
 */
export function normalizeApplicationStatusesJson(value: string | null | undefined): string {
  const parsed = parseApplicationStatuses(value);
  return JSON.stringify(parsed);
}

/** Parses a stored value into application statuses, falling back to defaults. */
export function getApplicationStatuses(value: string | null | undefined): ApplicationStatus[] {
  return parseApplicationStatuses(value);
}

function parseApplicationStatuses(value: string | null | undefined): ApplicationStatus[] {
  try {
    const parsed = JSON.parse(value || "");
    if (Array.isArray(parsed)) {
      const cleaned = parsed
        .map((item) => ({
          name: typeof item?.name === "string" ? normalizeStatusName(item.name) : "",
          stage: normalizeStage(item?.stage ?? item?.step),
        }))
        .filter((item) => item.name.length > 0 && item.stage.length > 0);
      const seen = new Set<string>();
      const unique = cleaned.filter((item) => {
        const key = item.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (unique.length > 0) return unique;
    }
  } catch {}
  return DEFAULT_APPLICATION_STATUSES.map((s) => ({ ...s }));
}

export function isValidApplicationStatusList(statuses: ApplicationStatus[]): boolean {
  if (!Array.isArray(statuses) || statuses.length === 0) return false;
  const seen = new Set<string>();
  for (const s of statuses) {
    if (typeof s?.name !== "string" || s.name.trim().length === 0) return false;
    if (typeof s?.stage !== "string" || s.stage.trim().length === 0) return false;
    const key = s.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

/**
 * The ordered, deduplicated stage labels used to render the process tracker.
 * Stages appear in the order statuses are configured, duplicates collapsed.
 */
export function getStageSequence(statuses: ApplicationStatus[]): string[] {
  const seen = new Set<string>();
  const stages: string[] = [];
  for (const s of statuses) {
    const stage = s.stage.trim();
    if (!stage || seen.has(stage.toLowerCase())) continue;
    seen.add(stage.toLowerCase());
    stages.push(stage);
  }
  return stages;
}
