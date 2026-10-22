"use client";

import Image from "next/image";
import Link from "next/link";
import { Handshake } from "lucide-react";
import { getCountryFlag } from "@/lib/country-flags";
import type { PartnershipsTableProps } from "./types";
import { currencySymbol, formatAmount } from "./utils";

export default function PartnershipsTable({ universities }: PartnershipsTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                University
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Partner
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Partnership Amount
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {universities.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400 text-sm italic">
                  No university partnerships found.
                </td>
              </tr>
            ) : (
              universities.map((univ) => (
                <tr key={univ.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold overflow-hidden relative"
                        style={{ backgroundColor: univ.color || "#6366f1" }}
                      >
                        {univ.logo ? (
                          <Image
                            src={univ.logo}
                            alt=""
                            fill
                            className="object-contain"
                            sizes="32px"
                          />
                        ) : (
                          univ.name[0] || "U"
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{univ.name}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-bold">
                          {getCountryFlag(univ.country) && (
                            <Image
                              src={getCountryFlag(univ.country)}
                              alt=""
                              width={24}
                              height={24}
                              className="w-4 h-3 rounded-sm object-cover"
                            />
                          )}
                          {univ.country || "Global"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                      <Handshake size={13} />
                      {univ.partner?.name || "Direct / None"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-black text-slate-700 font-tabular">
                      {univ.partnershipAmount
                        ? `${currencySymbol(univ.country)} ${formatAmount(univ.partnershipAmount)}`
                        : "-"}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <Link
                      href={`/universities/${univ.id}`}
                      className="text-xs font-bold text-[#1d4ed8] hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
