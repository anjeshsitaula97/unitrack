"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Info,
  Loader2,
  UserCheck,
  Clock,
  LayoutGrid,
  Table,
  Columns3,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { safeJson } from "@/lib/fetch-client";
import { getCountryFlag } from "@/lib/country-flags";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (dateString: string) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isOverdue = (dateString: string) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

const statusConfig: Record<string, { label: string; className: string }> = {
  New: { label: "New Lead", className: "bg-blue-50 text-blue-700" },
  Contacted: { label: "Contacted", className: "bg-amber-50 text-amber-700" },
  Qualified: { label: "Qualified", className: "bg-emerald-50 text-emerald-700" },
  Converted: {
    label: "Converted",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-100",
  },
  Lost: { label: "Lost", className: "bg-rose-50 text-rose-700" },
};

const rainbowGradients = [
  "from-red-400/20 via-rose-300/10 to-transparent",
  "from-orange-400/20 via-amber-300/10 to-transparent",
  "from-yellow-400/20 via-amber-200/10 to-transparent",
  "from-green-400/20 via-emerald-300/10 to-transparent",
  "from-teal-400/20 via-cyan-300/10 to-transparent",
  "from-blue-400/20 via-indigo-300/10 to-transparent",
  "from-indigo-400/20 via-violet-300/10 to-transparent",
  "from-purple-400/20 via-fuchsia-300/10 to-transparent",
  "from-pink-400/20 via-rose-300/10 to-transparent",
  "from-sky-400/20 via-blue-300/10 to-transparent",
  "from-emerald-400/20 via-teal-300/10 to-transparent",
  "from-violet-400/20 via-purple-300/10 to-transparent",
];

const leadKanbanStatuses = [
  {
    key: "New",
    label: "New",
    dot: "bg-blue-500",
    gradient: "from-blue-400/20 via-indigo-300/10 to-transparent",
  },
  {
    key: "Contacted",
    label: "Contacted",
    dot: "bg-amber-500",
    gradient: "from-amber-400/20 via-orange-300/10 to-transparent",
  },
  {
    key: "Qualified",
    label: "Qualified",
    dot: "bg-emerald-500",
    gradient: "from-emerald-400/20 via-teal-300/10 to-transparent",
  },
  {
    key: "Converted",
    label: "Converted",
    dot: "bg-indigo-500",
    gradient: "from-indigo-400/20 via-violet-300/10 to-transparent",
  },
  {
    key: "Lost",
    label: "Lost",
    dot: "bg-rose-500",
    gradient: "from-rose-400/20 via-pink-300/10 to-transparent",
  },
];

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  counselor?: string;
  assignedDate?: string;
  phone?: string;
  nextFollowUp: string;
  interestedCountry?: string;
  source?: string;
  createdAt: string;
}

interface LeadUser {
  role?: string;
}

interface LeadStaff {
  id: string;
  name: string;
}

export default function LeadsContent() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentUser, setCurrentUser] = useState<LeadUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [allUsers, setAllUsers] = useState<LeadStaff[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [viewMode, setViewMode] = useState<"grid" | "table" | "kanban">("grid");

  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, userRes, usersRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/users"),
      ]);

      const [leadsData, userData, usersData] = await Promise.all([
        safeJson(leadsRes),
        safeJson(userRes),
        safeJson(usersRes),
      ]);

      if (leadsRes.ok) {
        setLeads(Array.isArray(leadsData) ? leadsData : leadsData.data || []);
      }
      if (userRes.ok) {
        setCurrentUser(userData);
      }
      if (usersRes.ok) {
        setAllUsers(usersData);
      }
    } catch (_err) {
      toast.error("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  });
  useEffect(() => {
    fetchDataRef.current();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Lead deleted");
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (_err) {
      toast.error("Error connecting to server");
    }
  };

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesStaff = staffFilter === "all" || lead.counselor === staffFilter;
      return matchesSearch && matchesStatus && matchesStaff;
    });
  }, [leads, search, statusFilter, staffFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const isAdmin = ["Admin", "Super Admin"].includes(currentUser?.role ?? "");

  return (
    <div className="animate-fade-in relative block">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Lead Management</h1>
          <p className="text-sm text-slate-400">
            {filtered.length.toLocaleString()} leads matching your current filters
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/leads/new")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={15} />
          Add New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">All Status</option>
            {Object.keys(statusConfig).map((s) => (
              <option key={s} value={s}>
                {statusConfig[s].label}
              </option>
            ))}
          </select>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">All Staff</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Table view"
            >
              <Table size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg transition-all ${viewMode === "kanban" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Kanban view"
            >
              <Columns3 size={16} />
            </button>
          </div>
        </div>

        {viewMode === "table" ? (
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
                          className={
                            isOverdue(lead.nextFollowUp) ? "text-rose-500" : "text-slate-400"
                          }
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
                          onClick={() => router.push(`/leads/${lead.id}/edit`)}
                          className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(lead.id)}
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
        ) : viewMode === "grid" ? (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.length === 0 && !isLoading && (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                No leads found.
              </div>
            )}
            {paginated.map((lead, idx) => (
              <div
                key={lead.id}
                className="card p-5 hover:shadow-md transition-all group relative overflow-hidden"
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
                        onClick={() => handleDelete(lead.id)}
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
        ) : (
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
                        className="card p-4 hover:shadow-md transition-all group relative cursor-pointer overflow-hidden"
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/leads/${lead.id}/edit`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(`/leads/${lead.id}/edit`);
                          }
                        }}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${col.gradient} pointer-events-none`}
                        />
                        <div className="flex items-start justify-between mb-3 relative">
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
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/leads/${lead.id}/edit`);
                              }}
                              className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                              <Edit2 size={12} />
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(lead.id);
                                }}
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
                              <span className="font-semibold text-indigo-500">
                                {lead.counselor}
                              </span>
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
        )}

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of{" "}
            {filtered.length} leads
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold px-3">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
