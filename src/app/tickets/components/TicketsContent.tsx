"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Ticket as TicketIcon,
  Plus,
  Search,
  Loader2,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Bug,
  Sparkles,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  screenshot: string | null;
  creatorId: string;
  creator: { name: string; avatar: string | null };
  createdAt: string;
  updatedAt: string;
}

const TICKET_TYPES = ["Technical", "Feature Request"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export default function TicketsContent() {
  const [tickets, setTickets] = useState<Ticket[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    priority: "",
    screenshot: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) setTickets(await res.json());
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketsRef = useRef(fetchTickets);
  useEffect(() => {
    fetchTicketsRef.current();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, screenshot: data.url }));
    } catch {
      toast.error("Failed to upload screenshot");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.type) newErrors.type = "Category is required";
    if (!formData.priority) newErrors.priority = "Priority is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Ticket submitted successfully");
        setShowModal(false);
        setErrors({});
        fetchTickets();
        setFormData({
          title: "",
          description: "",
          type: "",
          priority: "",
          screenshot: "",
        });
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to submit ticket");
      }
    } catch {
      toast.error("Failed to submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast.success("Ticket status updated");
        fetchTickets();
      }
    } catch {
      toast.error("Failed to update ticket");
    }
  };

  const filtered = useMemo(() => {
    return (tickets ?? []).filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) &&
        (statusFilter === "all" || t.status === statusFilter) &&
        (typeFilter === "all" || t.type === typeFilter)
      );
    });
  }, [tickets, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(
    () => ({
      open: (tickets ?? []).filter((t) => t.status === "Open").length,
      inProgress: (tickets ?? []).filter((t) => t.status === "In Progress").length,
      resolved: (tickets ?? []).filter((t) => t.status === "Resolved").length,
    }),
    [tickets]
  );

  const statCards = [
    { label: "Open", value: stats.open, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Support Tickets</h1>
          <p className="text-sm text-slate-400">{filtered.length.toLocaleString()} tickets</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
            >
              <div
                className={`size-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}
              >
                <Icon size={20} />
              </div>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-400 font-medium">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters + List */}
      <div className="card overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              {TICKET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex items-center justify-center text-slate-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <TicketIcon size={32} className="mx-auto opacity-30" />
            <p className="text-sm font-medium">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                        ticket.type === "Technical"
                          ? "bg-red-50 text-red-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {ticket.type === "Technical" ? <Bug size={18} /> : <Sparkles size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-800 text-sm">{ticket.title}</h3>
                        <span
                          className={`badge ${
                            ticket.status === "Open"
                              ? "bg-blue-50 text-blue-700"
                              : ticket.status === "In Progress"
                                ? "bg-amber-50 text-amber-700"
                                : ticket.status === "Resolved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {ticket.status}
                        </span>
                        <span
                          className={`badge ${
                            ticket.priority === "Urgent"
                              ? "bg-red-600 text-white"
                              : ticket.priority === "High"
                                ? "bg-red-50 text-red-700"
                                : ticket.priority === "Medium"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{ticket.creator.name}</span>
                        <span>&middot;</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket.screenshot && (
                          <>
                            <span>&middot;</span>
                            <a
                              href={ticket.screenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                            >
                              <ImageIcon size={12} /> Screenshot
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ticket.id, "Resolved")}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        Resolve
                      </button>
                    )}
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
          role="button"
          tabIndex={0}
          onClick={() => { setShowModal(false); setErrors({}); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowModal(false);
              setErrors({});
            }
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">New Ticket</h2>
                <p className="text-sm text-slate-400">Report a bug or suggest a feature.</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowModal(false); setErrors({}); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                <input
                  required
                  placeholder="Summarize the issue or feature..."
                  value={formData.title}
                  onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (errors.title) setErrors({...errors, title: ""}); }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm ${errors.title ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => { setFormData({ ...formData, type: e.target.value }); if (errors.type) setErrors({...errors, type: ""}); }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm ${errors.type ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                  >
                    <option value="">Select category...</option>
                    {TICKET_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => { setFormData({ ...formData, priority: e.target.value }); if (errors.priority) setErrors({...errors, priority: ""}); }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm ${errors.priority ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                  >
                    <option value="">Select priority...</option>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Steps to reproduce or objective..."
                  value={formData.description}
                  onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({...errors, description: ""}); }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Screenshot (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="ss-upload"
                />
                <label
                  htmlFor="ss-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors group"
                >
                  {formData.screenshot ? (
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg overflow-hidden border border-slate-200 relative shrink-0">
                        <Image
                          src={formData.screenshot}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Attached &middot; click to change
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-indigo-500 transition-colors">
                        <Upload size={18} />
                      </div>
                      <p className="text-sm text-slate-500">Upload screenshot</p>
                    </>
                  )}
                </label>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setErrors({}); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-[2] justify-center disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
