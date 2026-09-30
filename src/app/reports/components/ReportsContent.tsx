"use client";

import React, { useState } from "react";
import { Download, FileText, Calendar, Filter, Loader2, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { buildXlsx, downloadBlob } from "@/lib/spreadsheet";

const reports = [
  {
    id: "universities",
    title: "Universities Directory",
    desc: "Complete list of all registered partner universities and their accreditation status.",
    type: "Excel",
  },
  {
    id: "courses",
    title: "Course Capacity & Enrollment",
    desc: "Detailed breakdown of active courses, credit limits, and student capacities.",
    type: "Excel",
  },
  {
    id: "applications",
    title: "Student Application History",
    desc: "Comprehensive log of all student applications, university choices, and current admission status.",
    type: "Excel",
  },
  {
    id: "payments",
    title: "Financial Payment Records",
    desc: "Complete ledger of all student fee payments, transaction methods, and proof of payment links.",
    type: "Excel",
  },
  {
    id: "users",
    title: "System Access Audit Log",
    desc: "Audit log of all platform administrative users, roles, and status.",
    type: "Excel",
  },
];

export default function ReportsContent() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[] | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const fetchReportData = async (reportId: string, _title: string) => {
    const params = new URLSearchParams({ type: reportId });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const res = await fetch(`/api/reports?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch report data");
    return await res.json();
  };

  const handlePreview = async (reportId: string, title: string) => {
    setIsPreviewLoading(true);
    setPreviewTitle(title);
    setSelectedReportId(reportId);
    setPreviewData(null); // Reset while loading
    try {
      const data = await fetchReportData(reportId, title);
      if (!data || data.length === 0) {
        toast.warning(`No records found for ${title}`);
        return;
      }
      setPreviewData(data);
      // Scroll to preview
      setTimeout(() => {
        document
          .getElementById("report-preview-area")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (_err) {
      toast.error("Failed to load report preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async (
    reportId: string,
    title: string,
    customData?: Record<string, unknown>[]
  ) => {
    setIsDownloading(reportId);
    toast.info(`Generating ${title}...`);

    try {
      const data = customData || (await fetchReportData(reportId, title));

      if (!data || data.length === 0) {
        toast.warning(`No records found for ${title}`);
        setIsDownloading(null);
        return;
      }

      let filename = `${reportId}_report`;
      if (startDate || endDate) {
        filename += `_${startDate || "start"}_to_${endDate || "end"}`;
      }
      filename += ".xlsx";

      downloadBlob(await buildXlsx("Report Data", data), filename);
      toast.success(`${title} downloaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while generating the report.");
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="animate-fade-in relative">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">System Reports</h1>
          <p className="text-sm text-slate-400">
            {reports.length.toLocaleString()} report templates available for generation
          </p>
        </div>

        {/* Date Filters block */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium whitespace-nowrap">
            <Filter size={14} className="text-indigo-500" /> Date Boundary
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
              className="px-2 py-1.5 text-xs border border-slate-200 rounded text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-300 w-full sm:w-32"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
              className="px-2 py-1.5 text-xs border border-slate-200 rounded text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-300 w-full sm:w-32"
            />
          </div>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((r) => (
          <button
            key={r.id}
            type="button"
            tabIndex={0}
            onClick={() => handlePreview(r.id, r.title)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handlePreview(r.id, r.title);
            }}
            className={`card p-5 border transition-all group flex flex-col justify-between min-h-[220px] cursor-pointer text-left
              ${selectedReportId === r.id ? "border-indigo-500 ring-2 ring-indigo-100 shadow-md bg-indigo-50/10" : "border-slate-100 hover:border-indigo-200 hover:shadow-md"}
            `}
          >
            <div>
              <div
                className={`size-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${selectedReportId === r.id ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"}`}
              >
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{r.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{r.desc}</p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(r.id, r.title);
                  }}
                  className={`p-2 rounded-lg transition-all ${selectedReportId === r.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                  title="Preview Report"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  disabled={isDownloading === r.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(r.id, r.title);
                  }}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
                  title="Download Excel"
                >
                  {isDownloading === r.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                </button>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase tracking-wider">
                {r.type}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Inline Preview Area */}
      <div id="report-preview-area" className="mt-8 transition-all duration-500 scroll-mt-6">
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
                    if (r) handleDownload(r.id, r.title, previewData);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <Download size={18} /> Download Excel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewData(null);
                    setSelectedReportId(null);
                  }}
                  className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
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
        ) : selectedReportId && !isPreviewLoading ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center text-slate-400">
            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-slate-200" />
            </div>
            <p className="font-bold">No data found for the selected criteria.</p>
            <p className="text-sm">Try adjusting your date filters.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
