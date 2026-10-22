"use client";

import { reportRowKey } from "./reportConfig";
import type { BarChartProps } from "./types";

export default function BarChart({ rows, fields, numField, chartType }: BarChartProps) {
  const maxVal = Math.max(...rows.slice(0, 15).map((r) => Number(r[numField]) || 0), 1);

  return (
    <div className="p-8">
      <h3 className="font-bold text-slate-800 mb-4">{chartType} Chart</h3>
      <div className="flex items-end gap-2 h-48">
        {rows.slice(0, 15).map((row) => {
          const h = (Number(row[numField]) / maxVal) * 100;
          return (
            <div
              key={reportRowKey(row, fields)}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full bg-indigo-500 rounded-t transition"
                style={{ height: `${Math.max(h, 2)}%` }}
              />
              <span className="text-[8px] text-slate-400 text-center truncate w-full">
                {String(row[fields.find((f) => f !== numField) || fields[0]] ?? "").substring(0, 6)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
