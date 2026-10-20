import { runWithConsultancy } from "./consultancy";

/**
 * Helpers for the News feature.
 *
 * Visibility rule: a news post is either platform-wide (audience "all", stored
 * with a null consultancyId) or scoped to a single consultancy. The Prisma
 * tenancy extension auto-filters every query to the active consultancy, which
 * would hide platform-wide rows from scoped users, so reads run through
 * `withNewsScope` (platform scope) with an explicit visibility filter instead.
 */

export const NEWS_AUDIENCE_ALL = "all";
export const NEWS_AUDIENCE_CONSULTANCY = "consultancy";

export type NewsAudience = typeof NEWS_AUDIENCE_ALL | typeof NEWS_AUDIENCE_CONSULTANCY;

export function isNewsAudience(value: unknown): value is NewsAudience {
  return value === NEWS_AUDIENCE_ALL || value === NEWS_AUDIENCE_CONSULTANCY;
}

/** Runs a query with the tenant filter disabled so platform-wide rows are visible. */
export function withNewsScope<T>(fn: () => T): T {
  return runWithConsultancy({ consultancyId: null }, fn);
}

/** Filter selecting the posts a consultancy is allowed to see. */
export function newsVisibilityWhere(consultancyId: number | null): Record<string, unknown> {
  // Platform scope (Super Admin) sees everything.
  if (consultancyId == null) return {};
  return { OR: [{ audience: NEWS_AUDIENCE_ALL }, { consultancyId }] };
}
