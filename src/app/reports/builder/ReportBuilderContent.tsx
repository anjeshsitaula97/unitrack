"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Save,
  Trash2,
  Loader2,
  FileText,
  Table,
  BarChart3,
  PieChart,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";

const entityFields: Record<string, string[]> = {
  Student: [
    "id",
    "name",
    "firstName",
    "lastName",
    "email",
    "phone",
    "nationality",
    "dob",
    "gender",
    "address",
    "status",
    "createdAt",
  ],
  University: [
    "id",
    "name",
    "country",
    "city",
    "type",
    "ranking",
    "founded",
    "status",
    "createdAt",
  ],
  Course: [
    "id",
    "name",
    "universityId",
    "faculty",
    "degreeType",
    "level",
    "duration",
    "credits",
    "tuitionFee",
    "language",
    "mode",
    "intake",
    "createdAt",
  ],
  Lead: ["id", "name", "email", "phone", "source", "status", "interestedCountry", "createdAt"],
  Payment: ["id", "amount", "currency", "status", "method", "date", "description", "createdAt"],
  Application: ["id", "status", "appliedDate", "createdAt"],
};

const chartTypes = ["Table", "Bar", "Pie", "Line"];

interface SavedReport {
  id: string;
  name: string;
  config: unknown;
}

interface ReportFilter {
  id: string;
  field: string;
  op: string;
  value: string;
}

