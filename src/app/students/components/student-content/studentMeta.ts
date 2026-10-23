import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Mail,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { KanbanStatus } from "./types";

export const capitalize = (str: string) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const parseList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
  } catch {
    return [String(value)];
  }
};

export const STATUS_META: Record<string, { icon: LucideIcon; color: string; headerBg: string }> = {
  Approved: {
    icon: CheckCircle2,
    color: "text-[#006e2c]",
    headerBg: "bg-[#006e2c]/5 hover:bg-[#006e2c]/10",
  },
  "In Review": {
    icon: Clock,
    color: "text-[#005bbf]",
    headerBg: "bg-[#005bbf]/5 hover:bg-[#005bbf]/10",
  },
  Submitted: {
    icon: FileText,
    color: "text-[#005bbf]",
    headerBg: "bg-[#005bbf]/5 hover:bg-[#005bbf]/10",
  },
  Pending: {
    icon: Clock,
    color: "text-[#727785]",
    headerBg: "bg-[#727785]/5 hover:bg-[#727785]/10",
  },
  Rejected: {
    icon: XCircle,
    color: "text-[#ba1a1a]",
    headerBg: "bg-[#ba1a1a]/5 hover:bg-[#ba1a1a]/10",
  },
};

export const requirementIcon = (req: string) => {
  const r = req.toLowerCase();
  if (r.includes("passport")) return ShieldCheck;
  if (r.includes("transcript")) return FileText;
  if (r.includes("certificate") || r.includes("degree")) return Award;
  if (r.includes("cv") || r.includes("resume")) return User;
  if (r.includes("english") || r.includes("ielts") || r.includes("language")) return BookOpen;
  if (r.includes("grade") || r.includes("marksheet") || r.includes("academic"))
    return GraduationCap;
  if (r.includes("sop") || r.includes("statement")) return FileText;
  if (r.includes("lor") || r.includes("recommendation")) return Mail;
  if (r.includes("work") || r.includes("experience")) return Briefcase;
  return FileText;
};

export const rainbowGradients = [
  "from-red-400/20 via-rose-300/10 to-transparent",
  "from-orange-400/20 via-amber-300/10 to-transparent",
  "from-yellow-400/20 via-amber-200/10 to-transparent",
  "from-green-400/20 via-emerald-300/10 to-transparent",
  "from-teal-400/20 via-cyan-300/10 to-transparent",
  "from-blue-400/20 via-indigo-300/10 to-transparent",
  "from-indigo-400/20 via-violet-300/10 to-transparent",
  "from-purple-400/20 via-fuchsia-300/10 to-transparent",
  "from-pink-400/20 via-rose-300/10 to-transparent",
  "from-sky-400/20 via-blue-300/10 to-transparent",
  "from-emerald-400/20 via-teal-300/10 to-transparent",
  "from-violet-400/20 via-purple-300/10 to-transparent",
];

export const studentStatusStyles: Record<
  string,
  { badge: string; accent: string; avatar: string }
> = {
  "New Leads": {
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    accent: "from-slate-300 to-slate-400",
    avatar: "bg-slate-100 text-slate-500 ring-slate-200",
  },
  "In Review": {
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    accent: "from-blue-400 to-indigo-400",
    avatar: "bg-blue-50 text-blue-600 ring-blue-100",
  },
  Verified: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    accent: "from-emerald-400 to-teal-400",
    avatar: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  Processing: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    accent: "from-amber-400 to-orange-400",
    avatar: "bg-amber-50 text-amber-600 ring-amber-100",
  },
  Applied: {
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    accent: "from-violet-400 to-purple-400",
    avatar: "bg-violet-50 text-violet-600 ring-violet-100",
  },
  Enrolled: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
    accent: "from-indigo-400 to-blue-400",
    avatar: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  },
  "Visa Approved": {
    badge: "bg-teal-50 text-teal-700 border-teal-100",
    accent: "from-teal-400 to-emerald-400",
    avatar: "bg-teal-50 text-teal-600 ring-teal-100",
  },
  "Visa Rejected": {
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    accent: "from-rose-400 to-red-400",
    avatar: "bg-rose-50 text-rose-600 ring-rose-100",
  },
};

export const defaultStudentStatusStyle = {
  badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
  accent: "from-indigo-400 to-violet-400",
  avatar: "bg-indigo-50 text-indigo-600 ring-indigo-100",
};

export const kanbanStatuses: KanbanStatus[] = [
  {
    key: "New Leads",
    label: "New Leads",
    dot: "bg-slate-400",
    gradient: "from-slate-400/20 via-gray-300/10 to-transparent",
  },
  {
    key: "In Review",
    label: "In Review",
    dot: "bg-blue-500",
    gradient: "from-blue-400/20 via-indigo-300/10 to-transparent",
  },
  {
    key: "Verified",
    label: "Verified",
    dot: "bg-emerald-500",
    gradient: "from-emerald-400/20 via-teal-300/10 to-transparent",
  },
  {
    key: "Processing",
    label: "Processing",
    dot: "bg-amber-500",
    gradient: "from-amber-400/20 via-orange-300/10 to-transparent",
  },
  {
    key: "Applied",
    label: "Applied",
    dot: "bg-purple-500",
    gradient: "from-purple-400/20 via-violet-300/10 to-transparent",
  },
  {
    key: "Enrolled",
    label: "Enrolled",
    dot: "bg-teal-500",
    gradient: "from-teal-400/20 via-cyan-300/10 to-transparent",
  },
  {
    key: "Visa Approved",
    label: "Visa Approved",
    dot: "bg-green-500",
    gradient: "from-green-400/20 via-emerald-300/10 to-transparent",
  },
  {
    key: "Visa Rejected",
    label: "Visa Rejected",
    dot: "bg-red-500",
    gradient: "from-red-400/20 via-rose-300/10 to-transparent",
  },
];
