export type ReportRow = Record<string, unknown>;

export interface ReportOption {
  id: string;
  title: string;
}

export interface ReportPreviewProps {
  isPreviewLoading: boolean;
  previewData: ReportRow[] | null;
  previewTitle: string;
  selectedReportId: string | null;
  startDate: string;
  endDate: string;
  reports: ReportOption[];
  onDownload: (reportId: string, title: string, data: ReportRow[]) => void;
  onClose: () => void;
}
