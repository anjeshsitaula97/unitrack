"use client";

import { reportRowKey } from "./reportConfig";
import type { PieChartProps } from "./types";

const colors = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
];

export default function PieChart({ rows, fields, numField }: PieChartProps) {
  return (
    <div className="p-8">
      <h3 className="font-bold text-slate-800 mb-4">Pie Chart</h3>
      <div className="flex flex-wrap gap-4 justify-center">
        {rows.slice(0, 10).map((row, i) => {
          return (
            <div key={reportRowKey(row, fields)} className="flex items-center gap-2">
              <div className="size-4 rounded-full" style={{ backgroundColor: colors[i % 10] }} />
              <span className="text-xs text-slate-600">
                {String(row[fields.find((f) => f !== numField) || fields[0]] ?? "") || "N/A"}
                {` (${row[numField]})`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
