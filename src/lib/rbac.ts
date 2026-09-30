import { NextResponse } from "next/server";
import { hasPermission } from "./permissions";
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
    "marketing/requests": "marketing",
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
    "hr/attendance": "hr",
    "hr/leave": "hr",
    "hr/payroll": "hr",
    "hr/employees": "hr",
    "hr/face": "hr",
    "hr/departments": "hr",
    "hr/designations": "hr",
    documents: "files",
    compare: "compare",
    onboarding: "onboarding",
    finance: "payments",
    access: "users",
    tickets: "tickets",
    learning: "learning",
    automations: "automations",
    "marketing/materials": "marketing",
    "learning-hub": "learning",
    featured: "learning",
    "staff-tasks": "tasks",
    "reports/builder": "reports",
    "settings/backups": "backups",
    "api-keys": "api_keys",
  };

  const prefix = moduleMap[module] || module.replace(/[^a-z]/g, "");
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

  if (session.role === "Super Admin") return null;

  const path = routePath.replace(/^.*\/api\//, "").split("/")[0];
  const action = methodToAction(method || "GET");
  const permission = moduleToPermission(path, action);

  if (!hasPermission(session.role as string, permission)) {
    return apiError("Forbidden: insufficient permissions", 403);
  }
  return null;
}

// Helper for specific permission checks
export function checkPermission(
  session: SessionPayload | null,
  permission: string
): NextResponse | null {
  if (!session) return apiError("Unauthorized", 401);
  if (session.role === "Super Admin") return null;
  if (!hasPermission(session.role as string, permission)) {
    return apiError("Forbidden: insufficient permissions", 403);
  }
  return null;
}
