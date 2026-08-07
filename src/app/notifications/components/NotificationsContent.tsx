"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  time: string;
  createdAt: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case "Success":
      return <CheckCircle size={18} className="text-emerald-500" />;
    case "Warning":
      return <AlertTriangle size={18} className="text-amber-500" />;
    case "Error":
      return <XCircle size={18} className="text-rose-500" />;
    default:
      return <Info size={18} className="text-indigo-500" />;
  }
};

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted] = useState(true);

  const fetchNotifications = async (silent = false) => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchNotificationsRef = useRef(fetchNotifications);
  useEffect(() => {
    fetchNotificationsRef.current = fetchNotifications;
    fetchNotificationsRef.current();

    const interval = setInterval(() => {
      fetchNotificationsRef.current(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  const markRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT", body: JSON.stringify({ read: true }) });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const clearAll = async () => {
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <div className="animate-fade-in w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {(notifications?.length ?? 0).toLocaleString()} notifications,{" "}
            {(notifications ?? []).filter((n) => !n.read).length} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(notifications?.length ?? 0) > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-colors"
            >
              <Trash2 size={16} /> Clear All
            </button>
          )}
          {(notifications ?? []).some((n) => !n.read) && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
              aria-label="CheckCircle"
            >
              {" "}
              <CheckCircle size={16} /> Mark all as read
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full size-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (notifications?.length ?? 0) === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Bell size={48} className="mx-auto mb-4 text-slate-200" />
          <p className="font-medium">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(notifications ?? []).map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => !n.read && markRead(n.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!n.read) markRead(n.id);
                }
              }}
              className={`card p-4 flex items-start gap-4 transition-all duration-200 cursor-pointer ${!n.read ? "border-l-4 border-l-indigo-500 bg-indigo-50/10" : "hover:bg-slate-50 opacity-80"}`}
            >
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`text-sm font-bold ${!n.read ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n.id, e);
                }}
                className="p-1.5 text-slate-500 hover:text-white hover:bg-rose-500 rounded-lg transition-colors flex-shrink-0 hover:shadow-sm"
                title="Delete notification"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
