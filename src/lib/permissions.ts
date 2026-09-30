// eslint-disable-next-line unused-imports/no-unused-vars
const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  STUDENT: "student",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const PERMISSIONS: Record<string, Role[]> = {
  // General
  "dashboard:view": ["admin", "staff", "student", "viewer"],
  "dashboard:read": ["admin", "staff", "student", "viewer"],
  "dashboard:update": ["admin", "staff", "student", "viewer"],
  "dashboard:export": ["admin", "staff"],

  // Universities
  "universities:read": ["admin", "staff", "student", "viewer"],
  "universities:create": ["admin", "staff"],
  "universities:update": ["admin", "staff"],
  "universities:delete": ["admin"],
  "universities:export": ["admin", "staff"],
  "universities:import": ["admin", "staff"],
  "universities:partners": ["admin", "staff"],

  // Courses
  "courses:read": ["admin", "staff", "student", "viewer"],
  "courses:create": ["admin", "staff"],
  "courses:update": ["admin", "staff"],
  "courses:delete": ["admin"],
  "courses:export": ["admin", "staff"],
  "courses:import": ["admin", "staff"],

  // Students
  "students:read": ["admin", "staff", "student", "viewer"],
  "students:create": ["admin", "staff"],
  "students:update": ["admin", "staff"],
  "students:delete": ["admin"],
  "students:export": ["admin", "staff"],
  "students:import": ["admin", "staff"],
  "students:credentials": ["admin", "staff"],
  "students:messages": ["admin", "staff", "student"],

  // Applications
  "applications:read": ["admin", "staff", "student"],
  "applications:create": ["admin", "staff"],
  "applications:update": ["admin", "staff"],
  "applications:delete": ["admin"],
  "applications:export": ["admin", "staff"],
  "applications:workflow": ["admin", "staff"],

  // Leads
  "leads:read": ["admin", "staff"],
  "leads:create": ["admin", "staff"],
  "leads:update": ["admin", "staff"],
  "leads:delete": ["admin"],
  "leads:export": ["admin", "staff"],
  "leads:assign": ["admin", "staff"],

  // Payments
  "payments:read": ["admin", "staff", "student"],
  "payments:create": ["admin", "staff"],
  "payments:update": ["admin"],
  "payments:delete": ["admin"],
  "payments:export": ["admin", "staff"],
  "payments:refund": ["admin"],

  // Expenses
  "expenses:read": ["admin", "staff"],
  "expenses:create": ["admin", "staff"],
  "expenses:update": ["admin", "staff"],
  "expenses:delete": ["admin"],
  "expenses:export": ["admin", "staff"],

  // Reports & Analytics
  "reports:read": ["admin", "staff", "student", "viewer"],
  "reports:create": ["admin", "staff"],
  "reports:delete": ["admin"],
  "analytics:read": ["admin", "staff"],
  "analytics:export": ["admin", "staff"],

  // HR & Payroll
  "hr:read": ["admin", "staff"],
  "hr:create": ["admin"],
  "hr:update": ["admin"],
  "hr:delete": ["admin"],
  "hr:attendance": ["admin", "staff"],
  "hr:leave": ["admin", "staff"],
  "hr:payroll": ["admin"],
  "hr:export": ["admin", "staff"],

  // Files
  "files:read": ["admin", "staff", "student", "viewer"],
  "files:create": ["admin", "staff"],
  "files:update": ["admin", "staff"],
  "files:delete": ["admin"],
  "files:share": ["admin", "staff"],

  // Calendar
  "calendar:read": ["admin", "staff", "student", "viewer"],
  "calendar:create": ["admin", "staff"],
  "calendar:update": ["admin", "staff"],
  "calendar:delete": ["admin"],

  // Visa & Country Workflow
  "visa:read": ["admin", "staff", "student"],
  "visa:create": ["admin", "staff"],
  "visa:update": ["admin", "staff"],
  "visa:delete": ["admin"],
  "workflow:read": ["admin", "staff"],
  "workflow:create": ["admin", "staff"],
  "workflow:update": ["admin", "staff"],
  "workflow:delete": ["admin"],

  // Access Control
  "users:read": ["admin", "staff"],
  "users:create": ["admin"],
  "users:update": ["admin"],
  "users:delete": ["admin"],
  "roles:read": ["admin"],
  "roles:create": ["admin"],
  "roles:update": ["admin"],
  "roles:delete": ["admin"],
  "permissions:read": ["admin"],
  "permissions:update": ["admin"],
  "api_keys:read": ["admin"],
  "api_keys:create": ["admin"],
  "api_keys:delete": ["admin"],

  // Settings
  "settings:read": ["admin", "staff"],
  "settings:update": ["admin"],
  "backups:read": ["admin"],
  "backups:create": ["admin"],
  "backups:restore": ["admin"],
  "branches:read": ["admin", "staff"],
  "branches:create": ["admin"],
  "branches:update": ["admin"],
  "branches:delete": ["admin"],

  // Platform
  "chat:read": ["admin", "staff", "student"],
  "chat:send": ["admin", "staff", "student"],
  "email:read": ["admin"],
  "email:create": ["admin"],
  "email:update": ["admin"],
  "email:delete": ["admin"],
  "notifications:read": ["admin", "staff", "student"],
  "notifications:create": ["admin", "staff"],
  "notifications:update": ["admin", "staff"],
  "notifications:delete": ["admin"],
  "tasks:read": ["admin", "staff", "student"],
  "tasks:create": ["admin", "staff"],
  "tasks:update": ["admin", "staff"],
  "tasks:delete": ["admin"],
  "learning:read": ["admin", "staff", "student", "viewer"],
  "learning:create": ["admin", "staff"],
  "learning:update": ["admin", "staff"],
  "learning:delete": ["admin"],
  "automations:read": ["admin", "staff"],
  "automations:create": ["admin", "staff"],
  "automations:update": ["admin", "staff"],
  "automations:delete": ["admin"],
  "marketing:read": ["admin", "staff"],
  "marketing:create": ["admin", "staff"],
  "marketing:update": ["admin", "staff"],
  "marketing:delete": ["admin"],

  // System
  "audit:read": ["admin"],
  "audit:export": ["admin"],
  "trash:read": ["admin", "staff"],
  "trash:restore": ["admin", "staff"],
  "trash:delete": ["admin"],
  "bulk:import": ["admin"],
  "bulk:export": ["admin", "staff"],

  // Qualifications
  "qualifications:read": ["admin", "staff", "student", "viewer"],
  "qualifications:create": ["admin", "staff"],
  "qualifications:update": ["admin", "staff"],
  "qualifications:delete": ["admin"],

  // Compare
  "compare:read": ["admin", "staff", "student", "viewer"],
  "compare:create": ["admin", "staff"],
  "compare:update": ["admin", "staff"],
  "compare:delete": ["admin"],

  // Onboarding
  "onboarding:read": ["admin", "staff", "student"],
  "onboarding:create": ["admin", "staff"],
  "onboarding:update": ["admin", "staff"],
  "onboarding:delete": ["admin"],

  // Admin only
  "admin:access": ["admin"],

  // Reference data and cross-cutting reads
  "embassy:read": ["admin", "staff"],
  "embassy:create": ["admin"],
  "embassy:update": ["admin"],
  "embassy:delete": ["admin"],
  "intakes:read": ["admin", "staff"],
  "intakes:create": ["admin", "staff"],
  "intakes:update": ["admin", "staff"],
  "intakes:delete": ["admin"],
  "master:read": ["admin", "staff"],
  "master:create": ["admin"],
  "master:update": ["admin"],
  "master:delete": ["admin"],
  "search:read": ["admin", "staff", "viewer"],
  "tickets:read": ["admin", "staff"],
  "tickets:create": ["admin", "staff"],
  "tickets:update": ["admin", "staff"],
  "tickets:delete": ["admin"],
  "bulk:read": ["admin"],
  "bulk:create": ["admin"],
  "bulk:update": ["admin"],
  "bulk:delete": ["admin"],
  "nepal:read": ["admin", "staff", "student"],
  // Cross-entity bulk mutations (delete / status / assignment) are admin-only.
  "batch:write": ["admin"],
};

