import Image from "next/image";
import { Building2, GraduationCap, Pencil } from "lucide-react";
import { getCountryFlag } from "@/lib/country-flags";
import { amountDisplay } from "./helpers";
import type { CommissionRow } from "./types";

interface CommissionTableProps {
  rows: CommissionRow[];
  filteredRows: CommissionRow[];
  onEdit: (row: CommissionRow) => void;
}

function commissionBadge(type?: string | null) {
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
        type === "Percentage" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
      }`}
    >
      {type || "Percentage"}
    </span>
  );
}

function levelBadge(kind: "university" | "course") {
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
        kind === "university" ? "bg-violet-50 text-violet-600" : "bg-indigo-50 text-indigo-600"
      }`}
    >
      {kind === "university" ? <Building2 size={11} /> : <GraduationCap size={11} />}
      {kind}
    </span>
  );
}

export default function CommissionTable({ rows, filteredRows, onEdit }: CommissionTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Level
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                University / Course
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Commission Type
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Commission Value
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Currency
              </th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400 text-sm italic">
                  {rows.length === 0
                    ? "No commissions configured yet. Click “Add Commission” to set one up for a university or course."
                    : "No commissions match your search."}
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.key} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-4">{levelBadge(row.kind)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold overflow-hidden relative flex-shrink-0"
                        style={{
                          backgroundColor:
                            row.kind === "university" ? row.color || "#7c3aed" : "#6366f1",
                        }}
                      >
                        {row.logo ? (
                          <Image
                            src={row.logo}
                            alt=""
                            fill
                            className="object-contain"
                            sizes="32px"
                          />
                        ) : (
                          row.name[0] || "?"
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{row.name}</p>
                        <p className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-bold">
                          {row.kind === "university" && getCountryFlag(row.country) && (
                            <Image
                              src={getCountryFlag(row.country)}
                              alt=""
                              width={24}
                              height={24}
                              className="w-4 h-3 rounded-sm object-cover"
                            />
                          )}
                          {row.subtitle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">{commissionBadge(row.commissionType)}</td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-black text-slate-700 font-tabular">
                      {amountDisplay(row)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {row.commissionCurrency || "-"}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1d4ed8] hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
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
