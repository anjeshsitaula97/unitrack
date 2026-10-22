"use client";

import { reportRowKey } from "./reportConfig";
import type { ReportTableProps } from "./types";

export default function ReportTable({ rows, fields }: ReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {fields.map((f) => (
              <th
                key={f}
                className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500"
              >
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row) => (
            <tr
              key={reportRowKey(row, fields)}
              className="border-b border-slate-50 hover:bg-slate-50"
            >
              {fields.map((f) => {
                const val = typeof row[f] === "object" ? JSON.stringify(row[f]) : row[f];
                const display = val === null || val === undefined ? "-" : String(val) || "-";
                return (
                  <td key={f} className="px-4 py-2.5 text-slate-700">
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 50 && (
        <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
          Showing 50 of {rows.length} rows
        </div>
      )}
    </div>
  );
}
