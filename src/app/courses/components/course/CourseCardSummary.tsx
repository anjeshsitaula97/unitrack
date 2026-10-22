"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Edit2, ListChecks, Trash2 } from "lucide-react";
import { getAppStatus } from "./courseStatus";
import CourseCardFee from "./CourseCardFee";
import type { Course } from "./types";

/**
 * Right-hand column of a course card: fees, key metrics and row actions.
 */
export default function CourseCardSummary({
  course,
  showInNPR,
  rates,
  expanded,
  hasPrereqs,
  onToggle,
  onEnroll,
  onDelete,
  onPrerequisites,
}: {
  course: Course;
  showInNPR: boolean;
  rates: Record<string, number>;
  expanded: boolean;
  hasPrereqs: boolean;
  onToggle: () => void;
  onEnroll: (course: Course) => void;
  onDelete: (id: string | number, name: string) => void;
  onPrerequisites: (course: Course) => void;
}) {
  const router = useRouter();
  const appStatus = getAppStatus(course);
  const isOpen = appStatus.label === "Applications Open";

  return (
    <div className="lg:w-72 flex-shrink-0 flex flex-col gap-3 lg:border-l lg:border-slate-100 lg:pl-6">
      {/* Fee + key metrics */}
      <div className="flex items-end justify-between gap-4">
        <CourseCardFee course={course} showInNPR={showInNPR} rates={rates} />
        <div className="flex gap-3 text-center flex-shrink-0">
          <div>
            <p className="text-sm font-black text-slate-700 leading-tight">{course.credits}</p>
            <p className="text-[10px] text-slate-400">Credits</p>
          </div>
          <div>
            <p className="text-sm font-black text-slate-700 leading-tight">{course.duration}</p>
            <p className="text-[10px] text-slate-400">Years</p>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold ${isOpen ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
      >
        <span className={`size-1.5 rounded-full ${isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
        {appStatus.label}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEnroll(course)}
          className="flex-1 btn-primary text-xs py-2 justify-center"
        >
          Quick Enroll
        </button>
        {hasPrereqs && (
          <button
            type="button"
            onClick={() => onPrerequisites(course)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors"
            title="View prerequisites & requirements"
          >
            <ListChecks size={13} />
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push(`/courses/edit/${course.id}`)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          title="Edit"
        >
          <Edit2 size={13} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(course.id, course.name)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-800 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
      >
        <span>{expanded ? "Hide details" : "Show details"}</span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
    </div>
  );
}
