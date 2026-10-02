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

export default function ReportBuilderContent() {
  const [entity, setEntity] = useState<string>("Student");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<{ field: string; op: string; value: string }[]>([]);
  const [chartType, setChartType] = useState("Table");
  const [reportData, setReportData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportName, setReportName] = useState("");
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const fetchSaved = async () => {
    try {
      const res = await fetch("/api/reports/saved");
      setSavedReports(await res.json());
    } catch {
      /* ignore */
    }
  };

  const fetchSavedRef = useRef(fetchSaved);
  useEffect(() => {
    fetchSavedRef.current();
  }, []);

  const addFilter = () =>
    setFilters([...filters, { field: entityFields[entity][0] || "id", op: "contains", value: "" }]);
  const removeFilter = (i: number) => setFilters(filters.filter((_, idx) => idx !== i));
  const updateFilter = (i: number, key: "field" | "op" | "value", val: string) => {
    const copy = [...filters];
    copy[i] = { ...copy[i], [key]: val };
    setFilters(copy);
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
    }
  };

  const loadReport = async (report: SavedReport) => {
    const cfg = typeof report.config === "string" ? JSON.parse(report.config) : report.config || {};
    setEntity(cfg.entity || "Student");
    setSelectedFields(cfg.fields || []);
    setFilters(cfg.filters || []);
    setChartType(cfg.chartType || "Table");
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
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
          <h3 className="font-bold text-slate-800 mb-3 text-sm">Saved Reports</h3>
          <div className="space-y-1">
            {savedReports.map((r: SavedReport) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                <button type="button" onClick={() => loadReport(r)} className="text-left">
                  <span className="font-medium text-slate-700 text-sm">
                    {r.name}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    {(typeof r.config === "string" ? JSON.parse(r.config || "{}") : r.config || {})
                      .entity || "?"}{" "}
                    &middot;{" "}
                    {(typeof r.config === "string" ? JSON.parse(r.config || "{}") : r.config || {})
                      .fields?.length || 0}{" "}
                    fields
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteReport(r.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Entity
            </label>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Fields
              </label>
              <span className="text-[10px] text-slate-400">{selectedFields.length} selected</span>
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {entityFields[entity].map((field) => (
                <label key={field} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleField(field)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600">{field}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Chart Type
            </label>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Filters
              </label>
              <button
                type="button"
                onClick={addFilter}
                className="text-indigo-600 text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {filters.map((f, i) => (
                <div key={i} className="flex gap-1 items-center">
                  <button type="button" onClick={() => removeFilter(i)} className="text-red-400">
                    <X size={12} />
                  </button>
                  <select
                    value={f.field}
                    onChange={(e) => updateFilter(i, "field", e.target.value)}
                    className="flex-1 text-[10px] px-1.5 py-1 bg-slate-50 border border-slate-200 rounded"
                  >
                    {entityFields[entity].map((fld) => (
                      <option key={fld} value={fld}>
                        {fld}
                      </option>
                    ))}
                  </select>
                  <select
                    value={f.op}
                    onChange={(e) => updateFilter(i, "op", e.target.value)}
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
                    value={f.value}
                    onChange={(e) => updateFilter(i, "value", e.target.value)}
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
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Report name..."
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!reportName.trim()}
              className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1"
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
                      {reportData.slice(0, 50).map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-50 hover:bg-slate-50"
                        >
                          {selectedFields.map((f) => {
                            const val =
                              typeof row[f] === "object" ? JSON.stringify(row[f]) : row[f];
                            const display =
                              val === null || val === undefined ? "-" : String(val) || "-";
                            return (
                              <td
                                key={f}
                                className="px-4 py-2.5 text-slate-700"
                              >
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
                        <BarChart3
                          className="mx-auto text-slate-200 mb-3"
                          size={48}
                        />
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
                        <h3 className="font-bold text-slate-800 mb-4">
                          {chartType} Chart
                        </h3>
                        <div className="flex items-end gap-2 h-48">
                          {reportData.slice(0, 15).map((row, i) => {
                            const h = (Number(row[numField]) / maxVal) * 100;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                  className="w-full bg-indigo-500 rounded-t transition-all"
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
                          const _pct = reportData.length > 1 ? 100 / reportData.length : 100;
                          return (
                            <div key={i} className="flex items-center gap-2">
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
