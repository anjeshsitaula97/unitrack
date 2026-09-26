"use client";

import React, { useState, useRef } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  User,
  Users,
  Shield,
  Lock,
  Bell,
  Globe,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  LayoutGrid,
  BookOpen,
  Building2,
  GraduationCap,
  Upload,
  Puzzle,
  CreditCard,
  Folder,
  Calendar,
  Route,
  GitCompare,
  ClipboardList,
  Briefcase,
  CheckSquare,
  BarChart3,
  Activity,
  Database,
  MessageSquare,
  Ticket,
  Library,
  Zap,
  Layers,
  ArrowUp,
  ArrowDown,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  DEFAULT_APPLICATION_STATUSES,
  getApplicationStatuses,
  type ApplicationStatus,
} from "@/lib/application-statuses";

type SettingsTab =
  | "profile"
  | "roles"
  | "permissions"
  | "localization"
  | "notifications"
  | "security"
  | "branches"
  | "qualifications"
  | "email"
  | "academics"
  | "modules"
  | "statuses";

interface EmailSetting {
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

interface Role {
  id: number;
  name: string;
  description: string | null;
  userCount: number;
  color: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

const PERMISSIONS: Permission[] = [
  // ── General ──
  {
    id: "p1",
    name: "dashboard:view",
    description: "Access main dashboard and metrics",
    module: "General",
  },

  // ── Universities ──
  {
    id: "p2",
    name: "universities:view",
    description: "View university list and details",
    module: "Universities",
  },
  {
    id: "p3",
    name: "universities:create",
    description: "Add new universities",
    module: "Universities",
  },
  {
    id: "p4",
    name: "universities:update",
    description: "Edit university information",
    module: "Universities",
  },
  {
    id: "p5",
    name: "universities:delete",
    description: "Remove universities from the platform",
    module: "Universities",
  },
  {
    id: "p6",
    name: "universities:export",
    description: "Export university data to Excel/CSV",
    module: "Universities",
  },
  {
    id: "p7",
    name: "universities:import",
    description: "Import universities from external files",
    module: "Universities",
  },

  // ── Courses ──
  {
    id: "p8",
    name: "courses:view",
    description: "View course list and details",
    module: "Courses",
  },
  { id: "p9", name: "courses:create", description: "Add new courses", module: "Courses" },
  { id: "p10", name: "courses:update", description: "Edit course information", module: "Courses" },
  { id: "p11", name: "courses:delete", description: "Delete courses", module: "Courses" },
  {
    id: "p12",
    name: "courses:export",
    description: "Export course data to Excel/CSV",
    module: "Courses",
  },
  {
    id: "p13",
    name: "courses:import",
    description: "Import courses from external files",
    module: "Courses",
  },

  // ── Students ──
  {
    id: "p14",
    name: "students:view",
    description: "View student profiles and records",
    module: "Students",
  },
  { id: "p15", name: "students:create", description: "Add new students", module: "Students" },
  {
    id: "p16",
    name: "students:update",
    description: "Edit student information",
    module: "Students",
  },
  { id: "p17", name: "students:delete", description: "Delete student records", module: "Students" },
  {
    id: "p18",
    name: "students:export",
    description: "Export student data to Excel/CSV",
    module: "Students",
  },
  {
    id: "p19",
    name: "students:import",
    description: "Import students from external files",
    module: "Students",
  },
  {
    id: "p20",
    name: "students:credentials",
    description: "Generate login credentials for student portal",
    module: "Students",
  },

  // ── Applications ──
  {
    id: "p21",
    name: "applications:view",
    description: "View applications and statuses",
    module: "Applications",
  },
  {
    id: "p22",
    name: "applications:create",
    description: "Submit new applications",
    module: "Applications",
  },
  {
    id: "p23",
    name: "applications:update",
    description: "Edit application details",
    module: "Applications",
  },
  {
    id: "p24",
    name: "applications:delete",
    description: "Delete applications",
    module: "Applications",
  },

  // ── Leads ──
  {
    id: "p25",
    name: "leads:manage",
    description: "Full management of leads (view, create, update, delete)",
    module: "Leads",
  },

  // ── Payments & Expenses ──
  {
    id: "p26",
    name: "payments:manage",
    description: "Full management of payments and transactions",
    module: "Payments",
  },
  {
    id: "p27",
    name: "expenses:manage",
    description: "Full management of expenses",
    module: "Expenses",
  },

  // ── Reports & Analytics ──
  { id: "p28", name: "reports:view", description: "View and access reports", module: "Reports" },
  {
    id: "p29",
    name: "reports:create",
    description: "Create new reports and export data",
    module: "Reports",
  },
  {
    id: "p30",
    name: "analytics:view",
    description: "Access analytics dashboard",
    module: "Analytics",
  },

  // ── HR & Payroll ──
  {
    id: "p31",
    name: "hr:manage",
    description: "Full management of HR (employees, attendance, leave, payroll)",
    module: "HR & Payroll",
  },

  // ── Files ──
  { id: "p32", name: "files:view", description: "View and download files", module: "Files" },
  { id: "p33", name: "files:upload", description: "Upload new files and scans", module: "Files" },
  { id: "p34", name: "files:delete", description: "Delete files and folders", module: "Files" },

  // ── Calendar ──
  {
    id: "p35",
    name: "calendar:manage",
    description: "Full calendar management",
    module: "Calendar",
  },

  // ── Visa & Country Workflow ──
  {
    id: "p36",
    name: "visa:manage",
    description: "Manage visa timeline and checklists",
    module: "Visa",
  },
  {
    id: "p37",
    name: "workflow:manage",
    description: "Manage country workflows and task templates",
    module: "Workflow",
  },

  // ── Access Control ──
  {
    id: "p38",
    name: "users:manage",
    description: "Invite, edit, and remove platform users",
    module: "Access Control",
  },
  {
    id: "p39",
    name: "roles:manage",
    description: "Create, edit, and delete user roles",
    module: "Access Control",
  },
  {
    id: "p40",
    name: "permissions:manage",
    description: "Configure permission toggles for each role",
    module: "Access Control",
  },
  {
    id: "p41",
    name: "api_keys:manage",
    description: "Manage API keys for integrations",
    module: "Access Control",
  },

  // ── Settings ──
  {
    id: "p42",
    name: "settings:view",
    description: "View system settings pages",
    module: "Settings",
  },
  {
    id: "p43",
    name: "settings:update",
    description: "Modify system configuration",
    module: "Settings",
  },
  {
    id: "p44",
    name: "backups:manage",
    description: "Create and restore database backups",
    module: "Settings",
  },

  // ── Platform ──
  {
    id: "p45",
    name: "chat:access",
    description: "Access the chat/messaging system",
    module: "Platform",
  },
  {
    id: "p46",
    name: "email:manage",
    description: "Configure SMTP and email settings",
    module: "Platform",
  },
  {
    id: "p47",
    name: "notifications:manage",
    description: "Manage notification templates and broadcasts",
    module: "Platform",
  },
  {
    id: "p48",
    name: "tasks:manage",
    description: "Manage staff tasks and assignments",
    module: "Platform",
  },

  // ── System ──
  {
    id: "p49",
    name: "audit:view",
    description: "View audit trail and activity logs",
    module: "System",
  },
  {
    id: "p50",
    name: "trash:manage",
    description: "View and restore deleted items",
    module: "System",
  },
];

import { COUNTRIES } from "@/lib/data/countries";
import { safeJson } from "@/lib/fetch-client";
import { MODULES, getEnabledModuleIds } from "@/lib/modules";

const MODULE_ICONS: Record<string, LucideIcon> = {
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  CreditCard,
  Folder,
  Calendar,
  Route,
  GitCompare,
  ClipboardList,
  Briefcase,
  ShieldCheck,
  CheckSquare,
  BarChart3,
  Upload,
  Activity,
  Trash2,
  Database,
  MessageSquare,
  Mail,
  Bell,
  Ticket,
  Library,
  Zap,
};

function ModuleIcon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = MODULE_ICONS[name] || LayoutGrid;
  return <Icon size={size} className={className} />;
}

interface SystemSettings {
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
  theme?: "system" | "light" | "dark";
}

interface Branch {
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

function SettingsContentInternal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab") as SettingsTab;

  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromUrl || "roles");
  const [showTiles, setShowTiles] = useState(true);
  const [prevTabFromUrl, setPrevTabFromUrl] = useState(tabFromUrl);

