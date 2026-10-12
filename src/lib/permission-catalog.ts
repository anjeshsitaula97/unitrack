/**
 * Canonical permission catalog.
 *
 * This module is the single source of truth for:
 *   - which permissions exist (and how the Settings UI presents them)
 *   - the default role grants used to seed /api/roles
 *   - the fallback matrix when a role has no stored grant list
 *
 * Because the catalog derives the fallback matrix, the Settings tab and the
 * server-side enforcer can no longer drift apart.
 */

export type RoleSlug = "admin" | "staff" | "student" | "viewer";

export interface PermissionDef {
  /** Stable identifier, "<module>:<action>". */
  id: string;
  /** Grouping label shown in Settings. */
  module: string;
  /** Human label shown in Settings. */
  name: string;
  description: string;
  /** Roles granted this permission by default. */
  defaultRoles: RoleSlug[];
  /** Locked-down platform capability; surfaced prominently in Settings. */
  critical?: boolean;
}

export const PERMISSION_CATALOG: PermissionDef[] = [
  { id: "dashboard:view", module: "General", name: "view", description: "Access main dashboard and metrics", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "dashboard:read", module: "General", name: "Read", description: "Load dashboard metrics and summaries", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "dashboard:update", module: "General", name: "Update", description: "Save dashboard layout and widget preferences", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "dashboard:export", module: "General", name: "export", description: "Export dashboard data", defaultRoles: ["admin", "staff"] },
  { id: "dashboard:create", module: "General", name: "create", description: "Save and create dashboard layouts", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "universities:read", module: "Universities", name: "read", description: "View university list and details", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "universities:create", module: "Universities", name: "create", description: "Add new universities", defaultRoles: ["admin", "staff"] },
  { id: "universities:update", module: "Universities", name: "update", description: "Edit university information", defaultRoles: ["admin", "staff"] },
  { id: "universities:delete", module: "Universities", name: "delete", description: "Remove universities from the platform", defaultRoles: ["admin"] },
  { id: "universities:export", module: "Universities", name: "export", description: "Export university data to Excel/CSV", defaultRoles: ["admin", "staff"] },
  { id: "universities:import", module: "Universities", name: "import", description: "Import universities from external files", defaultRoles: ["admin", "staff"] },
  { id: "universities:partners", module: "Universities", name: "partners", description: "Manage university partnerships", defaultRoles: ["admin", "staff"] },
  { id: "courses:read", module: "Courses", name: "read", description: "View course list and details", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "courses:create", module: "Courses", name: "create", description: "Add new courses", defaultRoles: ["admin", "staff"] },
  { id: "courses:update", module: "Courses", name: "update", description: "Edit course information", defaultRoles: ["admin", "staff"] },
  { id: "courses:delete", module: "Courses", name: "delete", description: "Delete courses", defaultRoles: ["admin"] },
  { id: "courses:export", module: "Courses", name: "export", description: "Export course data to Excel/CSV", defaultRoles: ["admin", "staff"] },
  { id: "courses:import", module: "Courses", name: "import", description: "Import courses from external files", defaultRoles: ["admin", "staff"] },
  { id: "students:read", module: "Students", name: "read", description: "View student profiles and records", defaultRoles: ["admin", "staff", "viewer"] },
  { id: "students:create", module: "Students", name: "create", description: "Add new students", defaultRoles: ["admin", "staff"] },
  { id: "students:update", module: "Students", name: "update", description: "Edit student information", defaultRoles: ["admin", "staff"] },
  { id: "students:delete", module: "Students", name: "delete", description: "Delete student records", defaultRoles: ["admin"] },
  { id: "students:export", module: "Students", name: "export", description: "Export student data to Excel/CSV", defaultRoles: ["admin", "staff"] },
  { id: "students:import", module: "Students", name: "import", description: "Import students from external files", defaultRoles: ["admin", "staff"] },
  { id: "students:credentials", module: "Students", name: "credentials", description: "Generate login credentials for student portal", defaultRoles: ["admin", "staff"] },
  { id: "students:messages", module: "Students", name: "messages", description: "Manage student conversations", defaultRoles: ["admin", "staff", "student"] },
  { id: "students:notes", module: "Students", name: "notes", description: "View, add and reply to student notes — the shared staff↔student communication thread", defaultRoles: ["admin", "staff"] },
  { id: "applications:read", module: "Applications", name: "read", description: "View applications and statuses", defaultRoles: ["admin", "staff", "student"] },
  { id: "applications:create", module: "Applications", name: "create", description: "Submit new applications", defaultRoles: ["admin", "staff"] },
  { id: "applications:update", module: "Applications", name: "update", description: "Edit application details", defaultRoles: ["admin", "staff"] },
  { id: "applications:delete", module: "Applications", name: "delete", description: "Delete applications", defaultRoles: ["admin"] },
  { id: "applications:export", module: "Applications", name: "export", description: "Export application data", defaultRoles: ["admin", "staff"] },
  { id: "applications:workflow", module: "Applications", name: "workflow", description: "Manage application workflow stages", defaultRoles: ["admin", "staff"] },
  { id: "leads:read", module: "Leads", name: "read", description: "View leads list and details", defaultRoles: ["admin", "staff"] },
  { id: "leads:create", module: "Leads", name: "create", description: "Add new leads", defaultRoles: ["admin", "staff"] },
  { id: "leads:update", module: "Leads", name: "update", description: "Edit lead information", defaultRoles: ["admin", "staff"] },
  { id: "leads:delete", module: "Leads", name: "delete", description: "Delete leads", defaultRoles: ["admin"] },
  { id: "leads:export", module: "Leads", name: "export", description: "Export leads data", defaultRoles: ["admin", "staff"] },
  { id: "leads:assign", module: "Leads", name: "assign", description: "Assign leads to counselors", defaultRoles: ["admin", "staff"] },
  { id: "payments:read", module: "Payments", name: "read", description: "View payments and transactions", defaultRoles: ["admin", "staff", "student"] },
  { id: "payments:create", module: "Payments", name: "create", description: "Record new payments", defaultRoles: ["admin", "staff"] },
  { id: "payments:update", module: "Payments", name: "update", description: "Edit payment records", defaultRoles: ["admin"] },
  { id: "payments:delete", module: "Payments", name: "delete", description: "Delete payment records", defaultRoles: ["admin"] },
  { id: "payments:export", module: "Payments", name: "export", description: "Export payment data", defaultRoles: ["admin", "staff"] },
  { id: "payments:refund", module: "Payments", name: "refund", description: "Process refunds", defaultRoles: ["admin"] },
  { id: "expenses:read", module: "Expenses", name: "read", description: "View expenses", defaultRoles: ["admin", "staff"] },
  { id: "expenses:create", module: "Expenses", name: "create", description: "Add new expenses", defaultRoles: ["admin", "staff"] },
  { id: "expenses:update", module: "Expenses", name: "update", description: "Edit expense records", defaultRoles: ["admin", "staff"] },
  { id: "expenses:delete", module: "Expenses", name: "delete", description: "Delete expense records", defaultRoles: ["admin"] },
  { id: "expenses:export", module: "Expenses", name: "export", description: "Export expense data", defaultRoles: ["admin", "staff"] },
  { id: "reports:read", module: "Reports", name: "read", description: "View and access reports", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "reports:create", module: "Reports", name: "create", description: "Create new reports and export data", defaultRoles: ["admin", "staff"] },
  { id: "reports:update", module: "Reports", name: "update", description: "Edit saved reports", defaultRoles: ["admin", "staff"] },
  { id: "reports:delete", module: "Reports", name: "delete", description: "Delete saved reports", defaultRoles: ["admin"] },
  { id: "analytics:read", module: "Analytics", name: "read", description: "Access analytics dashboard", defaultRoles: ["admin", "staff"] },
  { id: "analytics:export", module: "Analytics", name: "export", description: "Export analytics data", defaultRoles: ["admin", "staff"] },
  { id: "hr:read", module: "HR & Payroll", name: "read", description: "View HR dashboard and employee list", defaultRoles: ["admin", "staff"] },
  { id: "hr:create", module: "HR & Payroll", name: "create", description: "Add employees, departments, designations", defaultRoles: ["admin"] },
  { id: "hr:update", module: "HR & Payroll", name: "update", description: "Edit employee and HR records", defaultRoles: ["admin"] },
  { id: "hr:delete", module: "HR & Payroll", name: "delete", description: "Delete HR records", defaultRoles: ["admin"] },
  { id: "hr:attendance", module: "HR & Payroll", name: "attendance", description: "Manage attendance records", defaultRoles: ["admin", "staff"] },
  { id: "hr:leave", module: "HR & Payroll", name: "leave", description: "Manage leave requests and balances", defaultRoles: ["admin", "staff"] },
  { id: "hr:payroll", module: "HR & Payroll", name: "payroll", description: "Manage payroll processing", defaultRoles: ["admin"] },
  { id: "hr:export", module: "HR & Payroll", name: "export", description: "Export HR data", defaultRoles: ["admin", "staff"] },
  { id: "files:read", module: "Files", name: "read", description: "View and download files", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "files:create", module: "Files", name: "create", description: "Upload new files and create folders", defaultRoles: ["admin", "staff"] },
  { id: "files:update", module: "Files", name: "update", description: "Rename and move files/folders", defaultRoles: ["admin", "staff"] },
  { id: "files:delete", module: "Files", name: "delete", description: "Delete files and folders", defaultRoles: ["admin"] },
  { id: "files:share", module: "Files", name: "share", description: "Share files with team members", defaultRoles: ["admin", "staff"] },
  { id: "calendar:read", module: "Calendar", name: "read", description: "View calendar events", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "calendar:create", module: "Calendar", name: "create", description: "Create new events", defaultRoles: ["admin", "staff"] },
  { id: "calendar:update", module: "Calendar", name: "update", description: "Edit calendar events", defaultRoles: ["admin", "staff"] },
  { id: "calendar:delete", module: "Calendar", name: "delete", description: "Delete calendar events", defaultRoles: ["admin"] },
  { id: "visa:read", module: "Visa", name: "read", description: "View visa timelines and checklists", defaultRoles: ["admin", "staff", "student"] },
  { id: "visa:create", module: "Visa", name: "create", description: "Create visa applications", defaultRoles: ["admin", "staff"] },
  { id: "visa:update", module: "Visa", name: "update", description: "Update visa status and documents", defaultRoles: ["admin", "staff"] },
  { id: "visa:delete", module: "Visa", name: "delete", description: "Delete visa records", defaultRoles: ["admin"] },
  { id: "workflow:read", module: "Workflow", name: "read", description: "View country workflows and task templates", defaultRoles: ["admin", "staff"] },
  { id: "workflow:create", module: "Workflow", name: "create", description: "Create workflow stages and templates", defaultRoles: ["admin", "staff"] },
  { id: "workflow:update", module: "Workflow", name: "update", description: "Edit workflow stages and templates", defaultRoles: ["admin", "staff"] },
  { id: "workflow:delete", module: "Workflow", name: "delete", description: "Delete workflow stages and templates", defaultRoles: ["admin"] },
  { id: "users:read", module: "Access Control", name: "read", description: "View platform users", defaultRoles: ["admin", "staff"] },
  { id: "users:create", module: "Access Control", name: "create", description: "Invite new users", defaultRoles: ["admin"], critical: true },
  { id: "users:update", module: "Access Control", name: "update", description: "Edit user profiles and roles", defaultRoles: ["admin"], critical: true },
  { id: "users:delete", module: "Access Control", name: "delete", description: "Remove platform users", defaultRoles: ["admin"], critical: true },
  { id: "roles:read", module: "Access Control", name: "read", description: "View role definitions", defaultRoles: ["admin"], critical: true },
  { id: "roles:create", module: "Access Control", name: "create", description: "Create new roles", defaultRoles: ["admin"], critical: true },
  { id: "roles:update", module: "Access Control", name: "update", description: "Edit role details", defaultRoles: ["admin"], critical: true },
  { id: "roles:delete", module: "Access Control", name: "delete", description: "Delete roles", defaultRoles: ["admin"], critical: true },
  { id: "permissions:read", module: "Access Control", name: "read", description: "View permission configurations", defaultRoles: ["admin"], critical: true },
  { id: "permissions:update", module: "Access Control", name: "update", description: "Configure permission toggles for each role", defaultRoles: ["admin"], critical: true },
  { id: "api_keys:read", module: "Access Control", name: "read", description: "View API keys", defaultRoles: ["admin"], critical: true },
  { id: "api_keys:create", module: "Access Control", name: "create", description: "Generate new API keys", defaultRoles: ["admin"], critical: true },
  { id: "api_keys:delete", module: "Access Control", name: "delete", description: "Revoke API keys", defaultRoles: ["admin"], critical: true },
  { id: "settings:read", module: "Settings", name: "read", description: "View system settings pages", defaultRoles: ["admin", "staff"] },
  { id: "settings:create", module: "Settings", name: "create", description: "Save localization and new settings values", defaultRoles: ["admin", "staff"] },
  { id: "settings:update", module: "Settings", name: "update", description: "Modify system configuration", defaultRoles: ["admin"], critical: true },
  { id: "backups:read", module: "Settings", name: "read", description: "View database backups", defaultRoles: ["admin"], critical: true },
  { id: "backups:create", module: "Settings", name: "create", description: "Create database backups", defaultRoles: ["admin"], critical: true },
  { id: "backups:restore", module: "Settings", name: "restore", description: "Restore database from backup", defaultRoles: ["admin"], critical: true },
  { id: "branches:read", module: "Settings", name: "read", description: "View branch locations", defaultRoles: ["admin", "staff"] },
  { id: "branches:create", module: "Settings", name: "create", description: "Add new branch locations", defaultRoles: ["admin"] },
  { id: "branches:update", module: "Settings", name: "update", description: "Edit branch details", defaultRoles: ["admin"] },
  { id: "branches:delete", module: "Settings", name: "delete", description: "Remove branch locations", defaultRoles: ["admin"] },
  { id: "chat:read", module: "Platform", name: "read", description: "Access the chat/messaging system", defaultRoles: ["admin", "staff", "student"] },
  { id: "chat:send", module: "Platform", name: "send", description: "Send messages in chat", defaultRoles: ["admin", "staff", "student"] },
  { id: "email:read", module: "Platform", name: "read", description: "View email settings", defaultRoles: ["admin"] },
  { id: "email:create", module: "Platform", name: "create", description: "Configure SMTP and email settings", defaultRoles: ["admin"] },
  { id: "email:update", module: "Platform", name: "update", description: "Update email configuration", defaultRoles: ["admin"] },
  { id: "email:delete", module: "Platform", name: "delete", description: "Remove email configuration", defaultRoles: ["admin"] },
  { id: "notifications:read", module: "Platform", name: "read", description: "View notification center", defaultRoles: ["admin", "staff", "student"] },
  { id: "notifications:create", module: "Platform", name: "create", description: "Create notification templates and broadcasts", defaultRoles: ["admin", "staff"] },
  { id: "notifications:update", module: "Platform", name: "update", description: "Edit notification templates", defaultRoles: ["admin", "staff"] },
  { id: "notifications:delete", module: "Platform", name: "delete", description: "Delete notification templates", defaultRoles: ["admin"] },
  { id: "tasks:read", module: "Platform", name: "read", description: "View staff tasks and assignments", defaultRoles: ["admin", "staff", "student"] },
  { id: "tasks:create", module: "Platform", name: "create", description: "Create new tasks", defaultRoles: ["admin", "staff"] },
  { id: "tasks:update", module: "Platform", name: "update", description: "Edit task details", defaultRoles: ["admin", "staff"] },
  { id: "tasks:delete", module: "Platform", name: "delete", description: "Delete tasks", defaultRoles: ["admin"] },
  { id: "learning:read", module: "Platform", name: "read", description: "Access learning hub and featured content", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "learning:create", module: "Platform", name: "create", description: "Add learning resources", defaultRoles: ["admin", "staff"] },
  { id: "learning:update", module: "Platform", name: "update", description: "Edit learning resources", defaultRoles: ["admin", "staff"] },
  { id: "learning:delete", module: "Platform", name: "delete", description: "Delete learning resources", defaultRoles: ["admin"] },
  { id: "automations:read", module: "Platform", name: "read", description: "View automation rules", defaultRoles: ["admin", "staff"] },
  { id: "automations:create", module: "Platform", name: "create", description: "Create automation rules", defaultRoles: ["admin", "staff"] },
  { id: "automations:update", module: "Platform", name: "update", description: "Edit automation rules", defaultRoles: ["admin", "staff"] },
  { id: "automations:delete", module: "Platform", name: "delete", description: "Delete automation rules", defaultRoles: ["admin"] },
  { id: "marketing:read", module: "Platform", name: "read", description: "View marketing materials requests", defaultRoles: ["admin", "staff"] },
  { id: "marketing:create", module: "Platform", name: "create", description: "Create marketing requests", defaultRoles: ["admin", "staff"] },
  { id: "marketing:update", module: "Platform", name: "update", description: "Update marketing requests", defaultRoles: ["admin", "staff"] },
  { id: "marketing:delete", module: "Platform", name: "delete", description: "Delete marketing requests", defaultRoles: ["admin"] },
  { id: "audit:read", module: "System", name: "read", description: "View audit trail and activity logs", defaultRoles: ["admin"], critical: true },
  { id: "audit:export", module: "System", name: "export", description: "Export audit logs", defaultRoles: ["admin"], critical: true },
  { id: "trash:read", module: "System", name: "read", description: "View deleted items in recycle bin", defaultRoles: ["admin", "staff"] },
  { id: "trash:restore", module: "System", name: "restore", description: "Restore deleted items", defaultRoles: ["admin", "staff"] },
  { id: "trash:delete", module: "System", name: "delete", description: "Permanently delete items", defaultRoles: ["admin"] },
  { id: "bulk:import", module: "System", name: "import", description: "Import data in bulk", defaultRoles: ["admin"], critical: true },
  { id: "bulk:export", module: "System", name: "export", description: "Export data in bulk", defaultRoles: ["admin", "staff"] },
  { id: "qualifications:read", module: "Qualifications", name: "read", description: "View qualifications, faculties, degree types", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "qualifications:create", module: "Qualifications", name: "create", description: "Add new qualifications", defaultRoles: ["admin", "staff"] },
  { id: "qualifications:update", module: "Qualifications", name: "update", description: "Edit qualifications", defaultRoles: ["admin", "staff"] },
  { id: "qualifications:delete", module: "Qualifications", name: "delete", description: "Delete qualifications", defaultRoles: ["admin"] },
  { id: "compare:read", module: "Compare", name: "read", description: "View university and course comparisons", defaultRoles: ["admin", "staff", "student", "viewer"] },
  { id: "compare:create", module: "Compare", name: "create", description: "Create new comparisons", defaultRoles: ["admin", "staff"] },
  { id: "compare:update", module: "Compare", name: "update", description: "Update comparisons", defaultRoles: ["admin", "staff"] },
  { id: "compare:delete", module: "Compare", name: "delete", description: "Delete comparisons", defaultRoles: ["admin"] },
  { id: "onboarding:read", module: "Onboarding", name: "read", description: "View student onboarding progress", defaultRoles: ["admin", "staff", "student"] },
  { id: "onboarding:create", module: "Onboarding", name: "create", description: "Manage onboarding workflow", defaultRoles: ["admin", "staff"] },
  { id: "onboarding:update", module: "Onboarding", name: "update", description: "Update onboarding steps", defaultRoles: ["admin", "staff"] },
  { id: "onboarding:delete", module: "Onboarding", name: "delete", description: "Delete onboarding records", defaultRoles: ["admin"] },
  { id: "admin:access", module: "Access Control", name: "Access", description: "Invite users and change staff roles", defaultRoles: ["admin"], critical: true },
  { id: "embassy:read", module: "Embassy", name: "Read", description: "View embassy records", defaultRoles: ["admin", "staff"] },
  { id: "embassy:create", module: "Embassy", name: "Create", description: "Add embassy records", defaultRoles: ["admin"] },
  { id: "embassy:update", module: "Embassy", name: "Update", description: "Edit embassy records", defaultRoles: ["admin"] },
  { id: "embassy:delete", module: "Embassy", name: "Delete", description: "Remove embassy records", defaultRoles: ["admin"] },
  { id: "intakes:read", module: "Intakes", name: "Read", description: "View intake seasons", defaultRoles: ["admin", "staff"] },
  { id: "intakes:create", module: "Intakes", name: "Create", description: "Add intake seasons", defaultRoles: ["admin", "staff"] },
  { id: "intakes:update", module: "Intakes", name: "Update", description: "Edit intake seasons", defaultRoles: ["admin", "staff"] },
  { id: "intakes:delete", module: "Intakes", name: "Delete", description: "Remove intake seasons", defaultRoles: ["admin"] },
  { id: "master:read", module: "Master Data", name: "Read", description: "View master data lists", defaultRoles: ["admin", "staff"] },
  { id: "master:create", module: "Master Data", name: "Create", description: "Add master data entries", defaultRoles: ["admin"] },
  { id: "master:update", module: "Master Data", name: "Update", description: "Edit master data entries", defaultRoles: ["admin"] },
  { id: "master:delete", module: "Master Data", name: "Delete", description: "Remove master data entries", defaultRoles: ["admin"] },
  { id: "search:read", module: "Search", name: "Read", description: "Use global search across the platform", defaultRoles: ["admin", "staff", "viewer"] },
  { id: "tickets:read", module: "Tickets", name: "Read", description: "View support tickets", defaultRoles: ["admin", "staff"] },
  { id: "tickets:create", module: "Tickets", name: "Create", description: "Raise support tickets", defaultRoles: ["admin", "staff"] },
  { id: "tickets:update", module: "Tickets", name: "Update", description: "Update support tickets", defaultRoles: ["admin", "staff"] },
  { id: "tickets:delete", module: "Tickets", name: "Delete", description: "Remove support tickets", defaultRoles: ["admin"] },
  { id: "bulk:read", module: "Bulk Operations", name: "Read", description: "View bulk operation history", defaultRoles: ["admin"], critical: true },
  { id: "bulk:create", module: "Bulk Operations", name: "Create", description: "Start bulk create operations", defaultRoles: ["admin"], critical: true },
  { id: "bulk:update", module: "Bulk Operations", name: "Update", description: "Run bulk update operations", defaultRoles: ["admin"], critical: true },
  { id: "bulk:delete", module: "Bulk Operations", name: "Delete", description: "Run bulk delete operations", defaultRoles: ["admin"], critical: true },
  { id: "nepal:read", module: "Nepal", name: "Read", description: "View Nepal-specific reference data", defaultRoles: ["admin", "staff", "student"] },
  { id: "batch:write", module: "Bulk Operations", name: "Batch Write", description: "Apply cross-entity bulk mutations", defaultRoles: ["admin"], critical: true },
];

