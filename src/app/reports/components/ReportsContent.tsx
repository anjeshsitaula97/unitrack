"use client";

import React, { useState } from "react";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import ReportFilters from "./ReportFilters";
import ReportPreview from "./ReportPreview";
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

        <ReportFilters
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClear={() => {
            setStartDate("");
            setEndDate("");
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((r) => (
          <div
            key={r.id}
            className={`card relative p-5 border transition group flex flex-col justify-between min-h-[220px] text-left
              ${selectedReportId === r.id ? "border-indigo-500 ring-2 ring-indigo-100 shadow-md bg-indigo-50/10" : "border-slate-100 hover:border-indigo-200 hover:shadow-md"}
            `}
          >
            {/* Stretched overlay keeps the whole card clickable without nesting
                interactive controls inside another one. */}
            <button
              type="button"
              aria-label={`Preview ${r.title}`}
              onClick={() => handlePreview(r.id, r.title)}
              className="absolute inset-0 z-0 cursor-pointer"
            />
            <div>
              <div
                className={`size-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${selectedReportId === r.id ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"}`}
              >
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{r.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{r.desc}</p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-slate-100 gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label={`Preview ${r.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(r.id, r.title);
                  }}
                  className={`p-2 rounded-lg transition ${selectedReportId === r.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                  title="Preview Report"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`Download ${r.title}`}
                  disabled={isDownloading === r.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(r.id, r.title);
                  }}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
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
          </div>
        ))}
      </div>

      <ReportPreview
        isPreviewLoading={isPreviewLoading}
        previewData={previewData}
        previewTitle={previewTitle}
        selectedReportId={selectedReportId}
        startDate={startDate}
        endDate={endDate}
        reports={reports}
        onDownload={handleDownload}
        onClose={() => {
          setPreviewData(null);
          setSelectedReportId(null);
        }}
      />
    </div>
  );
}
