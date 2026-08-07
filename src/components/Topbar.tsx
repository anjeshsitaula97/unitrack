"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Settings,
  ChevronRight,
  Home,
  LogOut,
  User,
  HelpCircle,
  Moon,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { safeJson } from "@/lib/fetch-client";
import { clearAuthCache } from "./AppLayoutWrapper";
import { deactivateSession } from "@/lib/client-session";

interface TopbarProps {
  role: string;
  onRoleChange: (role: string) => void;
  sidebarCollapsed: boolean;
  user?: any;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  time: string;
}

const breadcrumbMap: Record<string, string[]> = {
  "/dashboard": ["Dashboard"],
  "/admin-dashboard": ["Administrator", "Dashboard"],
  "/partner-dashboard": ["Partner", "Dashboard"],
  "/universities": ["Universities"],
  "/courses": ["Courses"],
  "/leads": ["Leads"],
  "/students": ["Students"],
  "/applications": ["Applications"],
  "/search": ["Search Courses"],
  "/settings": ["Settings"],
  "/settings/backups": ["Management", "Database Backups"],
  "/payments": ["Management", "Payments"],
  "/files": ["Files"],
  "/expenses": ["Management", "Expenses"],
  "/tasks": ["Management", "Country Workflow"],
  "/analytics": ["Management", "Analytics"],
  "/reports": ["Management", "Reports"],
  "/reports/builder": ["Management", "Report Builder"],
  "/access": ["Management", "User Access"],
  "/api-keys": ["Management", "API Keys"],
  "/learning-hub": ["Platform", "Learning Hub"],
  "/featured": ["Platform", "Featured"],
  "/automations": ["Platform", "Automations"],
  "/notifications": ["Platform", "Notifications"],
  "/tickets": ["Support", "Tickets"],
  "/support": ["Support", "Support Hub"],
  "/chat": ["Platform", "Chat"],
  "/student-messages": ["Messages"],
  "/calendar": ["Calendar"],
  "/visa-timeline": ["Visa Timeline"],
  "/bulk-import": ["Management", "Bulk Import/Export"],
};

export default function Topbar({ role, onRoleChange, sidebarCollapsed, user }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const crumbs =
    pathname.startsWith("/applications/") && pathname !== "/applications"
      ? ["Applications", "Details"]
      : breadcrumbMap[pathname] || ["Dashboard"];
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMounted, setIsMounted] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await safeJson(res);
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchNotifications);

    const es = new EventSource("/api/notifications/stream");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notifications" && data.notifications?.length > 0) {
          setNotifications((prev) => {
            const existing = prev || [];
            const newIds = new Set(data.notifications.map((n: any) => n.id));
            const merged = [
              ...data.notifications,
              ...existing.filter((n: any) => !newIds.has(n.id)),
            ];
            return merged.slice(0, 50);
          });
          setUnreadCount(data.unreadCount);
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT", body: JSON.stringify({ read: true }) });
      setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      setNotifications((prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

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

  return (
    <header
      className={`
        fixed top-0 right-0 h-14 bg-white border-b border-slate-200 z-20
        flex items-center px-6 gap-4 transition-all duration-300
        ${sidebarCollapsed ? "left-16" : "left-60"}
      `}
    >
      <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <Home size={15} className="text-slate-400 flex-shrink-0" />
        {crumbs.map((crumb, i) => (
          <React.Fragment key={`crumb-${crumb}-${i}`}>
            <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
            <span
              className={`truncate ${i === crumbs.length - 1 ? "font-semibold text-slate-800" : "text-slate-500"}`}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-indigo-700 shadow-sm ml-auto mr-2">
        <ShieldCheck size={13} />
        {user?.role || role}
      </div>

      <button
        type="button"
        aria-label="Toggle dark mode"
        onClick={toggleTheme}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150"
      >
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <div className="relative">
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`p-2 rounded-lg transition-all duration-150 ${settingsOpen ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
        >
          <Settings size={17} />
        </button>

        {settingsOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-50 animate-fade-in py-1">
            <button
              type="button"
              onClick={() => {
                router.push("/settings?tab=profile");
                setSettingsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <User size={14} /> My Profile
            </button>
            <button
              type="button"
              onClick={() => {
                router.push("/settings?tab=roles");
                setSettingsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-b border-slate-50"
            >
              <Settings size={14} /> System Settings
            </button>
            <button
              type="button"
              onClick={() => {
                router.push("/support");
                setSettingsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-b border-slate-50"
            >
              <HelpCircle size={14} /> Support Hub
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              aria-label="LogOut"
            >
              {" "}
              <LogOut size={14} className={isLoggingOut ? "animate-spin" : ""} />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => {
            setNotifOpen(!notifOpen);
            setSettingsOpen(false);
          }}
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150"
        >
          <Bell size={17} />
          {isMounted && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-indigo-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        {isMounted && notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 animate-fade-in">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
              {(notifications?.length ?? 0) === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-slate-400">No notifications yet.</p>
                </div>
              )}
              {(notifications ?? []).map((n) => (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors text-left ${!n.read ? "bg-indigo-50/30" : ""}`}
                >
                  <p className="text-[11px] font-semibold text-slate-800 mb-0.5">{n.title}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                </button>
              ))}
            </div>
            {(notifications?.length ?? 0) > 0 && (
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/notifications");
                    setNotifOpen(false);
                  }}
                  className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                >
                  View All
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
