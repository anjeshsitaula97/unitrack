"use client";

import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { UniversityFormData, FormValue, Partner } from "./UniversityForm";

interface PartnershipCardProps {
  form: UniversityFormData;
  update: (field: string, value: FormValue) => void;
  partners: Partner[];
  COUNTRIES: { name: string; currency: string; currencySymbol?: string }[];
}

export default function PartnershipCard({
  form,
  update,
  partners,
  COUNTRIES,
}: PartnershipCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Plus size={16} className="text-indigo-600" />
          </div>
          <h2 className="text-base font-bold text-slate-700">Partnership & Commission</h2>
        </div>
        <label
          htmlFor="partnershipNA"
          className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <input
            id="partnershipNA"
            type="checkbox"
            checked={form.isPartnershipNA}
            onChange={(e) => update("isPartnershipNA", e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-xs font-bold text-slate-600">Not Applicable</span>
        </label>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${form.isPartnershipNA ? "opacity-40 pointer-events-none" : ""}`}
      >
        <div className="md:col-span-2">
          <label htmlFor="partnerId" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Select Partner
          </label>
          <div className="flex gap-2">
            <select
              id="partnerId"
              value={form.partnerId}
              onChange={(e) => update("partnerId", e.target.value)}
              disabled={form.isPartnershipNA}
              className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:cursor-not-allowed"
            >
              <option value="">Select a partner from settings…</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Link
              href="/partnership"
              className={`btn-secondary whitespace-nowrap ${form.isPartnershipNA ? "opacity-50" : ""}`}
              title="Manage Partners"
            >
              <Plus size={14} />
              Manage
            </Link>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 italic">
            Choose a partner registered in the Partnership module.
          </p>
        </div>

        <div>
          <label
            htmlFor="partnershipAmount"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Partnership Amount
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
              {COUNTRIES.find((c) => c.name === form.country)?.currencySymbol || "$"}
            </div>
            <input
              id="partnershipAmount"
              type="number"
              value={form.partnershipAmount}
              onChange={(e) => update("partnershipAmount", e.target.value)}
              disabled={form.isPartnershipNA}
              placeholder="e.g. 5000"
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 italic">
            Amount paid for the partnership agreement.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="commissionType"
              className="block text-xs font-semibold text-slate-600 mb-1.5"
            >
              Commission Type
            </label>
            <select
              id="commissionType"
              value={form.commissionType}
              onChange={(e) => update("commissionType", e.target.value)}
              disabled={form.isPartnershipNA}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:cursor-not-allowed"
            >
              <option value="Percentage">Percentage (%)</option>
              <option value="Flat">Flat Amount</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="commissionValue"
              className="block text-xs font-semibold text-slate-600 mb-1.5"
            >
              Value
            </label>
            <div className="relative">
              <input
                id="commissionValue"
                type="number"
                value={form.commissionValue}
                onChange={(e) => update("commissionValue", e.target.value)}
                disabled={form.isPartnershipNA}
                placeholder={form.commissionType === "Percentage" ? "e.g. 15" : "e.g. 1000"}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed"
              />
              {form.commissionType === "Percentage" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  %
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="commissionCurrency"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Commission Currency
          </label>
          <select
            id="commissionCurrency"
            value={form.commissionCurrency}
            onChange={(e) => update("commissionCurrency", e.target.value)}
            disabled={form.isPartnershipNA}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:cursor-not-allowed"
          >
            <option value="">Select currency…</option>
            {Array.from(new Set(COUNTRIES.map((c) => c.currency)))
              .sort()
              .map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
}
