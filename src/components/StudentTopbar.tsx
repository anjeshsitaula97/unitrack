"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, ChevronRight, GraduationCap, Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  time: string;
}

const breadcrumbMap: Record<string, string[]> = {
  "/student-portal/dashboard": ["Dashboard"],
  "/student-portal/applications": ["Applications"],
  "/student-portal/payments": ["Payments"],
  "/student-portal/documents": ["Documents"],
  "/student-portal/messages": ["Messages"],
};

interface AppStudent {
  id: number;
  name?: string | null;
}

export default function StudentTopbar({
  sidebarCollapsed,
  student,
}: {
  sidebarCollapsed: boolean;
  student?: AppStudent | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = breadcrumbMap[pathname] || ["Dashboard"];
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsMounted(true);
    });
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    } catch {}
  };

  useEffect(() => {
    if (!isMounted) return;
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

    es.onerror = () => es.close();

    return () => es.close();
  }, [isMounted]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT", body: JSON.stringify({ read: true }) });
      setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
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
    } catch {}
  };

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-white border-b border-slate-200 z-20 flex items-center px-6 gap-4 transition-all duration-300 ${sidebarCollapsed ? "left-16" : "left-60"}`}
    >
      <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <Home size={15} className="text-slate-400 flex-shrink-0" />
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
            <span
              className={`truncate ${i === crumbs.length - 1 ? "font-semibold text-slate-800" : "text-slate-500"}`}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setNotifOpen(!notifOpen)}
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

      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-1.5">
          <GraduationCap size={14} className="text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-700">
            {student?.name || "Student"}
          </span>
        </div>
      </div>
    </header>
  );
}
