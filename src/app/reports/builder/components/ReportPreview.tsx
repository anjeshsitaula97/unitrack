"use client";

import { Loader2, BarChart3 } from "lucide-react";
import ReportTable from "./ReportTable";
import ReportChart from "./ReportChart";
import type { ReportPreviewProps } from "./types";

export default function ReportPreview({
  loading,
  reportData,
  chartType,
  selectedFields,
}: ReportPreviewProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-20 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (reportData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
        <BarChart3 className="text-slate-200 mb-3" size={48} />
        <p className="text-slate-500 font-medium">Select fields and generate a report</p>
        <p className="text-xs text-slate-400 mt-1">
          Choose an entity, pick fields, add filters, then click Generate Report
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {chartType === "Table" ? (
        <ReportTable rows={reportData} fields={selectedFields} />
      ) : (
        <ReportChart rows={reportData} fields={selectedFields} chartType={chartType} />
      )}
    </div>
  );
}
