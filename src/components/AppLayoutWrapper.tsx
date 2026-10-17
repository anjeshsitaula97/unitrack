"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AppLayout from "./AppLayout";
import { getRoleHome, isDashboardRoute } from "@/lib/role-home";
import { Loader2 } from "lucide-react";
import {
  getCachedAuthState,
  setCachedAuthState,
  loadAuthState,
  revalidateAuthState,
  type AppUser,
  type AuthState,
} from "@/lib/auth-state";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string>(() => getCachedAuthState()?.role || "");
  const [user, setUser] = useState<AppUser | null>(() => getCachedAuthState()?.user ?? null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const apply = (state: AuthState | null) => {
      if (cancelled) return;
      setLoading(false);
      setCachedAuthState(state);
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

    const cachedState = getCachedAuthState();
    if (cachedState !== undefined) {
      apply(cachedState);
    } else {
      loadAuthState()
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
      revalidateAuthState()
        .then((state) => {
          setCachedAuthState(state);
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
