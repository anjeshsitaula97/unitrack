"use client";

import { ListChecks, X } from "lucide-react";
import type { Course } from "./types";

/**
 * Header strip of the prerequisites modal: course identity plus close action.
 */
export default function PrerequisiteModalHeader({
  course,
  onClose,
}: {
  course: Course;
  onClose: () => void;
}) {
  const chips = [course.level, course.degreeType, course.duration, course.country].filter(
    Boolean
  ) as string[];

  return (
    <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate-100 bg-slate-50/60">
      <div className="flex items-start gap-3 min-w-0">
        <span className="size-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
          <ListChecks size={20} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-black text-slate-800 leading-tight truncate">
            Prerequisites &amp; Requirements
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-1 truncate">{course.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="text-[11px] text-slate-400 truncate">{course.university}</span>
            {chips.map((chip) => (
              <span
                key={`prereq-chip-${chip}`}
                className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-0.5"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
      >
        <X size={18} />
      </button>
    </div>
  );
}
