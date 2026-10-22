import { Loader2, MapPin, ShieldCheck, Trash2 } from "lucide-react";
import SortHeader from "./SortHeader";
import type { AttendanceRecord } from "./types";

const AttendanceTable = ({
  records,
  loading,
  sortField,
  onSort,
  onDelete,
}: {
  records: AttendanceRecord[];
  loading: boolean;
  sortField: string;
  onSort: (field: string) => void;
  onDelete: (id: number) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-slate-50/60 border-b border-slate-100">
        <tr>
          <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Employee
          </th>
          <SortHeader field="checkIn" sortField={sortField} onSort={onSort}>
            Check In
          </SortHeader>
          <SortHeader field="checkOut" sortField={sortField} onSort={onSort}>
            Check Out
          </SortHeader>
          <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Status
          </th>
          <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Verify
          </th>
          <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {loading ? (
          <tr>
            <td colSpan={6} className="py-12 text-center">
              <Loader2 className="animate-spin text-indigo-500 mx-auto" size={24} />
            </td>
          </tr>
        ) : records.length === 0 ? (
          <tr>
            <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
              No records match your filters
            </td>
          </tr>
        ) : (
          records.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                    {r.user.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{r.user.name}</p>
                    <p className="text-[10px] text-slate-400">{r.user.employeeId || ""}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                {r.checkIn ? (
                  <div>
                    <span className="text-xs text-slate-600">
                      {new Date(r.checkIn).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {r.checkInLat && r.checkInLng && (
                      <a
                        href={`https://www.google.com/maps?q=${r.checkInLat},${r.checkInLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 hover:underline"
                        title="Open in Google Maps"
                      >
                        <MapPin size={10} /> {r.checkInLat.toFixed(4)}, {r.checkInLng.toFixed(4)}
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )}
              </td>
              <td className="py-3 px-4">
                {r.checkOut ? (
                  <div>
                    <span className="text-xs text-slate-600">
                      {new Date(r.checkOut).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {r.checkOutLat && r.checkOutLng && (
                      <a
                        href={`https://www.google.com/maps?q=${r.checkOutLat},${r.checkOutLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 hover:underline"
                        title="Open in Google Maps"
                      >
                        <MapPin size={10} /> {r.checkOutLat.toFixed(4)}, {r.checkOutLng.toFixed(4)}
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    r.status === "Present"
                      ? "bg-emerald-50 text-emerald-700"
                      : r.status === "Late"
                        ? "bg-amber-50 text-amber-700"
                        : r.status === "Half-Day"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  {r.checkInPhoto ? (
                    <button
                      type="button"
                      onClick={() => window.open(r.checkInPhoto!, "_blank", "noopener,noreferrer")}
                      className="p-1 text-emerald-500 hover:text-emerald-600"
                      title="View check-in photo"
                    >
                      <ShieldCheck size={14} />
                    </button>
                  ) : (
                    <span className="p-1 text-slate-300" title="No face verification">
                      <ShieldCheck size={14} />
                    </span>
                  )}
                  {r.checkInLat && r.checkInLng && (
                    <a
                      href={`https://www.google.com/maps?q=${r.checkInLat},${r.checkInLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-indigo-600"
                      title="Open check-in location in Google Maps"
                    >
                      <MapPin size={13} />
                    </a>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete record"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default AttendanceTable;
