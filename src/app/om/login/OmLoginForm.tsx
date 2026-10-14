"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { clearAuthCache } from "@/components/AppLayoutWrapper";

export function OmLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, portal: "super-admin" }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let message = `Server responded with ${res.status}. Please check the server logs.`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson?.error) message = errorJson.error;
        } catch {
          // Non-JSON body (e.g. a proxy/HTML error page) — keep the generic message.
        }
        throw new Error(message);
      }

      clearAuthCache();
      router.push("/om");
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
            <div className="size-16 rounded-xl flex items-center justify-center mb-4 shadow-lg transition-colors bg-indigo-600 shadow-indigo-600/20">
              <ShieldCheck className="size-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Super Admin Login</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Sign in to access the UniTrack Super Admin console
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label
                htmlFor="om-login-email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="size-5 text-slate-400" />
                </div>
                <input
                  id="om-login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm text-sm p-3 font-medium text-slate-800 transition-colors bg-slate-50 focus:bg-white outline-none"
                  placeholder="superadmin@example.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="om-login-password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-slate-400" />
                </div>
                <input
                  id="om-login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm text-sm p-3 font-medium text-slate-800 transition-colors bg-slate-50 focus:bg-white outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-colors disabled:opacity-70 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 size-4" />
                  Authenticating…
                </>
              ) : (
                "Sign In as Super Admin"
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

export default OmLoginForm;
