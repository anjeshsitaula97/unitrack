"use client";

import React from "react";
import { Building2, AlertCircle } from "lucide-react";
import type { UniversityFormData, FormValue } from "./UniversityForm";

interface BasicInfoCardProps {
  form: UniversityFormData;
  errors: Record<string, string>;
  update: (field: string, value: FormValue) => void;
  COUNTRIES: { name: string; currency: string; currencySymbol?: string }[];
}

export default function BasicInfoCard({ form, errors, update, COUNTRIES }: BasicInfoCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Building2 size={16} className="text-indigo-600" />
        </div>
        <h2 className="text-base font-bold text-slate-700">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label
            htmlFor="universityName"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            University Full Name *
          </label>
          <input
            id="universityName"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Massachusetts Institute of Technology"
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${errors.name ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={11} />
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="shortName" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Short Name / Abbreviation
          </label>
          <input
            id="shortName"
            type="text"
            value={form.shortName}
            onChange={(e) => update("shortName", e.target.value)}
            placeholder="e.g. MIT"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label
            htmlFor="institutionType"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Institution Type
          </label>
          <select
            id="institutionType"
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="Non-profit">Non-profit</option>
            <option value="For-profit">For-profit</option>
          </select>
        </div>

        <div>
          <label htmlFor="country" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Country *
          </label>
          <select
            id="country"
            value={form.country}
            onChange={(e) => {
              const countryName = e.target.value;
              update("country", countryName);
              const countryData = COUNTRIES.find((c) => c.name === countryName);
              if (countryData) {
                update("commissionCurrency", countryData.currency);
              }
            }}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer ${errors.country ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
          >
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={11} />
              {errors.country}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="foundedYear"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Founded Year
          </label>
          <input
            id="foundedYear"
            type="number"
            value={form.foundedYear}
            onChange={(e) => update("foundedYear", e.target.value)}
            placeholder="e.g. 1861"
            min="1000"
            max="2026"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label htmlFor="ranking" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Global Ranking
          </label>
          <input
            id="ranking"
            type="number"
            value={form.ranking}
            onChange={(e) => update("ranking", e.target.value)}
            placeholder="e.g. 1"
            min="1"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Brief description of the university..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
