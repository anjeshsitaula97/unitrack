"use client";

import { Calendar, Clock, User } from "lucide-react";
import RequestMaterials from "./RequestMaterials";
import {
  PRIORITY_COLORS,
  REQUEST_TYPE_COLORS,
  STATUS_COLORS,
  STATUS_OPTIONS,
  TYPE_ICONS,
} from "./constants";
import { formatDate } from "./utils";
import type { MarketingRequest } from "./types";

export default function MarketingRequestRow({
  request,
  onUpdateStatus,
  onDownload,
}: {
  request: MarketingRequest;
  onUpdateStatus: (requestId: number, status: string) => void;
  onDownload: (url: string, fileName: string) => void;
}) {
  return (
    <div className="p-6 hover:bg-slate-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div
              className={`p-3 rounded-xl ${REQUEST_TYPE_COLORS[request.type] || REQUEST_TYPE_COLORS.Other}`}
            >
              {TYPE_ICONS[request.type] || TYPE_ICONS.Other}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-semibold text-slate-900 truncate">{request.title}</h3>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}
                >
                  {request.status}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[request.priority]}`}
                >
                  {request.priority}
                </span>
              </div>
              <p className="mt-2 text-slate-600 line-clamp-2">{request.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User size={14} /> Requested by {request.requester.name}
                </span>
                {request.assignee && (
                  <span className="flex items-center gap-1">
                    <User size={14} className="text-indigo-500" /> Assigned to{" "}
                    {request.assignee.name}
                  </span>
                )}
                {request.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Due {formatDate(request.dueDate)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={14} /> Created {formatDate(request.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {request.materials.length > 0 && (
            <RequestMaterials materials={request.materials} onDownload={onDownload} />
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            aria-label={`Status for ${request.title}`}
            value={request.status}
            onChange={(e) => onUpdateStatus(request.id, e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            {STATUS_OPTIONS.filter((s) => s !== "All").map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
