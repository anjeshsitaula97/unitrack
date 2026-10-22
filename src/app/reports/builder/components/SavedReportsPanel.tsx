"use client";

import { Trash2 } from "lucide-react";
import { readConfig } from "./reportConfig";
import type { SavedReportsPanelProps } from "./types";

export default function SavedReportsPanel({ reports, onLoad, onDelete }: SavedReportsPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
      <h3 className="font-bold text-slate-800 mb-3 text-sm">Saved Reports</h3>
      <div className="space-y-1">
        {reports.map((r) => {
          const cfg = readConfig(r.config);
          return (
            <div
              key={r.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              <button type="button" onClick={() => onLoad(r)} className="text-left">
                <span className="font-medium text-slate-700 text-sm">{r.name}</span>
                <span className="text-[10px] text-slate-400 ml-2">
                  {(cfg.entity as string) || "?"} &middot;{" "}
                  {(cfg.fields as unknown[] | undefined)?.length || 0} fields
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${r.name}`}
                onClick={() => onDelete(r.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
