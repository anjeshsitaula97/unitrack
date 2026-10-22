"use client";

import { ChevronDown, Filter } from "lucide-react";
import type { ReqFilter } from "./types";

export default function RequirementsToolbar({
  reqFilter,
  onReqFilterChange,
}: {
  reqFilter: ReqFilter;
  onReqFilterChange: (filter: ReqFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        {(["All", "Pending", "Approved", "Rejected", "In Review"] as ReqFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onReqFilterChange(f)}
            className={`px-4 py-1.5 rounded-md text-xs transition ${
              reqFilter === f
                ? "font-bold bg-white shadow-sm text-slate-800"
                : "font-semibold text-slate-500 hover:bg-white/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700"
      >
        <Filter size={16} className="mr-2" />
        Filters
        <ChevronDown size={16} className="ml-2" />
      </button>
    </div>
  );
}
