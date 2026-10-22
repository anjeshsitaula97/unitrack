"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { DashboardStudent } from "./types";

export default function ReferredStudentsTable({ students }: { students: DashboardStudent[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-emerald-600" />
          <h2 className="font-bold text-slate-800 text-sm">Recently Referred Students</h2>
        </div>
        <Link
          href="/students"
          className="text-[11px] font-semibold text-indigo-600 hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Student
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Partner
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Interested Country
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-xs text-slate-400">
                  No referred students yet.
                </td>
              </tr>
            )}
            {students.slice(0, 8).map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4">
                  <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                  <p className="text-[10px] text-slate-400">{s.email || "—"}</p>
                </td>
                <td className="p-4 text-xs font-medium text-slate-600">{s.partner?.name || "—"}</td>
                <td className="p-4 text-xs font-medium text-slate-600">
                  {s.interestedCountry || "—"}
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                    {s.status || "Active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
