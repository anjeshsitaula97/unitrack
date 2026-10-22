import type { Dispatch, RefObject, SetStateAction } from "react";
import { CalendarClock, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { inputClass, labelClass, type Consultancy, type FormState } from "./types";

export default function ConsultancyFormFields({
  form,
  setForm,
  editing,
  isUploading,
  fileInputRef,
  onLogoUpload,
}: {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  editing: Consultancy | null;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onLogoUpload: (file: File) => void;
}) {
  return (
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
              if (file) onLogoUpload(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
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
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-3">Contact</p>
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
              onChange={(e) => setForm((f) => ({ ...f, packageExpiryDate: e.target.value }))}
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
  );
}
