"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Building2, CalendarClock, Image as ImageIcon, Loader2, Save, Upload } from "lucide-react";
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
}

interface FormState {
  name: string;
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

type SetForm = React.Dispatch<React.SetStateAction<FormState | null>>;

const inputClass =
  "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition";
const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

function toDateInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function toForm(c: Consultancy): FormState {
  return {
    name: c.name || "",
    email: c.email || "",
    phone: c.phone || "",
    website: c.website || "",
    address: c.address || "",
    logoUrl: c.logoUrl || "",
    packageName: c.packageName || "",
    packageStartDate: toDateInput(c.packageStartDate),
    packageExpiryDate: toDateInput(c.packageExpiryDate),
    maxUsers: c.maxUsers != null ? String(c.maxUsers) : "",
  };
}

function BrandingSection({
  form,
  setForm,
  readOnly,
  isUploading,
  fileInputRef,
  onLogoUpload,
}: {
  form: FormState;
  setForm: SetForm;
  readOnly: boolean;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onLogoUpload: (file: File) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-3">Branding</p>
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
          <label htmlFor="company-logo-url" className="sr-only">
            Logo URL
          </label>
          <input
            id="company-logo-url"
            type="text"
            value={form.logoUrl}
            onChange={(e) => setForm((f) => (f ? { ...f, logoUrl: e.target.value } : f))}
            placeholder="Logo URL (or upload a file)"
            disabled={readOnly}
            className={`${inputClass} disabled:opacity-60`}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Displayed in the sidebar in place of the UniTrack logo.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onLogoUpload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || readOnly}
          className="btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload
        </button>
      </div>

      <div className="mt-4">
        <label htmlFor="company-name" className={labelClass}>
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          id="company-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))}
          disabled={readOnly}
          className={`${inputClass} disabled:opacity-60`}
        />
      </div>
    </div>
  );
}

function ContactSection({
  form,
  setForm,
  readOnly,
}: {
  form: FormState;
  setForm: SetForm;
  readOnly: boolean;
}) {
  const fields: { id: string; label: string; type: string; key: keyof FormState }[] = [
    { id: "company-email", label: "Email", type: "email", key: "email" },
    { id: "company-phone", label: "Phone", type: "text", key: "phone" },
    { id: "company-website", label: "Website", type: "text", key: "website" },
    { id: "company-address", label: "Address", type: "text", key: "address" },
  ];

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-3">Contact</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className={labelClass}>
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type}
              value={form[field.key]}
              onChange={(e) => setForm((f) => (f ? { ...f, [field.key]: e.target.value } : f))}
              disabled={readOnly}
              className={`${inputClass} disabled:opacity-60`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PackageSection({ form, setForm }: { form: FormState; setForm: SetForm }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5">
        <CalendarClock size={12} /> Package &amp; Subscription
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company-package-name" className={labelClass}>
            Package Name
          </label>
          <input
            id="company-package-name"
            type="text"
            value={form.packageName}
            onChange={(e) => setForm((f) => (f ? { ...f, packageName: e.target.value } : f))}
            placeholder="e.g. Professional"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="company-max-users" className={labelClass}>
            Max Users
          </label>
          <input
            id="company-max-users"
            type="number"
            min={1}
            value={form.maxUsers}
            onChange={(e) => setForm((f) => (f ? { ...f, maxUsers: e.target.value } : f))}
            placeholder="Unlimited"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="company-start-date" className={labelClass}>
            Start Date
          </label>
          <input
            id="company-start-date"
            type="date"
            value={form.packageStartDate}
            onChange={(e) => setForm((f) => (f ? { ...f, packageStartDate: e.target.value } : f))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="company-expiry-date" className={labelClass}>
            Expiry Date
          </label>
          <input
            id="company-expiry-date"
            type="date"
            value={form.packageExpiryDate}
            onChange={(e) => setForm((f) => (f ? { ...f, packageExpiryDate: e.target.value } : f))}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

export default function CompanyProfileSettings() {
  const [consultancy, setConsultancy] = useState<Consultancy | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/consultancy", { cache: "no-store" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error || "Failed to load consultancy");
        return;
      }
      const data = await res.json();
      setConsultancy(data?.consultancy ?? null);
      setCanEdit(Boolean(data?.canEdit));
      setIsSuperAdmin(Boolean(data?.isSuperAdmin));
      setForm(data?.consultancy ? toForm(data.consultancy) : null);
    } catch {
      toast.error("Error connecting to backend");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  const handleLogoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error || "Failed to upload logo");
        return;
      }
      const data = await res.json();
      setForm((f) => (f ? { ...f, logoUrl: data.url } : f));
      toast.success("Logo uploaded");
    } catch {
      toast.error("Error uploading logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.name.trim()) {
      toast.error("Consultancy name is required");
      return;
    }

    setIsSaving(true);
    const payload: Record<string, string> = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      website: form.website.trim(),
      address: form.address.trim(),
      logoUrl: form.logoUrl.trim(),
    };
    if (isSuperAdmin) {
      payload.packageName = form.packageName.trim();
      payload.packageStartDate = form.packageStartDate;
      payload.packageExpiryDate = form.packageExpiryDate;
      payload.maxUsers = form.maxUsers.trim();
    }

    try {
      const res = await fetch("/api/consultancy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error || "Failed to save");
        return;
      }
      const data = await res.json();
      setConsultancy(data);
      setForm(toForm(data));
      toast.success("Consultancy profile updated");
    } catch {
      toast.error("Error connecting to backend");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
      </div>
    );
  }

  if (!consultancy || !form) {
    return (
      <div className="space-y-6 max-w-2xl animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Company Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your consultancy&apos;s branding and contact details.
            </p>
          </div>
        </div>
        <div className="card p-8 text-sm text-slate-500">
          {isSuperAdmin
            ? "You're currently viewing All Consultancies. Switch into a specific consultancy to edit its profile."
            : "No consultancy profile is linked to your account."}
        </div>
      </div>
    );
  }

  const readOnly = !canEdit;

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Building2 size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Company Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Branding (logo &amp; name) and contact details for{" "}
            <span className="font-mono font-semibold">{consultancy.code}</span>.
          </p>
        </div>
      </div>

      <div className="card p-8 space-y-6">
        <BrandingSection
          form={form}
          setForm={setForm}
          readOnly={readOnly}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          onLogoUpload={handleLogoUpload}
        />

        <ContactSection form={form} setForm={setForm} readOnly={readOnly} />

        {isSuperAdmin && <PackageSection form={form} setForm={setForm} />}

        {!readOnly && (
          <div className="flex items-center justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary mt-4"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={14} /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
