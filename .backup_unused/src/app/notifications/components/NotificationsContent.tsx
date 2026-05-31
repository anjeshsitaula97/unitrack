'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  time: string;
  createdAt: string;
}

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  const fetchNotifications = async (silent = false) => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  const markRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT', body: JSON.stringify({ read: true }) });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Success': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'Warning': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'Error': return <XCircle size={18} className="text-rose-500" />;
      default: return <Info size={18} className="text-indigo-500" />;
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">
            {notifications.length.toLocaleString()} notifications, {notifications.filter(n => !n.read).length} unread
          </p>
        </div>
        {notifications.some(n => !n.read) && (
          <button type="button" 
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
           aria-label="CheckCircle"> <CheckCircle size={16} /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="card p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full size-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
            <Bell size={32} />
          </div>
          <p className="text-slate-600 font-bold mb-1 uppercase tracking-tight">No notifications yet</p>
          <p className="text-sm text-slate-400 font-medium">You are all caught up! New notifications will appear here as they arrive.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button type="button"
              key={n.id} 
              onClick={() => !n.read && markRead(n.id)}
              className={`card p-4 flex items-start gap-4 transition-all duration-200 cursor-pointer ${!n.read ? 'border-l-4 border-l-indigo-500 bg-indigo-50/10' : 'hover:bg-slate-50 opacity-80'}`}
            >
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-bold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            </button>
            ))}
        </div>
      )}
    </div>
  );
}
