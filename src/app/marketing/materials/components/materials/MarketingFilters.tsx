"use client";

import type { Dispatch, SetStateAction } from "react";
import { ChevronDown, Filter, Search } from "lucide-react";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS } from "./constants";
import type { FilterState } from "./types";

export default function MarketingFilters({
  filters,
  setFilters,
  showFilters,
  onToggleFilters,
}: {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  return (
    <>
      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <Filter size={18} />
        Filters
        <ChevronDown
          size={16}
          className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
        />
      </button>

      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 animate-fade-in">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                aria-label="Search requests"
                placeholder="Search requests..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <select
              aria-label="Filter by status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by priority"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
}
