"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import type { ApplicationDetail, ApplicationStatus } from "./types";

export default function ApplicationStatusSettings({
  appStatuses,
  detail,
  saving,
  onStatusUpdate,
}: {
  appStatuses: ApplicationStatus[];
  detail: ApplicationDetail;
  saving: boolean;
  onStatusUpdate: (status: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h3 className="font-bold text-slate-900 text-sm">Application status</h3>
      <p className="text-xs text-slate-500 mt-1 mb-5">
        Set the application status here. The process tracker below updates automatically to match
        the selected status.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {appStatuses.map((s) => {
          const active = detail.status === s.name;
          const stepLabel = s.stage;
          return (
            <button
              key={s.name}
              type="button"
              disabled={saving}
              onClick={() => onStatusUpdate(s.name)}
              className={`text-left rounded-xl border-2 p-4 transition ${
                active
                  ? "border-[#1d4ed8] bg-[#1d4ed8]/5"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              } disabled:opacity-60 disabled:cursor-wait`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-bold ${active ? "text-[#1d4ed8]" : "text-slate-800"}`}
                >
                  {s.name}
                </span>
                {active ? (
                  <CheckCircle2 size={18} className="text-[#1d4ed8]" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-200" />
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                Process stage: <span className="font-semibold text-slate-700">{stepLabel}</span>
              </div>
              {active && saving && (
                <Loader2 size={14} className="animate-spin mt-2 text-[#1d4ed8]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
