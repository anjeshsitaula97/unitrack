"use client";

import { Table, BarChart3, PieChart } from "lucide-react";
import { chartTypes } from "./reportConfig";
import type { ChartTypeSelectorProps } from "./types";

export default function ChartTypeSelector({ chartType, onChange }: ChartTypeSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
        Chart Type
      </span>
      <div className="flex flex-wrap gap-1">
        {chartTypes.map((ct) => (
          <button
            type="button"
            key={ct}
            onClick={() => onChange(ct)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${chartType === ct ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600"}`}
          >
            {ct === "Table" ? (
              <Table size={12} />
            ) : ct === "Bar" ? (
              <BarChart3 size={12} />
            ) : ct === "Pie" ? (
              <PieChart size={12} />
            ) : (
              <BarChart3 size={12} />
            )}{" "}
            {ct}
          </button>
        ))}
      </div>
    </div>
  );
}
