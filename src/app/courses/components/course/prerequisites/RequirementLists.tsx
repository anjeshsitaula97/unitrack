"use client";

import { CheckCircle, FileText } from "lucide-react";
import ModalSection from "../ModalSection";

export function PrerequisitesSection({ prerequisites }: { prerequisites: string[] }) {
  return (
    <ModalSection icon={<FileText size={14} />} title="Prerequisites" count={prerequisites.length}>
      <div className="space-y-2">
        {prerequisites.map((req) => (
          <div
            key={`prereq-${req}`}
            className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div className="size-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <FileText size={13} />
            </div>
            <p className="text-sm font-semibold text-slate-700 flex-1 min-w-0 break-words">{req}</p>
          </div>
        ))}
      </div>
    </ModalSection>
  );
}

export function OtherRequirementsSection({ requirements }: { requirements: string[] }) {
  return (
    <ModalSection
      icon={<CheckCircle size={14} />}
      title="Other Requirements"
      count={requirements.length}
    >
      <div className="space-y-2">
        {requirements.map((req) => (
          <div
            key={`requirement-${req}`}
            className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div className="size-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle size={13} />
            </div>
            <p className="text-sm font-semibold text-slate-700 flex-1 min-w-0 break-words">{req}</p>
          </div>
        ))}
      </div>
    </ModalSection>
  );
}
