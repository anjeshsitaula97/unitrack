"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, SearchSlash } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <div className="size-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
          <SearchSlash size={40} className="text-slate-400" />
        </div>

        <h1 className="text-6xl font-black text-slate-200 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Page not found</h2>
        <p className="text-sm text-slate-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
