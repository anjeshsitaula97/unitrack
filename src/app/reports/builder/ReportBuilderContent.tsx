"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import SavedReportsPanel from "./components/SavedReportsPanel";
import BuilderSidebar from "./components/BuilderSidebar";
import ReportPreview from "./components/ReportPreview";
import { entityFields, makeFilterId, readConfig } from "./components/reportConfig";
import type { ReportFilter, SavedReport } from "./components/types";

export default function ReportBuilderContent() {
  const [entity, setEntity] = useState<string>("Student");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [chartType, setChartType] = useState("Table");
  const [reportData, setReportData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportName, setReportName] = useState("");
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSaved = async () => {
    try {
      const res = await fetch("/api/reports/saved");
      if (!res.ok) return;
      const data = await res.json();
      setSavedReports(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  };

  const fetchSavedRef = useRef(fetchSaved);
  useEffect(() => {
    fetchSavedRef.current();
  }, []);

  const addFilter = () =>
    setFilters([
      ...filters,
      { id: makeFilterId(), field: entityFields[entity][0] || "id", op: "contains", value: "" },
    ]);
  const removeFilter = (id: string) => setFilters(filters.filter((f) => f.id !== id));
  const updateFilter = (id: string, key: "field" | "op" | "value", val: string) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  };

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleGenerate = async () => {
    if (selectedFields.length === 0) {
      toast.error("Select at least one field");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, fields: selectedFields, filters, chartType }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Report generation failed");
      }
      setReportData(await res.json());
    } catch {
      toast.error("Report generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!reportName.trim()) {
      toast.error("Enter a report name");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reports/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reportName,
          config: { entity, fields: selectedFields, filters, chartType },
        }),
      });
      if (res.ok) {
        toast.success("Report saved");
        fetchSaved();
        setReportName("");
        setShowSaved(true);
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const loadReport = async (report: SavedReport) => {
    const cfg = readConfig(report.config);
    setEntity((cfg.entity as string) || "Student");
    setSelectedFields((cfg.fields as string[]) || []);
    setFilters(
      ((cfg.filters as ReportFilter[]) || []).map((f) => ({
        id: f.id || makeFilterId(),
        field: f.field,
        op: f.op,
        value: f.value,
      }))
    );
    setChartType((cfg.chartType as string) || "Table");
    setShowSaved(false);
    toast.success("Report loaded");
  };

  const deleteReport = async (id: string) => {
    try {
      await fetch(`/api/reports/saved?id=${id}`, { method: "DELETE" });
      fetchSaved();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Report Builder
        </h1>
        <button
          type="button"
          onClick={() => setShowSaved(!showSaved)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1"
        >
          <FileText size={14} /> Saved Reports ({savedReports.length})
        </button>
      </div>

      {showSaved && savedReports.length > 0 && (
        <SavedReportsPanel reports={savedReports} onLoad={loadReport} onDelete={deleteReport} />
      )}

      <div className="grid grid-cols-3 gap-6">
        <BuilderSidebar
          entity={entity}
          selectedFields={selectedFields}
          chartType={chartType}
          filters={filters}
          reportName={reportName}
          loading={loading}
          saving={saving}
          onEntityChange={(value) => {
            setEntity(value);
            setSelectedFields([]);
          }}
          onToggleField={toggleField}
          onChartTypeChange={setChartType}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          onUpdateFilter={updateFilter}
          onGenerate={handleGenerate}
          onSave={handleSave}
          onReportNameChange={setReportName}
        />

        <div className="col-span-2">
          <ReportPreview
            loading={loading}
            reportData={reportData}
            chartType={chartType}
            selectedFields={selectedFields}
          />
        </div>
      </div>
    </>
  );
}
