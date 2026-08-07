"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  BookOpen,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Timer,
  Eye,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  studentId: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  university: {
    name: string;
    country: string;
  };
  course: {
    name: string;
    level: string;
  };
  status: string;
  appliedDate: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  Submitted: "bg-blue-50 text-blue-700 border-blue-100",
  Processing: "bg-amber-50 text-amber-700 border-amber-100",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Rejected: "bg-red-50 text-red-700 border-red-100",
  Pending: "bg-slate-50 text-slate-700 border-slate-100",
};

const statusIcons: Record<string, any> = {
  Submitted: <FileText size={14} />,
  Processing: <Timer size={14} />,
  Approved: <CheckCircle2 size={14} />,
  Rejected: <AlertCircle size={14} />,
  Pending: <Clock size={14} />,
};

export default function ApplicationsContent() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const perPage = 10;

  const openApplication = (id: string) => {
    router.push(`/applications/${id}`);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${deletingId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Application deleted");
        setDeletingId(null);
        fetchApplications();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete application");
    } finally {
      setDeleting(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : data.data);
      }
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = useMemo(() => {
    return (applications ?? []).filter((app) => {
      const name = `${app.student.firstName} ${app.student.lastName}`.toLowerCase();
      const univ = app.university.name.toLowerCase();
      const course = app.course.name.toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = name.includes(query) || univ.includes(query) || course.includes(query);
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-indigo-600" />
            Applications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {filtered.length.toLocaleString()} applications matching your current filters
          </p>
        </div>
        <button
          onClick={() => router.push("/applications/new")}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          New Application
        </button>
      </div>

      <ApplicationStatsCards applications={applications} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <ApplicationFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <ApplicationTable
          isLoading={isLoading}
          filtered={filtered}
          paginated={paginated}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          onView={openApplication}
          onDelete={setDeletingId}
        />
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeletingId(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up p-8 text-center">
            <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Delete Application?</h3>
            <p className="text-sm text-slate-500 mb-8">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="animate-spin" size={14} />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationStatsCards({ applications }: { applications: Application[] | undefined }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        {
          label: "Total Applications",
          value: applications?.length ?? 0,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          label: "Processing",
          value: (applications ?? []).filter((a) => a.status === "Processing").length,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          label: "Approved",
          value: (applications ?? []).filter((a) => a.status === "Approved").length,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Rejected",
          value: (applications ?? []).filter((a) => a.status === "Rejected").length,
          color: "text-red-600",
          bg: "bg-red-50",
        },
      ].map((stat, idx) => (
        <div
          key={stat.label}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function ApplicationFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}) {
  return (
    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative flex-1 w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by student, university or course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="Processing">Processing</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
}

function ActionsDropdown({
  appId,
  onView,
  onDelete,
}: {
  appId: string;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 animate-fade-in">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onView(appId);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
          >
            <Eye size={14} /> View
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onView(appId);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
          >
            <Pencil size={14} /> Edit
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete(appId);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-all text-left"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function ApplicationTable({
  isLoading,
  filtered,
  paginated,
  page,
  setPage,
  totalPages,
  onView,
  onDelete,
}: {
  isLoading: boolean;
  filtered: Application[];
  paginated: Application[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <>
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Loading applications…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <FileText className="text-slate-200" size={32} />
          </div>
          <p className="text-slate-500 font-medium">No applications found</p>
          <p className="text-slate-400 text-sm">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Application ID
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Student
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  University & Course
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Date Applied
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onView?.(app.id)}
                      className="text-xs font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all text-left"
                    >
                      #{String(app.id).slice(-8).toUpperCase()}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {(
                          app.student.firstName?.[0] ||
                          app.student.lastName?.[0] ||
                          "?"
                        ).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {app.student.firstName || ""} {app.student.lastName || ""}
                        </p>
                        <p className="text-xs text-slate-400">{app.student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={12} className="text-slate-400" />
                        <p className="text-sm font-semibold text-slate-700">
                          {app.university.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={12} className="text-slate-400" />
                        <p className="text-xs text-slate-500">{app.course.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[app.status] || statusColors["Pending"]}`}
                    >
                      {statusIcons[app.status] || statusIcons["Pending"]}
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar size={12} />
                      <span className="text-xs font-medium">
                        {new Date(app.appliedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionsDropdown
                      appId={app.id}
                      onView={onView || (() => {})}
                      onDelete={onDelete || (() => {})}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-700 font-bold">{(page - 1) * 10 + 1}</span> to{" "}
            <span className="text-slate-700 font-bold">{Math.min(page * 10, filtered.length)}</span>{" "}
            of <span className="text-slate-700 font-bold">{filtered.length}</span> applications
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  type="button"
                  key={`page-${i}`}
                  onClick={() => setPage(i + 1)}
                  className={`size-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-400 hover:bg-slate-50 border border-slate-100"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
