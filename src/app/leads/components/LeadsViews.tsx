"use client";

import Image from "next/image";
import { Edit2, Trash2, Mail, Phone, Calendar, Info, UserCheck, Clock } from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { getCountryFlag } from "@/lib/country-flags";
import {
  capitalize,
  formatDate,
  isOverdue,
  statusConfig,
  rainbowGradients,
  leadKanbanStatuses,
  type Lead,
} from "./leads-types";

export function LeadsTable({
  paginated,
  isLoading,
  isAdmin,
  router,
  onDelete,
}: {
  paginated: Lead[];
  isLoading?: boolean;
  isAdmin: boolean;
  router: AppRouterInstance;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50/60 border-b border-slate-100">
          <tr>
            <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Lead Info
            </th>
            <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Counselor / Assigned
            </th>
            <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Status
            </th>
            <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Next Follow-up
            </th>
            <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right pr-5">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {paginated.length === 0 && !isLoading && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                No leads found.
              </td>
            </tr>
          )}
          {paginated.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-5">
                <div>
                  <p className="text-sm font-bold text-slate-800">{lead.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Mail size={10} /> {lead.email}
                    </span>
                    {lead.phone && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Phone size={10} /> {lead.phone}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 px-3">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <UserCheck size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {lead.counselor || "Unassigned"}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} />{" "}
                      {lead.assignedDate ? formatDate(lead.assignedDate) : "Not assigned"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-3">
                <span
                  className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${statusConfig[lead.status]?.className || ""}`}
                >
                  {statusConfig[lead.status]?.label || lead.status}
                </span>
              </td>
              <td className="py-4 px-3">
                <div
                  className={`flex items-center gap-2 ${isOverdue(lead.nextFollowUp) ? "text-rose-600" : "text-slate-600"}`}
                >
                  <Calendar
                    size={14}
                    className={isOverdue(lead.nextFollowUp) ? "text-rose-500" : "text-slate-400"}
                  />
                  <div className="text-xs font-medium">
                    {formatDate(lead.nextFollowUp)}
                    {isOverdue(lead.nextFollowUp) && (
                      <span className="ml-2 px-1.5 py-0.5 bg-rose-50 text-[9px] font-bold uppercase tracking-tighter rounded border border-rose-100 animate-pulse">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 px-3 text-right pr-5">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    aria-label="Edit lead"
                    onClick={() => router.push(`/leads/${lead.id}/edit`)}
                    className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      aria-label="Delete lead"
                      onClick={() => onDelete(lead.id)}
                      className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LeadsGrid({
  paginated,
  isLoading,
  isAdmin,
  router,
  onDelete,
}: {
  paginated: Lead[];
  isLoading?: boolean;
  isAdmin: boolean;
  router: AppRouterInstance;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {paginated.length === 0 && !isLoading && (
        <div className="col-span-full py-12 text-center text-slate-400 text-sm">
          No leads found.
        </div>
      )}
      {paginated.map((lead, idx) => (
        <div
          key={lead.id}
          className="card p-5 hover:shadow-md transition group relative overflow-hidden"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${rainbowGradients[idx % rainbowGradients.length]} pointer-events-none`}
          />
          <div className="flex justify-between items-start mb-4 relative">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800">{capitalize(lead.name)}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-semibold text-slate-400">{lead.email}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide ${statusConfig[lead.status]?.className || ""}`}
                  >
                    {statusConfig[lead.status]?.label || lead.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => router.push(`/leads/${lead.id}/edit`)}
                className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                title="Edit"
              >
                <Edit2 size={15} />
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onDelete(lead.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2 mb-4 relative">
            {lead.phone && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone size={13} className="text-slate-400" />
                {lead.phone}
              </div>
            )}
            {lead.counselor && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <UserCheck size={13} className="text-slate-400" />
                <span className="font-bold text-indigo-600">Counselor: {lead.counselor}</span>
              </div>
            )}
            {lead.interestedCountry && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {getCountryFlag(lead.interestedCountry) && (
                  <Image
                    src={getCountryFlag(lead.interestedCountry)}
                    alt=""
                    width={24}
                    height={24}
                    className="w-5 h-3.5 rounded-sm object-cover"
                  />
                )}
                {lead.interestedCountry}
              </div>
            )}
            {lead.source && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info size={13} className="text-slate-400" />
                Source: {lead.source}
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between relative">
            <div
              className={`flex items-center gap-2 text-xs ${isOverdue(lead.nextFollowUp) ? "text-rose-600" : "text-slate-500"}`}
            >
              <Calendar
                size={13}
                className={isOverdue(lead.nextFollowUp) ? "text-rose-500" : "text-slate-400"}
              />
              {formatDate(lead.nextFollowUp)}
              {isOverdue(lead.nextFollowUp) && (
                <span className="px-1.5 py-0.5 bg-rose-50 text-[9px] font-bold uppercase tracking-tighter rounded border border-rose-100">
                  Overdue
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeadsKanban({
  filtered,
  isAdmin,
  router,
  onDelete,
}: {
  filtered: Lead[];
  isAdmin: boolean;
  router: AppRouterInstance;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto p-5">
      {leadKanbanStatuses.map((col) => {
        const leadsInCol = filtered.filter((l) => l.status === col.key);
        return (
          <div key={col.key} className="min-w-[280px] max-w-[280px] flex-shrink-0">
            <div className="card p-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`size-2.5 rounded-full ${col.dot}`} />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {col.label}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {leadsInCol.length}
              </span>
            </div>
            <div className="space-y-3">
              {leadsInCol.map((lead) => (
                <div
                  key={lead.id}
                  className="card p-4 hover:shadow-md transition group relative overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${col.gradient} pointer-events-none`}
                  />
                  <button
                    type="button"
                    aria-label={`Edit ${lead.name}`}
                    onClick={() => router.push(`/leads/${lead.id}/edit`)}
                    className="absolute inset-0 z-0 cursor-pointer"
                  />
                  <div className="relative z-10 pointer-events-none">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">
                            {capitalize(lead.name)}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                        <button
                          type="button"
                          aria-label="Edit lead"
                          onClick={() => router.push(`/leads/${lead.id}/edit`)}
                          className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Edit2 size={12} />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            aria-label="Delete lead"
                            onClick={() => onDelete(lead.id)}
                            className="p-1 text-red-300 hover:text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5 relative">
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Phone size={10} className="text-slate-300" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.counselor && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <UserCheck size={10} className="text-slate-300" />
                          <span className="font-semibold text-indigo-500">{lead.counselor}</span>
                        </div>
                      )}
                      {lead.interestedCountry && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          {getCountryFlag(lead.interestedCountry) && (
                            <Image
                              src={getCountryFlag(lead.interestedCountry)}
                              alt=""
                              width={24}
                              height={24}
                              className="w-5 h-3.5 rounded-sm object-cover"
                            />
                          )}
                          {lead.interestedCountry}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between relative">
                      <span className="text-[9px] text-slate-400">
                        {lead.source && `via ${lead.source}`}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {formatDate(lead.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {leadsInCol.length === 0 && (
                <div className="card p-4">
                  <p className="text-[10px] text-slate-300 text-center">No leads</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
