"use client";

import { Check } from "lucide-react";

export default function ApplicationProcessOverview({
  progressStages,
  doneThrough,
}: {
  progressStages: string[];
  doneThrough: number;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h3 className="font-bold text-slate-900 text-sm mb-1">Application process</h3>
      <p className="text-xs text-slate-500 mb-4">
        This is how the status maps to the process tracker shown at the top of the page.
      </p>
      <div className="space-y-3">
        {progressStages.map((stage, i) => {
          const done = i <= doneThrough;
          const current = i === doneThrough;
          return (
            <div
              key={stage}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                current ? "border-[#1d4ed8]/40 bg-[#1d4ed8]/5" : "border-slate-100 bg-slate-50/50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-emerald-500 text-white" : "border-2 border-slate-300 bg-white"
                }`}
              >
                {done && <Check size={14} strokeWidth={3} />}
              </div>
              <span
                className={`text-sm whitespace-pre-line ${current ? "font-bold text-slate-900" : "text-slate-600"}`}
              >
                {stage}
              </span>
              {current && (
                <span className="ml-auto shrink-0 px-2 py-0.5 rounded-full bg-[#1d4ed8] text-white text-[10px] font-bold">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
