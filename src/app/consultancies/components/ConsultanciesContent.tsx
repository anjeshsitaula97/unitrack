"use client";

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Globe2,
  Image as ImageIcon,
  Loader2,
  Package,
  Pencil,
  Plus,
  Power,
  Upload,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Consultancy {
  id: number;
  code: string;
  name: string;
  status: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  logoUrl: string | null;
  packageName: string | null;
  packageStartDate: string | null;
  packageExpiryDate: string | null;
  maxUsers: number | null;
  createdAt: string;
  userCount?: number;
}

interface FormState {
  name: string;
  status: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logoUrl: string;
  packageName: string;
  packageStartDate: string;
  packageExpiryDate: string;
  maxUsers: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  status: "Active",
  email: "",
  phone: "",
  website: "",
  address: "",
  logoUrl: "",
  packageName: "",
  packageStartDate: "",
  packageExpiryDate: "",
  maxUsers: "",
};

const inputClass =
  "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition";

const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

function readActiveCookie(): string {
  if (typeof document === "undefined") return "all";
  const match = document.cookie.match(/(?:^|; )active_consultancy=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "all";
}

const emptySubscribe = () => () => {};

/** Convert an ISO timestamp into the `yyyy-mm-dd` a date input expects. */
function toDateInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Days until expiry, negative when past. Null when no expiry is set. */
function daysToExpiry(value: string | null): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function PackageBadge({ expiry }: { expiry: string | null }) {
  const days = daysToExpiry(expiry);
  if (days === null) {
    return <span className="text-[11px] text-slate-400">No expiry</span>;
  }
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
        Expired {Math.abs(days)}d ago
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
        Expires in {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
      Active
    </span>
  );
}

export default function ConsultanciesContent() {
  const [consultancies, setConsultancies] = useState<Consultancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeId = useSyncExternalStore(emptySubscribe, readActiveCookie, () => "all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Consultancy | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/consultancies", { cache: "no-store" });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setConsultancies(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load consultancies");
      setConsultancies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: Consultancy) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      status: c.status || "Active",
      email: c.email || "",
      phone: c.phone || "",
      website: c.website || "",
      address: c.address || "",
      logoUrl: c.logoUrl || "",
      packageName: c.packageName || "",
      packageStartDate: toDateInput(c.packageStartDate),
      packageExpiryDate: toDateInput(c.packageExpiryDate),
      maxUsers: c.maxUsers != null ? String(c.maxUsers) : "",
    });
    setModalOpen(true);
  };

  const handleLogoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to upload logo");
        return;
      }
      const data = await res.json().catch(() => null);
      setForm((f) => ({ ...f, logoUrl: data.url }));
      toast.success("Logo uploaded");
    } catch {
      toast.error("Error uploading logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      toast.error("Consultancy name is required");
      return;
    }

    setIsSaving(true);
    const payload = {
      name,
      status: form.status,
      email: form.email.trim(),
      phone: form.phone.trim(),
      website: form.website.trim(),
      address: form.address.trim(),
      logoUrl: form.logoUrl.trim(),
      packageName: form.packageName.trim(),
      packageStartDate: form.packageStartDate || "",
      packageExpiryDate: form.packageExpiryDate || "",
      maxUsers: form.maxUsers.trim(),
    };

    try {
      const res = await fetch(editing ? `/api/consultancies/${editing.id}` : "/api/consultancies", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to save consultancy");
        return;
      }
      toast.success(editing ? "Consultancy updated" : "Consultancy created");
      setModalOpen(false);
      await load();
    } catch {
      toast.error("Error connecting to backend");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (c: Consultancy) => {
    if (
      !confirm(
        `Delete "${c.name}" (${c.code})? This permanently removes the consultancy and its default roles and settings.`
      )
    )
      return;

    setBusyId(c.id);
    try {
      const res = await fetch(`/api/consultancies/${c.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to delete consultancy");
        return;
      }
      toast.success("Consultancy deleted");
      if (activeId === String(c.id)) {
        document.cookie = "active_consultancy=all; path=/; max-age=0";
        window.location.reload();
        return;
      }
      await load();
    } catch {
      toast.error("Error connecting to backend");
    } finally {
      setBusyId(null);
    }
  };

  const switchTo = (value: string) => {
    document.cookie = `active_consultancy=${encodeURIComponent(value)}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;
    toast.success(value === "all" ? "Viewing all consultancies" : "Switched consultancy");
    // Reload so every server-rendered surface re-scopes to the selection.
    window.location.reload();
  };

  const isActive = (c: Consultancy) => activeId === String(c.id);
  const colCount = 7;

  return (
    <div className="animate-fade-in relative block min-h-[400px]">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Consultancies</h1>
          <p className="text-sm text-slate-400">
            {consultancies.length.toLocaleString()} consultanc
            {consultancies.length === 1 ? "y" : "ies"} on the platform
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary" aria-label="Add">
          <Plus size={15} /> New Consultancy
        </button>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3 text-indigo-700 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <Building2 className="flex-shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-bold">Fully isolated workspaces</h4>
            <p className="text-xs mt-1">
              Each consultancy sees only its own records, roles and branding. Use{" "}
              <span className="font-semibold">View All</span> to work across the platform, or switch
              into a single consultancy to scope every screen, list and report to it.
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead className="bg-slate-50/60">
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                  Consultancy
                </th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                  Package
                </th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                  Start Date
                </th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                  Expiry Date
                </th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                  Users
                </th>
                <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                  Status
                </th>
                <th className="text-right py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="bg-slate-50/40">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Globe2 size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">All Consultancies</p>
                      <p className="text-[11px] text-slate-400">Platform-wide view</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5 text-sm text-slate-400">—</td>
                <td className="py-4 px-5 text-sm text-slate-400">—</td>
                <td className="py-4 px-5 text-sm text-slate-400">—</td>
                <td className="py-4 px-5 text-sm text-slate-400">—</td>
                <td className="py-4 px-5">
                  {activeId === "all" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">—</span>
                  )}
                </td>
                <td className="py-4 px-5 text-right">
                  {activeId !== "all" && (
                    <button
                      type="button"
                      onClick={() => switchTo("all")}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      View All
                    </button>
                  )}
                </td>
              </tr>

              {consultancies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center overflow-hidden">
                        {c.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.logoUrl}
                            alt={c.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 size={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{c.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    {c.packageName ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Package size={13} className="text-slate-400" /> {c.packageName}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-sm text-slate-600">
                    {formatDate(c.packageStartDate)}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-600">
                        {formatDate(c.packageExpiryDate)}
                      </span>
                      <PackageBadge expiry={c.packageExpiryDate} />
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Users size={13} className="text-slate-400" />
                      {(c.userCount ?? 0).toLocaleString()}
                      {c.maxUsers != null && (
                        <span className="text-slate-400">/ {c.maxUsers.toLocaleString()}</span>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    {isActive(c) ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> Active
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          c.status === "Active"
                            ? "text-slate-500 bg-slate-50 border-slate-200"
                            : "text-amber-600 bg-amber-50 border-amber-100"
                        }`}
                      >
                        {c.status}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => switchTo(String(c.id))}
                        disabled={isActive(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Switch to this consultancy"
                      >
                        <Power size={12} /> Switch
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 text-slate-500 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        disabled={busyId === c.id}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-700 hover:text-red-500 disabled:opacity-40 transition-colors"
                        title="Delete"
                      >
                        {busyId === c.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <X size={13} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && consultancies.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="py-12 text-center text-sm text-slate-400">
                    No consultancies yet. Create the first one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white rounded-2xl shadow-xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {editing ? `Edit ${editing.code}` : "New Consultancy"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Branding */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-3">
                  Branding
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {form.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={22} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="consultancy-logo-url" className={labelClass}>
                      Logo URL
                    </label>
                    <input
                      id="consultancy-logo-url"
                      type="text"
                      value={form.logoUrl}
                      onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                      placeholder="Logo URL (or upload a file)"
                      className={inputClass}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Shown in the sidebar of this consultancy&apos;s workspace.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    Upload
                  </button>
                </div>

                <div className="mt-4">
                  <label htmlFor="consultancy-name" className={labelClass}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="consultancy-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Great Gateway to Abroad Consultancy"
                    className={inputClass}
                    autoFocus
                  />
                  {!editing && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      A sequential code (C001, C002…) is assigned automatically.
                    </p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-3">
                  Contact
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="consultancy-email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="consultancy-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="consultancy-phone" className={labelClass}>
                      Phone
                    </label>
                    <input
                      id="consultancy-phone"
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="consultancy-website" className={labelClass}>
                    Website
                  </label>
                  <input
                    id="consultancy-website"
                    type="text"
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="consultancy-address" className={labelClass}>
                    Address
                  </label>
                  <textarea
                    id="consultancy-address"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              {/* Package */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5">
                  <CalendarClock size={12} /> Package &amp; Subscription
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="consultancy-package-name" className={labelClass}>
                      Package Name
                    </label>
                    <input
                      id="consultancy-package-name"
                      type="text"
                      value={form.packageName}
                      onChange={(e) => setForm((f) => ({ ...f, packageName: e.target.value }))}
                      placeholder="e.g. Professional"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="consultancy-max-users" className={labelClass}>
                      Max Users
                    </label>
                    <input
                      id="consultancy-max-users"
                      type="number"
                      min={1}
                      value={form.maxUsers}
                      onChange={(e) => setForm((f) => ({ ...f, maxUsers: e.target.value }))}
                      placeholder="Unlimited"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="consultancy-start-date" className={labelClass}>
                      Start Date
                    </label>
                    <input
                      id="consultancy-start-date"
                      type="date"
                      value={form.packageStartDate}
                      onChange={(e) => setForm((f) => ({ ...f, packageStartDate: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="consultancy-expiry-date" className={labelClass}>
                      Expiry Date
                    </label>
                    <input
                      id="consultancy-expiry-date"
                      type="date"
                      value={form.packageExpiryDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, packageExpiryDate: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="consultancy-status" className={labelClass}>
                  Status
                </label>
                <select
                  id="consultancy-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className={inputClass}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving…
                  </>
                ) : editing ? (
                  "Save Changes"
                ) : (
                  "Create Consultancy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
