import { Filter } from "lucide-react";

export default function ReportFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium whitespace-nowrap">
        <Filter size={14} className="text-indigo-500" /> Date Boundary
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          aria-label="Start date"
          className="px-2 py-1.5 text-xs border border-slate-200 rounded text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-300 w-full sm:w-32"
        />
        <span className="text-slate-400 text-xs">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          aria-label="End date"
          className="px-2 py-1.5 text-xs border border-slate-200 rounded text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-300 w-full sm:w-32"
        />
      </div>
      {(startDate || endDate) && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
