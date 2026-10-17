import { PERMISSION_CATALOG, resolvePermissions } from "@/lib/permissions";
import { MODULES, getEnabledModuleIds } from "@/lib/modules";
import { getApplicationStatuses, type ApplicationStatus } from "@/lib/application-statuses";

export type SettingsTab =
  | "profile"
  | "company"
  | "roles"
  | "permissions"
  | "localization"
  | "notifications"
  | "security"
  | "branches"
  | "qualifications"
  | "email"
  | "email-templates"
  | "academics"
  | "modules"
  | "statuses";

export interface EmailSetting {
  [key: string]: unknown;
  id: string;
  type: string;
  branchId?: string;
  branch?: { name?: string } | null;
  isActive: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpEncryption: string;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailTemplateItem {
  key: string;
  name: string;
  description: string;
  trigger: string;
  autoSend: boolean;
  placeholders: string[];
  id: number | null;
  subject: string;
  body: string;
  isEnabled: boolean;
  isDefault: boolean;
}

export interface Role {
  [key: string]: unknown;
  id: number;
  name: string;
  description: string | null;
  userCount: number;
  color: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface SystemSettings {
  [key: string]: unknown;
  country: string;
  currencyCode: string;
  phoneCode: string;
  language: string;
  enableBranches: boolean;
  showBSDate?: boolean;
  officeLatitude?: number | null;
  officeLongitude?: number | null;
  officeRadius?: number | null;
  enabledModules?: string;
}

export interface Branch {
  [key: string]: unknown;
  id: string;
  name: string;
  location: string;
  manager: string;
  latitude?: number | null;
  longitude?: number | null;
  phone: string;
  email: string;
  status: string;
  logo?: string | null;
}

export interface AcademicItem {
  id: string;
  name: string;
}

export interface Qualification {
  id: string;
  name: string;
  level: number;
}

export interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export const PERMISSIONS: Permission[] = PERMISSION_CATALOG.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  module: p.module,
}));

export function parsePermissionList(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function readJson<T>(res: Response, fallback: T): Promise<T> {
  if (!res.ok) return fallback;
  try {
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function loadRoles(
  signal: AbortSignal
): Promise<{ roles: Role[]; permissions: Record<string, string[]> }> {
  const res = await fetch("/api/roles", { signal });
  const data = await readJson<unknown>(res, []);
  if (!Array.isArray(data)) return { roles: [], permissions: {} };
  const formattedRoles: Role[] = data.map((role) => ({
    ...role,
    id: Number(role.id),
    userCount: role.userCount || 0,
    permissions: parsePermissionList(role.permissions),
  }));
  const permissions: Record<string, string[]> = {};
  formattedRoles.forEach((r) => {
    // Show the *effective* grant set so an empty stored list (e.g. the
    // seeded Student row) renders the catalog defaults instead of lying
    // with every box unchecked. Toggling then persists the full list.
    permissions[String(r.id)] = [...resolvePermissions(r.name || "", r.permissions)];
  });
  return { roles: formattedRoles, permissions };
}

export async function loadLocalization(
  signal: AbortSignal
): Promise<{ settings: SystemSettings; moduleIds: string[] | null } | null> {
  const res = await fetch("/api/settings/localization", { signal });
  const data = await readJson<Record<string, unknown> | null>(res, null);
  if (!data || data.error) return null;
  const moduleIds = data.enabledModules ? getEnabledModuleIds(data.enabledModules as string) : null;
  return { settings: data as unknown as SystemSettings, moduleIds };
}

export async function loadBranches(signal: AbortSignal): Promise<Branch[]> {
  const res = await fetch("/api/branches", { signal });
  const data = await readJson<unknown>(res, []);
  return Array.isArray(data) ? (data as Branch[]) : [];
}

export async function loadQualifications(signal: AbortSignal): Promise<Qualification[]> {
  const res = await fetch("/api/qualifications", { signal });
  const data = await readJson<unknown>(res, []);
  return Array.isArray(data) ? (data as Qualification[]) : [];
}

export async function loadFaculties(signal: AbortSignal): Promise<AcademicItem[]> {
  const res = await fetch("/api/faculties", { signal });
  const data = await readJson<unknown>(res, []);
  return Array.isArray(data) ? (data as AcademicItem[]) : [];
}

export async function loadDegreeTypes(signal: AbortSignal): Promise<AcademicItem[]> {
  const res = await fetch("/api/degree-types", { signal });
  const data = await readJson<unknown>(res, []);
  return Array.isArray(data) ? (data as AcademicItem[]) : [];
}

export async function loadAcademicDocs(signal: AbortSignal): Promise<AcademicItem[]> {
  const res = await fetch("/api/academic-documents", { signal });
  const data = await readJson<unknown>(res, []);
  return Array.isArray(data) ? (data as AcademicItem[]) : [];
}

export interface AcademicTheme {
  iconWrap: string;
  focus: string;
  editBorder: string;
  addButton: string;
  editButton: string;
}

export const FACULTY_THEME: AcademicTheme = {
  iconWrap: "bg-indigo-50 text-indigo-600",
  focus: "focus:ring-indigo-500",
  editBorder: "border-indigo-200",
  addButton: "bg-indigo-600 hover:bg-indigo-700",
  editButton: "text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50",
};

export const DEGREE_THEME: AcademicTheme = {
  iconWrap: "bg-emerald-50 text-emerald-600",
  focus: "focus:ring-emerald-500",
  editBorder: "border-emerald-200",
  addButton: "bg-emerald-600 hover:bg-emerald-700",
  editButton: "text-emerald-800 hover:text-emerald-600 hover:bg-emerald-50",
};

export const DOC_THEME: AcademicTheme = {
  iconWrap: "bg-amber-50 text-amber-600",
  focus: "focus:ring-amber-500",
  editBorder: "border-amber-200",
  addButton: "bg-amber-600 hover:bg-amber-700",
  editButton: "text-amber-800 hover:text-amber-600 hover:bg-amber-50",
};

export async function loadEmailSettings(signal: AbortSignal): Promise<EmailSetting[]> {
  const res = await fetch("/api/settings/email", { signal });
  const data = await readJson<unknown>(res, []);
  return Array.isArray(data) ? (data as EmailSetting[]) : [];
}

export async function loadEmailTemplates(signal: AbortSignal): Promise<EmailTemplateItem[]> {
  const res = await fetch("/api/settings/email-templates", { signal });
  const data = await readJson<unknown>(res, []);
  return Array.isArray(data) ? (data as EmailTemplateItem[]) : [];
}

export async function loadProfile(signal: AbortSignal): Promise<ProfileData | null> {
  const res = await fetch("/api/profile", { signal });
  const data = await readJson<Record<string, unknown> | null>(res, null);
  if (!data || data.error) return null;
  return data as unknown as ProfileData;
}

export async function loadStatuses(signal: AbortSignal): Promise<ApplicationStatus[] | null> {
  const res = await fetch("/api/settings/application-statuses", { signal });
  const data = await readJson<Record<string, unknown> | null>(res, null);
  if (!data || !Array.isArray(data.statuses)) return null;
  return getApplicationStatuses(JSON.stringify(data.statuses));
}

export const DEFAULT_ENABLED_MODULE_IDS = MODULES.filter((m) => m.defaultEnabled).map((m) => m.id);
