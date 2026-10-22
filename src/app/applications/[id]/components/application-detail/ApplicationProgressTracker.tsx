"use client";

import React from "react";
import { Check } from "lucide-react";

export default function ApplicationProgressTracker({
  progressStages,
  doneThrough,
}: {
  progressStages: string[];
  doneThrough: number;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 overflow-x-auto">
      <div className="flex items-center min-w-[800px]">
        {progressStages.map((stage, i) => {
          const done = i <= doneThrough;
          const isLast = i === progressStages.length - 1;
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    done ? "bg-emerald-500 text-white" : "border-2 border-slate-300 bg-white"
                  }`}
                >
                  {done && <Check size={14} strokeWidth={3} />}
                </div>
                <span
                  className={`text-xs font-medium text-center whitespace-pre-line ${
                    done ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {stage}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 flex-grow mx-2.5 ${
                    i < doneThrough ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
