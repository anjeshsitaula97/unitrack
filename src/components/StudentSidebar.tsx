"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Folder,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { MODULES, getEnabledModuleIds } from "@/lib/modules";
import { deactivateSession } from "@/lib/client-session";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    href: "/student-portal/dashboard",
    moduleId: null,
  },
  {
    id: "applications",
    label: "Applications",
    icon: <FileText size={18} />,
    href: "/student-portal/applications",
    moduleId: "students",
  },
  {
    id: "messages",
    label: "Messages",
    icon: <MessageSquare size={18} />,
    href: "/student-portal/messages",
    moduleId: "students",
  },
  {
    id: "payments",
    label: "Payments",
    icon: <CreditCard size={18} />,
    href: "/student-portal/payments",
    moduleId: "finance",
  },
  {
    id: "documents",
    label: "Documents",
    icon: <Folder size={18} />,
    href: "/student-portal/documents",
    moduleId: "files",
  },
];

export default function StudentSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [enabledModuleIds, setEnabledModuleIds] = useState<string[]>(() =>
    MODULES.map((m) => m.id)
  );

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

  const filteredNavItems = navItems.filter((item) => {
    if (!item.moduleId) return true;
    return enabledModuleIds.includes(item.moduleId);
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    deactivateSession();
    router.push("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-30 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-60"}`}
    >
      <div
        className={`flex items-center h-14 border-b border-slate-100 px-3 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="text-white" size={18} />
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-800 text-base tracking-tight truncate">
              Student
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
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive =
            pathname === item.href || (item.id === "dashboard" && pathname === "/student-portal");
          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${collapsed ? "justify-center" : ""} ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? "text-indigo-600" : ""}`}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-2">
        {collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-150 mb-1"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
