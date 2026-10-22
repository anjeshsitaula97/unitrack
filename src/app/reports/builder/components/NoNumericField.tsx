"use client";

import { BarChart3 } from "lucide-react";
import type { NoNumericFieldProps } from "./types";

export default function NoNumericField({ chartType }: NoNumericFieldProps) {
  return (
    <div className="p-8 text-center">
      <BarChart3 className="mx-auto text-slate-200 mb-3" size={48} />
      <p className="text-slate-500 font-medium">No numeric field found for chart</p>
      <p className="text-xs text-slate-400 mt-1">
        Include a numeric field (e.g. credits, amount, ranking) to use {chartType.toLowerCase()}{" "}
        chart
      </p>
    </div>
  );
}
