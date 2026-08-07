import React from "react";
import {
  Building2,
  BookOpen,
  Users,
  Zap,
  TrendingUp,
  UserCheck,
  FileText,
  ClipboardList,
} from "lucide-react";

export interface DashboardStats {
  totalUniversities: number;
  universitiesLastMonth: number;
  countriesCount: number;
  totalCourses: number;
  coursesLastMonth: number;
  totalEnrolled: number;
  activeCourses: number;
  totalLeads: number;
  totalStudents: number;
  totalApplications: number;
  totalTasks: number;
}

export interface KpiDefinition {
  id: string;
  title: string;
  icon: React.ReactNode;
  gradient: string;
  category: string;
  valueFn: (stats: DashboardStats | null | undefined) => string;
  changeFn: (stats: DashboardStats | null | undefined) => {
    change: string;
    type: "positive" | "negative" | "warning" | "neutral";
  };
  subtitleFn?: (stats: DashboardStats | null | undefined) => string;
}

export const AVAILABLE_KPIS: KpiDefinition[] = [
  {
    id: "kpi-total-universities",
    title: "Total Universities",
    icon: <Building2 size={20} />,
    gradient: "from-indigo-400/20 via-violet-300/10 to-transparent",
    category: "academic",
    valueFn: (s) => s?.totalUniversities?.toLocaleString() || "0",
    changeFn: (s) => ({
      change: `+${s?.universitiesLastMonth || 0} this month`,
      type: "positive" as const,
    }),
    subtitleFn: (s) => `Across ${s?.countriesCount || 0} countries`,
  },
  {
    id: "kpi-total-courses",
    title: "Total Courses",
    icon: <BookOpen size={20} />,
    gradient: "from-sky-400/20 via-blue-300/10 to-transparent",
    category: "academic",
    valueFn: (s) => s?.totalCourses?.toLocaleString() || "0",
    changeFn: (s) => ({
      change: `+${s?.coursesLastMonth || 0} this month`,
      type: "positive" as const,
    }),
    subtitleFn: () => "Active catalog",
  },
  {
    id: "kpi-enrolled-students",
    title: "Enrolled Students",
    icon: <Users size={20} />,
    gradient: "from-amber-400/20 via-orange-300/10 to-transparent",
    category: "academic",
    valueFn: (s) =>
      (s?.totalEnrolled || 0) >= 1000000
        ? `${((s?.totalEnrolled || 0) / 1000000).toFixed(2)}M`
        : s?.totalEnrolled?.toLocaleString() || "0",
    changeFn: () => ({ change: "Lifetime enrollment", type: "positive" as const }),
    subtitleFn: () => "Global reach",
  },
  {
    id: "kpi-active-courses",
    title: "Active Courses",
    icon: <Zap size={20} />,
    gradient: "from-pink-400/20 via-rose-300/10 to-transparent",
    category: "academic",
    valueFn: (s) => s?.activeCourses?.toLocaleString() || "0",
    changeFn: (s) => ({
      change:
        (s?.totalCourses || 0) > 0
          ? `${(((s?.activeCourses || 0) / (s?.totalCourses || 1)) * 100).toFixed(1)}% of catalog`
          : "0% of catalog",
      type: "neutral" as const,
    }),
    subtitleFn: (s) => `${(s?.totalCourses || 0) - (s?.activeCourses || 0) || 0} non-active`,
  },
  {
    id: "kpi-growth",
    title: "Growth (30d)",
    icon: <TrendingUp size={20} />,
    gradient: "from-emerald-400/20 via-teal-300/10 to-transparent",
    category: "academic",
    valueFn: (s) =>
      (s?.totalUniversities || 0) > 0
        ? `+${(((s?.universitiesLastMonth || 0) / (s?.totalUniversities || 1)) * 100).toFixed(1)}%`
        : "0%",
    changeFn: () => ({ change: "New university listings", type: "positive" as const }),
    subtitleFn: () => "Expansion rate",
  },
  {
    id: "kpi-total-leads",
    title: "Total Leads",
    icon: <UserCheck size={20} />,
    gradient: "from-teal-400/20 via-cyan-300/10 to-transparent",
    category: "outreach",
    valueFn: (s) => s?.totalLeads?.toLocaleString() || "0",
    changeFn: () => ({ change: "Inquiry pipeline", type: "positive" as const }),
    subtitleFn: () => "Prospective students",
  },
  {
    id: "kpi-total-students",
    title: "Total Students",
    icon: <Users size={20} />,
    gradient: "from-purple-400/20 via-fuchsia-300/10 to-transparent",
    category: "outreach",
    valueFn: (s) => s?.totalStudents?.toLocaleString() || "0",
    changeFn: () => ({ change: "Full student body", type: "neutral" as const }),
    subtitleFn: () => "Active records",
  },
  {
    id: "kpi-total-applications",
    title: "Total Applications",
    icon: <FileText size={20} />,
    gradient: "from-rose-400/20 via-pink-300/10 to-transparent",
    category: "outreach",
    valueFn: (s) => s?.totalApplications?.toLocaleString() || "0",
    changeFn: () => ({ change: "Submitted applications", type: "positive" as const }),
    subtitleFn: () => "Processing queue",
  },
  {
    id: "kpi-total-tasks",
    title: "Total Tasks",
    icon: <ClipboardList size={20} />,
    gradient: "from-cyan-400/20 via-sky-300/10 to-transparent",
    category: "operations",
    valueFn: (s) => s?.totalTasks?.toLocaleString() || "0",
    changeFn: () => ({ change: "Across all workflows", type: "neutral" as const }),
    subtitleFn: () => "Active items",
  },
];
