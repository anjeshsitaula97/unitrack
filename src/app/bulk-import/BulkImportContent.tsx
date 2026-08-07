"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const importTypes = [
  {
    value: "students",
    label: "Students",
    description: "Import student records with name, email, phone, etc.",
  },
  {
    value: "universities",
    label: "Universities",
    description: "Import university listings with name, country, type, etc.",
  },
  {
    value: "courses",
    label: "Courses",
    description: "Import course data with universityId, name, faculty, etc.",
  },
  {
    value: "leads",
    label: "Leads",
    description: "Import lead records with name, email, source, status.",
  },
  {
    value: "applications",
    label: "Applications",
    description: "Import student applications with student email, university, course, and status.",
  },
  {
    value: "payments",
    label: "Payments",
    description: "Import payment records with student email, amount, currency, and method.",
  },
  {
    value: "staff",
    label: "Staff",
    description: "Import staff user accounts with name, email, role, and status.",
  },
  {
    value: "partners",
    label: "Partners",
    description: "Import partner records with name, contact details, and address.",
  },
  {
    value: "expenses",
    label: "Expenses",
    description: "Import expense records with category, amount, date, and description.",
  },
];

const templates: Record<string, string[]> = {
  students: [
    "name",
    "firstName",
    "lastName",
    "email",
    "phone",
    "whatsappNumber",
    "gender",
    "nationality",
    "passportNumber",
    "studyLevel",
    "interestedCountry",
    "status",
    "counselor",
  ],
  universities: ["name", "shortName", "country", "city", "type", "website", "ranking", "status"],
  courses: [
    "name",
    "universityId",
    "faculty",
    "degreeType",
    "level",
    "duration",
    "language",
    "mode",
    "tuitionFee",
    "status",
  ],
  leads: ["name", "email", "phone", "source", "status", "interestedCountry", "counselor"],
  applications: ["studentEmail", "universityId", "courseId", "status"],
  payments: ["studentEmail", "amount", "currency", "status", "method", "date", "description"],
  staff: ["name", "email", "role", "password", "phone", "status"],
  partners: ["name", "contactPerson", "email", "phone", "address", "description"],
  expenses: ["category", "amount", "currency", "date", "description", "paidTo", "method", "billNo"],
};

export default function BulkImportContent() {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  const [importType, setImportType] = useState("students");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [exportType, setExportType] = useState("students");
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }
    setImporting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", importType);
      // Check file extension
      if (
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls") &&
        !file.name.endsWith(".csv")
      ) {
        toast.error("Please upload an Excel file (.xlsx, .xls) or CSV");
        setImporting(false);
        return;
      }
      const res = await fetch("/api/bulk", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        toast.success(`Imported ${data.imported} records`);
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/bulk?type=${exportType}&format=xlsx`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${exportType}_${new Date().toISOString().split("T")[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`${exportType} exported successfully`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Export failed");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = templates[exportType];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${exportType}_template.xlsx`);
    toast.success("Template downloaded");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Bulk Import/Export
        </h1>
      </div>

      <div className="flex gap-2 mb-6">
        {(["import", "export"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab === "import" ? (
              <Upload size={16} className="inline mr-1.5" />
            ) : (
              <Download size={16} className="inline mr-1.5" />
            )}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "import" ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Import Data</h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            {importTypes.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => {
                  setImportType(t.value);
                  setResult(null);
                  setFile(null);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  importType === t.value
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-500 mb-4">
            {importTypes.find((t) => t.value === importType)?.description}
          </p>

          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileSpreadsheet size={24} className="text-emerald-500" />
                <span className="font-medium text-slate-700">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 font-medium">Click to upload Excel file</p>
                <p className="text-xs text-slate-400 mt-1">.xlsx, .xls, or .csv files</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            type="button"
            onClick={handleImport}
            disabled={!file || importing}
            className="mt-4 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {importing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {importing ? "Importing..." : "Import Data"}
          </button>

          {result && (
            <div
              className={`mt-4 p-4 rounded-xl ${result.errors?.length > 0 ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.errors?.length > 0 ? (
                  <AlertTriangle size={18} className="text-amber-500" />
                ) : (
                  <CheckCircle size={18} className="text-emerald-500" />
                )}
                <span className="font-semibold text-slate-800">Import Complete</span>
              </div>
              <p className="text-sm text-slate-600">
                Imported: {result.imported} of {result.total} records
              </p>
              {result.errors?.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {result.errors.map((err: string, i: number) => (
                    <p key={i} className="text-xs text-red-600">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Export Data</h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            {importTypes.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => setExportType(t.value)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  exportType === t.value
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              {exporting ? "Exporting..." : "Export as Excel"}
            </button>

            <button
              type="button"
              onClick={downloadTemplate}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet size={18} />
              Download Template
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-700 mb-2">Export Fields</h3>
            <div className="flex flex-wrap gap-1.5">
              {templates[exportType].map((f) => (
                <span
                  key={f}
                  className="px-2 py-1 bg-slate-50 rounded-lg text-xs text-slate-600 font-mono"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
