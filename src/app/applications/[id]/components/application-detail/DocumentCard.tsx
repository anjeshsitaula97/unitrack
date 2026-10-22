"use client";

import { Check, FileText, Maximize2, Upload, X } from "lucide-react";
import type { SectionKey, StudentDoc } from "./types";

export default function DocumentCard({
  doc,
  section,
  iconWrap,
  onSetDocStatus,
}: {
  doc: StudentDoc;
  section: SectionKey;
  iconWrap: string;
  onSetDocStatus: (docId: string, status: "Approved" | "Rejected") => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${iconWrap}`}>
          <FileText size={18} />
        </div>
        <div className="min-w-0">
          <span className="font-medium text-slate-800 block truncate">
            {doc.academicDocument?.name || doc.name}
          </span>
          {doc.academicDocument?.name && doc.name !== doc.academicDocument.name && (
            <span className="text-[11px] text-slate-400 truncate block">{doc.name}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {section === "Pending" && (
          <>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-[#1d4ed8] text-white rounded text-xs font-bold inline-flex items-center gap-1"
            >
              <Upload size={12} />
              View
            </a>
          </>
        )}
        {section === "In Review" && (
          <>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Maximize2 size={14} className="mr-2" />
              Details
            </a>
            <button
              type="button"
              onClick={() => onSetDocStatus(doc.id, "Approved")}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              <Check size={14} className="mr-1" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => onSetDocStatus(doc.id, "Rejected")}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
            >
              <X size={14} className="mr-1" />
              Reject
            </button>
          </>
        )}
        {section !== "Pending" && section !== "In Review" && (
          <>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Maximize2 size={14} className="mr-2" />
              Details
            </a>
          </>
        )}
      </div>
    </div>
  );
}
