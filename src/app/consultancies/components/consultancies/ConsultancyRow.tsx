import { Building2, CheckCircle2, Loader2, Package, Pencil, Power, Users, X } from "lucide-react";
import PackageBadge from "./PackageBadge";
import type { Consultancy } from "./types";
import { formatDate } from "./utils";

export default function ConsultancyRow({
  consultancy,
  isActive,
  isBusy,
  onSwitch,
  onEdit,
  onDelete,
}: {
  consultancy: Consultancy;
  isActive: boolean;
  isBusy: boolean;
  onSwitch: (value: string) => void;
  onEdit: (c: Consultancy) => void;
  onDelete: (c: Consultancy) => void;
}) {
  const c = consultancy;

  return (
    <tr className="hover:bg-slate-50">
      <td className="py-4 px-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center overflow-hidden">
            {c.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logoUrl} alt={c.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 size={16} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{c.code}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-5">
        {c.packageName ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
            <Package size={13} className="text-slate-400" /> {c.packageName}
          </span>
        ) : (
          <span className="text-sm text-slate-300">—</span>
        )}
      </td>
      <td className="py-4 px-5 text-sm text-slate-600">{formatDate(c.packageStartDate)}</td>
      <td className="py-4 px-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">{formatDate(c.packageExpiryDate)}</span>
          <PackageBadge expiry={c.packageExpiryDate} />
        </div>
      </td>
      <td className="py-4 px-5">
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          <Users size={13} className="text-slate-400" />
          {(c.userCount ?? 0).toLocaleString()}
          {c.maxUsers != null && (
            <span className="text-slate-400">/ {c.maxUsers.toLocaleString()}</span>
          )}
        </span>
      </td>
      <td className="py-4 px-5">
        {isActive ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={11} /> Active
          </span>
        ) : (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              c.status === "Active"
                ? "text-slate-500 bg-slate-50 border-slate-200"
                : "text-amber-600 bg-amber-50 border-amber-100"
            }`}
          >
            {c.status}
          </span>
        )}
      </td>
      <td className="py-4 px-5 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onSwitch(String(c.id))}
            disabled={isActive}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Switch to this consultancy"
          >
            <Power size={12} /> Switch
          </button>
          <button
            type="button"
            onClick={() => onEdit(c)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 text-slate-500 transition-colors"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(c)}
            disabled={isBusy}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-700 hover:text-red-500 disabled:opacity-40 transition-colors"
            title="Delete"
          >
            {isBusy ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
          </button>
        </div>
      </td>
    </tr>
  );
}
