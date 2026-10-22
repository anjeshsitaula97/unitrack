"use client";

import type { ChangeEvent, RefObject } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { getStatusBadge } from "./utils";
import type { RequirementRow } from "./types";

export default function CourseRequirements({
  requirementRows,
  uploadingReq,
  onUploadClick,
  fileInputRef,
  onFileSelected,
}: {
  requirementRows: RequirementRow[];
  uploadingReq: string | null;
  onUploadClick: (reqName: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelected: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  if (requirementRows.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm">Course Requirements</h3>
      </div>
      <div className="divide-y divide-slate-50">
        {requirementRows.map((row) => {
          const badgeInfo = getStatusBadge(row.status);
          return (
            <div key={`req-${row.name}`} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-700 truncate">{row.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeInfo.className}`}
                >
                  {badgeInfo.label}
                </span>
                {row.status !== "Approved" && (
                  <button
                    type="button"
                    disabled={uploadingReq === row.name}
                    onClick={() => onUploadClick(row.name)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#1d4ed8] text-[#1d4ed8] rounded text-xs font-bold hover:bg-[#1d4ed8]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingReq === row.name ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    {uploadingReq === row.name ? "Uploading…" : "Upload"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt,.csv"
        className="hidden"
        onChange={onFileSelected}
      />
    </div>
  );
}
