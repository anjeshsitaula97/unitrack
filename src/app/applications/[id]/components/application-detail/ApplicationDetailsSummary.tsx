"use client";

import { formatIntakeLabel } from "@/lib/intake";
import { formatDate } from "./utils";
import type { ApplicationDetail } from "./types";

export default function ApplicationDetailsSummary({ detail }: { detail: ApplicationDetail }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2 text-sm">
      <h3 className="font-bold text-slate-900 text-sm mb-2">Application details</h3>
      <p>
        <span className="font-semibold text-slate-800">Status:</span> {detail.status}
      </p>
      <p>
        <span className="font-semibold text-slate-800">Applied:</span>{" "}
        {formatDate(detail.appliedDate)}
      </p>
      <p>
        <span className="font-semibold text-slate-800">Last updated:</span>{" "}
        {formatDate(detail.updatedAt)}
      </p>
      <p>
        <span className="font-semibold text-slate-800">University:</span> {detail.university.name},{" "}
        {detail.university.country}
      </p>
      <p>
        <span className="font-semibold text-slate-800">Course:</span> {detail.course.name} (
        {detail.course.level})
      </p>
      <p>
        <span className="font-semibold text-slate-800">Intake:</span>{" "}
        {detail.course.intake ? formatIntakeLabel(detail.course.intake) : "Not specified"}
      </p>
    </div>
  );
}
