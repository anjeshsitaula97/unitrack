"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearAuthCache } from "./AppLayoutWrapper";
import { deactivateSession } from "@/lib/client-session";
import AppLogo from "@/components/ui/AppLogo";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Bell,
  Star,
  FileText,
  Zap,
  Search,
  ShieldCheck,
  Key,
  LogOut,
  CreditCard,
  Receipt,
  Layout,
  Library,
  Database,
  Ticket as TicketIcon,
  X,
  CheckSquare,
  MessageSquare,
  Briefcase,
  Clock,
  CalendarClock,
  DollarSign,
  UserCog,
  Folder,
  Calendar,
  Route,
  Upload,
  Mail,
  GitCompare,
  ClipboardList,
  Activity,
  Trash2,
  Handshake,
  BadgeDollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MODULES, getEnabledModuleIds } from "@/lib/modules";
import { getRoleHome } from "@/lib/role-home";

interface AppUser {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
  subscriptionPackage?: string | null;
  subscriptionExpiry?: string | null;
  isFirstLogin?: boolean | null;
}

interface DashboardStats {
  totalUniversities: number;
  universitiesLastMonth: number;
  totalCourses: number;
  coursesLastMonth: number;
  totalEnrolled: number;
  activeCourses: number;
  countriesCount: number;
  totalLeads: number;
  totalStudents: number;
  totalApplications: number;
  totalTasks: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: "main",
    items: [
      {
        id: "nav-dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        href: "/dashboard",
      },
      {
        id: "nav-universities",
        label: "Universities",
        icon: <Building2 size={18} />,
        href: "/universities",
      },
      { id: "nav-courses", label: "Courses", icon: <BookOpen size={18} />, href: "/courses" },
      { id: "nav-leads", label: "Leads", icon: <Users size={18} />, href: "/leads" },
      {
        id: "nav-students",
        label: "Students",
        icon: <GraduationCap size={18} />,
        href: "/students",
      },
      {
        id: "nav-applications",
        label: "Applications",
        icon: <FileText size={18} />,
        href: "/applications",
      },
      {
        id: "nav-student-messages",
        label: "Messages",
        icon: <MessageSquare size={18} />,
        href: "/student-messages",
      },
      { id: "nav-search", label: "Search Courses", icon: <Search size={18} />, href: "/search" },
      { id: "nav-files", label: "Files", icon: <Folder size={18} />, href: "/files" },
      { id: "nav-calendar", label: "Calendar", icon: <Calendar size={18} />, href: "/calendar" },
      {
        id: "nav-visa-timeline",
        label: "Visa Timeline",
        icon: <Route size={18} />,
        href: "/visa-timeline",
      },
      { id: "nav-compare", label: "Compare", icon: <GitCompare size={18} />, href: "/compare" },
      {
        id: "nav-onboarding",
        label: "Onboarding",
        icon: <ClipboardList size={18} />,
        href: "/onboarding",
      },
    ],
  },
  {
    id: "management",
    title: "Management",
    items: [
      { id: "nav-staff", label: "User Access", icon: <ShieldCheck size={18} />, href: "/access" },
      { id: "nav-apikeys", label: "API Keys", icon: <Key size={18} />, href: "/api-keys" },
      { id: "nav-payments", label: "Payments", icon: <CreditCard size={18} />, href: "/payments" },
      {
        id: "nav-partnership",
        label: "Partnership",
        icon: <Handshake size={18} />,
        href: "/partnership",
      },
      {
        id: "nav-commission",
        label: "Commission",
        icon: <BadgeDollarSign size={18} />,
        href: "/commission",
      },
      { id: "nav-expenses", label: "Expenses", icon: <Receipt size={18} />, href: "/expenses" },
      {
        id: "nav-backups",
        label: "Database Backups",
        icon: <Database size={18} />,
        href: "/settings/backups",
      },
      { id: "nav-workflow", label: "Country Workflow", icon: <Layout size={18} />, href: "/tasks" },
      {
        id: "nav-staff-tasks",
        label: "Tasks",
        icon: <CheckSquare size={18} />,
        href: "/staff-tasks",
      },
      {
        id: "nav-analytics",
        label: "Analytics",
        icon: <BarChart3 size={18} />,
        href: "/analytics",
      },
      { id: "nav-reports", label: "Reports", icon: <FileText size={18} />, href: "/reports" },
      {
        id: "nav-bulk-import",
        label: "Bulk Import/Export",
        icon: <Upload size={18} />,
        href: "/bulk-import",
      },
      {
        id: "nav-report-builder",
        label: "Report Builder",
        icon: <BarChart3 size={18} />,
        href: "/reports/builder",
      },
      { id: "nav-audit", label: "Audit Trail", icon: <Activity size={18} />, href: "/audit" },
      { id: "nav-trash", label: "Recycle Bin", icon: <Trash2 size={18} />, href: "/trash" },
    ],
  },
  {
    id: "hr",
    title: "HR & Payroll",
    items: [
      { id: "nav-hr-dashboard", label: "HR Dashboard", icon: <UserCog size={18} />, href: "/hr" },
      {
        id: "nav-hr-employees",
        label: "Employees",
        icon: <Users size={18} />,
        href: "/hr/employees",
      },
      {
        id: "nav-hr-departments",
        label: "Departments",
        icon: <Building2 size={18} />,
        href: "/hr/departments",
      },
      {
        id: "nav-hr-designations",
        label: "Designations",
        icon: <Briefcase size={18} />,
        href: "/hr/designations",
      },
      {
        id: "nav-hr-attendance",
        label: "Attendance",
        icon: <Clock size={18} />,
        href: "/hr/attendance",
      },
      { id: "nav-hr-leave", label: "Leave", icon: <CalendarClock size={18} />, href: "/hr/leave" },
      {
        id: "nav-hr-payroll",
        label: "Payroll",
        icon: <DollarSign size={18} />,
        href: "/hr/payroll",
      },
    ],
  },
  {
    id: "platform",
    title: "Platform",
    items: [
      {
        id: "nav-learning",
        label: "Learning Hub",
        icon: <Library size={18} />,
        href: "/learning-hub",
      },
      { id: "nav-featured", label: "Featured", icon: <Star size={18} />, href: "/featured" },
      {
        id: "nav-automations",
        label: "Automations",
        icon: <Zap size={18} />,
        href: "/automations",
      },
      {
        id: "nav-notifications",
        label: "Notifications",
        icon: <Bell size={18} />,
        href: "/notifications",
      },
      { id: "nav-chat", label: "Chat", icon: <MessageSquare size={18} />, href: "/chat" },
      { id: "nav-email", label: "Email", icon: <Mail size={18} />, href: "/email" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user?: AppUser | null;
}

export default function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined);
  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);
  const navRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (Array.isArray(data)) {
          setUnreadCount(data.filter((n: { read: boolean }) => !n.read).length);
        }
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();
        if (!data.error) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchUnreadCount();
    fetchStats();
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchStats();
    }, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  // Persist scroll position
  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem("sidebar-scroll");
    if (savedScrollPos && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScrollPos, 10);
    }
  }, []);

  const handleScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem("sidebar-scroll", navRef.current.scrollTop.toString());
    }
  };

  const userName = user?.name || user?.email?.split("@")[0] || "Loading...";
  const userRole = user?.role || "User";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        clearAuthCache();
        deactivateSession();
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [enabledModuleIds, setEnabledModuleIds] = useState<string[]>(() =>
    MODULES.map((m) => m.id)
  );
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings/localization")
      .then((r) => r.json())
      .then((data) => {
        if (data?.enabledModules) {
          setEnabledModuleIds(getEnabledModuleIds(data.enabledModules));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredSections = useMemo(() => {
    const enabledRoutes = new Set<string>();
    for (const mod of MODULES) {
      if (enabledModuleIds.includes(mod.id)) {
        for (const r of mod.routes) enabledRoutes.add(r);
      }
    }
    enabledRoutes.add("/dashboard");

    const dashboardHref = getRoleHome(user?.role);

    const sectionsWithModules = navSections
      .map((section) => ({
        ...section,
        items: section.items
          .filter((item) => {
            const matchingModule = MODULES.find((m) => m.routes.includes(item.href));
            if (matchingModule && !enabledModuleIds.includes(matchingModule.id)) return false;
            if (!matchingModule) return true;
            return enabledRoutes.has(item.href);
          })
          .map((item) => (item.id === "nav-dashboard" ? { ...item, href: dashboardHref } : item)),
      }))
      .filter((section) => section.items.length > 0);

    if (!searchQuery) return sectionsWithModules;
    const query = searchQuery.toLowerCase();
    const result: NavSection[] = [];
    for (const section of sectionsWithModules) {
      const filteredItems = section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(query) || section.title?.toLowerCase().includes(query)
      );
      if (filteredItems.length > 0) {
        result.push({ ...section, items: filteredItems });
      }
    }
    return result;
  }, [searchQuery, enabledModuleIds, user?.role]);

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-30
        flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-14 border-b border-slate-100 px-3 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={28} />
          {!collapsed && (
            <span className="font-bold text-slate-800 text-base tracking-tight truncate">
              UniTrack
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150"
            aria-label="Collapse sidebar"
          >
            {" "}
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3 border-b border-slate-100">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
              size={14}
            />
            <input
              ref={searchInputRef}
              id="unitrack-sidebar-search-input"
              type="search"
              name="unitrack-sidebar-search-field"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.currentTarget.focus()}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-label="Search menu"
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 pointer-events-auto relative z-10"
            />
            {!searchQuery && (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-400 pointer-events-none uppercase">
                /
              </kbd>
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      <NavSectionList
        filteredSections={filteredSections}
        collapsed={collapsed}
        pathname={pathname}
        stats={stats}
        unreadCount={unreadCount}
        navRef={navRef}
        handleScroll={handleScroll}
      />

      <UserBottomSection
        collapsed={collapsed}
        onToggle={onToggle}
        pathname={pathname}
        user={user}
        userName={userName}
        userRole={userRole}
        userInitials={userInitials}
        handleLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </aside>
  );
}

function NavSectionList({
  filteredSections,
  collapsed,
  pathname,
  stats,
  unreadCount,
  navRef,
  handleScroll,
}: {
  filteredSections: NavSection[];
  collapsed: boolean;
  pathname: string;
  stats: DashboardStats | undefined;
  unreadCount: number | undefined;
  navRef: React.RefObject<HTMLElement | null>;
  handleScroll: () => void;
}) {
  return (
    <nav
      ref={navRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin"
    >
      {filteredSections.map((section) => (
        <div key={section.id} className="mb-4">
          {section.title && !collapsed && (
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {section.title}
            </p>
          )}
          {section.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                id={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 relative group
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span className={`flex-shrink-0 ${isActive ? "text-indigo-600" : ""}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed &&
                  (item.id === "nav-notifications"
                    ? (unreadCount ?? 0) > 0
                    : item.id === "nav-universities"
                      ? (stats?.totalUniversities || 0) > 0
                      : item.id === "nav-courses"
                        ? (stats?.totalCourses || 0) > 0
                        : item.id === "nav-leads"
                          ? (stats?.totalLeads || 0) > 0
                          : item.id === "nav-students"
                            ? (stats?.totalStudents || 0) > 0
                            : item.id === "nav-applications"
                              ? (stats?.totalApplications || 0) > 0
                              : item.id === "nav-staff-tasks"
                                ? (stats?.totalTasks || 0) > 0
                                : (item.badge || 0) > 0) && (
                    <span className="ml-auto bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.id === "nav-notifications"
                        ? unreadCount
                        : item.id === "nav-universities"
                          ? stats?.totalUniversities || 0
                          : item.id === "nav-courses"
                            ? stats?.totalCourses || 0
                            : item.id === "nav-leads"
                              ? stats?.totalLeads || 0
                              : item.id === "nav-students"
                                ? stats?.totalStudents || 0
                                : item.id === "nav-applications"
                                  ? stats?.totalApplications || 0
                                  : item.id === "nav-staff-tasks"
                                    ? stats?.totalTasks || 0
                                    : item.badge}
                    </span>
                  )}
                {collapsed &&
                  (item.id === "nav-notifications"
                    ? (unreadCount ?? 0) > 0
                    : item.id === "nav-universities"
                      ? (stats?.totalUniversities || 0) > 0
                      : item.id === "nav-courses"
                        ? (stats?.totalCourses || 0) > 0
                        : item.id === "nav-leads"
                          ? (stats?.totalLeads || 0) > 0
                          : item.id === "nav-students"
                            ? (stats?.totalStudents || 0) > 0
                            : item.id === "nav-applications"
                              ? (stats?.totalApplications || 0) > 0
                              : item.id === "nav-staff-tasks"
                                ? (stats?.totalTasks || 0) > 0
                                : item.badge) && (
                    <span className="absolute top-1 right-1 size-2 bg-indigo-500 rounded-full" />
                  )}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
      {filteredSections.length === 0 && !collapsed && (
        <div className="px-4 py-8 text-center">
          <p className="text-xs text-slate-400">No menu items found</p>
        </div>
      )}
    </nav>
  );
}

function UserBottomSection({
  collapsed,
  onToggle,
  pathname,
  user,
  userName,
  userRole,
  userInitials,
  handleLogout,
  isLoggingOut,
}: {
  collapsed: boolean;
  onToggle: () => void;
  pathname: string;
  user?: AppUser | null;
  userName: string;
  userRole: string;
  userInitials: string;
  handleLogout: () => void;
  isLoggingOut: boolean;
}) {
  return (
    <div className="border-t border-slate-100 p-2 space-y-1">
      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-150"
          aria-label="Expand sidebar"
        >
          {" "}
          <ChevronRight size={16} />
        </button>
      )}
      <Link
        href="/tickets"
        className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 w-full ${
          pathname === "/tickets"
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        } ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? "Tickets" : undefined}
      >
        <TicketIcon size={18} className={pathname === "/tickets" ? "text-indigo-600" : ""} />
        {!collapsed && <span>Tickets</span>}
      </Link>
      <Link
        href="/settings"
        className={`text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 w-full ${
          pathname === "/settings"
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        } ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? "Settings" : undefined}
      >
        <Settings size={18} className={pathname === "/settings" ? "text-indigo-600" : ""} />
        {!collapsed && <span>Settings</span>}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? "Logout" : undefined}
      >
        {" "}
        <LogOut size={18} className={isLoggingOut ? "animate-spin" : ""} />
        {!collapsed && <span>{isLoggingOut ? "Logging out..." : "Sign Out"}</span>}
      </button>

      {!collapsed && (
        <div className="mx-1 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          {user?.role?.includes("Admin") ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Storage</span>
                <span className="text-xs text-slate-400">68% used</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-[68%] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Your Plan
                </span>
                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">
                  {user?.subscriptionPackage || "Basic"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-slate-500 font-medium">
                  Expires:{" "}
                  <span className="text-slate-700 font-bold">
                    {user?.subscriptionExpiry
                      ? new Date(user.subscriptionExpiry).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Never"}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <div
        className={`flex items-center gap-3 px-3 py-2 mt-1 ${collapsed ? "justify-center" : ""}`}
      >
        {user?.avatar &&
        (user.avatar.startsWith("http") ||
          user.avatar.startsWith("/") ||
          user.avatar.startsWith("data:")) ? (
          <div className="size-7 rounded-full overflow-hidden flex-shrink-0 relative">
            <Image
              src={user.avatar}
              alt={userName}
              width={28}
              height={28}
              className="object-cover size-full"
              unoptimized
            />
          </div>
        ) : (
          <div className="size-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {userInitials}
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate">{userRole}</p>
          </div>
        )}
      </div>
    </div>
  );
}
