"use client";

import { Save, Loader2, Eye } from "lucide-react";
import type { ReportActionsProps } from "./types";

export default function ReportActions({
  loading,
  saving,
  reportName,
  canGenerate,
  onGenerate,
  onSave,
  onReportNameChange,
}: ReportActionsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onGenerate}
        disabled={loading || !canGenerate}
        className="btn-primary w-full flex items-center justify-center gap-1"
      >
        {loading ? <Loader2 className="animate-spin" size={14} /> : <Eye size={14} />} Generate
        Report
      </button>

      <div className="flex gap-2">
        <label className="sr-only" htmlFor="reportName">
          Report name
        </label>
        <input
          id="reportName"
          type="text"
          value={reportName}
          onChange={(e) => onReportNameChange(e.target.value)}
          placeholder="Report name..."
          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={!reportName.trim() || saving}
          className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1 disabled:opacity-50"
        >
          <Save size={14} /> Save
        </button>
      </div>
    </>
  );
}