  if (tabFromUrl && prevTabFromUrl !== tabFromUrl) {
    setPrevTabFromUrl(tabFromUrl);
    setActiveTab(tabFromUrl);
  }

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setShowTiles(false);
    router.push(`/settings?tab=${tab}`, { scroll: false });
  };
  const [roles, setRoles] = useState<Role[]>([]);
  const isLoadingRoles = useRef(true);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "", color: "text-slate-600 bg-slate-50 border-slate-200" });

  // Localization states
  const [locSettings, setLocSettings] = useState<SystemSettings>({
    country: "Nepal",
    currencyCode: "NPR",
    phoneCode: "+977",
    language: "English",
    enableBranches: false,
    showBSDate: false,
    officeLatitude: null,
    officeLongitude: null,
    officeRadius: 100,
    theme: "system",
  });
  const [isSavingLoc, setIsSavingLoc] = useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>(() =>
    MODULES.filter((m) => m.defaultEnabled).map((m) => m.id)
  );
  const [isSavingModules, setIsSavingModules] = useState(false);

  // Application statuses states
  const [appStatuses, setAppStatuses] = useState<ApplicationStatus[]>(DEFAULT_APPLICATION_STATUSES);
  const [isSavingStatuses, setIsSavingStatuses] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusStage, setNewStatusStage] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const isLoadingBranches = useRef(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [newBranch, setNewBranch] = useState({
    name: "",
    location: "",
    manager: "",
    phone: "",
    email: "",
    status: "Active",
    latitude: "",
    longitude: "",
    logo: "",
  });

  // Qualifications states
  const [qualifications, setQualifications] = useState<{ id: string; name: string; level: number }[]>([]);
  const [newQualName, setNewQualName] = useState("");
  const [newQualLevel, setNewQualLevel] = useState(0);
  const [editingQual, setEditingQual] = useState<{ id: string; name: string; level: number } | null>(null);
  const [deleteQualId, setDeleteQualId] = useState<string | null>(null);

  // Academic settings states
  const [faculties, setFaculties] = useState<{ id: string; name: string }[] | undefined>(undefined);
  const [degreeTypes, setDegreeTypes] = useState<{ id: string; name: string }[] | undefined>(
    undefined
  );
  const [academicDocs, setAcademicDocs] = useState<{ id: string; name: string }[] | undefined>(
    undefined
  );
  const [isLoadingAcademics, setIsLoadingAcademics] = useState(true);
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newDegreeTypeName, setNewDegreeTypeName] = useState("");
  const [newAcademicDocName, setNewAcademicDocName] = useState("");
  const [editingFaculty, setEditingFaculty] = useState<{ id: string; name: string } | null>(null);
  const [editingDegreeType, setEditingDegreeType] = useState<{ id: string; name: string } | null>(
    null
  );
  const [editingAcademicDoc, setEditingAcademicDoc] = useState<{ id: string; name: string } | null>(
    null
  );

  const fetchAcademics = async (signal?: AbortSignal) => {
    try {
      const [fRes, dRes, aRes] = await Promise.all([
        fetch("/api/faculties", { signal }),
        fetch("/api/degree-types", { signal }),
        fetch("/api/academic-documents", { signal }),
      ]);
      const [fData, dData, aData] = await Promise.all([fRes.json(), dRes.json(), aRes.json()]);
      if (Array.isArray(fData)) setFaculties(fData);
      if (Array.isArray(dData)) setDegreeTypes(dData);
      if (Array.isArray(aData)) setAcademicDocs(aData);
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      if (!isAbort) {
        toast.error("Failed to load academic data");
      }
    } finally {
      setIsLoadingAcademics(false);
    }
  };

  const [emailSettings, setEmailSettings] = useState<EmailSetting[] | undefined>(undefined);
  const isLoadingEmail = useRef(true);

  const fetchEmailSettings = (signal?: AbortSignal) => {
    fetch("/api/settings/email", { signal })
      .then(safeJson)
      .then((data) => {
        if (Array.isArray(data)) setEmailSettings(data);
        isLoadingEmail.current = false;
      })
      .catch((err) => {
        if (err?.name !== "AbortError") isLoadingEmail.current = false;
      });
  };

  // Permissions mapping
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

  React.useEffect(() => {
    const ac = new AbortController();
    const opts = { signal: ac.signal };

    fetch("/api/roles", opts)
      .then(safeJson)
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedRoles = data.map((role) => ({
            ...role,
            id: Number(role.id),
            userCount: role.userCount || 0,
            permissions: JSON.parse(role.permissions || "[]"),
          }));
          setRoles(formattedRoles);
          const perms: Record<string, string[]> = {};
          formattedRoles.forEach((r) => {
            perms[String(r.id)] = r.permissions || [];
          });
          setRolePermissions(perms);
        }
        isLoadingRoles.current = false;
      })
      .catch((err) => {
        if (err?.name !== "AbortError") isLoadingRoles.current = false;
      });

    fetch("/api/settings/localization", opts)
      .then(safeJson)
      .then((data) => {
        if (data && !data.error) {
          setLocSettings(data);
          if (data.enabledModules) {
            const ids = getEnabledModuleIds(data.enabledModules);
            setEnabledModules(ids);
          }
        }
      })
      .catch(() => {});

    fetch("/api/branches", opts)
      .then(safeJson)
      .then((data) => {
        if (Array.isArray(data)) setBranches(data);
      })
      .catch(() => {});

    fetch("/api/qualifications", opts)
      .then(safeJson)
      .then((data) => {
        if (Array.isArray(data)) setQualifications(data);
      })
      .catch(() => {});

    fetchEmailSettings(ac.signal);
    queueMicrotask(() => {
      fetchAcademics(ac.signal);
    });

    fetch("/api/settings/application-statuses", opts)
      .then(safeJson)
      .then((data) => {
        if (data && Array.isArray(data.statuses)) {
          setAppStatuses(getApplicationStatuses(JSON.stringify(data.statuses)));
        }
      })
      .catch(() => {});

    return () => ac.abort();
  }, []);

  const SMTP_PROVIDERS: Record<
    string,
    { smtpHost: string; smtpPort: string; smtpEncryption: string }
  > = {
    Gmail: { smtpHost: "smtp.gmail.com", smtpPort: "587", smtpEncryption: "TLS" },
    Outlook: { smtpHost: "smtp-mail.outlook.com", smtpPort: "587", smtpEncryption: "TLS" },
    Hostinger: { smtpHost: "smtp.hostinger.com", smtpPort: "465", smtpEncryption: "SSL" },
  };

  const [showAddEmail, setShowAddEmail] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailSetting | null>(null);
  const [newEmail, setNewEmail] = useState({
    type: "Global",
    branchId: "",
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    smtpEncryption: "TLS",
    fromEmail: "",
    fromName: "",
    isActive: true,
    provider: "Custom",
  });

  const handleProviderChange = (provider: string) => {
    const preset = SMTP_PROVIDERS[provider];
    setNewEmail((prev) => ({
      ...prev,
      provider,
      ...(preset
        ? {
            smtpHost: preset.smtpHost,
            smtpPort: preset.smtpPort,
            smtpEncryption: preset.smtpEncryption,
          }
        : {}),
    }));
  };

  const handleEmailUserChange = (value: string) => {
    setNewEmail((prev) => ({
      ...prev,
      smtpUser: value,
      fromEmail: value,
    }));
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = editingEmail || newEmail;

    try {
      const res = await fetch("/api/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(editingEmail ? "Settings updated" : "Settings added");
        fetchEmailSettings();
        setShowAddEmail(false);
        setEditingEmail(null);
        setNewEmail({
          type: "Global",
          branchId: "",
          smtpHost: "",
          smtpPort: "587",
          smtpUser: "",
          smtpPass: "",
          smtpEncryption: "TLS",
          fromEmail: "",
          fromName: "",
          isActive: true,
          provider: "Custom",
        });
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (_error) {
      toast.error("Error saving settings");
    }
  };

  const handleDeleteEmail = async (id: string) => {
    if (!confirm("Are you sure you want to delete these SMTP settings?")) return;
    try {
      const res = await fetch(`/api/settings/email?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Settings deleted");
        fetchEmailSettings();
      } else {
        toast.error("Failed to delete");
      }
    } catch (_error) {
      toast.error("Error deleting");
    }
  };

  const _fetchBranches = () => {
    isLoadingBranches.current = true;
    fetch("/api/branches")
      .then(safeJson)
      .then((data) => {
        if (Array.isArray(data)) setBranches(data);
        isLoadingBranches.current = false;
      })
      .catch(() => (isLoadingBranches.current = false));
  };

  const handleCountryChange = (countryName: string) => {
    const data = COUNTRIES.find((c) => c.name === countryName);
    if (data) {
      setLocSettings({
        ...locSettings,
        country: data.name,
        currencyCode: data.currency,
        phoneCode: data.phoneCode,
        // language is not present in the new COUNTRIES data, keeping previous or default
      });
    } else {
      setLocSettings({ ...locSettings, country: countryName });
    }
  };

  const handleSaveLocalization = async () => {
    setIsSavingLoc(true);
    try {
      const payload = { ...locSettings, enabledModules: JSON.stringify(enabledModules) };
      const res = await fetch("/api/settings/localization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Localization settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (_err) {
      toast.error("Error connecting to server");
    } finally {
      setIsSavingLoc(false);
    }
  };

  const handleSaveModules = async () => {
    if (enabledModules.length === 0) {
      toast.error("At least one module must remain enabled");
      return;
    }
    setIsSavingModules(true);
    try {
      const payload = { ...locSettings, enabledModules: JSON.stringify(enabledModules) };
      const res = await fetch("/api/settings/localization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Module settings saved. Refresh to see changes.");
      } else {
        toast.error("Failed to save module settings");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setIsSavingModules(false);
    }
  };

  const handleAddStatus = () => {
    const name = newStatusName.trim();
    const stage = newStatusStage.trim();
    if (!name) return;
    if (!stage) {
      toast.error("Enter a process stage for this status");
      return;
    }
    const exists = appStatuses.some((s) => s.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error("A status with that name already exists");
      return;
    }
    setAppStatuses((prev) => [...prev, { name, stage }]);
    setNewStatusName("");
    setNewStatusStage("");
    toast.success("Status added — press Save to apply");
  };

  const handleMoveStatus = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= appStatuses.length) return;
    setAppStatuses((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleDeleteStatus = (index: number) => {
    setAppStatuses((prev) => prev.filter((_, i) => i !== index));
    toast.success("Status removed — press Save to apply");
  };

  const handleChangeStatusStage = (index: number, stage: string) => {
    setAppStatuses((prev) => prev.map((s, i) => (i === index ? { ...s, stage } : s)));
  };

  const handleSaveStatuses = async () => {
    if (appStatuses.length === 0) {
      toast.error("Add at least one status before saving");
      return;
    }
    setIsSavingStatuses(true);
    try {
      const res = await fetch("/api/settings/application-statuses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statuses: appStatuses }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppStatuses(getApplicationStatuses(JSON.stringify(data.statuses)));
        toast.success("Application statuses saved");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save application statuses");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setIsSavingStatuses(false);
    }
  };

  const handleToggleBSDate = async () => {
    const next = !locSettings.showBSDate;
    const updated = { ...locSettings, showBSDate: next };
    setLocSettings(updated);
    try {
      const res = await fetch("/api/settings/localization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(next ? "B.S. date will show on dashboard" : "B.S. date hidden on dashboard");
    } catch (err) {
      console.error("BS Date toggle error:", err);
      toast.error(`Failed to update preference${err instanceof Error ? `: ${err.message}` : ""}`);
      setLocSettings((prev) => ({ ...prev, showBSDate: !next }));
    }
  };

  // Profile states
  const [profile, setProfile] = useState({ name: "", email: "", role: "", avatar: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification preferences
  const DEFAULT_NOTIF_PREFS = [
    {
      id: "appStatus",
      label: "Application Status Updates",
      desc: "Receive alerts when your admission status changes.",
      email: true,
      push: true,
    },
    {
      id: "payment",
      label: "Payment Reminders",
      desc: "Notifications for upcoming tuition and fee deadlines.",
      email: true,
      push: false,
    },
    {
      id: "scholarship",
      label: "Scholarship & Rewards",
      desc: "Stay updated on new funding opportunities.",
      email: true,
      push: false,
    },
    {
      id: "marketing",
      label: "Marketing & Institution News",
      desc: "Occasional news about campus events and programs.",
      email: false,
      push: false,
    },
  ];
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);
  const toggleNotif = (id: string, key: "email" | "push") => {
    setNotifPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: !p[key] } : p)));
  };
  const resetNotifPrefs = () => {
    setNotifPrefs(DEFAULT_NOTIF_PREFS.map((p) => ({ ...p })));
    toast.success("Notification preferences reset to default");
  };

  React.useEffect(() => {
    const ac = new AbortController();
    fetch("/api/profile", { signal: ac.signal })
      .then(safeJson)
      .then((data) => {
        if (data && !data.error) setProfile(data);
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, avatar: profile.avatar }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (_err) {
      toast.error("Error connecting to server");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProfile({ ...profile, avatar: data.url });
    } catch {
      toast.error("Failed to upload avatar");
    }
  };

  const handleBranchLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (isEdit) {
        setEditingBranch((prev) => (prev ? { ...prev, logo: data.url } : prev));
      } else {
        setNewBranch((prev) => ({ ...prev, logo: data.url }));
      }
    } catch {
      toast.error("Failed to upload logo");
    }
  };

  const togglePermission = async (roleId: string, permissionId: string) => {
    const current = rolePermissions[roleId] || [];
    let updated: string[];

    if (current.includes(permissionId)) {
      updated = current.filter((id) => id !== permissionId);
    } else {
      updated = [...current, permissionId];
    }

    // Optimistic update
    setRolePermissions((prev) => ({ ...prev, [roleId]: updated }));

    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: updated }),
      });
      if (res.ok) {
        toast.success("Permission updated");
      } else {
        throw new Error();
      }
    } catch (_err) {
      // Revert on error
      setRolePermissions((prev) => ({ ...prev, [roleId]: current }));
      toast.error("Failed to update permission");
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRole,
          permissions: [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const newRoleData = {
          ...data,
          id: Number(data.id),
          userCount: 0,
          permissions: JSON.parse(data.permissions || "[]"),
        };
        setRoles([...roles, newRoleData]);
        setRolePermissions({ ...rolePermissions, [String(data.id)]: [] });
        setNewRole({ name: "", description: "", color: "text-slate-600 bg-slate-50 border-slate-200" });
        setShowAddRole(false);
        toast.success("New role created");
      } else {
        toast.error(data.error || "Failed to create role");
      }
    } catch (_err) {
      toast.error("Error creating role");
    }
  };

  const handleDeleteRole = async (id: number | string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      try {
        const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          setRoles(roles.filter((r) => r.id !== id));
          toast.success("Role deleted");
        } else {
          toast.error(data.error || "Failed to delete role");
        }
      } catch (_err) {
        toast.error("Error deleting role");
      }
    }
  };

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const handleUpdateRole = async () => {
    if (!editingRole || !editingRole.name) return;

    try {
      const res = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingRole.name,
          description: editingRole.description,
          color: editingRole.color,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedRole = {
          ...data,
          id: Number(data.id),
          userCount: data.userCount || 0,
          permissions: JSON.parse(data.permissions || "[]"),
        };
        setRoles(roles.map((r) => (r.id === editingRole.id ? updatedRole : r)));
        setEditingRole(null);
        toast.success("Role updated");
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch (_err) {
      toast.error("Error updating role");
    }
  };

  const handleAddBranch = async () => {
    if (!newBranch.name) {
      toast.error("Branch name is required");
      return;
    }
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBranch),
      });
      const data = await res.json();
      if (res.ok) {
        setBranches([data, ...branches]);
        setNewBranch({
          name: "",
          location: "",
          manager: "",
          phone: "",
          email: "",
          status: "Active",
          latitude: "",
          longitude: "",
          logo: "",
        });
        setShowAddBranch(false);
        toast.success("Branch added successfully");
      } else {
        toast.error(data.error || "Failed to add branch");
      }
    } catch (_err) {
      toast.error("Error adding branch");
    }
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch || !editingBranch.name) return;
    try {
      const res = await fetch(`/api/branches/${editingBranch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBranch),
      });
      const data = await res.json();
      if (res.ok) {
        setBranches(branches.map((b) => (b.id === editingBranch.id ? data : b)));
        setEditingBranch(null);
        toast.success("Branch updated successfully");
      } else {
        toast.error(data.error || "Failed to update branch");
      }
    } catch (_err) {
      toast.error("Error updating branch");
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      try {
        const res = await fetch(`/api/branches/${id}`, { method: "DELETE" });
        if (res.ok) {
          setBranches(branches.filter((b) => b.id !== id));
          toast.success("Branch deleted");
        } else {
          toast.error("Failed to delete branch");
        }
      } catch (_err) {
        toast.error("Error deleting branch");
      }
    }
  };

  const handleAddQual = async () => {
    if (!newQualName.trim()) return;
    try {
      const res = await fetch("/api/qualifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newQualName, level: newQualLevel }),
      });
      const data = await res.json();
      if (res.ok) {
        setQualifications([...qualifications, data]);
        setNewQualName("");
        setNewQualLevel(0);
        toast.success("Qualification added");
      } else {
        toast.error(data.error || "Failed to add qualification");
      }
    } catch (_err) {
      toast.error("Error adding qualification");
    }
  };

  const handleUpdateQual = async () => {
    if (!editingQual || !editingQual.name.trim()) return;
    try {
      const res = await fetch(`/api/qualifications/${editingQual.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingQual.name, level: editingQual.level }),
      });
      const data = await res.json();
      if (res.ok) {
        setQualifications(qualifications.map((q) => (q.id === editingQual.id ? data : q)));
        setEditingQual(null);
        toast.success("Qualification updated");
      } else {
        toast.error(data.error || "Failed to update qualification");
      }
    } catch (_err) {
      toast.error("Error updating qualification");
    }
  };

  const handleDeleteQual = async (id: string) => {
    try {
      const res = await fetch(`/api/qualifications/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setQualifications(qualifications.filter((q) => q.id !== id));
        toast.success("Qualification deleted");
      } else {
        toast.error(data.error || "Failed to delete qualification");
      }
    } catch (_err) {
      toast.error("Error deleting qualification");
    }
  };

  const handleAddFaculty = async () => {
    if (!newFacultyName.trim()) return;
    try {
      const res = await fetch("/api/faculties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFacultyName }),
      });
      const data = await res.json();
      if (res.ok) {
        setFaculties([...(faculties ?? []), data]);
        setNewFacultyName("");
        toast.success("Faculty added");
      } else {
        toast.error(data.error || "Failed to add faculty");
      }
    } catch (_err) {
      toast.error("Error adding faculty");
    }
  };

  const handleUpdateFaculty = async () => {
    if (!editingFaculty || !editingFaculty.name.trim()) return;
    try {
      const res = await fetch("/api/faculties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFaculty),
      });
      const data = await res.json();
      if (res.ok) {
        setFaculties((faculties ?? []).map((f) => (f.id === editingFaculty.id ? data : f)));
        setEditingFaculty(null);
        toast.success("Faculty updated");
      } else {
        toast.error(data.error || "Failed to update faculty");
      }
    } catch (_err) {
      toast.error("Error updating faculty");
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faculty?")) return;
    try {
      const res = await fetch(`/api/faculties?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFaculties((faculties ?? []).filter((f) => f.id !== id));
        toast.success("Faculty deleted");
      } else {
        toast.error("Failed to delete faculty");
      }
    } catch (_err) {
      toast.error("Error deleting faculty");
    }
  };

  const handleAddDegreeType = async () => {
    if (!newDegreeTypeName.trim()) return;
    try {
      const res = await fetch("/api/degree-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDegreeTypeName }),
      });
      const data = await res.json();
      if (res.ok) {
        setDegreeTypes([...(degreeTypes ?? []), data]);
        setNewDegreeTypeName("");
        toast.success("Degree type added");
      } else {
        toast.error(data.error || "Failed to add degree type");
      }
    } catch (_err) {
      toast.error("Error adding degree type");
    }
  };

  const handleUpdateDegreeType = async () => {
    if (!editingDegreeType || !editingDegreeType.name.trim()) return;
    try {
      const res = await fetch("/api/degree-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDegreeType),
      });
      const data = await res.json();
      if (res.ok) {
        setDegreeTypes((degreeTypes ?? []).map((d) => (d.id === editingDegreeType.id ? data : d)));
        setEditingDegreeType(null);
        toast.success("Degree type updated");
      } else {
        toast.error(data.error || "Failed to update degree type");
      }
    } catch (_err) {
      toast.error("Error updating degree type");
    }
  };

  const handleDeleteDegreeType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this degree type?")) return;
    try {
      const res = await fetch(`/api/degree-types?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDegreeTypes((degreeTypes ?? []).filter((d) => d.id !== id));
        toast.success("Degree type deleted");
      } else {
        toast.error("Failed to delete degree type");
      }
    } catch (_err) {
      toast.error("Error deleting degree type");
    }
  };

  const handleAddAcademicDoc = async () => {
    if (!newAcademicDocName.trim()) return;
    try {
      const res = await fetch("/api/academic-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAcademicDocName }),
      });
      const data = await res.json();
      if (res.ok) {
        setAcademicDocs([...(academicDocs ?? []), data]);
        setNewAcademicDocName("");
        toast.success("Academic document added");
      } else {
        toast.error(data.error || "Failed to add academic document");
      }
    } catch (_err) {
      toast.error("Error adding academic document");
    }
  };

  const handleUpdateAcademicDoc = async () => {
    if (!editingAcademicDoc || !editingAcademicDoc.name.trim()) return;
    try {
      const res = await fetch("/api/academic-documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAcademicDoc),
      });
      const data = await res.json();
      if (res.ok) {
        setAcademicDocs(
          (academicDocs ?? []).map((d) => (d.id === editingAcademicDoc.id ? data : d))
        );
        setEditingAcademicDoc(null);
        toast.success("Academic document updated");
      } else {
        toast.error(data.error || "Failed to update academic document");
      }
    } catch (_err) {
      toast.error("Error updating academic document");
    }
  };

  const handleDeleteAcademicDoc = async (id: string) => {
    if (!confirm("Are you sure you want to delete this academic document?")) return;
    try {
      const res = await fetch(`/api/academic-documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAcademicDocs((academicDocs ?? []).filter((d) => d.id !== id));
        toast.success("Academic document deleted");
      } else {
        toast.error("Failed to delete academic document");
      }
    } catch (_err) {
      toast.error("Error deleting academic document");
    }
  };

  return (
    <div className="animate-fade-in py-6">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account preferences, platform roles, and application security.
          </p>
        </div>
        {!showTiles && (
          <button
            type="button"
            onClick={() => {
              setShowTiles(true);
              router.replace("/settings", { scroll: false });
            }}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            Back to All Settings
          </button>
        )}
      </header>
      {showTiles ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(() => {
            const groups: Record<string, { id: string; label: string; icon: React.ReactNode; desc: string }[]> = {
              "Account & Access": [
                { id: "profile", label: "Profile", icon: <User size={26} />, desc: "Edit your name, email and contact details" },
                { id: "roles", label: "Roles", icon: <Shield size={26} />, desc: "Create and manage admin & staff roles" },
                { id: "permissions", label: "Role Permissions", icon: <ShieldCheck size={26} />, desc: "Granular capability controls per role" },
                { id: "email", label: "Email Settings", icon: <Mail size={26} />, desc: "SMTP, sender identity and template" },
                { id: "security", label: "Security", icon: <Lock size={26} />, desc: "Password policy and 2FA" },
              ],
              "Platform & Content": [
                { id: "localization", label: "Localization", icon: <Globe size={26} />, desc: "Region, language and currency" },
                { id: "branches", label: "Branches", icon: <MapPin size={26} />, desc: "Campus locations & branches" },
                { id: "qualifications", label: "Qualifications", icon: <GraduationCap size={26} />, desc: "Degree types and levels" },
                { id: "academics", label: "Academics", icon: <BookOpen size={26} />, desc: "Programs, courses and grading" },
              ],
              Application: [
                { id: "modules", label: "Modules", icon: <Puzzle size={26} />, desc: "Toggle platform feature modules" },
                { id: "statuses", label: "Application Statuses", icon: <Layers size={26} />, desc: "Review pipeline & status labels" },
                { id: "notifications", label: "Notifications", icon: <Bell size={26} />, desc: "Alert channels & delivery" },
              ],
};
            return Object.entries(groups).map(([group, tabs]) => {
              return (
                <div key={group} className="space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{group}</div>
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as SettingsTab)}
                      className="w-full flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" 
                    >
                      <span className="flex items-center gap-3">
                        <span className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">{tab.icon}</span>
                        <span className="text-sm font-bold text-slate-700">{tab.label}</span>
                      </span>
                      <span className="text-xs text-slate-400 leading-snug">{tab.desc}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          )()}
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sub-navigation */}
        <aside className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-24">
            <nav className="flex flex-col">
              {(Object.entries({
                "Account & Access": [
                  { id: "profile", label: "Profile", icon: <User size={18} /> },
                  { id: "roles", label: "Roles", icon: <Shield size={18} /> },
                  { id: "permissions", label: "Role Permissions", icon: <ShieldCheck size={18} /> },
                  { id: "email", label: "Email Settings", icon: <Mail size={18} /> },
                  { id: "security", label: "Security", icon: <Lock size={18} /> },
                ],
                "Platform & Content": [
                  { id: "localization", label: "Localization", icon: <Globe size={18} /> },
                  { id: "branches", label: "Branches", icon: <MapPin size={18} /> },
                  { id: "qualifications", label: "Qualifications", icon: <BookOpen size={18} /> },
                  { id: "academics", label: "Academics", icon: <GraduationCap size={18} /> },
                ],
                Application: [
                  { id: "modules", label: "Modules", icon: <Puzzle size={18} /> },
                  { id: "statuses", label: "Application Statuses", icon: <Layers size={18} /> },
                  { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
                ],
                            })).map(
                ([group, tabs]: [string, { id: string; label: string; icon: React.ReactNode }[]]) =>
 (
                  <div key={group} className="border-b border-slate-200 last:border-b-0">
                    <div className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {group}
                    </div>
                    {tabs.map((tab) => (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as SettingsTab)}
                        className={`flex items-center gap-3 px-5 py-2.5 text-left transition-colors duration-200 rounded-lg mx-2 mb-0.5 ${
                          activeTab === tab.id
                            ? "bg-indigo-50 text-indigo-700 font-bold"
                            : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <span className={activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}>
                          {tab.icon}
                        </span>
                        <span className="text-sm">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                )
              )}
            </nav>
          </div>
        </aside>

        {/* Content Sections */}
        <div className="lg:col-span-9 space-y-6 min-w-0">
          {activeTab === "localization" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Globe size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Localization</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure your region, currency, and language settings.
                  </p>
                </div>
              </div>

              <div className="card p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="settings-country"
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                    >
                      Country
                    </label>
                    <select
                      id="settings-country"
                      value={locSettings.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="settings-currencyCode"
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                    >
                      Currency Code
                    </label>
                    <input
                      id="settings-currencyCode"
                      type="text"
                      value={locSettings.currencyCode}
                      onChange={(e) =>
                        setLocSettings({ ...locSettings, currencyCode: e.target.value })
                      }
                      placeholder="e.g. GBP"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-phoneCode"
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                    >
                      Telephone Code Symbol
                    </label>
                    <input
                      id="settings-phoneCode"
                      type="text"
                      value={locSettings.phoneCode}
                      onChange={(e) =>
                        setLocSettings({ ...locSettings, phoneCode: e.target.value })
                      }
                      placeholder="e.g. +44"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-language"
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                    >
                      Primary Language
                    </label>
                    <select
                      id="settings-language"
                      value={locSettings.language}
                      onChange={(e) => setLocSettings({ ...locSettings, language: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Chinese</option>
                      <option>Japanese</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="settings-theme"
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                    >
                      Theme Mode
                    </label>
                    <select
                      id="settings-theme"
                      value={locSettings.theme || "system"}
                      onChange={(e) =>
                        setLocSettings({ ...locSettings, theme: e.target.value as "system" | "light" | "dark" })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                    >
                      <option value="system">System Default</option>
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose your preferred color scheme. System default follows your OS setting.
                    </p>
                  </div>

                  <div className="md:col-span-2 py-4 border-t border-slate-50 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">
                          Multi-branch Management
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Enable this to manage multiple office locations and branches.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setLocSettings({
                            ...locSettings,
                            enableBranches: !locSettings.enableBranches,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                          locSettings.enableBranches ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`absolute top-1 size-4 rounded-full bg-white transition-all duration-300 ${
                            locSettings.enableBranches ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 py-4 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">
                          Show B.S. Date on Dashboard
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Display Nepali Bikram Sambat (B.S.) date alongside the AD date on the main
                          dashboard.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleBSDate}
                        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                          locSettings.showBSDate ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`absolute top-1 size-4 rounded-full bg-white transition-all duration-300 ${
                            locSettings.showBSDate ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 py-4 border-t border-slate-100 mt-4">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">
                    Main Office Location (Geofence)
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Used for check-in/check-out geolocation validation. Users must be within the set
                    radius to mark attendance.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="settings-officeLatitude"
                        className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                      >
                        Office Latitude
                      </label>
                      <input
                        id="settings-officeLatitude"
                        type="number"
                        step="any"
                        value={locSettings.officeLatitude ?? ""}
                        onChange={(e) =>
                          setLocSettings({
                            ...locSettings,
                            officeLatitude: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                        placeholder="e.g. 40.7128"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="settings-officeLongitude"
                        className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                      >
                        Office Longitude
                      </label>
                      <input
                        id="settings-officeLongitude"
                        type="number"
                        step="any"
                        value={locSettings.officeLongitude ?? ""}
                        onChange={(e) =>
                          setLocSettings({
                            ...locSettings,
                            officeLongitude: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                        placeholder="e.g. -74.0060"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="settings-officeRadius"
                        className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                      >
                        Radius (meters)
                      </label>
                      <input
                        id="settings-officeRadius"
                        type="number"
                        min="1"
                        value={locSettings.officeRadius ?? 100}
                        onChange={(e) =>
                          setLocSettings({
                            ...locSettings,
                            officeRadius: e.target.value ? parseInt(e.target.value) : 100,
                          })
                        }
                        placeholder="100"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-50 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveLocalization}
                    disabled={isSavingLoc}
                    className="btn-primary px-10 shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {isSavingLoc ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
                <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Globe size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Platform-wide Impact</h4>
                  <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                    Changing these settings will update date formats, currency symbols, and default
                    phone prefixes across the entire UniTrack platform for all users.
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === "roles" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Platform Roles</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage user roles and their general descriptions.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRole(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add New Role
                </button>
              </div>

              {showAddRole && (
                <div className="card p-6 border-2 border-indigo-100 animate-slide-down">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Construct New Role</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddRole(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="settings-addRole-name"
                        className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                      >
                        Role Name
                      </label>
                      <input
                        id="settings-addRole-name"
                        type="text"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="e.g. Content Manager"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="settings-addRole-description"
                        className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                      >
                        Description
                      </label>
                      <input
                        id="settings-addRole-description"
                        type="text"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        placeholder="What can this role do?"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="settings-addRole-color"
                        className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                      >
                        Color Theme
                      </label>
                      <select
                        id="settings-addRole-color"
                        value={newRole.color}
                        onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="text-rose-600 bg-rose-50 border-rose-200">Rose</option>
                        <option value="text-indigo-600 bg-indigo-50 border-indigo-200">Indigo</option>
                        <option value="text-emerald-600 bg-emerald-50 border-emerald-200">Emerald</option>
                        <option value="text-slate-600 bg-slate-50 border-slate-200">Slate</option>
                        <option value="text-amber-600 bg-amber-50 border-amber-200">Amber</option>
                        <option value="text-violet-600 bg-violet-50 border-violet-200">Violet</option>
                        <option value="text-cyan-600 bg-cyan-50 border-cyan-200">Cyan</option>
                        <option value="text-orange-600 bg-orange-50 border-orange-200">Orange</option>
                        <option value="text-pink-600 bg-pink-50 border-pink-200">Pink</option>
                        <option value="text-teal-600 bg-teal-50 border-teal-200">Teal</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddRole(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="button" onClick={handleAddRole} className="btn-primary">
                      Create Role
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {isLoadingRoles.current ? (
                  <div className="xl:col-span-2 flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                  </div>
                ) : roles.length === 0 ? (
                  <div className="xl:col-span-2 text-center py-8 text-sm text-slate-400">
                    No roles found. Create a role to get started.
                  </div>
                ) : (
                  roles.map((role) => (
                    <div
                      key={role.id}
                      className="card p-5 group hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${role.color}`}
                        >
                          {role.name}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setEditingRole(role)}
                            className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(role.id)}
                            className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">{role.name}</p>
                      <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
                        {role.description || "No description"}
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Users size={14} />
                          <span>{role.userCount} Active Users</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("permissions")}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Manage Permissions
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {editingRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <button
                    type="button"
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    onClick={() => setEditingRole(null)}
                  />
                  <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-800">Edit Platform Role</h3>
                      <button
                        type="button"
                        onClick={() => setEditingRole(null)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label
                          htmlFor="settings-editRole-name"
                          className="block text-xs font-semibold text-slate-600 mb-1.5"
                        >
                          Role Name
                        </label>
                        <input
                          id="settings-editRole-name"
                          type="text"
                          value={editingRole.name}
                          onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="settings-editRole-description"
                          className="block text-xs font-semibold text-slate-600 mb-1.5"
                        >
                          Description
                        </label>
                        <textarea
                          id="settings-editRole-description"
                          value={editingRole.description || ""}
                          onChange={(e) =>
                            setEditingRole({ ...editingRole, description: e.target.value })
                          }
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="settings-editRole-color"
                          className="block text-xs font-semibold text-slate-600 mb-1.5"
                        >
                          Color Theme
                        </label>
                        <select
                          id="settings-editRole-color"
                          value={editingRole.color}
                          onChange={(e) => setEditingRole({ ...editingRole, color: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                          <option value="text-rose-600 bg-rose-50 border-rose-200">Rose</option>
                          <option value="text-indigo-600 bg-indigo-50 border-indigo-200">Indigo</option>
                          <option value="text-emerald-600 bg-emerald-50 border-emerald-200">Emerald</option>
                          <option value="text-slate-600 bg-slate-50 border-slate-200">Slate</option>
                          <option value="text-amber-600 bg-amber-50 border-amber-200">Amber</option>
                          <option value="text-violet-600 bg-violet-50 border-violet-200">Violet</option>
                          <option value="text-cyan-600 bg-cyan-50 border-cyan-200">Cyan</option>
                          <option value="text-orange-600 bg-orange-50 border-orange-200">Orange</option>
                          <option value="text-pink-600 bg-pink-50 border-pink-200">Pink</option>
                          <option value="text-teal-600 bg-teal-50 border-teal-200">Teal</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => setEditingRole(null)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button type="button" onClick={handleUpdateRole} className="btn-primary">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Role Permissions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure granular access levels for each platform role.
                  </p>
                </div>
              </div>

              <div className="card overflow-hidden rounded-2xl">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[240px]">
                          Permission
                        </th>
                        {roles.map((role) => (
                          <th
                            key={role.id}
                            className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap"
                          >
                            {role.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSIONS.reduce<{ module: string; perms: typeof PERMISSIONS }[]>(
                        (groups, perm) => {
                          const last = groups[groups.length - 1];
                          if (last && last.module === perm.module) last.perms.push(perm);
                          else groups.push({ module: perm.module, perms: [perm] });
                          return groups;
                        },
                        []
                      ).map((group) => (
                        <React.Fragment key={group.module}>
                          <tr className="bg-indigo-50/40">
                            <td
                              colSpan={1 + roles.length}
                              className="px-4 py-2 text-[10px] font-black text-indigo-700 uppercase tracking-widest"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 rounded-full bg-indigo-400" />
                                {group.module}
                              </div>
                            </td>
                          </tr>
                          {group.perms.map((perm) => (
                            <tr
                              key={perm.id}
                              className="hover:bg-slate-50/50 transition-colors border-b border-slate-100/50"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <p className="text-[11px] font-bold text-slate-700">
                                    {perm.name
                                      .split(":")[1]
                                      ?.replace(/_/g, " ")
                                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                                  </p>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                                  {perm.description}
                                </p>
                              </td>
                              {roles.map((role) => {
                                const roleIdStr = String(role.id);
                                const hasPerm = rolePermissions[roleIdStr]?.includes(perm.id);
                                return (
                                  <td
                                    key={`${role.id}-${perm.id}`}
                                    className="px-4 py-3 text-center"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => togglePermission(roleIdStr, perm.id)}
                                      className={`size-8 rounded-xl flex items-center justify-center mx-auto transition-all ${
                                        hasPerm
                                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                          : "bg-slate-50 text-slate-300 border border-slate-100 hover:border-slate-200"
                                      }`}
                                    >
                                      {hasPerm ? (
                                        <Check size={14} strokeWidth={3} />
                                      ) : (
                                        <Lock size={12} />
                                      )}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Email SMTP Settings</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure SMTP servers for the main office or individual branches.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddEmail(true)}
                  className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <Plus size={18} />
                  Add SMTP Config
                </button>
              </div>

              {/* Add/Edit Form */}
              {(showAddEmail || editingEmail) && (
                <div className="card p-8 border-2 border-indigo-100 animate-slide-down mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">
                      {editingEmail ? "Update SMTP Configuration" : "New SMTP Configuration"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddEmail(false);
                        setEditingEmail(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEmail} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {!editingEmail && (
                        <div>
                          <label
                            htmlFor="settings-email-configType"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                          >
                            Config Type
                          </label>
                          <select
                            id="settings-email-configType"
                            value={newEmail.type}
                            onChange={(e) =>
                              setNewEmail({
                                ...newEmail,
                                type: e.target.value,
                                branchId: e.target.value === "Global" ? "" : newEmail.branchId,
                              })
                            }
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="Global">Global / Main Office</option>
                            <option value="Branch">Specific Branch</option>
                          </select>
                        </div>
                      )}

                      {!editingEmail && (
                        <div>
                          <label
                            htmlFor="settings-email-provider"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                          >
                            Email Provider
                          </label>
                          <select
                            id="settings-email-provider"
                            value={newEmail.provider}
                            onChange={(e) => handleProviderChange(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="Custom">Custom SMTP</option>
                            <option value="Gmail">Gmail</option>
                            <option value="Outlook">Outlook</option>
                            <option value="Hostinger">Hostinger</option>
                          </select>
                          <p className="text-[10px] text-slate-400 mt-1 italic">
                            Selecting a provider auto-fills the SMTP server details.
                          </p>
                        </div>
                      )}

                      {((!editingEmail && newEmail.type === "Branch") ||
                        (editingEmail && editingEmail.type === "Branch")) && (
                        <div>
                          <label
                            htmlFor="settings-email-branch"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                          >
                            Select Branch
                          </label>
                          <select
                            id="settings-email-branch"
                            value={editingEmail ? editingEmail.branchId : newEmail.branchId}
                            onChange={(e) => {
                              if (editingEmail)
                                setEditingEmail({ ...editingEmail, branchId: e.target.value });
                              else setNewEmail({ ...newEmail, branchId: e.target.value });
                            }}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            disabled={!!editingEmail}
                          >
                            <option value="">Select Branchâ€¦</option>
                            {branches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="md:col-span-1">
                        <label
                          htmlFor="settings-email-fromName"
                          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                        >
                          Sender Name
                        </label>
                        <input
                          id="settings-email-fromName"
                          type="text"
                          value={editingEmail ? editingEmail.fromName : newEmail.fromName}
                          onChange={(e) => {
                            if (editingEmail)
                              setEditingEmail({ ...editingEmail, fromName: e.target.value });
                            else setNewEmail({ ...newEmail, fromName: e.target.value });
                          }}
                          placeholder="e.g. UniTrack Support"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label
                          htmlFor="settings-email-fromEmail"
                          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                        >
                          Sender Email
                        </label>
                        <input
                          id="settings-email-fromEmail"
                          type="email"
                          value={editingEmail ? editingEmail.fromEmail : newEmail.fromEmail}
                          onChange={(e) => {
                            if (editingEmail)
                              setEditingEmail({ ...editingEmail, fromEmail: e.target.value });
                            else setNewEmail({ ...newEmail, fromEmail: e.target.value });
                          }}
                          placeholder="noreply@unitrack.com"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="md:col-span-2">
                        <label
                          htmlFor="settings-email-smtpHost"
                          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                        >
                          SMTP Host
                        </label>
                        <input
                          id="settings-email-smtpHost"
                          type="text"
                          value={editingEmail ? editingEmail.smtpHost : newEmail.smtpHost}
                          onChange={(e) => {
                            if (editingEmail)
                              setEditingEmail({ ...editingEmail, smtpHost: e.target.value });
                            else setNewEmail({ ...newEmail, smtpHost: e.target.value });
                          }}
                          placeholder="smtp.gmail.com"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="settings-email-port"
                          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                        >
                          Port
                        </label>
                        <input
                          id="settings-email-port"
                          type="number"
                          value={editingEmail ? editingEmail.smtpPort : newEmail.smtpPort}
                          onChange={(e) => {
                            if (editingEmail)
                              setEditingEmail({ ...editingEmail, smtpPort: e.target.value });
                            else setNewEmail({ ...newEmail, smtpPort: e.target.value });
                          }}
                          placeholder="587"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="settings-email-encryption"
                          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                        >
                          Encryption
                        </label>
                        <select
                          id="settings-email-encryption"
                          value={
                            editingEmail ? editingEmail.smtpEncryption : newEmail.smtpEncryption
                          }
                          onChange={(e) => {
                            if (editingEmail)
                              setEditingEmail({ ...editingEmail, smtpEncryption: e.target.value });
                            else setNewEmail({ ...newEmail, smtpEncryption: e.target.value });
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="TLS">TLS</option>
                          <option value="SSL">SSL</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="settings-email-smtpUser"
                          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                        >
                          SMTP Username / Email
                        </label>
                        <input
                          id="settings-email-smtpUser"
                          type="email"
                          value={editingEmail ? editingEmail.smtpUser : newEmail.smtpUser}
                          onChange={(e) => {
                            if (editingEmail)
                              setEditingEmail({ ...editingEmail, smtpUser: e.target.value });
                            else handleEmailUserChange(e.target.value);
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="settings-email-smtpPass"
                          className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                        >
                          SMTP Password
                        </label>
                        <input
                          id="settings-email-smtpPass"
                          type="password"
                          value={editingEmail ? editingEmail.smtpPass : newEmail.smtpPass}
                          onChange={(e) => {
                            if (editingEmail)
                              setEditingEmail({ ...editingEmail, smtpPass: e.target.value });
                            else setNewEmail({ ...newEmail, smtpPass: e.target.value });
                          }}
                          placeholder={
                            editingEmail ? "Leave blank to keep existing" : "Enter SMTP password"
                          }
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="active-toggle"
                          checked={editingEmail ? editingEmail.isActive : newEmail.isActive}
                          onChange={(e) => {
                            if (editingEmail)
                              setEditingEmail({ ...editingEmail, isActive: e.target.checked });
                            else setNewEmail({ ...newEmail, isActive: e.target.checked });
                          }}
                          className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <label
                          htmlFor="active-toggle"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Active Configuration
                        </label>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddEmail(false);
                            setEditingEmail(null);
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                          {editingEmail ? "Update SMTP" : "Create SMTP"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* List View */}
              <div className="space-y-4">
                {(emailSettings?.length ?? 0) === 0 && !showAddEmail && (
                  <div className="text-center py-8 text-sm text-slate-400">
                    No email settings configured yet.
                  </div>
                )}
                {(emailSettings ?? []).map((setting) => (
                  <div
                    key={setting.id}
                    className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-12 rounded-2xl flex items-center justify-center ${setting.type === "Global" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {setting.type === "Global" ? <Shield size={24} /> : <MapPin size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">
                            {setting.type === "Global"
                              ? "Main Office (Global)"
                              : setting.branch?.name}
                          </h3>
                          {!setting.isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          SMTP: {setting.smtpHost}:{setting.smtpPort} ({setting.smtpEncryption})
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Sender: {setting.fromName} &lt;{setting.fromEmail}&gt;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingEmail(setting)}
                        className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEmail(setting.id)}
                        className="p-2 text-rose-800 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-5 mt-10">
                <div className="size-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900 mb-1">Email Delivery Security</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    SMTP credentials are stored securely in the database. When a branch
                    configuration is active, the system will prioritize it for emails originating
                    from that branch. If no branch setting exists, the Global configuration is used
                    as a fallback.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="card p-10 max-w-2xl mx-auto animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500/10 to-violet-500/10" />

              <div className="relative mt-8 text-center">
                <div className="relative inline-block group">
                  <div className="size-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-indigo-200 border-4 border-white overflow-hidden relative">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        width={128}
                        height={128}
                        className="object-cover size-full"
                        unoptimized
                      />
                    ) : profile.name ? (
                      profile.name.substring(0, 2).toUpperCase()
                    ) : (
                      "??"
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 size-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 cursor-pointer hover:bg-indigo-50 transition-all border border-slate-100 group-hover:scale-110"
                  >
                    <Edit2 size={18} />
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mt-6">
                  {profile.name || "Loading..."}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    {profile.role || "System User"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left pt-8 border-t border-slate-50">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="settings-profile-name"
                      className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="settings-profile-name"
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="settings-profile-email"
                      className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="settings-profile-email"
                      type="text"
                      value={profile.email}
                      readOnly
                      className="w-full px-5 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl text-slate-500 font-medium outline-none cursor-not-allowed shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="settings-profile-role"
                      className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
                    >
                      Account Role
                    </label>
                    <input
                      id="settings-profile-role"
                      type="text"
                      value={profile.role}
                      readOnly
                      className="w-full px-5 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl text-slate-500 font-medium outline-none cursor-not-allowed shadow-sm"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Avatar Source
                    </span>
                    <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-400 font-medium flex items-center gap-2 italic truncate">
                      <Mail size={14} className="flex-shrink-0" />
                      {profile.avatar
                        ? profile.avatar.startsWith("data:")
                          ? "Custom Uploaded Image"
                          : profile.avatar
                        : "System Default Initials"}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="btn-primary px-12 py-3 rounded-2xl shadow-xl shadow-indigo-100 disabled:opacity-50 hover:scale-105 transition-transform"
                  >
                    {isSavingProfile ? "Saving Changes..." : "Save Profile Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "academics" && (
            <div className="space-y-8 animate-fade-in max-w-4xl pb-12">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Academic Settings</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage faculties and degree types used across the platform.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Faculty Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <LayoutGrid size={18} />
                    </div>
                    <h3 className="font-bold text-slate-700">Faculties</h3>
                  </div>

                  <div className="card p-5">
                    <div className="flex gap-2 mb-6">
                      <input
                        type="text"
                        value={newFacultyName}
                        onChange={(e) => setNewFacultyName(e.target.value)}
                        placeholder="Add new faculty..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleAddFaculty()}
                      />
                      <button
                        type="button"
                        onClick={handleAddFaculty}
                        className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                        aria-label="Add"
                      >
                        {" "}
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {(faculties ?? []).map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm"
                        >
                          {editingFaculty?.id === f.id ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={editingFaculty.name}
                                onChange={(e) =>
                                  setEditingFaculty({ ...editingFaculty, name: e.target.value })
                                }
                                className="flex-1 px-2 py-1 bg-white border border-indigo-200 rounded-lg outline-none text-sm"
                                onKeyDown={(e) => e.key === "Enter" && handleUpdateFaculty()}
                              />
                              <button
                                type="button"
                                onClick={handleUpdateFaculty}
                                className="text-emerald-500 p-1 hover:bg-emerald-50 rounded"
                                aria-label="Check"
                              >
                                {" "}
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingFaculty(null)}
                                className="text-slate-400 p-1 hover:bg-slate-100 rounded"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-semibold text-slate-600">{f.name}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setEditingFaculty(f)}
                                  className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFaculty(f.id)}
                                  className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {(faculties?.length ?? 0) === 0 && !isLoadingAcademics && (
                        <div className="py-8 text-center text-slate-400 text-xs italic">
                          No faculties defined yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Degree Type Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <GraduationCap size={18} />
                    </div>
                    <h3 className="font-bold text-slate-700">Degree Types</h3>
                  </div>

                  <div className="card p-5">
                    <div className="flex gap-2 mb-6">
                      <input
                        type="text"
                        value={newDegreeTypeName}
                        onChange={(e) => setNewDegreeTypeName(e.target.value)}
                        placeholder="Add new degree type..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleAddDegreeType()}
                      />
                      <button
                        type="button"
                        onClick={handleAddDegreeType}
                        className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
                        aria-label="Add"
                      >
                        {" "}
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {(degreeTypes ?? []).map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm"
                        >
                          {editingDegreeType?.id === d.id ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={editingDegreeType.name}
                                onChange={(e) =>
                                  setEditingDegreeType({
                                    ...editingDegreeType,
                                    name: e.target.value,
                                  })
                                }
                                className="flex-1 px-2 py-1 bg-white border border-emerald-200 rounded-lg outline-none text-sm"
                                onKeyDown={(e) => e.key === "Enter" && handleUpdateDegreeType()}
                              />
                              <button
                                type="button"
                                onClick={handleUpdateDegreeType}
                                className="text-emerald-500 p-1 hover:bg-emerald-50 rounded"
                                aria-label="Check"
                              >
                                {" "}
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingDegreeType(null)}
                                className="text-slate-400 p-1 hover:bg-slate-100 rounded"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-semibold text-slate-600">{d.name}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setEditingDegreeType(d)}
                                  className="p-1.5 text-emerald-800 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDegreeType(d.id)}
                                  className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {(degreeTypes?.length ?? 0) === 0 && !isLoadingAcademics && (
                        <div className="py-8 text-center text-slate-400 text-xs italic">
                          No degree types defined yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Required Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="font-bold text-slate-700">Documents Required</h3>
                  <p className="text-xs text-slate-400 ml-2">
                    Required documents shown in the Course and Application forms
                  </p>
                </div>

                <div className="card p-5">
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={newAcademicDocName}
                      onChange={(e) => setNewAcademicDocName(e.target.value)}
                      placeholder="Add new document type..."
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleAddAcademicDoc()}
                    />
                    <button
                      type="button"
                      onClick={handleAddAcademicDoc}
                      className="p-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all"
                      aria-label="Add"
                    >
                      {" "}
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                    {(academicDocs ?? []).map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm"
                      >
                        {editingAcademicDoc?.id === d.id ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={editingAcademicDoc.name}
                              onChange={(e) =>
                                setEditingAcademicDoc({
                                  ...editingAcademicDoc,
                                  name: e.target.value,
                                })
                              }
                              className="flex-1 px-2 py-1 bg-white border border-amber-200 rounded-lg outline-none text-sm"
                              onKeyDown={(e) => e.key === "Enter" && handleUpdateAcademicDoc()}
                            />
                            <button
                              type="button"
                              onClick={handleUpdateAcademicDoc}
                              className="text-emerald-500 p-1 hover:bg-emerald-50 rounded"
                              aria-label="Check"
                            >
                              {" "}
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAcademicDoc(null)}
                              className="text-slate-400 p-1 hover:bg-slate-100 rounded"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-semibold text-slate-600">{d.name}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setEditingAcademicDoc(d)}
                                className="p-1.5 text-amber-800 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAcademicDoc(d.id)}
                                className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {(academicDocs?.length ?? 0) === 0 && !isLoadingAcademics && (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        No document types defined yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "qualifications" && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Education Qualifications</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage the standard qualification levels available for student education
                    history.
                  </p>
                </div>
              </div>

              <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <input
                    type="text"
                    value={newQualName}
                    onChange={(e) => setNewQualName(e.target.value)}
                    placeholder="e.g. SLC, +2, Bachelor's, Master's"
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <select
                    value={newQualLevel}
                    onChange={(e) => setNewQualLevel(Number(e.target.value))}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value={0}>No Level (Custom)</option>
                    <option value={1}>Level 1: SEE / SLC / Grade 10</option>
                    <option value={2}>Level 2: +2 / PCL / Grade 12</option>
                    <option value={3}>Level 3: Bachelor / Undergraduate</option>
                    <option value={4}>Level 4: Master / Postgraduate</option>
                    <option value={5}>Level 5: PhD / Doctorate</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddQual}
                    className="btn-primary flex items-center gap-2"
                    aria-label="Add"
                  >
                    {" "}
                    <Plus size={18} /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {qualifications.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group"
                    >
                      {editingQual?.id === q.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingQual.name}
                            onChange={(e) =>
                              setEditingQual({ ...editingQual, name: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateQual();
                              if (e.key === "Escape") setEditingQual(null);
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <select
                            value={editingQual.level}
                            onChange={(e) =>
                              setEditingQual({ ...editingQual, level: Number(e.target.value) })
                            }
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value={0}>Custom</option>
                            <option value={1}>Level 1</option>
                            <option value={2}>Level 2</option>
                            <option value={3}>Level 3</option>
                            <option value={4}>Level 4</option>
                            <option value={5}>Level 5</option>
                          </select>
                          <button
                            type="button"
                            onClick={handleUpdateQual}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            aria-label="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingQual(null)}
                            className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-all"
                            aria-label="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-slate-700">{q.name}</span>
                          {q.level && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                              Level {q.level}
                            </span>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              type="button"
                              onClick={() => setEditingQual(q)}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              aria-label="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteQualId(q.id)}
                              className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              aria-label="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {qualifications.length === 0 && (
                    <div className="py-10 text-center text-slate-400">
                      No qualifications added yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <ConfirmDialog
            open={!!deleteQualId}
            title="Delete Qualification"
            message="Are you sure you want to delete this qualification? This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={() => {
              if (deleteQualId) handleDeleteQual(deleteQualId);
              setDeleteQualId(null);
            }}
            onCancel={() => setDeleteQualId(null)}
          />

          {activeTab === "security" && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Account Security</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your password and session settings.
                  </p>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Change Password</h3>
                    <p className="text-xs text-slate-400">
                      Regularly updating your password is recommended for safety.
                    </p>
                  </div>
                </div>

                <form className="space-y-4" autoComplete="off">
                  <input
                    type="password"
                    id="current-password"
                    name="current-password"
                    placeholder="Current Password"
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="password"
                    id="new-password"
                    name="new-password"
                    placeholder="New Password"
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Confirm New Password"
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="button" className="btn-primary w-full shadow-lg shadow-indigo-100">
                    Update Password
                  </button>
                </form>
              </div>

              <div className="bg-slate-50 border border-red-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-red-600">Deactivate Account</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    This action will suspend your access to all applications and documents.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.message("Deactivate Account", {
                      description: "Contact your administrator to deactivate this account.",
                    })
                  }
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all flex-shrink-0"
                >
                  Deactivate
                </button>
              </div>
            </div>
          )}

          {activeTab === "modules" && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Puzzle size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Feature Modules</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enable or disable modules across the platform. Disabled modules are hidden
                      from the sidebar and their routes are blocked.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveModules}
                  disabled={isSavingModules}
                  className="btn-primary px-6 shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {isSavingModules ? "Saving..." : "Save Modules"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map((mod) => {
                  const isEnabled = enabledModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className={`card p-5 transition-all duration-200 ${isEnabled ? "border-indigo-200 bg-white" : "border-slate-200 bg-slate-50/60 opacity-60"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <div
                              className={`size-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isEnabled ? "bg-indigo-50 text-indigo-600" : "bg-slate-200/70 text-slate-500"}`}
                            >
                              <ModuleIcon name={mod.icon} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                {mod.label}
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"}`}
                                >
                                  {isEnabled ? "ON" : "OFF"}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {mod.description}
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-mono pl-12">
                            {mod.routes.join(", ")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEnabledModules((prev) =>
                              prev.includes(mod.id)
                                ? prev.filter((id) => id !== mod.id)
                                : [...prev, mod.id]
                            );
                          }}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            isEnabled ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
                <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Puzzle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Module Visibility</h4>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Disabled modules are immediately hidden from the sidebar and their routes return
                    a redirect. A page refresh may be needed for sidebar changes to take effect.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "statuses" && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Application Statuses</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage the status options available on applications and how each maps to the
                      process tracker.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveStatuses}
                  disabled={isSavingStatuses}
                  className="btn-primary px-6 shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {isSavingStatuses ? "Saving..." : "Save Statuses"}
                </button>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
                <div className="size-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-900">How it works</h4>
                  <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
                    Each status maps to a process stage (1–5): Created, Application Started,
                    Reviewed (By UniTrack), Submitted to School, Offer received. Applications whose
                    status is changed will automatically reflect the mapped stage in their process
                    tracker.
                  </p>
                </div>
              </div>

              <div className="card p-5">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Add status</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Status name (e.g. Conditional Offer)"
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Process stage (e.g. Application Started)"
                    value={newStatusStage}
                    onChange={(e) => setNewStatusStage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
                    className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddStatus}
                    disabled={!newStatusName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">
                    Statuses{" "}
                    <span className="text-slate-400 font-semibold">({appStatuses.length})</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Order affects the Manage App dropdown
                  </p>
                </div>
                {appStatuses.length === 0 ? (
                  <div className="p-10 text-center text-sm text-slate-500">
                    No statuses defined yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {appStatuses.map((status, index) => (
                      <div
                        key={`${status.name}-${index}`}
                        className="flex items-center gap-3 px-5 py-3"
                      >
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMoveStatus(index, -1)}
                            disabled={index === 0}
                            className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveStatus(index, 1)}
                            disabled={index === appStatuses.length - 1}
                            className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 flex-1 min-w-0 truncate">
                          {status.name}
                        </span>
                        <input
                          type="text"
                          value={status.stage}
                          onChange={(e) => handleChangeStatusStage(index, e.target.value)}
                          placeholder="Stage"
                          className="w-44 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteStatus(index)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Remove status"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Bell size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Notification Preferences</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose how you want to receive alerts across the platform.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800">Alert Preferences</h3>
                  <button
                    type="button"
                    onClick={resetNotifPrefs}
                    className="text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    Reset to Default
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Alert Type
                        </th>
                        <th className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          SMS / Push
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {notifPrefs.map((pref) => (
                        <tr key={pref.id}>
                          <td className="py-4">
                            <p className="text-sm font-medium text-slate-800">{pref.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
                          </td>
                          <td className="text-center py-4">
                            <input
                              type="checkbox"
                              checked={pref.email}
                              onChange={() => toggleNotif(pref.id, "email")}
                              className="size-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="text-center py-4">
                            <input
                              type="checkbox"
                              checked={pref.push}
                              onChange={() => toggleNotif(pref.id, "push")}
                              className="size-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
                <div className="size-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Bell size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-900">Email delivery</h4>
                  <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
                    Email alerts are sent through the SMTP server configured in Email Settings. SMS
                    and push notifications are delivered through the connected channel providers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "branches" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Branch Management</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage your consultancy office locations and branches.
                    </p>
                  </div>
                </div>
                {locSettings.enableBranches ? (
                  <button
                    type="button"
                    onClick={() => setShowAddBranch(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Branch
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100">
                    Branches Disabled in Localization
                  </div>
                )}
              </div>

              {!locSettings.enableBranches && (
                <div className="card p-12 text-center bg-slate-50/50 border-dashed border-2 border-slate-200">
                  <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <MapPin size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Branches Feature is Disabled</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                    To manage multiple branches, you first need to enable the &quot;Multi-branch
                    Management&quot; toggle in the Localization settings.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTabChange("localization")}
                    className="btn-secondary text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                  >
                    Go to Localization Settings
                  </button>
                </div>
              )}

              {locSettings.enableBranches && (
                <>
                  {showAddBranch && (
                    <div className="card p-6 border-2 border-indigo-100 animate-slide-down">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Add New Branch</h3>
                        <button
                          type="button"
                          onClick={() => setShowAddBranch(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label
                            htmlFor="settings-addBranch-name"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                          >
                            Branch Name
                          </label>
                          <input
                            id="settings-addBranch-name"
                            type="text"
                            value={newBranch.name}
                            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                            placeholder="e.g. London Head Office"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Branch Logo
                          </label>
                          <div className="flex items-center gap-3">
                            {newBranch.logo ? (
                              <div className="relative size-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                                <Image
                                  src={newBranch.logo}
                                  alt="Logo"
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setNewBranch({ ...newBranch, logo: "" })}
                                  className="absolute -top-1 -right-1 size-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ) : (
                              <div className="size-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0">
                                <Building2 size={20} />
                              </div>
                            )}
                            <label
                              htmlFor="settings-addBranch-logo"
                              className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-100 transition-all"
                            >
                              <Upload size={14} />
                              Upload Logo
                              <input
                                id="settings-addBranch-logo"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleBranchLogoUpload(e, false)}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="settings-addBranch-location"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                          >
                            Location / Address
                          </label>
                          <input
                            id="settings-addBranch-location"
                            type="text"
                            value={newBranch.location}
                            onChange={(e) =>
                              setNewBranch({ ...newBranch, location: e.target.value })
                            }
                            placeholder="e.g. 123 Baker St, London"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-addBranch-manager"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                          >
                            Branch Manager
                          </label>
                          <input
                            id="settings-addBranch-manager"
                            type="text"
                            value={newBranch.manager}
                            onChange={(e) =>
                              setNewBranch({ ...newBranch, manager: e.target.value })
                            }
                            placeholder="Manager Name"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-addBranch-email"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                          >
                            Contact Email
                          </label>
                          <input
                            id="settings-addBranch-email"
                            type="email"
                            value={newBranch.email}
                            onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                            placeholder="branch@example.com"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-addBranch-phone"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                          >
                            Phone Number
                          </label>
                          <input
                            id="settings-addBranch-phone"
                            type="text"
                            value={newBranch.phone}
                            onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                            placeholder="+44 ..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-addBranch-status"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                          >
                            Status
                          </label>
                          <select
                            id="settings-addBranch-status"
                            value={newBranch.status}
                            onChange={(e) => setNewBranch({ ...newBranch, status: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="settings-addBranch-latitude"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                          >
                            Latitude (geofence)
                          </label>
                          <input
                            id="settings-addBranch-latitude"
                            type="number"
                            step="any"
                            value={newBranch.latitude}
                            onChange={(e) =>
                              setNewBranch({ ...newBranch, latitude: e.target.value })
                            }
                            placeholder="e.g. 40.7128"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-addBranch-longitude"
                            className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                          >
                            Longitude (geofence)
                          </label>
                          <input
                            id="settings-addBranch-longitude"
                            type="number"
                            step="any"
                            value={newBranch.longitude}
                            onChange={(e) =>
                              setNewBranch({ ...newBranch, longitude: e.target.value })
                            }
                            placeholder="e.g. -74.0060"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddBranch(false)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button type="button" onClick={handleAddBranch} className="btn-primary">
                          Add Branch
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {branches.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-slate-400">
                        No branches found. Add your first branch location.
                      </div>
                    ) : (
                      branches.map((branch) => (
                        <div
                          key={branch.id}
                          className="card p-6 group hover:shadow-lg transition-all duration-300 shadow-[inset_0_0_0_1px_theme(colors.indigo.200)]"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              {branch.logo ? (
                                <div className="size-10 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 relative">
                                  <Image
                                    src={branch.logo}
                                    alt={`${branch.name} logo`}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm flex-shrink-0">
                                  {branch.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h3 className="font-bold text-slate-800 text-lg">{branch.name}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                  <MapPin size={12} className="text-slate-400" />
                                  {branch.location || "No address provided"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setEditingBranch(branch)}
                                className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBranch(branch.id)}
                                className="p-2 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-y-3 mt-4 pt-4 border-t border-slate-50">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Manager
                              </p>
                              <p className="text-xs font-semibold text-slate-700">
                                {branch.manager || "N/A"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Status
                              </p>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  branch.status === "Active"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {branch.status}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Email
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Mail size={12} className="text-slate-400" />
                                {branch.email || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Phone
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Phone size={12} className="text-slate-400" />
                                {branch.phone || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {editingBranch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <button
                    type="button"
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    onClick={() => setEditingBranch(null)}
                  />
                  <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg animate-slide-up overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-800">Edit Branch Details</h3>
                      <button
                        type="button"
                        onClick={() => setEditingBranch(null)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label
                            htmlFor="settings-editBranch-name"
                            className="block text-xs font-semibold text-slate-600 mb-1.5"
                          >
                            Branch Name
                          </label>
                          <input
                            id="settings-editBranch-name"
                            type="text"
                            value={editingBranch.name}
                            onChange={(e) =>
                              setEditingBranch({ ...editingBranch, name: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Branch Logo
                          </label>
                          <div className="flex items-center gap-3">
                            {editingBranch.logo ? (
                              <div className="relative size-14 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                                <Image
                                  src={editingBranch.logo}
                                  alt="Logo"
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingBranch({ ...editingBranch, logo: "" })}
                                  className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="size-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0">
                                <Building2 size={24} />
                              </div>
                            )}
                            <label
                              htmlFor="settings-editBranch-logo"
                              className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-100 transition-all"
                            >
                              <Upload size={14} />
                              Upload Logo
                              <input
                                id="settings-editBranch-logo"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleBranchLogoUpload(e, true)}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label
                            htmlFor="settings-editBranch-location"
                            className="block text-xs font-semibold text-slate-600 mb-1.5"
                          >
                            Location
                          </label>
                          <input
                            id="settings-editBranch-location"
                            type="text"
                            value={editingBranch.location}
                            onChange={(e) =>
                              setEditingBranch({ ...editingBranch, location: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-editBranch-manager"
                            className="block text-xs font-semibold text-slate-600 mb-1.5"
                          >
                            Manager
                          </label>
                          <input
                            id="settings-editBranch-manager"
                            type="text"
                            value={editingBranch.manager}
                            onChange={(e) =>
                              setEditingBranch({ ...editingBranch, manager: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-editBranch-status"
                            className="block text-xs font-semibold text-slate-600 mb-1.5"
                          >
                            Status
                          </label>
                          <select
                            id="settings-editBranch-status"
                            value={editingBranch.status}
                            onChange={(e) =>
                              setEditingBranch({ ...editingBranch, status: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="settings-editBranch-email"
                            className="block text-xs font-semibold text-slate-600 mb-1.5"
                          >
                            Email
                          </label>
                          <input
                            id="settings-editBranch-email"
                            type="email"
                            value={editingBranch.email}
                            onChange={(e) =>
                              setEditingBranch({ ...editingBranch, email: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-editBranch-phone"
                            className="block text-xs font-semibold text-slate-600 mb-1.5"
                          >
                            Phone
                          </label>
                          <input
                            id="settings-editBranch-phone"
                            type="text"
                            value={editingBranch.phone}
                            onChange={(e) =>
                              setEditingBranch({ ...editingBranch, phone: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-editBranch-latitude"
                            className="block text-xs font-semibold text-slate-600 mb-1.5"
                          >
                            Latitude (geofence)
                          </label>
                          <input
                            id="settings-editBranch-latitude"
                            type="number"
                            step="any"
                            value={editingBranch.latitude ?? ""}
                            onChange={(e) =>
                              setEditingBranch({
                                ...editingBranch,
                                latitude: e.target.value ? parseFloat(e.target.value) : null,
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="settings-editBranch-longitude"
                            className="block text-xs font-semibold text-slate-600 mb-1.5"
                          >
                            Longitude (geofence)
                          </label>
                          <input
                            id="settings-editBranch-longitude"
                            type="number"
                            step="any"
                            value={editingBranch.longitude ?? ""}
                            onChange={(e) =>
                              setEditingBranch({
                                ...editingBranch,
                                longitude: e.target.value ? parseFloat(e.target.value) : null,
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-50">
                        <button
                          type="button"
                          onClick={() => setEditingBranch(null)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button type="button" onClick={handleUpdateBranch} className="btn-primary">
                          Update Branch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export default function SettingsContent() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading settingsâ€¦</div>}>
      <SettingsContentInternal />
    </Suspense>
  );
}
