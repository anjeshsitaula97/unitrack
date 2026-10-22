"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { commissionLabel } from "./commission";
import type { DashboardUniversity } from "./types";

export default function RecentPartnerUniversitiesCard({
  universities,
}: {
  universities: DashboardUniversity[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-indigo-600" />
          <h2 className="font-bold text-slate-800 text-sm">Recent Partner Universities</h2>
        </div>
        <Link
          href="/universities"
          className="text-[11px] font-semibold text-indigo-600 hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-slate-50">
        {universities.length === 0 && (
          <p className="p-6 text-center text-xs text-slate-400">No partner universities yet.</p>
        )}
        {universities.map((u) => (
          <div key={u.id} className="px-5 py-3 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {(u.name[0] || "?").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
              <p className="text-[10px] text-slate-400">
                {u.country || "Global"} • {u.partner?.name || "Partner"}
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-600">{commissionLabel(u)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
