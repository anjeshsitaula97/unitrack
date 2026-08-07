"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, Clock, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

interface ChangeDetail {
  field: string;
  from: string;
  to: string;
}

interface AuditLog {
  id: string;
  actorName?: string;
  actorInitials?: string;
  target?: string;
  action?: string;
  createdAt: string;
  details?: string | null;
}

export default function AuditContent() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => {
        if (!r.ok)
          throw new Error(
            r.status === 401 ? "Unauthorized — you need Admin access" : "Failed to load"
          );
        return r.json();
      })
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const parseChanges = (raw?: string | null): ChangeDetail[] => {
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((c) => c && typeof c.field === "string");
    } catch {}
    return [];
  };

  const filtered = logs.filter((log) => {
    if (
      search &&
      !log.actorName?.toLowerCase().includes(search.toLowerCase()) &&
      !log.target?.toLowerCase().includes(search.toLowerCase()) &&
      !log.action?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (actionFilter && !log.action?.toLowerCase().includes(actionFilter.toLowerCase()))
      return false;
    if (dateFrom && new Date(log.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(log.createdAt) > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  const clearFilters = () => {
    setSearch("");
    setActionFilter("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          Audit Trail
        </h1>
        <span className="text-sm text-slate-400">{filtered.length} entries</span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 mb-6">
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Search
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Actor, target, action..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Action
            </label>
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="e.g. created"
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-32"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {(search || actionFilter || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <AlertCircle className="mx-auto text-red-300 dark:text-red-700 mb-3" size={48} />
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Clock className="mx-auto text-slate-200 dark:text-slate-700 mb-3" size={48} />
          <p className="text-slate-500 font-medium">No activity logs found</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((log) => {
            const changes = parseChanges(log.details);
            const expanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
              >
                <div
                  className={`p-3 flex items-center gap-3 text-sm ${changes.length > 0 ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60" : ""}`}
                  onClick={() => changes.length > 0 && setExpandedId(expanded ? null : log.id)}
                >
                  <div className="size-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {log.actorInitials ||
                      log.actorName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2) ||
                      "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {log.actorName}
                    </span>{" "}
                    <span className="text-slate-500">{log.action}</span>{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {log.target}
                    </span>
                    {changes.length > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-semibold">
                        {changes.length} change{changes.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  {changes.length > 0 &&
                    (expanded ? (
                      <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                    ))}
                </div>
                {expanded && changes.length > 0 && (
                  <div className="px-4 pb-3 border-t border-slate-100 dark:border-slate-700 pt-3 space-y-1.5">
                    {changes.map((c, i) => (
                      <div key={`${c.field}-${i}`} className="flex items-start gap-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold capitalize flex-shrink-0 min-w-[90px] text-center">
                          {c.field.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="text-slate-400 line-through decoration-red-300 dark:decoration-red-700 break-all">
                          {c.from || "—"}
                        </span>
                        <span className="text-slate-300 flex-shrink-0">→</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium break-all">
                          {c.to || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
