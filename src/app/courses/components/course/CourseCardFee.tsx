"use client";

import { annualTuition, isSemesterPeriod } from "@/lib/tuition";
import { convertToNPR, formatNPR } from "@/lib/forex";
import type { Course } from "./types";

/**
 * Annualised tuition (and the secondary fee line) for a course card.
 */
export default function CourseCardFee({
  course,
  showInNPR,
  rates,
}: {
  course: Course;
  showInNPR: boolean;
  rates: Record<string, number>;
}) {
  const courseCurrency = course.currency || "USD";
  const yearlyTuition = annualTuition(course.tuitionFee, course.tuitionFeePeriod);
  const tuitionIsSemester = isSemesterPeriod(course.tuitionFeePeriod);

  const tuitionLabel = showInNPR
    ? formatNPR(convertToNPR(String(yearlyTuition ?? 0), courseCurrency, rates))
    : `${courseCurrency} ${yearlyTuition !== null ? yearlyTuition.toLocaleString() : "—"}`;

  const appFeeLabel = course.applicationFee
    ? showInNPR
      ? formatNPR(convertToNPR(course.applicationFee, courseCurrency, rates))
      : `${courseCurrency} ${course.applicationFee}`
    : null;

  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
        Tuition / yr
      </p>
      <p className="text-lg font-black text-indigo-600 leading-tight">{tuitionLabel}</p>
      {tuitionIsSemester && course.tuitionFee ? (
        <p className="text-[10px] text-slate-400 leading-tight">
          {courseCurrency} {course.tuitionFee} /sem
        </p>
      ) : appFeeLabel ? (
        <p className="text-[10px] font-bold text-emerald-600 leading-tight">
          App. Fee: {appFeeLabel}
        </p>
      ) : null}
    </div>
  );
}
