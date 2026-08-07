"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Loader2,
  FileText,
  FileImage,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";
import { safeJson } from "@/lib/fetch-client";

interface StudentDocumentRow {
  id: number;
  name: string;
  type: string | null;
  status: string | null;
  url: string;
  uploadedAt: string;
}

const fileIcons: Record<string, LucideIcon> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
};

function getIcon(url: string) {
  const ext = url?.split(".").pop()?.toLowerCase() || "";
  return fileIcons[ext] || FileText;
}

export default function StudentDocuments() {
  const [documents, setDocuments] = useState<StudentDocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student-portal/documents")
      .then(safeJson)
      .then((d) => {
        setDocuments(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">My Documents</h1>
        <p className="text-slate-500 text-sm mt-1">
          {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
        </p>
      </div>
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : documents.length === 0 ? (
        <div className="py-20 text-center">
          <Download className="mx-auto text-slate-200 mb-3" size={48} />
          <p className="text-slate-500 font-medium">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const Icon = getIcon(doc.url);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{doc.name}</div>
                    <div className="text-xs text-slate-400">
                      {doc.type || "Document"} &middot;{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      doc.status === "Uploaded"
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-amber-600 bg-amber-50"
                    }`}
                  >
                    {doc.status}
                  </span>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <Download size={16} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
