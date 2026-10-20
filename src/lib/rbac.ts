import { NextResponse } from "next/server";
import { hasPermission } from "./permissions";
import { isSuperAdminRole } from "./permission-catalog";
import { apiError, type SessionPayload } from "./api-utils";

type PermissionAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "import"
  | "manage"
  | "view"
  | "access"
  | "credentials";

/**
 * API path prefix -> permission namespace. Keys are matched longest-first so a
 * sub-module can diverge from its parent module.
 */
const moduleMap: Record<string, string> = {
  students: "students",
  universities: "universities",
  courses: "courses",
  applications: "applications",
  leads: "leads",
  payments: "payments",
  expenses: "expenses",
  reports: "reports",
  analytics: "analytics",
  hr: "hr",
  files: "files",
  calendar: "calendar",
  visa: "visa",
  workflow: "workflow",
  users: "users",
  roles: "roles",
  permissions: "permissions",
  api_keys: "api_keys",
  settings: "settings",
  chat: "chat",
  email: "email",
  notifications: "notifications",
  news: "news",
  tasks: "tasks",
  audit: "audit",
  trash: "trash",
  backups: "backups",
  bulk: "bulk",
  qualifications: "qualifications",
  faculties: "qualifications",
  "degree-types": "qualifications",
  "academic-documents": "qualifications",
  branches: "branches",
  emails: "email",
  partners: "universities",
  "partner-with-us": "universities",
  "student-portal": "students",
  "student-messages": "students",
  "partner-dashboard": "universities",
  marketing: "marketing",
  batch: "bulk",
  comparison: "compare",
  "dashboard-layout": "dashboard",
  embassy: "embassy",
  "guided-tour": "dashboard",
  holidays: "calendar",
  intakes: "intakes",
  "learning-resources": "learning",
  master: "master",
  search: "search",
  upload: "files",
  uploads: "files",
  "visa-types": "visa",
  "visa-timeline": "visa",
  "visa-checklists": "visa",
  "workflow-stages": "workflow",
  documents: "files",
  compare: "compare",
  onboarding: "onboarding",
  finance: "payments",
  access: "users",
  tickets: "tickets",
  learning: "learning",
  automations: "automations",
  nepal: "nepal",
  restore: "backups",
  "quick-filters": "dashboard",
  "email-settings": "email",
  dashboard: "dashboard",
  "hr/attendance": "hr",
  "hr/leave": "hr",
  "hr/payroll": "hr",
  "hr/employees": "hr",
  "hr/face": "hr",
  "hr/departments": "hr",
  "hr/designations": "hr",
  "hr/settings": "hr",
  "marketing/requests": "marketing",
  "marketing/materials": "marketing",
  "learning-hub": "learning",
  featured: "learning",
  "staff-tasks": "tasks",
  "reports/builder": "reports",
  "reports/saved": "reports",
  "reports/generate": "reports",
  "settings/backups": "backups",
  "settings/email": "email",
  "settings/application-statuses": "settings",
  "settings/localization": "settings",
  "api-keys": "api_keys",
  "students/documents": "files",
};

/**
 * The database-backed grant set for this request, if the session carries one.
 * Falls back to the static catalog when absent so unit tests and any caller
 * that builds a bare session object keep working.
 */
function sessionPermissions(
  session: SessionPayload
): ReadonlySet<string> | undefined {
  const granted = session.permissions;
  if (!Array.isArray(granted) || granted.length === 0) return undefined;
  return new Set(granted as string[]);
}

function methodToAction(method: string): PermissionAction {
  switch (method) {
    case "GET":
      return "read";
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "read";
  }
}

function moduleToPermission(module: string, action: PermissionAction): string {
  const path = module.replace(/^\/+|\/+$/g, "");
  if (!path) return `${action}`;

  // Longest prefix wins so a sub-module entry such as "hr/payroll" or
  // "settings/backups" can be mapped independently of its parent. Matching on
  // the first segment alone made every multi-segment entry unreachable.
  const candidates = Object.keys(moduleMap).sort((a, b) => b.length - a.length);
  for (const key of candidates) {
    if (path === key || path.startsWith(`${key}/`)) {
      return `${moduleMap[key]}:${action}`;
    }
  }

  const prefix = path.split("/")[0].replace(/[^a-z]/g, "");
  return `${prefix}:${action}`;
}

export function checkRoutePermission(
  session: SessionPayload | null,
  arg2: string | { url: string; method: string } | null,
  arg3?: string
): NextResponse | null {
  const routePath = typeof arg2 === "string" ? arg2 : arg2?.url;
  const method = arg3 ?? (typeof arg2 === "object" ? arg2?.method : undefined);

  if (!session) return apiError("Unauthorized", 401);
  if (!routePath) return null;

  if (isSuperAdminRole(session.role)) return null;

  // Strip any query string / fragment before mapping, otherwise a URL such as
  // "/api/universities?perPage=100" produced the bogus permission
  // "universitiesperpage:read" and 403'd every filtered or paginated request.
  const path = routePath.replace(/^.*\/api\//, "").split(/[?#]/)[0];
  const action = methodToAction(method || "GET");
  const permission = moduleToPermission(path, action);

  if (!hasPermission(session.role, permission, sessionPermissions(session))) {
    return apiError("Forbidden: insufficient permissions", 403);
  }
  return null;
}

/** Helper for specific permission checks against a named permission. */
export function checkPermission(
  session: SessionPayload | null,
  permission: string
): NextResponse | null {
  if (!session) return apiError("Unauthorized", 401);
  if (isSuperAdminRole(session.role)) return null;
  if (!hasPermission(session.role, permission, sessionPermissions(session))) {
    return apiError("Forbidden: insufficient permissions", 403);
  }
  return null;
}

/**
 * Guard for any endpoint that writes a role onto a user.
 *
 * `Super Admin` is the only role that carries an unconditional bypass in
 * `hasPermission`, so allowing a lesser role to grant it is a full privilege
 * escalation. Both /api/access and /api/staff/[id] must go through here.
 */
export function assertAssignableRole(
  actorRole: string | undefined | null,
  targetRole: string | undefined | null
): string | null {
  const target = (targetRole || "").trim();
  if (!target) return "A role is required";
  if (target.length > 64) return "Role name is too long";
  if (isSuperAdminRole(target) && !isSuperAdminRole(actorRole)) {
    return "Only a Super Admin can assign the Super Admin role";
  }
  return null;
}
