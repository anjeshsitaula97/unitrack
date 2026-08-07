const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  STUDENT: "student",
  VIEWER: "Viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const PERMISSIONS: Record<string, Role[]> = {
  // Students
  "students:read": ["admin", "staff", "student", "Viewer"],
  "students:create": ["admin", "staff"],
  "students:update": ["admin", "staff"],
  "students:delete": ["admin"],

  // Universities
  "universities:read": ["admin", "staff", "student", "Viewer"],
  "universities:create": ["admin", "staff"],
  "universities:update": ["admin", "staff"],
  "universities:delete": ["admin"],

  // Courses
  "courses:read": ["admin", "staff", "student", "Viewer"],
  "courses:create": ["admin", "staff"],
  "courses:update": ["admin", "staff"],
  "courses:delete": ["admin"],

  // Applications
  "applications:read": ["admin", "staff", "student"],
  "applications:create": ["admin", "staff"],
  "applications:update": ["admin", "staff"],
  "applications:delete": ["admin"],

  // Payments
  "payments:read": ["admin", "staff", "student"],
  "payments:create": ["admin", "staff"],
  "payments:update": ["admin"],
  "payments:delete": ["admin"],

  // Leads
  "leads:read": ["admin", "staff"],
  "leads:create": ["admin", "staff"],
  "leads:update": ["admin", "staff"],
  "leads:delete": ["admin"],

  // HR
  "hr:read": ["admin", "staff"],
  "hr:create": ["admin"],
  "hr:update": ["admin"],
  "hr:delete": ["admin"],

  // Settings
  "settings:read": ["admin", "staff"],
  "settings:update": ["admin"],

  // Chat
  "chat:read": ["admin", "staff", "student"],
  "chat:send": ["admin", "staff", "student"],

  // Tickets
  "tickets:read": ["admin", "staff", "student"],
  "tickets:create": ["admin", "staff", "student"],
  "tickets:update": ["admin", "staff"],

  // Bulk operations
  "bulk:import": ["admin"],
  "bulk:export": ["admin", "staff"],

  // Admin only
  "admin:access": ["admin"],
  "api-keys:manage": ["admin"],
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
  if (pathname.startsWith("/api-keys")) return "api-keys:manage";
  if (pathname.startsWith("/staff-tasks") || pathname.startsWith("/tasks")) return "students:read";
  if (pathname.startsWith("/files")) return "students:read";
  return null;
}
