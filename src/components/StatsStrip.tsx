import React from "react";

export interface StatItem {
  id: string;
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function StatsStrip({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {stats.map((s) => (
        <div key={s.id} className="card px-4 py-3 flex items-center gap-3">
          <div
            className={`size-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}
          >
            {s.icon}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">{s.label}</div>
            <div className={`text-lg font-bold ${s.color} font-tabular`}>{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
