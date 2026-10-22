import { Calendar, Download, X } from "lucide-react";
import type { ReportOption, ReportRow } from "./types";

export default function PreviewHeader({
  previewData,
  previewTitle,
  startDate,
  endDate,
  reports,
  onDownload,
  onClose,
}: {
  previewData: ReportRow[];
  previewTitle: string;
  startDate: string;
  endDate: string;
  reports: ReportOption[];
  onDownload: (reportId: string, title: string, data: ReportRow[]) => void;
  onClose: () => void;
}) {
  return (
    <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">
            Live Preview
          </span>
          <h2 className="text-xl font-black text-slate-800">{previewTitle}</h2>
        </div>
        <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          Showing {previewData.length} records{" "}
          {startDate || endDate ? `from ${startDate || "beginning"} to ${endDate || "today"}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => {
            const r = reports.find((report) => report.title === previewTitle);
            if (r) onDownload(r.id, r.title, previewData);
          }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          <Download size={18} /> Download Excel
        </button>
        <button
          aria-label="Close report preview"
          type="button"
          onClick={onClose}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-400 transition"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
