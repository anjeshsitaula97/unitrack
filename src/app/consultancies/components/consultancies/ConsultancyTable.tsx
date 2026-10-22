import { CheckCircle2, Globe2 } from "lucide-react";
import ConsultancyRow from "./ConsultancyRow";
import type { Consultancy } from "./types";

export default function ConsultancyTable({
  consultancies,
  isLoading,
  activeId,
  busyId,
  onSwitch,
  onEdit,
  onDelete,
  isActive,
}: {
  consultancies: Consultancy[];
  isLoading: boolean;
  activeId: string;
  busyId: number | null;
  onSwitch: (value: string) => void;
  onEdit: (c: Consultancy) => void;
  onDelete: (c: Consultancy) => void;
  isActive: (c: Consultancy) => boolean;
}) {
  const colCount = 7;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px]">
          <thead className="bg-slate-50/60">
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Consultancy
              </th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Package
              </th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Start Date
              </th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Expiry Date
              </th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Users
              </th>
              <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Status
              </th>
              <th className="text-right py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr className="bg-slate-50/40">
              <td className="py-4 px-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Globe2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">All Consultancies</p>
                    <p className="text-[11px] text-slate-400">Platform-wide view</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-5 text-sm text-slate-400">—</td>
              <td className="py-4 px-5 text-sm text-slate-400">—</td>
              <td className="py-4 px-5 text-sm text-slate-400">—</td>
              <td className="py-4 px-5 text-sm text-slate-400">—</td>
              <td className="py-4 px-5">
                {activeId === "all" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} /> Active
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">—</span>
                )}
              </td>
              <td className="py-4 px-5 text-right">
                {activeId !== "all" && (
                  <button
                    type="button"
                    onClick={() => onSwitch("all")}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    View All
                  </button>
                )}
              </td>
            </tr>

            {consultancies.map((c) => (
              <ConsultancyRow
                key={c.id}
                consultancy={c}
                isActive={isActive(c)}
                isBusy={busyId === c.id}
                onSwitch={onSwitch}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}

            {!isLoading && consultancies.length === 0 && (
              <tr>
                <td colSpan={colCount} className="py-12 text-center text-sm text-slate-400">
                  No consultancies yet. Create the first one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
