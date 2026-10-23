"use client";

import React from "react";
// This component is itself lazy-loaded via next/dynamic({ ssr: false }) by
// FacultyDistributionChart, so recharts is already fetched on demand.
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const CustomTooltip = ({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
  total: number;
}) => {
  if (active && payload && payload.length) {
    const pct = ((payload[0].value / total) * 100).toFixed(1);
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="size-2.5 rounded-full"
            style={{ backgroundColor: payload[0].payload.color }}
          />
          <p className="text-xs font-semibold text-slate-700">{payload[0].name}</p>
        </div>
        <p className="text-sm font-bold text-slate-800 font-tabular">
          {payload[0].value.toLocaleString()} courses
        </p>
        <p className="text-xs text-slate-400">{pct}% of catalog</p>
      </div>
    );
  }
  return null;
};

interface PieEntry {
  name: string;
  value: number;
  color: string;
}

export default function FacultyDistributionPie({
  data,
  total,
  activeIndex,
  onHover,
  onLeave,
}: {
  data: PieEntry[];
  total: number;
  activeIndex: number | null;
  onHover: (index: number) => void;
  onLeave: () => void;
}) {
  return (
    <div className="relative flex-shrink-0">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={(_, index) => onHover(index)}
            onMouseLeave={onLeave}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-bold text-slate-800 font-tabular">
          {total >= 1000 ? (total / 1000).toFixed(1) + "k" : total.toString()}
        </span>
        <span className="text-[10px] text-slate-400">total</span>
      </div>
    </div>
  );
}
