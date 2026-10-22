"use client";

import { Search } from "lucide-react";
import type { PartnershipToolbarProps } from "./types";

export default function PartnershipToolbar({
  tab,
  onTabChange,
  search,
  onSearchChange,
}: PartnershipToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
        <button
          type="button"
          onClick={() => onTabChange("partnerships")}
          className={`px-4 py-1.5 rounded-md text-xs transition ${
            tab === "partnerships"
              ? "font-bold bg-white shadow-sm text-slate-800"
              : "font-semibold text-slate-500 hover:bg-white/50"
          }`}
        >
          Partnerships
        </button>
        <button
          type="button"
          onClick={() => onTabChange("partners")}
          className={`px-4 py-1.5 rounded-md text-xs transition ${
            tab === "partners"
              ? "font-bold bg-white shadow-sm text-slate-800"
              : "font-semibold text-slate-500 hover:bg-white/50"
          }`}
        >
          Partners
        </button>
      </div>
      <div className="relative flex-1 min-w-[260px] max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={
            tab === "partnerships" ? "Search universities or partners..." : "Search partners..."
          }
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-slate-100 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-medium placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