export function hasPermission(role: string | undefined, permission: string): boolean {
  if (!role) return false;
  if (role.toLowerCase() === "super admin") return true;
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role.toLowerCase() as Role);
}

export function checkPermission(role: string | undefined, permission: string): string | null {
  if (!hasPermission(role, permission)) {
    return "Forbidden: insufficient permissions";
  }
  return null;
}

export function getRoutePermission(pathname: string): string | null {
  if (pathname.startsWith("/students")) return "students:read";
  if (pathname.startsWith("/universities")) return "universities:read";
  if (pathname.startsWith("/courses")) return "courses:read";
  if (pathname.startsWith("/applications")) return "applications:read";
  if (pathname.startsWith("/payments")) return "payments:read";
  if (pathname.startsWith("/leads")) return "leads:read";
  if (pathname.startsWith("/hr")) return "hr:read";
  if (pathname.startsWith("/settings")) return "settings:read";
  if (pathname.startsWith("/chat")) return "chat:read";
  if (pathname.startsWith("/tickets")) return "tickets:read";
  if (pathname.startsWith("/api-keys")) return "api_keys:read";
  if (pathname.startsWith("/staff-tasks") || pathname.startsWith("/tasks")) return "tasks:read";
  if (pathname.startsWith("/files")) return "files:read";
  if (pathname.startsWith("/calendar")) return "calendar:read";
  if (pathname.startsWith("/visa")) return "visa:read";
  if (pathname.startsWith("/workflow")) return "workflow:read";
  if (pathname.startsWith("/compare")) return "compare:read";
  if (pathname.startsWith("/onboarding")) return "onboarding:read";
  if (pathname.startsWith("/learning")) return "learning:read";
  if (pathname.startsWith("/featured")) return "learning:read";
  if (pathname.startsWith("/automations")) return "automations:read";
  if (pathname.startsWith("/marketing")) return "marketing:read";
  if (pathname.startsWith("/audit")) return "audit:read";
  if (pathname.startsWith("/trash")) return "trash:read";
  if (pathname.startsWith("/backups") || pathname.startsWith("/settings/backups"))
    return "backups:read";
  if (pathname.startsWith("/branches")) return "branches:read";
  if (
    pathname.startsWith("/qualifications") ||
    pathname.startsWith("/faculties") ||
    pathname.startsWith("/degree-types") ||
    pathname.startsWith("/academic-documents")
  )
    return "qualifications:read";
  return null;
}
