"use client";

import { Clock, Zap } from "lucide-react";
import CourseIntakesBlock from "./CourseIntakesBlock";
import type { Course, QuickFilter } from "./types";

/**
 * The expanded body of a course card: full description, prerequisites, quick
 * filters, available intakes and start date.
 */
export default function CourseCardDetails({
  course,
  quickFilters,
}: {
  course: Course;
  quickFilters: QuickFilter[];
}) {
  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fade-in">
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
          Full Description
        </p>
        <div className="text-xs text-slate-600 leading-relaxed max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
          {course.description}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
          Prerequisites
        </p>
        <div className="flex flex-wrap gap-1">
          {course.prerequisites.map((p) => (
            <span
              key={`card-prereq-${p}`}
              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
      {course.quickFilters && course.quickFilters.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Quick Filters
          </p>
          <div className="flex flex-wrap gap-1">
            {course.quickFilters.map((f) => {
              const filterInfo = quickFilters.find((q) => q.label === f);
              return (
                <span
                  key={`card-qf-detail-${f}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold"
                >
                  <Zap size={10} />
                  {filterInfo?.label || f}
                </span>
              );
            })}
          </div>
        </div>
      )}
      <div className="pt-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Available Intakes
        </p>
        <CourseIntakesBlock intake={course.intake} />
      </div>
      {course.startDate && (
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-slate-400" />
          <span className="text-xs text-slate-500">
            Starts{" "}
            {new Date(course.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </span>
        </div>
      )}
    </div>
  );
}
