"use client";

import { FileText } from "lucide-react";
import { getStatusBadge, normalizeDocStatus } from "./utils";
import type { MatchedPrerequisite } from "./types";

export default function CoursePrerequisitesOverview({
  matchedPrereqs,
}: {
  matchedPrereqs: MatchedPrerequisite[];
}) {
  if (matchedPrereqs.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm">Course Prerequisites</h3>
      </div>
      <div className="divide-y divide-slate-50">
        {matchedPrereqs.map((prereq) => {
          const badgeInfo = getStatusBadge(
            prereq.doc ? normalizeDocStatus(prereq.doc.status) : "Missing"
          );
          return (
            <div
              key={`prereq-${prereq.name}`}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-700 truncate">{prereq.name}</span>
              </div>
              <span
                className={`shrink-0 ml-3 px-2 py-0.5 rounded text-[10px] font-bold ${badgeInfo.className}`}
              >
                {badgeInfo.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
