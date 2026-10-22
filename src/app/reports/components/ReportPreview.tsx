import PreviewEmpty from "./report-preview/PreviewEmpty";
import PreviewLoading from "./report-preview/PreviewLoading";
import PreviewResults from "./report-preview/PreviewResults";
import type { ReportPreviewProps } from "./report-preview/types";

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
}: ReportPreviewProps) {
  return (
    <div id="report-preview-area" className="mt-8 transition duration-500 scroll-mt-6">
      {isPreviewLoading ? (
        <PreviewLoading previewTitle={previewTitle} />
      ) : previewData ? (
        <PreviewResults
          previewData={previewData}
          previewTitle={previewTitle}
          startDate={startDate}
          endDate={endDate}
          reports={reports}
          onDownload={onDownload}
          onClose={onClose}
        />
      ) : selectedReportId ? (
        <PreviewEmpty />
      ) : null}
    </div>
  );
}
