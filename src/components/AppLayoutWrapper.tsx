"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AppLayout from "./AppLayout";
import { getRoleHome, isDashboardRoute } from "@/lib/role-home";
import { Loader2 } from "lucide-react";

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

interface AuthState {
  user: AppUser;
  role: string;
}

let cached: AuthState | null | undefined = undefined;
let inFlight: Promise<AuthState | null> | null = null;

export function clearAuthCache() {
  cached = undefined;
  inFlight = null;
}

async function fetchAuthState(): Promise<AuthState | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.id) return null;
    return { user: data, role: (data.role || "Student").toLowerCase() };
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return null;
  }
}

function startAuthLoad(): Promise<AuthState | null> {
  if (inFlight === null) {
    inFlight = fetchAuthState().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string>(cached?.role || "");
  const [user, setUser] = useState<AppUser | null>(cached?.user ?? null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const apply = (state: AuthState | null) => {
      if (cancelled) return;
      setLoading(false);
      cached = state;
      if (!state) {
        window.location.replace("/login");
        return;
      }
      setUser(state.user);
      setRole(state.role);
      if (isDashboardRoute(pathname)) {
        const home = getRoleHome(state.user?.role);
        if (home !== pathname) {
          window.location.replace(home);
        }
      }
    };

    if (cached !== undefined) {
      apply(cached);
    } else {
      startAuthLoad()
        .then(apply)
        .catch(() => {
          if (!cancelled) {
            setLoading(false);
            window.location.replace("/login");
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // A long-lived tab can hold a stale role (e.g. signed in as a different user
  // elsewhere, or upgraded to Super Admin). Revalidate whenever the tab becomes
  // visible again so role-gated UI like the consultancy switcher self-corrects.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      fetchAuthState()
        .then((state) => {
          cached = state;
          if (!state) {
            window.location.replace("/login");
            return;
          }
          setUser(state.user);
          setRole(state.role);
        })
        .catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <AppLayout role={role} onRoleChange={(v: string) => setRole(v)} user={user}>
      {children}
    </AppLayout>
  );
}
