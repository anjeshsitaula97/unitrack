"use client";

import { X } from "lucide-react";
import { COUNTRIES } from "@/lib/data/countries";
import type { AddPartnerFormProps } from "./types";

export default function AddPartnerForm({
  partner,
  onChange,
  onClose,
  onCreate,
}: AddPartnerFormProps) {
  return (
    <div className="card p-6 border-2 border-indigo-100 animate-slide-down mb-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800">Register New Partner Company</h3>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <label
            htmlFor="partnership-partner-name"
            className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
          >
            Partner Name
          </label>
          <input
            id="partnership-partner-name"
            type="text"
            value={partner.name}
            onChange={(e) => onChange({ ...partner, name: e.target.value })}
            placeholder="e.g. UniPath International"
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
          />
        </div>
        <div>
          <label
            htmlFor="partnership-partner-contact"
            className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
          >
            Contact Person
          </label>
          <input
            id="partnership-partner-contact"
            type="text"
            value={partner.contactPerson}
            onChange={(e) => onChange({ ...partner, contactPerson: e.target.value })}
            placeholder="e.g. John Doe"
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
          />
        </div>
        <div>
          <label
            htmlFor="partnership-partner-email"
            className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
          >
            Email Address
          </label>
          <input
            id="partnership-partner-email"
            type="email"
            value={partner.email}
            onChange={(e) => onChange({ ...partner, email: e.target.value })}
            placeholder="partner@example.com"
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
          />
        </div>
        <div>
          <label
            htmlFor="partnership-partner-phone"
            className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
          >
            Phone Number
          </label>
          <input
            id="partnership-partner-phone"
            type="tel"
            value={partner.phone}
            onChange={(e) => onChange({ ...partner, phone: e.target.value })}
            placeholder="+977 9800 000 000"
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
          />
        </div>
        <div>
          <label
            htmlFor="partnership-partner-address"
            className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
          >
            Office Address
          </label>
          <input
            id="partnership-partner-address"
            type="text"
            value={partner.address}
            onChange={(e) => onChange({ ...partner, address: e.target.value })}
            placeholder="Kathmandu, Nepal"
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
          />
        </div>
        <div>
          <label
            htmlFor="partnership-partner-countries"
            className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
          >
            Countries
          </label>
          {partner.countries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {partner.countries.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold inline-flex items-center gap-1"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...partner,
                        countries: partner.countries.filter((x) => x !== c),
                      })
                    }
                    className="hover:text-red-500"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
          <select
            id="partnership-partner-countries"
            value=""
            onChange={(e) => {
              if (e.target.value && !partner.countries.includes(e.target.value))
                onChange({
                  ...partner,
                  countries: [...partner.countries, e.target.value],
                });
            }}
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
          >
            <option value="">Select a country...</option>
            {COUNTRIES.filter((c) => !new Set(partner.countries).has(c.name)).map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={onCreate} className="btn-primary">
          Create Partner
        </button>
      </div>
    </div>
  );
}
