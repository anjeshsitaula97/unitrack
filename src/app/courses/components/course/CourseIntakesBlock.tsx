"use client";

import { Calendar } from "lucide-react";
import { formatIntakeLabel, getIntakeStatus, parseIntakes } from "@/lib/intake";

/**
 * The "Available Intakes" block on an expanded course card.
 *
 * The stored `intake` value is normalised by `parseIntakes`, so a legacy
 * single name, a legacy list of names and the current array of objects all
 * render the same way — and a corrupted value never shows up as raw JSON.
 */
export default function CourseIntakesBlock({ intake }: { intake?: string | null }) {
  const intakes = parseIntakes(intake);

  if (intakes.length === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <Calendar size={11} className="text-slate-400" />
        <span className="text-xs text-slate-500">
          Intake: <strong className="text-slate-700">{formatIntakeLabel(intake)}</strong>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {intakes.map((intakeItem) => {
        const status = getIntakeStatus(intakeItem);
        return (
          <div
            key={`intake-list-${intakeItem.name}-${intakeItem.openDate}`}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
          >
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700">{intakeItem.name}</span>
            </div>
            {status && (
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${status.className}`}
              >
                {status.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
