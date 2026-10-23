"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ErrorBoundary from "./ErrorBoundary";
import GuidedTour from "./GuidedTour";
import NewsPopup from "./NewsPopup";
import SessionIdleGuard from "./SessionIdleGuard";
import { Toaster } from "sonner";

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

interface AppLayoutProps {
  children: React.ReactNode;
  role: string;
  onRoleChange: (role: string) => void;
  user?: AppUser | null;
}

export default function AppLayout({ children, role, onRoleChange, user }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} user={user} />
      <Topbar role={role} onRoleChange={onRoleChange} sidebarCollapsed={collapsed} user={user} />
      <main
        className={`transition duration-300 min-h-screen flex flex-col ${collapsed ? "ml-16" : "ml-60"}`}
      >
        <div className="pt-14 flex-1">
          <div className="p-6 max-w-screen-2xl mx-auto">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
        <footer className="px-6 pb-5 pt-2 text-center text-xs text-slate-400">
          &copy; 2026 UniTrack by Avenlixx Technologies. All rights reserved.
        </footer>
      </main>
      <GuidedTour user={user} />
      <NewsPopup />
      <SessionIdleGuard />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
