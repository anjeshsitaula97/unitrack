import { Calendar, Download, FileText, Loader2, X } from "lucide-react";

type ReportRow = Record<string, unknown>;

export default function ReportPreview({
  isPreviewLoading,
  previewData,
  previewTitle,
  selectedReportId,
  startDate,
  endDate,
  reports,
  onDownload,
  onClose,
}: {
  isPreviewLoading: boolean;
  previewData: ReportRow[] | null;
  previewTitle: string;
  selectedReportId: string | null;
  startDate: string;
  endDate: string;
  reports: { id: string; title: string }[];
  onDownload: (reportId: string, title: string, data: ReportRow[]) => void;
  onClose: () => void;
}) {
  return (
    <div id="report-preview-area" className="mt-8 transition duration-500 scroll-mt-6">
      {isPreviewLoading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center gap-4 text-center shadow-sm">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <div>
            <p className="text-lg font-black text-slate-800">Compiling Report…</p>
            <p className="text-sm text-slate-400 font-medium">
              Fetching the latest data for {previewTitle}
            </p>
          </div>
        </div>
      ) : previewData ? (
        <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-xl overflow-hidden flex flex-col animate-fade-in">
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
                {startDate || endDate
                  ? `from ${startDate || "beginning"} to ${endDate || "today"}`
                  : ""}
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

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="sticky top-0 bg-white border-b border-slate-100 z-10 shadow-sm">
                <tr>
                  {Object.keys(previewData[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {previewData.slice(0, 100).map((row, rowOffset) => {
                  const rowKey = `row-${Object.values(row).join("-").slice(0, 30)}-${rowOffset}`;
                  return (
                    <tr key={rowKey} className="hover:bg-indigo-50/20 transition-colors">
                      {Object.values(row).map((val, colOffset) => {
                        const cellKey = `cell-${Object.keys(row)[colOffset] || colOffset}-${String(val).slice(0, 10)}`;
                        return (
                          <td
                            key={cellKey}
                            className="px-6 py-4 text-sm text-slate-600 font-bold whitespace-nowrap"
                          >
                            {typeof val === "object" ? JSON.stringify(val) : String(val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6">
            {previewData.length > 100
              ? "Showing first 100 records only. Download full report for complete data."
              : `End of ${previewTitle}`}
          </div>
        </div>
      ) : selectedReportId ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center text-slate-400">
          <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-slate-200" />
          </div>
          <p className="font-bold">No data found for the selected criteria.</p>
          <p className="text-sm">Try adjusting your date filters.</p>
        </div>
      ) : null}
    </div>
  );
}
