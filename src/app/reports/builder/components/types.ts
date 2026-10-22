export interface SavedReport {
  id: string;
  name: string;
  config: unknown;
}

export interface ReportFilter {
  id: string;
  field: string;
  op: string;
  value: string;
}

export type FilterKey = "field" | "op" | "value";

export interface SavedReportsPanelProps {
  reports: SavedReport[];
  onLoad: (report: SavedReport) => void;
  onDelete: (id: string) => void;
}

export interface EntitySelectorProps {
  entity: string;
  onSelect: (entity: string) => void;
}

export interface FieldsSelectorProps {
  entity: string;
  selectedFields: string[];
  onToggle: (field: string) => void;
}

export interface ChartTypeSelectorProps {
  chartType: string;
  onChange: (chartType: string) => void;
}

export interface FiltersPanelProps {
  entity: string;
  filters: ReportFilter[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, key: FilterKey, value: string) => void;
}

export interface ReportActionsProps {
  loading: boolean;
  saving: boolean;
  reportName: string;
  canGenerate: boolean;
  onGenerate: () => void;
  onSave: () => void;
  onReportNameChange: (value: string) => void;
}

export interface BuilderSidebarProps {
  entity: string;
  selectedFields: string[];
  chartType: string;
  filters: ReportFilter[];
  reportName: string;
  loading: boolean;
  saving: boolean;
  onEntityChange: (entity: string) => void;
  onToggleField: (field: string) => void;
  onChartTypeChange: (chartType: string) => void;
  onAddFilter: () => void;
  onRemoveFilter: (id: string) => void;
  onUpdateFilter: (id: string, key: FilterKey, value: string) => void;
  onGenerate: () => void;
  onSave: () => void;
  onReportNameChange: (value: string) => void;
}

export interface ReportPreviewProps {
  loading: boolean;
  reportData: Record<string, unknown>[];
  chartType: string;
  selectedFields: string[];
}

export interface ReportTableProps {
  rows: Record<string, unknown>[];
  fields: string[];
}

export interface ReportChartProps {
  rows: Record<string, unknown>[];
  fields: string[];
  chartType: string;
}

export interface BarChartProps {
  rows: Record<string, unknown>[];
  fields: string[];
  numField: string;
  chartType: string;
}

export interface PieChartProps {
  rows: Record<string, unknown>[];
  fields: string[];
  numField: string;
}

export interface NoNumericFieldProps {
  chartType: string;
}
