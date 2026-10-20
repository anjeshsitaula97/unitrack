"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Bell,
  Settings,
  ChevronRight,
  Home,
  LogOut,
  User,
  HelpCircle,
  ShieldCheck,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthCache } from "@/lib/auth-state";
import { deactivateSession } from "@/lib/client-session";
import { api } from "@/lib/fetch-client";
import { toast } from "sonner";
import ConsultancySwitcher from "./ConsultancySwitcher";
import {
  clearNotificationsRemote,
  countUnread,
  deleteNotificationRemote,
  markAllNotificationsReadRemote,
  markNotificationReadRemote,
  subscribeNotifications,
  type NotificationEvent,
} from "@/lib/notification-client";

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

const NOTIFICATION_TONE: Record<string, { icon: React.ReactNode; ring: string; bg: string }> = {
  Success: {
    icon: <CheckCircle2 size={16} />,
    ring: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  Warning: {
    icon: <AlertTriangle size={16} />,
    ring: "text-amber-600",
    bg: "bg-amber-50",
  },
  Error: {
    icon: <XCircle size={16} />,
    ring: "text-rose-600",
    bg: "bg-rose-50",
  },
  Info: {
    icon: <Info size={16} />,
    ring: "text-indigo-600",
    bg: "bg-indigo-50",
  },
};

function toneFor(type: string) {
  return NOTIFICATION_TONE[type] ?? NOTIFICATION_TONE.Info;
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
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const tone = toneFor(notification.type);
  return (
    <div
      className={`group/item relative flex items-start gap-3 px-4 py-3 transition-colors ${
        !notification.read ? "bg-indigo-50/40" : "hover:bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={() => onRead(notification.id)}
        className="flex flex-1 min-w-0 items-start gap-3 text-left cursor-pointer"
      >
        <span
          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${tone.bg} ${tone.ring}`}
        >
          {tone.icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-800">
              {notification.title}
            </span>
            {!notification.read && (
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
            )}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
            {notification.message}
          </span>
          <span className="mt-1 block text-[11px] font-medium text-slate-400">
            {notification.time}
          </span>
        </span>
      </button>
      <div className="flex flex-shrink-0 items-center gap-0.5">
        {!notification.read && (
          <button
            type="button"
            onClick={() => onRead(notification.id)}
            title="Mark as read"
            aria-label="Mark as read"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
          >
            <CheckCircle2 size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          title="Delete notification"
          aria-label="Delete notification"
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function NotificationsMenu({
  open,
  notifications,
  unreadCount,
  onClose,
  onMarkAllRead,
  onClearAll,
  onRead,
  onDelete,
}: {
  open: boolean;
  notifications: Notification[] | undefined;
  unreadCount: number;
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  if (!open) return null;

  const hasAny = (notifications?.length ?? 0) > 0;

  return (
    <div className="absolute right-0 top-full mt-2 w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50 animate-fade-in">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              Mark all read
            </button>
          )}
          {hasAny && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-md px-2 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
      <div className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto">
        {!hasAny && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell size={18} />
            </span>
            <p className="text-xs text-slate-400">You&rsquo;re all caught up.</p>
          </div>
        )}
        {(notifications ?? []).map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={onRead} onDelete={onDelete} />
        ))}
      </div>
      {hasAny && (
        <div className="border-t border-slate-100 p-2">
          <button
            type="button"
            onClick={() => {
              router.push("/notifications");
              onClose();
            }}
            className="w-full rounded-lg py-2 text-center text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Popup card raised by the bell for each newly-arrived notification. Carries an
 * explicit dismiss (X) and a delete action that removes the row server-side.
 */
function NotificationPopup({
  id,
  title,
  message,
  type,
  onDelete,
}: {
  id: number | string;
  title: string;
  message: string;
  type: string;
  onDelete: (id: string) => void;
}) {
  const tone = toneFor(type);
  return (
    <div className="pointer-events-auto flex w-[340px] items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl">
      <span
        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${tone.bg} ${tone.ring}`}
      >
        {tone.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{message}</p>
        <div className="mt-2 flex items-center gap-3">
          <a
            href="/notifications"
            className="text-[11px] font-semibold text-indigo-600 hover:underline"
          >
            View
          </a>
          <button
            type="button"
            onClick={() => onDelete(titleId(id))}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => toast.dismiss(id)}
        className="-mr-1 -mt-1 flex-shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** The bucket id is prefixed with the notification id: `notification:<id>`. */
function notificationToastId(id: string): string {
  return `notification:${id}`;
}

/** Recover the notification id from a sonner toast id. */
function titleId(toastId: number | string): string {
  return String(toastId).replace(/^notification:/, "");
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
  const unreadCount = useMemo(() => countUnread(notifications ?? []), [notifications]);
  const [isMounted] = useState(true);
  const markAllReadBusyRef = useRef(false);
  // IDs already surfaced — the SSE stream resends the current list on every
  // change, so only ids never seen before should raise a popup. The first list
  // (history) is recorded silently.
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const historyLoadedRef = useRef(false);
  // Latest delete handler, so the SSE effect (which runs once) never captures a
  // stale closure and can be declared before `handleDelete` exists.
  const deleteHandlerRef = useRef<(id: string) => void>(() => {});
  const notificationsRef = useRef<Notification[] | undefined>(undefined);

  const fetchNotifications = async () => {
    try {
      const data = await api.get<Notification[]>("/api/notifications", { showError: false });
      if (Array.isArray(data)) {
        // The initial load is history, not new events — mark it seen silently.
        data.forEach((n) => seenNotificationIdsRef.current.add(n.id));
        historyLoadedRef.current = true;
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchNotifications);

    const es = new EventSource("/api/notifications/stream");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== "notifications") return;

        const list = (data.notifications as Notification[]) ?? [];

        // Only ids never seen before raise a popup; a fresh delete/clear simply
        // drops rows from the list without a toast.
        const fresh = list.filter((n) => {
          if (seenNotificationIdsRef.current.has(n.id)) return false;
          seenNotificationIdsRef.current.add(n.id);
          return true;
        });

        // The stream is authoritative: replace the list wholesale so deletions
        // and "clear all" from the notifications page propagate to the bell.
        setNotifications(list);

        if (!historyLoadedRef.current) {
          // First payload may arrive before the initial fetch resolves — do not
          // toast the backlog.
          historyLoadedRef.current = true;
          return;
        }

        for (const n of fresh) {
          toast.custom(
            (id) => (
              <NotificationPopup
                id={id}
                title={n.title}
                message={n.message}
                type={n.type}
                onDelete={(id) => deleteHandlerRef.current(id)}
              />
            ),
            { id: notificationToastId(n.id), duration: 8000, position: "top-right" }
          );
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

  // Stay in sync with mutations made anywhere in the app (notifications page,
  // another surface) without waiting for the next SSE cycle.
  useEffect(() => {
    return subscribeNotifications((event: NotificationEvent) => {
      if (event.kind === "cleared") {
        notificationsRef.current?.forEach((n) => toast.dismiss(notificationToastId(n.id)));
        setNotifications([]);
        return;
      }
      if (event.kind === "removed") {
        const gone = new Set(event.ids);
        gone.forEach((id) => toast.dismiss(notificationToastId(id)));
        setNotifications((prev) => prev?.filter((n) => !gone.has(n.id)));
        return;
      }
      if (event.kind === "read") {
        const done = new Set(event.ids);
        setNotifications((prev) => prev?.map((n) => (done.has(n.id) ? { ...n, read: true } : n)));
        return;
      }
      if (event.kind === "readAll") {
        setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })));
      }
    });
  }, []);

  // Mirror the list into a ref so imperative callbacks (SSE, bus) can dismiss
  // the matching toasts without capturing a stale closure.
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const markAllRead = async () => {
    if (markAllReadBusyRef.current) return;
    markAllReadBusyRef.current = true;
    setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsReadRemote();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    } finally {
      markAllReadBusyRef.current = false;
    }
  };

  const markRead = async (id: string) => {
    setNotifications((prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markNotificationReadRemote(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDelete = async (id: string) => {
    toast.dismiss(notificationToastId(id));
    setNotifications((prev) => prev?.filter((n) => n.id !== id));
    try {
      await deleteNotificationRemote(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    notificationsRef.current?.forEach((n) => toast.dismiss(notificationToastId(n.id)));
    setNotifications([]);
    try {
      await clearNotificationsRemote();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // Keep the popup's delete callback pointed at the current handler.
  useEffect(() => {
    deleteHandlerRef.current = handleDelete;
  });

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
            onClearAll={handleClearAll}
            onRead={markRead}
            onDelete={handleDelete}
          />
        )}
      </div>
    </header>
  );
}
