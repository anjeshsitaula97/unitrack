"use client";

import React from "react";
import { Globe, ExternalLink } from "lucide-react";
import type { UniversityFormData, FormValue } from "./UniversityForm";

interface ContactCardProps {
  form: UniversityFormData;
  update: (field: string, value: FormValue) => void;
  isSuperAdmin?: boolean;
}

export default function ContactCard({ form, update, isSuperAdmin = false }: ContactCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-8 bg-emerald-50 rounded-lg flex items-center justify-center">
          <Globe size={16} className="text-emerald-600" />
        </div>
        <h2 className="text-base font-bold text-slate-700">Contact & Web</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="websiteUrl" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Website URL
          </label>
          <input
            id="websiteUrl"
            type="url"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://university.edu"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        {isSuperAdmin && (
          <div className="md:col-span-2">
            <label
              htmlFor="applicationLink"
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1.5"
            >
              <ExternalLink size={12} />
              Application Link
              <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                Super Admin only
              </span>
            </label>
            <input
              id="applicationLink"
              type="url"
              value={form.applicationLink}
              onChange={(e) => update("applicationLink", e.target.value)}
              placeholder="https://university.edu/apply"
              className="w-full px-3 py-2.5 text-sm border border-amber-200 rounded-lg bg-amber-50/40 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Direct application URL. Hidden from consultancy users.
            </p>
          </div>
        )}
        <div>
          <label
            htmlFor="contactEmail"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Contact Email
          </label>
          <input
            id="contactEmail"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="admissions@university.edu"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 (617) 253-0000"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Status
          </label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Address
          </label>
          <input
            id="address"
            type="text"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="77 Massachusetts Ave, Cambridge, MA 02139"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>
    </div>
  );
}
