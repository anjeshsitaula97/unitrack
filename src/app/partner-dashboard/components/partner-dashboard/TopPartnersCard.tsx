"use client";

import Link from "next/link";
import { Handshake, Users } from "lucide-react";
import type { DashboardPartner } from "./types";

export default function TopPartnersCard({ partners }: { partners: DashboardPartner[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Handshake size={16} className="text-cyan-600" />
          <h2 className="font-bold text-slate-800 text-sm">Top Partners</h2>
        </div>
        <Link
          href="/partnership"
          className="text-[11px] font-semibold text-indigo-600 hover:underline"
        >
          View partnerships
        </Link>
      </div>
      <div className="divide-y divide-slate-50">
        {partners.length === 0 && (
          <p className="p-6 text-center text-xs text-slate-400">No partners registered yet.</p>
        )}
        {partners.map((p, i) => (
          <div key={p.id} className="px-5 py-3 flex items-center gap-3">
            <span className="size-6 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {p.contactPerson || p.email || "—"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-lg px-2 py-0.5">
              <Users size={11} /> {p._count?.students || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
