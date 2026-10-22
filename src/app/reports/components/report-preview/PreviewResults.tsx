import PreviewHeader from "./PreviewHeader";
import PreviewTable from "./PreviewTable";
import type { ReportOption, ReportRow } from "./types";

export default function PreviewResults({
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
    <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-xl overflow-hidden flex flex-col animate-fade-in">
      <PreviewHeader
        previewData={previewData}
        previewTitle={previewTitle}
        startDate={startDate}
        endDate={endDate}
        reports={reports}
        onDownload={onDownload}
        onClose={onClose}
      />

      <PreviewTable previewData={previewData} />

      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6">
        {previewData.length > 100
          ? "Showing first 100 records only. Download full report for complete data."
          : `End of ${previewTitle}`}
      </div>
    </div>
  );
}
