"use client";

import { Globe, Handshake, Mail, Phone } from "lucide-react";
import type { PartnerCardProps } from "./types";
import { parseCountries } from "./utils";

export default function PartnerCard({ partner, universityCount }: PartnerCardProps) {
  const countries = parseCountries(partner.countries);
  const univCount = universityCount;

  return (
    <div className="card p-5 hover:shadow-md transition duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <Handshake size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800 truncate">{partner.name}</h3>
          {partner.contactPerson && (
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
              {partner.contactPerson}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1.5 mb-4 text-xs text-slate-500">
        {partner.email && (
          <div className="flex items-center gap-2">
            <Mail size={12} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{partner.email}</span>
          </div>
        )}
        {partner.phone && (
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{partner.phone}</span>
          </div>
        )}
        {countries.length > 0 && (
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{countries.join(", ")}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        <div className="text-center">
          <p className="text-sm font-black text-slate-700 font-tabular">{univCount}</p>
          <p className="text-[10px] text-slate-400">Universities</p>
        </div>
        <div className="text-center border-x border-slate-100">
          <p className="text-sm font-black text-slate-700 font-tabular">
            {partner._count?.students || 0}
          </p>
          <p className="text-[10px] text-slate-400">Students</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-indigo-600 font-tabular">{countries.length}</p>
          <p className="text-[10px] text-slate-400">Countries</p>
        </div>
      </div>
    </div>
  );
}
