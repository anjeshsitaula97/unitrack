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
  ShieldCheck,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthCache } from "@/lib/auth-state";
import { deactivateSession } from "@/lib/client-session";
import { api } from "@/lib/fetch-client";
import ConsultancySwitcher from "./ConsultancySwitcher";

interface AppUser {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
  subscriptionPackage?: string | null;
  subscriptionExpiry?: string | null;
  isFirstLogin?: boolean | null;
  consultancy?: { id: number; code: string; name: string; logoUrl: string | null } | null;
}

interface TopbarProps {
  role: string;
  onRoleChange: (role: string) => void;
  sidebarCollapsed: boolean;
  user?: AppUser | null;
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

function SettingsMenu({
  open,
  onClose,
  onLogout,
  isLoggingOut,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  const router = useRouter();
  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-50 animate-fade-in py-1">
      <button
        type="button"
        onClick={() => {
          router.push("/settings?tab=profile");
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
      >
        <User size={14} /> My Profile
      </button>
      <button
        type="button"
        onClick={() => {
          router.push("/settings?tab=roles");
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-b border-slate-50"
      >
        <Settings size={14} /> System Settings
      </button>
      <button
        type="button"
        onClick={() => {
          router.push("/support");
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-b border-slate-50"
      >
        <HelpCircle size={14} /> Support Hub
      </button>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        aria-label="LogOut"
      >
        {" "}
        <LogOut size={14} className={isLoggingOut ? "animate-spin" : ""} />
        {isLoggingOut ? "Signing out..." : "Sign Out"}
      </button>
    </div>
  );
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className={`w-full px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors text-left ${
        !notification.read ? "bg-indigo-50/30" : ""
      }`}
    >
      <p className="text-[11px] font-semibold text-slate-800 mb-0.5">{notification.title}</p>
      <p className="text-xs text-slate-700 leading-relaxed">{notification.message}</p>
      <p className="text-[10px] text-slate-400 mt-1">{notification.time}</p>
    </button>
  );
}

function NotificationsMenu({
  open,
  notifications,
  unreadCount,
  onClose,
  onMarkAllRead,
  onRead,
}: {
  open: boolean;
  notifications: Notification[] | undefined;
  unreadCount: number;
  onClose: () => void;
  onMarkAllRead: () => void;
  onRead: (id: string) => void;
}) {
  const router = useRouter();
  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 animate-fade-in">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="font-semibold text-slate-800 text-sm">Notifications</span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
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
          <NotificationItem key={n.id} notification={n} onRead={onRead} />
        ))}
      </div>
      {(notifications?.length ?? 0) > 0 && (
        <div className="px-4 py-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              router.push("/notifications");
              onClose();
            }}
            className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            View All
          </button>
        </div>
      )}
    </div>
  );
}

export default function Topbar({
  role,
  onRoleChange: _onRoleChange,
  sidebarCollapsed,
  user,
}: TopbarProps) {
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
  const [isMounted] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const markAllReadBusyRef = useRef(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.get<Notification[]>("/api/notifications", { showError: false });
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
            const newIds = new Set(data.notifications.map((n: Notification) => n.id));
            const merged = [
              ...data.notifications,
              ...existing.filter((n: Notification) => !newIds.has(n.id)),
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
    if (markAllReadBusyRef.current) return;
    markAllReadBusyRef.current = true;
    try {
      await api.put("/api/notifications", { read: true }, { showError: false });
      setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    } finally {
      markAllReadBusyRef.current = false;
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.put("/api/notifications", { id, read: true }, { showError: false });
      setNotifications((prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await api.post("/api/auth/logout", undefined, { showError: false });
      clearAuthCache();
      deactivateSession();
      router.push("/login");
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
        flex items-center px-6 gap-4 transition duration-300
        ${sidebarCollapsed ? "left-16" : "left-60"}
      `}
    >
      <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <Home size={15} className="text-slate-400 flex-shrink-0" />
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb}>
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

      <ConsultancySwitcher role={user?.role || role} />

      <div className="relative">
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`p-2 rounded-lg transition duration-150 ${settingsOpen ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
        >
          <Settings size={17} />
        </button>

        <SettingsMenu
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => {
            setNotifOpen(!notifOpen);
            setSettingsOpen(false);
          }}
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition duration-150"
        >
          <Bell size={17} />
          {isMounted && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-indigo-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        {isMounted && (
          <NotificationsMenu
            open={notifOpen}
            notifications={notifications}
            unreadCount={unreadCount}
            onClose={() => setNotifOpen(false)}
            onMarkAllRead={markAllRead}
            onRead={markRead}
          />
        )}
      </div>
    </header>
  );
}
