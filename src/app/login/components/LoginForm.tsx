"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, GraduationCap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getRoleHome } from "@/lib/role-home";
import { clearAuthCache } from "@/components/AppLayoutWrapper";
import { activateSession } from "@/lib/client-session";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"admin" | "student">("admin");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = loginMode === "admin" ? "/api/auth/login" : "/api/student-portal/auth";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to login.");
      }

      if (loginMode === "admin") {
        clearAuthCache();
        let home = "/dashboard";
        try {
          const me = await fetch("/api/auth/me").then((r) => r.json());
          home = getRoleHome(me?.role);
        } catch {
          // fall back to the default dashboard
        }
        activateSession();
        router.push(home);
      } else {
        activateSession();
        router.push("/student-portal/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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
              onClick={() => setLoginMode("admin")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
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
              onClick={() => setLoginMode("student")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                loginMode === "student"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <GraduationCap size={16} />
              Student
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center">
              <span className="size-2 rounded-full bg-red-600 mr-2 flex-shrink-0"></span>
              {error}
            </div>
          )}

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
                  placeholder={loginMode === "admin" ? "admin@unitrack.com" : "student@example.com"}
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
                  placeholder="********"
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
        </div>
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-xs text-slate-500">
            Copyright@2026 , Licenced by Avenlixx Technology.
          </p>
        </div>
      </div>
    </div>
  );
}
