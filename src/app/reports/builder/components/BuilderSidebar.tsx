"use client";

import EntitySelector from "./EntitySelector";
import FieldsSelector from "./FieldsSelector";
import ChartTypeSelector from "./ChartTypeSelector";
import FiltersPanel from "./FiltersPanel";
import ReportActions from "./ReportActions";
import type { BuilderSidebarProps } from "./types";

export default function BuilderSidebar({
  entity,
  selectedFields,
  chartType,
  filters,
  reportName,
  loading,
  saving,
  onEntityChange,
  onToggleField,
  onChartTypeChange,
  onAddFilter,
  onRemoveFilter,
  onUpdateFilter,
  onGenerate,
  onSave,
  onReportNameChange,
}: BuilderSidebarProps) {
  return (
    <div className="col-span-1 space-y-4">
      <EntitySelector entity={entity} onSelect={onEntityChange} />

      <FieldsSelector entity={entity} selectedFields={selectedFields} onToggle={onToggleField} />

      <ChartTypeSelector chartType={chartType} onChange={onChartTypeChange} />

      <FiltersPanel
        entity={entity}
        filters={filters}
        onAdd={onAddFilter}
        onRemove={onRemoveFilter}
        onUpdate={onUpdateFilter}
      />

      <ReportActions
        loading={loading}
        saving={saving}
        reportName={reportName}
        canGenerate={selectedFields.length > 0}
        onGenerate={onGenerate}
        onSave={onSave}
        onReportNameChange={onReportNameChange}
      />
    </div>
  );
}
