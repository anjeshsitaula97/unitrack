export interface ModuleDefinition {
  id: string;
  label: string;
  description: string;
  routes: string[];
  defaultEnabled: boolean;
  icon: string;
}

export const MODULES: ModuleDefinition[] = [
  {
    id: "universities",
    label: "Universities",
    description: "University listings, partnerships, and accreditation tracking",
    routes: ["/universities"],
    defaultEnabled: true,
    icon: "Building2",
  },
  {
    id: "courses",
    label: "Courses",
    description: "Course management and program listings",
    routes: ["/courses", "/search"],
    defaultEnabled: true,
    icon: "BookOpen",
  },
  {
    id: "leads",
    label: "Leads",
    description: "Lead capture and pipeline management",
    routes: ["/leads"],
    defaultEnabled: true,
    icon: "Users",
  },
  {
    id: "students",
    label: "Students",
    description: "Student profiles, applications, and messaging",
    routes: ["/students", "/applications", "/student-messages"],
    defaultEnabled: true,
    icon: "GraduationCap",
  },
  {
    id: "finance",
    label: "Finance",
    description: "Payments, expenses, and financial tracking",
    routes: ["/payments", "/expenses"],
    defaultEnabled: true,
    icon: "CreditCard",
  },
  {
    id: "files",
    label: "Files",
    description: "Document and file management",
    routes: ["/files"],
    defaultEnabled: true,
    icon: "Folder",
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Events, deadlines, and scheduling",
    routes: ["/calendar"],
    defaultEnabled: true,
    icon: "Calendar",
  },
  {
    id: "visa",
    label: "Visa Timeline",
    description: "Visa application tracking and timelines",
    routes: ["/visa-timeline"],
    defaultEnabled: true,
    icon: "Route",
  },
  {
    id: "compare",
    label: "Compare",
    description: "University and course comparison tool",
    routes: ["/compare"],
    defaultEnabled: true,
    icon: "GitCompare",
  },
  {
    id: "onboarding",
    label: "Onboarding",
    description: "Student onboarding workflow",
    routes: ["/onboarding"],
    defaultEnabled: true,
    icon: "ClipboardList",
  },
  {
    id: "hr",
    label: "HR & Payroll",
    description: "Employees, attendance, leave, departments, and payroll",
    routes: [
      "/hr",
      "/hr/employees",
      "/hr/departments",
      "/hr/designations",
      "/hr/attendance",
      "/hr/leave",
      "/hr/payroll",
    ],
    defaultEnabled: true,
    icon: "Briefcase",
  },
  {
    id: "access",
    label: "User Access & API Keys",
    description: "User management, roles, and API key administration",
    routes: ["/access", "/api-keys"],
    defaultEnabled: true,
    icon: "ShieldCheck",
  },
  {
    id: "tasks",
    label: "Tasks & Workflow",
    description: "Task management and country workflow tracking",
    routes: ["/tasks", "/staff-tasks"],
    defaultEnabled: true,
    icon: "CheckSquare",
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    description: "Analytics dashboards, reports, and report builder",
    routes: ["/analytics", "/reports", "/reports/builder"],
    defaultEnabled: true,
    icon: "BarChart3",
  },
  {
    id: "bulk",
    label: "Bulk Import/Export",
    description: "Mass data import and export operations",
    routes: ["/bulk-import"],
    defaultEnabled: true,
    icon: "Upload",
  },
  {
    id: "audit",
    label: "Audit Trail",
    description: "Activity logging and audit history",
    routes: ["/audit"],
    defaultEnabled: true,
    icon: "Activity",
  },
  {
    id: "trash",
    label: "Recycle Bin",
    description: "Soft-deleted records and restoration",
    routes: ["/trash"],
    defaultEnabled: true,
    icon: "Trash2",
  },
  {
    id: "backups",
    label: "Database Backups",
    description: "Backup creation, restoration, and management",
    routes: ["/settings/backups"],
    defaultEnabled: true,
    icon: "Database",
  },
  {
    id: "chat",
    label: "Chat",
    description: "Internal team messaging",
    routes: ["/chat"],
    defaultEnabled: true,
    icon: "MessageSquare",
  },
  {
    id: "email",
    label: "Email",
    description: "Email sending and configuration",
    routes: ["/email"],
    defaultEnabled: true,
    icon: "Mail",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "System notification center",
    routes: ["/notifications"],
    defaultEnabled: true,
    icon: "Bell",
  },
  {
    id: "tickets",
    label: "Tickets",
    description: "Support ticket management",
    routes: ["/tickets"],
    defaultEnabled: true,
    icon: "Ticket",
  },
  {
    id: "learning",
    label: "Learning Hub & Featured",
    description: "Learning resources and featured content management",
    routes: ["/learning-hub", "/featured"],
    defaultEnabled: true,
    icon: "Library",
  },
  {
    id: "automations",
    label: "Automations",
    description: "Workflow automation rules",
    routes: ["/automations"],
    defaultEnabled: true,
    icon: "Zap",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Marketing materials requests and asset management",
    routes: ["/marketing/materials"],
    defaultEnabled: true,
    icon: "Megaphone",
  },
];

export function defaultEnabledModuleIds(): string[] {
  return MODULES.filter((m) => m.defaultEnabled).map((m) => m.id);
}

/**
 * Returns a valid, non-empty JSON array of enabled module ids.
 * Empty / invalid / unset values are normalized to the default modules so that
 * a "no configuration" state never means "all modules disabled".
 */
export function normalizeEnabledModulesJson(value: string | null | undefined): string {
  try {
    const parsed = JSON.parse(value || "");
    if (Array.isArray(parsed) && parsed.length > 0) return JSON.stringify(parsed);
  } catch {}
  return JSON.stringify(defaultEnabledModuleIds());
}

/**
 * Parses a stored/cookie value into enabled module ids. A valid JSON array is
 * authoritative (even an empty one); anything unparseable falls back to defaults.
 */
export function getEnabledModuleIds(enabledModulesJson: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(enabledModulesJson || "");
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return defaultEnabledModuleIds();
}

export function isRouteEnabled(route: string, enabledModuleIds: string[]): boolean {
  if (route === "/dashboard" || route === "/settings" || route.startsWith("/settings/"))
    return true;
  for (const mod of MODULES) {
    if (enabledModuleIds.includes(mod.id)) {
      if (mod.routes.some((r) => route === r || route.startsWith(r + "/"))) return true;
    }
  }
  return false;
}
