"use client";

import { Check, ChevronDown, Share2 } from "lucide-react";
import { formatIntakeLabel } from "@/lib/intake";
import { appIdShort } from "./utils";
import type { ApplicationDetail, ApplicationStatus } from "./types";

export default function ApplicationDetailHeader({
  title,
  detail,
  appStatuses,
  saving,
  manageOpen,
  onToggleManage,
  onStatusUpdate,
  onShare,
}: {
  title: string;
  detail: ApplicationDetail;
  appStatuses: ApplicationStatus[];
  saving: boolean;
  manageOpen: boolean;
  onToggleManage: () => void;
  onStatusUpdate: (status: string) => void;
  onShare: () => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-slate-900 leading-snug">{title}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
          <span>
            App ID: <span className="font-medium text-slate-700">{appIdShort(detail.id)}</span>
          </span>
          <span>
            Main selected intake:{" "}
            <span className="font-medium text-slate-700">
              {detail.course.intake ? formatIntakeLabel(detail.course.intake) : "Not specified"}
            </span>
          </span>
          <span>
            Campus:{" "}
            <span className="font-medium text-slate-700">
              {detail.university.name}
              {detail.university.city ? ` — ${detail.university.city}` : ""}
            </span>
          </span>
        </div>
      </div>
      <div className="flex gap-3 shrink-0 relative">
        <div className="relative">
          <button
            type="button"
            onClick={onToggleManage}
            className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage App
            <ChevronDown size={16} className="ml-2" />
          </button>
          {manageOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Update status
              </p>
              {appStatuses.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  disabled={saving}
                  onClick={() => onStatusUpdate(s.name)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${
                    detail.status === s.name ? "text-[#1d4ed8] font-semibold" : "text-slate-700"
                  }`}
                >
                  {s.name}
                  {detail.status === s.name && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center px-4 py-2 bg-[#1d4ed8] text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Share2 size={16} className="mr-2" />
          Share access
        </button>
      </div>
    </div>
  );
}
