"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ErrorBoundary from "./ErrorBoundary";
import GuidedTour from "./GuidedTour";
import { Toaster } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
  role: string;
  onRoleChange: (role: string) => void;
  user?: any;
}

export default function AppLayout({ children, role, onRoleChange, user }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} user={user} />
      <Topbar role={role} onRoleChange={onRoleChange} sidebarCollapsed={collapsed} user={user} />
      <main
        className={`transition-all duration-300 pt-14 min-h-screen ${collapsed ? "ml-16" : "ml-60"}`}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
      <GuidedTour user={user} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
