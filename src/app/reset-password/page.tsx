"use client";

import React, { useState } from "react";
import { Lock, Loader2, ArrowLeft, GraduationCap, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto size-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="size-6 text-red-600" />
        </div>
        <p className="text-slate-700 font-medium mb-2">Invalid reset link</p>
        <p className="text-sm text-slate-500 mb-6">
          This password reset link is invalid or missing a token.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center">
          <span className="size-2 rounded-full bg-red-600 mr-2 flex-shrink-0"></span>
          {error}
        </div>
      )}

      {success ? (
        <div className="text-center py-4">
          <div className="mx-auto size-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="size-6 text-emerald-600" />
          </div>
          <p className="text-slate-700 font-medium mb-2">Password reset successfully</p>
          <p className="text-sm text-slate-500 mb-6">
            Your password has been updated. You can now log in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Go to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="size-5 text-slate-400" />
              </div>
              <input
                id="new-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm text-sm p-3 font-medium text-slate-800 transition-colors bg-slate-50 focus:bg-white"
                placeholder="Min. 6 characters"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="size-5 text-slate-400" />
              </div>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm text-sm p-3 font-medium text-slate-800 transition-colors bg-slate-50 focus:bg-white"
                placeholder="Repeat your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 size-4" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="size-16 rounded-xl flex items-center justify-center mb-4 shadow-lg bg-emerald-600 shadow-emerald-600/20">
              <GraduationCap className="size-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Set New Password</h1>
            <p className="text-slate-500 mt-2 text-sm text-center">
              Choose a strong password for your account
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-8 text-slate-400">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Login
            </Link>
          </div>
        </div>
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-xs text-slate-500">Student portal password reset.</p>
        </div>
      </div>
    </div>
  );
}
