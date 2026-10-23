"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Database,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { clearAuthCache } from "@/lib/auth-state";
import { deactivateSession } from "@/lib/client-session";
import { SUPER_ADMIN_DASHBOARD_PATH } from "@/lib/role-home";
import SessionIdleGuard from "@/components/SessionIdleGuard";

interface AppConsoleUser {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

const NAV_ITEMS = [
  { href: "/appconsole", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/appconsole/consultancies", label: "Consultancies", icon: Building2, exact: false },
  { href: "/settings/backups", label: "Backups", icon: Database, exact: false },
];

export default function AppConsoleShell({
  user,
  children,
}: {
  user: AppConsoleUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const name = user.name || user.email?.split("@")[0] || "Super Admin";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const logoutInFlightRef = useRef(false);

  const handleLogout = async () => {
    if (logoutInFlightRef.current) return;
    logoutInFlightRef.current = true;
    try {
      setLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        clearAuthCache();
        deactivateSession();
        router.push("/appconsole/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logoutInFlightRef.current = false;
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* The console obeys the same inactivity rule as the rest of the app. */}
      <SessionIdleGuard />
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">UniTrack</p>
            <p className="text-[11px] text-slate-400 leading-tight">Super Admin Console</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-white/10">
            <Link
              href={SUPER_ADMIN_DASHBOARD_PATH}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
              title="Sign out"
              aria-label="Sign out"
            >
              {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 h-16 px-4 sm:px-6 bg-white/80 backdrop-blur border-b border-slate-200">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-800">Super Admin Console</span>
            <span className="hidden sm:inline text-slate-300">/</span>
            <span className="hidden sm:inline text-slate-500">
              {NAV_ITEMS.find((item) => isActive(item.href, item.exact))?.label ?? "Overview"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
              <ShieldCheck size={12} /> Super Admin
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
