"use client";

import React from "react";
import { LineChart as LineIcon } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export interface TrendEntry {
  name: string;
  courses: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 min-w-[160px]">
        <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
        {payload.map((p) => (
          <div key={`tt-${p.name}`} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-xs text-slate-500">{p.name}</span>
            </div>
            <span className="text-xs font-bold text-slate-800 font-tabular">
              {p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendAreaChart({ data }: { data: TrendEntry[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300">
        <LineIcon size={32} strokeWidth={1.5} className="mb-2" />
        <p className="text-xs">No activity data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="coursesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "Plus Jakarta Sans" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "Plus Jakarta Sans" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="courses"
          name="Courses Added"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#coursesGrad)"
          dot={false}
          activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