const makeFilterId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `filter-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function readConfig(config: unknown): Record<string, unknown> {
  if (!config) return {};
  if (typeof config === "string") {
    try {
      const parsed = JSON.parse(config);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof config === "object" ? (config as Record<string, unknown>) : {};
}

function reportRowKey(row: Record<string, unknown>, fields: string[]) {
  return fields.map((f) => String(row[f] ?? "")).join("|");
}

function SavedReportsPanel({
  reports,
  onLoad,
  onDelete,
}: {
  reports: SavedReport[];
  onLoad: (report: SavedReport) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
      <h3 className="font-bold text-slate-800 mb-3 text-sm">Saved Reports</h3>
      <div className="space-y-1">
        {reports.map((r) => {
          const cfg = readConfig(r.config);
          return (
            <div
              key={r.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              <button type="button" onClick={() => onLoad(r)} className="text-left">
                <span className="font-medium text-slate-700 text-sm">{r.name}</span>
                <span className="text-[10px] text-slate-400 ml-2">
                  {(cfg.entity as string) || "?"} &middot;{" "}
                  {(cfg.fields as unknown[] | undefined)?.length || 0} fields
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${r.name}`}
                onClick={() => onDelete(r.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  const selectedFieldSet = new Set(selectedFields);

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
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Entity
            </span>
            <div className="flex flex-wrap gap-1">
              {Object.keys(entityFields).map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => {
                    setEntity(e);
                    setSelectedFields([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${entity === e ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Fields
              </span>
              <span className="text-[10px] text-slate-400">{selectedFields.length} selected</span>
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {entityFields[entity].map((field) => (
                <label key={field} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFieldSet.has(field)}
                    onChange={() => toggleField(field)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600">{field}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Chart Type
            </span>
            <div className="flex flex-wrap gap-1">
              {chartTypes.map((ct) => (
                <button
                  type="button"
                  key={ct}
                  onClick={() => setChartType(ct)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${chartType === ct ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600"}`}
                >
                  {ct === "Table" ? (
                    <Table size={12} />
                  ) : ct === "Bar" ? (
                    <BarChart3 size={12} />
                  ) : ct === "Pie" ? (
                    <PieChart size={12} />
                  ) : (
                    <BarChart3 size={12} />
                  )}{" "}
                  {ct}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Filters
              </span>
              <button
                type="button"
                onClick={addFilter}
                className="text-indigo-600 text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {filters.map((f) => (
                <div key={f.id} className="flex gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => removeFilter(f.id)}
                    aria-label="Remove filter"
                    className="text-red-400"
                  >
                    <X size={12} />
                  </button>
                  <select
                    aria-label="Filter field"
                    value={f.field}
                    onChange={(e) => updateFilter(f.id, "field", e.target.value)}
                    className="flex-1 text-[10px] px-1.5 py-1 bg-slate-50 border border-slate-200 rounded"
                  >
                    {entityFields[entity].map((fld) => (
                      <option key={fld} value={fld}>
                        {fld}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter operator"
                    value={f.op}
                    onChange={(e) => updateFilter(f.id, "op", e.target.value)}
                    className="w-16 text-[10px] px-1 py-1 bg-slate-50 border border-slate-200 rounded"
                  >
                    {["contains", "equals", "gt", "lt", "startsWith"].map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    aria-label="Filter value"
                    value={f.value}
                    onChange={(e) => updateFilter(f.id, "value", e.target.value)}
                    className="flex-1 text-[10px] px-1.5 py-1 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || selectedFields.length === 0}
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
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Report name..."
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!reportName.trim() || saving}
              className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1 disabled:opacity-50"
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        <div className="col-span-2">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : reportData.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {chartType === "Table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {selectedFields.map((f) => (
                          <th
                            key={f}
                            className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500"
                          >
                            {f}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.slice(0, 50).map((row) => (
                        <tr
                          key={reportRowKey(row, selectedFields)}
                          className="border-b border-slate-50 hover:bg-slate-50"
                        >
                          {selectedFields.map((f) => {
                            const val =
                              typeof row[f] === "object" ? JSON.stringify(row[f]) : row[f];
                            const display =
                              val === null || val === undefined ? "-" : String(val) || "-";
                            return (
                              <td key={f} className="px-4 py-2.5 text-slate-700">
                                {display}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.length > 50 && (
                    <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
                      Showing 50 of {reportData.length} rows
                    </div>
                  )}
                </div>
              ) : (
                (() => {
                  const numField =
                    reportData.length > 0
                      ? selectedFields.find((f) => !isNaN(Number(reportData[0][f])))
                      : undefined;
                  if (!numField) {
                    return (
                      <div className="p-8 text-center">
                        <BarChart3 className="mx-auto text-slate-200 mb-3" size={48} />
                        <p className="text-slate-500 font-medium">
                          No numeric field found for chart
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Include a numeric field (e.g. credits, amount, ranking) to use{" "}
                          {chartType.toLowerCase()} chart
                        </p>
                      </div>
                    );
                  }
                  if (chartType === "Bar" || chartType === "Line") {
                    const maxVal = Math.max(
                      ...reportData.slice(0, 15).map((r) => Number(r[numField]) || 0),
                      1
                    );
                    return (
                      <div className="p-8">
                        <h3 className="font-bold text-slate-800 mb-4">{chartType} Chart</h3>
                        <div className="flex items-end gap-2 h-48">
                          {reportData.slice(0, 15).map((row) => {
                            const h = (Number(row[numField]) / maxVal) * 100;
                            return (
                              <div
                                key={reportRowKey(row, selectedFields)}
                                className="flex-1 flex flex-col items-center gap-1"
                              >
                                <div
                                  className="w-full bg-indigo-500 rounded-t transition"
                                  style={{ height: `${Math.max(h, 2)}%` }}
                                />
                                <span className="text-[8px] text-slate-400 text-center truncate w-full">
                                  {String(
                                    row[
                                      selectedFields.find((f) => f !== numField) ||
                                        selectedFields[0]
                                    ] ?? ""
                                  ).substring(0, 6)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  const colors = [
                    "#6366f1",
                    "#8b5cf6",
                    "#ec4899",
                    "#f43f5e",
                    "#f97316",
                    "#eab308",
                    "#22c55e",
                    "#06b6d4",
                    "#3b82f6",
                    "#a855f7",
                  ];
                  return (
                    <div className="p-8">
                      <h3 className="font-bold text-slate-800 mb-4">Pie Chart</h3>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {reportData.slice(0, 10).map((row, i) => {
                          return (
                            <div
                              key={reportRowKey(row, selectedFields)}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="size-4 rounded-full"
                                style={{ backgroundColor: colors[i % 10] }}
                              />
                              <span className="text-xs text-slate-600">
                                {String(
                                  row[
                                    selectedFields.find((f) => f !== numField) || selectedFields[0]
                                  ] ?? ""
                                ) || "N/A"}
                                {` (${row[numField]})`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
              <BarChart3 className="text-slate-200 mb-3" size={48} />
              <p className="text-slate-500 font-medium">Select fields and generate a report</p>
              <p className="text-xs text-slate-400 mt-1">
                Choose an entity, pick fields, add filters, then click Generate Report
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
