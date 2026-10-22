"use client";

import { Clock } from "lucide-react";

export default function PartnerDashboardHeader({
  userName,
  timeStr,
  adDateStr,
}: {
  userName: string;
  timeStr: string;
  adDateStr: string;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-0.5">Good morning, {userName}!</h1>
        <p className="text-sm text-slate-400">
          B2B Partner overview — partnerships, referrals, and commissions
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="flex items-center gap-1.5 font-tabular" suppressHydrationWarning>
          <Clock size={14} /> {timeStr}
        </span>
        <span className="text-slate-300">|</span>
        <span>{adDateStr}</span>
      </div>
    </div>
  );
}
