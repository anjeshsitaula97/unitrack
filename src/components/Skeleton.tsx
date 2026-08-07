"use client";

import React from "react";

export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="size-9 rounded-xl bg-slate-200 mb-4" />
      <div className="h-7 w-24 bg-slate-200 rounded mb-1" />
      <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
      <div className="h-4 w-20 bg-slate-200 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="bg-slate-50/60 border-b border-slate-100">
        <div className="flex gap-6 px-5 py-3">
          {[140, 200, 120, 100, 80].map((w, i) => (
            <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: w }} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-6 px-5 py-4 border-b border-slate-50 last:border-0">
          {[140, 200, 120, 100, 80].map((w, j) => (
            <div key={j} className="h-4 bg-slate-100 rounded" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

function _SkeletonAvatar() {
  return <div className="size-8 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />;
}
