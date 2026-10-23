"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, GraduationCap, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRoleHome } from "@/lib/role-home";
import { clearAuthCache } from "@/lib/auth-state";
import SessionTakeoverRelogin, {
  type BlockedSessionInfo,
} from "@/components/SessionTakeoverRelogin";

export default function LoginForm({ idleNotice = "" }: { idleNotice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"admin" | "student">("admin");
  // The account is live elsewhere and the server offered an email code as the
  // way back in; this is that refusal, kept so the panel can describe it.
  const [blocked, setBlocked] = useState<BlockedSessionInfo | null>(null);

  // Where a finished sign-in goes. Shared by the password form and the code
  // relogin so taking over a session lands exactly where signing in would have.
  const goToHome = async () => {
    if (loginMode === "student") {
      router.push("/student-portal/dashboard");
      return;
    }
    clearAuthCache();
    let home = "/dashboard";
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load profile: ${res.status}`);
      const me = await res.json();
      home = getRoleHome(me?.role);
    } catch {
      // fall back to the default dashboard
    }
    router.push(home);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBlocked(null);
    setIsLoading(true);

    try {
      const endpoint = loginMode === "admin" ? "/api/auth/login" : "/api/student-portal/auth";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let message = `Server responded with ${res.status}. Please check the server logs.`;
        let payload: BlockedSessionInfo | null = null;
        try {
          payload = JSON.parse(errorText);
          if (payload?.error) message = payload.error;
        } catch {
          // Non-JSON body (e.g. a proxy/HTML error page) — keep the generic message.
        }
        // 409 with an offer attached: the account is signed in somewhere else,
        // and the person has to prove they own it before taking it back.
        if (
          res.status === 409 &&
          payload &&
          (payload as { code?: string }).code === "SESSION_ACTIVE_ELSEWHERE" &&
          payload.relogin?.otpEnabled
        ) {
          setBlocked(payload);
          return;
        }
        throw new Error(message);
      }

      await res.json();
      await goToHome();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to UniTrack Website
        </Link>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div
              className={`size-16 rounded-xl flex items-center justify-center mb-4 shadow-lg transition-colors ${
                loginMode === "admin"
                  ? "bg-indigo-600 shadow-indigo-600/20"
                  : "bg-emerald-600 shadow-emerald-600/20"
              }`}
            >
              {loginMode === "admin" ? (
                <Lock className="size-8 text-white" />
              ) : (
                <GraduationCap className="size-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {loginMode === "admin" ? "Admin Login" : "Student Login"}
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {loginMode === "admin"
                ? "Sign in to access the UniTrack dashboard"
                : "Sign in to track your applications"}
            </p>
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode("admin");
                setBlocked(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition duration-150 ${
                loginMode === "admin"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ShieldCheck size={16} />
              Administrator
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("student");
                setBlocked(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition duration-150 ${
                loginMode === "student"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <GraduationCap size={16} />
              Student
            </button>
          </div>

          {idleNotice && !error && (
            <div className="mb-6 p-4 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium border border-amber-100 flex items-center">
              <span className="size-2 rounded-full bg-amber-500 mr-2 flex-shrink-0"></span>
              {idleNotice}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center">
              <span className="size-2 rounded-full bg-red-600 mr-2 flex-shrink-0"></span>
              {error}
            </div>
          )}

          {blocked && (
            <SessionTakeoverRelogin
              block={blocked}
              email={email}
              password={password}
              portal={loginMode === "student" ? "student" : undefined}
              accent={loginMode === "student" ? "emerald" : "indigo"}
              onSignedIn={goToHome}
              onCancel={() => setBlocked(null)}
            />
          )}

          {!blocked && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-5 text-slate-400" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm text-sm p-3 font-medium text-slate-800 transition-colors bg-slate-50 focus:bg-white"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-slate-400" />
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm text-sm p-3 font-medium text-slate-800 transition-colors bg-slate-50 focus:bg-white"
                    placeholder=""
                  />
                </div>
                {loginMode === "student" && (
                  <div className="mt-2 text-right">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-colors disabled:opacity-70 ${
                  loginMode === "admin"
                    ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 size-4" />
                    Authenticating…
                  </>
                ) : loginMode === "admin" ? (
                  "Sign In as Admin"
                ) : (
                  "Sign In as Student"
                )}
              </button>
            </form>
          )}
        </div>
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-xs text-slate-500">
            &copy; 2026 UniTrack by Avenlixx Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
