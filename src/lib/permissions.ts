import {
  isSuperAdminRole,
  resolvePermissions,
  STATIC_PERMISSION_MATRIX,
  type RoleSlug,
} from "./permission-catalog";

export type Role = RoleSlug;

export {
  PERMISSION_CATALOG,
  CATALOG_MODULES,
  STATIC_PERMISSION_MATRIX,
  isKnownPermission,
  isSuperAdminRole,
  permissionsForModule,
  resolvePermissions,
  roleSlugFor,
  type PermissionDef,
  type RoleSlug,
} from "./permission-catalog";

/**
 * Effective permissions for a role.
 *
 * `stored` is the role's persisted grant list (Settings > Role Permissions). It
 * wins when present and non-empty, so the tab is authoritative. An absent,
 * empty or unrecognised list falls back to the catalog defaults, so a missing
 * or half-written row can never lock a role out of the platform.
 */
export function getEffectivePermissions(
  role: string | undefined | null,
  stored?: unknown
): Set<string> {
  return resolvePermissions(role, stored);
}

/**
 * Whether a role holds a permission.
 *
 * When `effective` is supplied it is the already-resolved grant set for this
 * request, which is what lets a database-backed role take effect without making
 * this function asynchronous (all ~140 API routes call it synchronously).
 * Omitting it falls back to the static catalog matrix, which is what client and
 * unit-test callers want.
 */
export function hasPermission(
  role: string | undefined | null,
  permission: string,
  effective?: ReadonlySet<string> | readonly string[] | null
): boolean {
  if (!role) return false;
  if (isSuperAdminRole(role)) return true;

  if (effective) {
    const granted = effective instanceof Set ? effective : new Set(effective);
    return granted.has(permission);
  }

  const allowedRoles = STATIC_PERMISSION_MATRIX[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role.trim().toLowerCase() as RoleSlug);
}

export function checkPermission(
  role: string | undefined | null,
  permission: string,
  effective?: ReadonlySet<string> | readonly string[] | null
): string | null {
  if (!hasPermission(role, permission, effective)) {
    return "Forbidden: insufficient permissions";
  }
  return null;
}

/**
 * Page-level gate for a pathname.
 *
 * This drives client-side navigation hiding only; the authoritative check is
 * always `checkRoutePermission` / `checkPermission` on the API route.
 */
export function getRoutePermission(pathname: string): string | null {
  // Longest prefixes first so specific areas win over their parent module.
  const rules: Array<[string, string]> = [
    ["/settings/backups", "backups:read"],
    ["/api-keys", "api_keys:read"],
    ["/qualifications", "qualifications:read"],
    ["/faculties", "qualifications:read"],
    ["/degree-types", "qualifications:read"],
    ["/academic-documents", "qualifications:read"],
    ["/staff-tasks", "tasks:read"],
    ["/students", "students:read"],
    ["/universities", "universities:read"],
    ["/courses", "courses:read"],
    ["/applications", "applications:read"],
    ["/payments", "payments:read"],
    ["/leads", "leads:read"],
    ["/expenses", "expenses:read"],
    ["/hr", "hr:read"],
    ["/settings", "settings:read"],
    ["/chat", "chat:read"],
    ["/tickets", "tickets:read"],
    ["/tasks", "tasks:read"],
    ["/files", "files:read"],
    ["/calendar", "calendar:read"],
    ["/visa", "visa:read"],
    ["/workflow", "workflow:read"],
    ["/compare", "compare:read"],
    ["/onboarding", "onboarding:read"],
    ["/learning", "learning:read"],
    ["/featured", "learning:read"],
    ["/automations", "automations:read"],
    ["/marketing", "marketing:read"],
    ["/audit", "audit:read"],
    ["/trash", "trash:read"],
    ["/backups", "backups:read"],
    ["/branches", "branches:read"],
    ["/news", "news:read"],
  ];

  for (const [prefix, permission] of rules) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return permission;
    }
  }
  return null;
}
