"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, CheckCircle, XCircle, Loader2, X, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface LeaveUser {
  id: number;
  name: string;
  email: string;
  employeeId: string | null;
  avatar: string | null;
}

interface LeaveTypeInfo {
  id: number;
  name: string;
}

interface LeaveRequestItem {
  id: number;
  userId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  approvedBy: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: LeaveUser;
  leaveType: LeaveTypeInfo;
  approver: { id: number; name: string } | null;
}

interface LeaveType {
  id: number;
  name: string;
  description: string | null;
  daysPerYear: number;
  createdAt: string;
  updatedAt: string;
}

function BackToHrTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Link href="/hr" className="text-slate-400 hover:text-slate-600">
        <ArrowLeft size={16} />
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    </div>
  );
}

function LeavePageHeader({ total, onApply }: { total: number; onApply: () => void }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <BackToHrTitle title="Leave Management" />
        <p className="text-sm text-slate-400">{total} total requests</p>
      </div>
      <button type="button" onClick={onApply} className="btn-primary flex items-center gap-2">
        <Plus size={15} /> Apply Leave
      </button>
    </div>
  );
}

function LeaveSummaryCard({
  icon,
  iconClasses,
  label,
  value,
  valueClasses,
}: {
  icon: React.ReactNode;
  iconClasses: string;
  label: string;
  value: number;
  valueClasses: string;
}) {
  return (
    <div className="card px-4 py-3 flex items-center gap-3">
      <div className={`size-8 rounded-lg flex items-center justify-center ${iconClasses}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-400 font-medium">{label}</div>
        <div className={`text-lg font-bold ${valueClasses}`}>{value}</div>
      </div>
    </div>
  );
}

function Th({ children, className = "p-3" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`${className} text-[11px] font-bold text-slate-400 uppercase tracking-widest`}>
      {children}
    </th>
  );
}

function LeaveTableHead() {
  return (
    <thead className="bg-slate-50/60 border-b border-slate-100">
      <tr>
        <Th className="py-3 px-5">Employee</Th>
        <Th>Leave Type</Th>
        <Th>From</Th>
        <Th>To</Th>
        <Th>Reason</Th>
        <Th>Status</Th>
        <Th className="p-3 text-right pr-5">Actions</Th>
      </tr>
    </thead>
  );
}

function LeaveRequestModal({
  types,
  form,
  setForm,
  submitting,
  onSubmit,
  onClose,
}: {
  types: LeaveType[];
  form: { leaveTypeId: string; startDate: string; endDate: string; reason: string };
  setForm: React.Dispatch<
    React.SetStateAction<{
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason: string;
    }>
  >;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Apply for Leave</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="leave-type"
              className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
            >
              Leave Type
            </label>
            <select
              id="leave-type"
              required
              value={form.leaveTypeId}
              onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm appearance-none"
            >
              <option value="">Select type…</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.daysPerYear} days/yr)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="leave-startDate"
                className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
              >
                Start Date
              </label>
              <input
                id="leave-startDate"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="leave-endDate"
                className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
              >
                End Date
              </label>
              <input
                id="leave-endDate"
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="leave-reason"
              className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
            >
              Reason
            </label>
            <textarea
              id="leave-reason"
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Reason for leave"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-8 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeaveContent() {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, typeRes] = await Promise.all([
        fetch(`/api/hr/leave/requests${statusFilter ? `?status=${statusFilter}` : ""}`),
        fetch("/api/hr/leave/types"),
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (typeRes.ok) setTypes(await typeRes.json());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);
  useEffect(() => {
    fetchDataRef.current();
  }, [statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/leave/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Leave request submitted");
        setShowModal(false);
        setForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to submit");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/hr/leave/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Leave ${status.toLowerCase()}`);
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to update");
      }
    } catch {
      toast.error("Error connecting to server");
    }
  };

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="animate-fade-in">
      <LeavePageHeader total={requests.length} onApply={() => setShowModal(true)} />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <LeaveSummaryCard
          icon={<Clock size={14} />}
          iconClasses="bg-amber-50 text-amber-600"
          label="Pending"
          value={pendingCount}
          valueClasses="text-amber-700"
        />
        <LeaveSummaryCard
          icon={<CheckCircle size={14} />}
          iconClasses="bg-emerald-50 text-emerald-600"
          label="Approved"
          value={approvedCount}
          valueClasses="text-emerald-700"
        />
        <LeaveSummaryCard
          icon={<XCircle size={14} />}
          iconClasses="bg-rose-50 text-rose-600"
          label="Rejected"
          value={rejectedCount}
          valueClasses="text-rose-700"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
          {["", "Pending", "Approved", "Rejected"].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${statusFilter === s ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <LeaveTableHead />
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto" size={24} />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No leave requests
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {r.user.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{r.user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs text-slate-600">{r.leaveType.name}</span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs text-slate-600">
                        {new Date(r.startDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs text-slate-600">
                        {new Date(r.endDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs text-slate-600 max-w-[150px] truncate block">
                        {r.reason}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          r.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : r.status === "Rejected"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right pr-5">
                      {r.status === "Pending" && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatus(r.id, "Approved")}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatus(r.id, "Rejected")}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <LeaveRequestModal
          types={types}
          form={form}
          setForm={setForm}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
