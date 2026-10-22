"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";
import { safeJson } from "@/lib/fetch-client";
import ViewModeToggle from "@/components/ViewModeToggle";
import { LeadsGrid, LeadsKanban, LeadsTable } from "./LeadsViews";
import { statusConfig, type Lead, type LeadStaff, type LeadUser } from "./leads-types";

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
        // The list is filtered/paginated client-side below, so we need the full
        // set. Without an explicit perPage the API defaulted to 20, which made
        // leads beyond the first page unreachable.
        fetch("/api/leads?perPage=500"),
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
              aria-label="Search leads by name or email"
              placeholder="Search leads by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>
          <select
            aria-label="Filter by status"
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
            aria-label="Filter by staff"
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
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>

        {viewMode === "table" ? (
          <LeadsTable
            paginated={paginated}
            isLoading={isLoading}
            isAdmin={isAdmin}
            router={router}
            onDelete={handleDelete}
          />
        ) : viewMode === "grid" ? (
          <LeadsGrid
            paginated={paginated}
            isLoading={isLoading}
            isAdmin={isAdmin}
            router={router}
            onDelete={handleDelete}
          />
        ) : (
          <LeadsKanban
            filtered={filtered}
            isAdmin={isAdmin}
            router={router}
            onDelete={handleDelete}
          />
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          perPage={perPage}
          total={filtered.length}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          noun="leads"
        />
      </div>
    </div>
  );
}