/**
 * Module order for the Settings tab, derived from the catalog so a new
 * permission can never appear without a module to render it under.
 */
export const CATALOG_MODULES: string[] = Array.from(
  new Set(PERMISSION_CATALOG.map((p) => p.module))
);

/** Catalog entries for one module, in catalog order. */
export function permissionsForModule(module: string): PermissionDef[] {
  return PERMISSION_CATALOG.filter((p) => p.module === module);
}

/**
 * Fallback matrix derived from the catalog, so it can never drift from it.
 */
export const STATIC_PERMISSION_MATRIX: Record<string, RoleSlug[]> =
  Object.fromEntries(
    PERMISSION_CATALOG.map((p) => [p.id, p.defaultRoles])
  );

export const SUPER_ADMIN_ROLE = "Super Admin";

export function isSuperAdminRole(role: string | undefined | null): boolean {
  return (role || "").trim().toLowerCase() === "super admin";
}

/**
 * Maps any stored role string onto a catalog role slug.
 * Returns null for roles with no static defaults (custom roles such as
 * "Moderator" or "B2B Partner", which are governed purely by their stored
 * permission list).
 */
export function roleSlugFor(role: string | undefined | null): RoleSlug | null {
  const normalized = (role || "").trim().toLowerCase();
  if (normalized === "administrator") return "admin";
  if (["admin", "staff", "student", "viewer"].includes(normalized)) return normalized as RoleSlug;
  return null;
}

export function isKnownPermission(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(STATIC_PERMISSION_MATRIX, id);
}

/**
 * Effective permissions for a role.
 *
 * A stored list wins so that Settings is authoritative. An absent, empty or
 * unparseable list falls back to the catalog defaults, which means a missing or
 * half-written row can never lock a role out of the platform.
 */
export function resolvePermissions(
  role: string | undefined | null,
  stored: unknown
): Set<string> {
  if (isSuperAdminRole(role)) return new Set(PERMISSION_CATALOG.map((p) => p.id));

  const fallback = () => {
    const slug = roleSlugFor(role);
    const set = new Set<string>();
    if (!slug) return set;
    for (const [id, roles] of Object.entries(STATIC_PERMISSION_MATRIX)) {
      if (roles.includes(slug)) set.add(id);
    }
    return set;
  };

  if (!Array.isArray(stored)) return fallback();
  const known = stored.filter((id): id is string => typeof id === "string" && isKnownPermission(id));
  if (known.length === 0) return fallback();
  return new Set(known);
}

export function permissionAllowed(
  effective: ReadonlySet<string> | undefined,
  permission: string
): boolean {
  if (!effective) return false;
  return effective.has(permission);
}
