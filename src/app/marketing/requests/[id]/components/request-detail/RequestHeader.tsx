"use client";

import { ArrowLeft, Calendar, Clock, Megaphone, User } from "lucide-react";
import { formatDate } from "./formatters";
import { PRIORITY_COLORS, STATUS_COLORS, STATUS_OPTIONS, type RequestHeaderProps } from "./types";

export default function RequestHeader({
  request,
  isSaving,
  onSaveStatus,
  onBack,
}: RequestHeaderProps) {
  return (
    <>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Marketing Materials
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-indigo-100 rounded-xl text-indigo-600">
              <Megaphone size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}
                >
                  {request.status}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[request.priority]}`}
                >
                  {request.priority} priority
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {request.type}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => onSaveStatus(status)}
                disabled={isSaving || status === request.status}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  request.status === status
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <User size={20} className="text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500">Requested by</p>
              <p className="text-sm font-medium text-slate-900">{request.requester.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <User size={20} className="text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500">Assigned to</p>
              <p className="text-sm font-medium text-slate-900">
                {request.assignee?.name || "Unassigned"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Calendar size={20} className="text-orange-500" />
            <div>
              <p className="text-xs text-slate-500">Due date</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(request.dueDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Clock size={20} className="text-purple-500" />
            <div>
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(request.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {request.description}
          </p>
        </div>
      </div>
    </>
  );
}
