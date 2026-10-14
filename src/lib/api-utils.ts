import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "./session";
import type { SessionPayload } from "./session";
import { isSuperAdminRole } from "./permission-catalog";

export type { SessionPayload } from "./session";

export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * The role lives in the token so it survives without a database round-trip, but
 * a token issued before a demotion, disablement or deletion would otherwise keep
 * its old authority until it expires. Re-reading the account closes that window.
 * Cached briefly so a single page load does not repeat the lookup per request.
 *
 * The same lookup carries the role's stored permission grants so that
 * Settings > Role Permissions is actually enforced without an extra query.
 */
const ROLE_CACHE_TTL_MS = 30_000;
const roleCache = new Map<
  number,
  {
    role: string;
    name: string;
    permissions?: string[];
    consultancyId: number | null;
    expires: number;
  }
>();

/**
 * Reads a Role row's stored grant list. A missing row, empty JSON, malformed
 * JSON or an unparseable shape all resolve to `undefined`, which makes
 * `hasPermission` fall back to the catalog defaults instead of denying.
 */
function parseStoredPermissions(raw: string | null | undefined): string[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    const ids = parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
    return ids.length > 0 ? ids : undefined;
  } catch {
    return undefined;
  }
}

export function invalidateRoleCache(userId?: number): void {
  if (typeof userId === "number") roleCache.delete(userId);
  else roleCache.clear();
}

async function getCurrentAccountRole(id: number): Promise<{
  role: string;
  name: string;
  permissions?: string[];
  consultancyId: number | null;
} | null> {
  const cached = roleCache.get(id);
  if (cached && cached.expires > Date.now()) {
    return {
      role: cached.role,
      name: cached.name,
      permissions: cached.permissions,
      consultancyId: cached.consultancyId,
    };
  }

  const { baseDb } = await import("./base-db");
  const user = await baseDb.user.findUnique({
    where: { id },
    select: { role: true, name: true, status: true, consultancyId: true },
  });

  if (!user) {
    roleCache.delete(id);
    return null;
  }
  if (user.status && user.status.toLowerCase() !== "active") {
    roleCache.delete(id);
    return null;
  }

  const consultancyId = user.consultancyId ?? null;

  // Role grants are optional configuration; never let a lookup failure here
  // revoke access, because the static catalog is a safe fallback.
  let stored: string[] | undefined;
  try {
    const roleRow = await baseDb.role.findFirst({
      where: { name: user.role, consultancyId },
      select: { permissions: true },
    });
    stored = parseStoredPermissions(roleRow?.permissions);
  } catch {
    stored = undefined;
  }

  const entry = {
    role: user.role,
    name: user.name,
    permissions: stored,
    consultancyId,
    expires: Date.now() + ROLE_CACHE_TTL_MS,
  };
  roleCache.set(id, entry);
  return {
    role: entry.role,
    name: entry.name,
    permissions: entry.permissions,
    consultancyId: entry.consultancyId,
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const session = await verifyAuth(token);
    // Student subjects belong to the student portal and must never reach admin APIs.
    if (session.subject === "student") return null;

    // Trust the stored account state, not the role claim baked into the token.
    const account = await getCurrentAccountRole(session.id);
    if (!account) return null;

    // A Super Admin owns the platform and may switch which consultancy they are
    // viewing. The choice lives in a non-HttpOnly cookie; absent or "all" means
    // platform scope (every consultancy).
    let consultancyId = account.consultancyId;
    if (isSuperAdminRole(account.role)) {
      const selected = cookieStore.get("active_consultancy")?.value;
      if (selected && selected !== "all") {
        const parsed = Number(selected);
        if (Number.isInteger(parsed) && parsed > 0) consultancyId = parsed;
      } else {
        consultancyId = null;
      }
    }

    return {
      ...session,
      role: account.role,
      name: session.name || account.name,
      consultancyId,
      // Left undefined when the role has no stored grant list, which makes
      // `hasPermission` use the catalog defaults.
      permissions: account.permissions,
    };
  } catch {
    return null;
  }
}

export async function getStudentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("student_token")?.value;
  if (!token) return null;
  try {
    const session = await verifyAuth(token);
    if (session.subject !== "student") return null;

    // Same staleness problem as staff: drop the session if the student record
    // has since been removed.
    const { baseDb } = await import("./base-db");
    const student = await baseDb.student.findUnique({
      where: { id: session.id },
      select: { id: true, consultancyId: true },
    });
    if (!student) return null;

    return { ...session, consultancyId: student.consultancyId ?? null };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: apiError("Unauthorized", 401) };
  }
  return { session, error: null };
}

export function requireRole(
  session: SessionPayload | null,
  roles: readonly string[]
): NextResponse | null {
  if (!session || !roles.includes(session.role as string)) {
    return apiError("Forbidden: insufficient permissions", 403);
  }
  return null;
}

export interface PaginationParams {
  page: number;
  perPage: number;
  search: string;
  skip: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("perPage") || "20")));
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * perPage;
  return { page, perPage, search, skip };
}

export function buildSearchFilter(search: string, fields: string[]) {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search },
    })),
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    total,
    page: params.page,
    perPage: params.perPage,
    totalPages: Math.ceil(total / params.perPage),
  };
}

export { checkRoutePermission, checkPermission } from "./rbac";
