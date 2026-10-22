import { Search, SlidersHorizontal } from "lucide-react";

const AttendanceFilters = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  showFilters,
  onToggleFilters,
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
}: {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}) => (
  <>
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <h3 className="font-bold text-slate-800">Attendance Report</h3>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <input
            aria-label="Attendance from date"
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
          />
          <span className="text-[10px] text-slate-400">to</span>
          <input
            aria-label="Attendance to date"
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
          />
        </div>
        <button
          type="button"
          onClick={onToggleFilters}
          className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${showFilters ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
        >
          <SlidersHorizontal size={12} /> Filters
        </button>
      </div>
    </div>

    {showFilters && (
      <div className="mb-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Search employee..."
            type="text"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 bg-white"
          />
        </div>
        <select
          aria-label="Filter attendance by status"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">All Status</option>
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Absent">Absent</option>
          <option value="Half-Day">Half-Day</option>
        </select>
      </div>
    )}
  </>
);

export default AttendanceFilters;
