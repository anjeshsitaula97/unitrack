"use client";

import { Edit2, Filter, GraduationCap, LayoutGrid, List, Search } from "lucide-react";
import type { Student } from "./types";

const SELECT_CLASS =
  "text-xs font-bold border border-slate-100 rounded-xl px-4 py-2.5 bg-white text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer hover:border-slate-200 transition appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_8px_center] bg-no-repeat";

export default function CoursesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  levelFilter,
  onLevelFilterChange,
  countryFilter,
  onCountryFilterChange,
  universityFilter,
  onUniversityFilterChange,
  universities,
  countries,
  sortBy,
  onSortChange,
  selectedStudentId,
  onStudentChange,
  students,
  onEditGuest,
  viewMode,
  onViewModeChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  levelFilter: string;
  onLevelFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  universityFilter: string;
  onUniversityFilterChange: (value: string) => void;
  universities: string[];
  countries: string[];
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedStudentId: string;
  onStudentChange: (value: string) => void;
  students: Student[];
  onEditGuest: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}) {
  return (
    <div className="card px-5 py-4 mb-5 border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Search courses"
            placeholder="Search courses, universities, countries..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-11 w-full"
          />
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <select
            aria-label="Status filter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            aria-label="Level filter"
            value={levelFilter}
            onChange={(e) => onLevelFilterChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">All Levels</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Postgraduate">Postgraduate</option>
            <option value="PhD">PhD</option>
          </select>

          <select
            aria-label="Country filter"
            value={countryFilter}
            onChange={(e) => onCountryFilterChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={`country-${c}`} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="University filter"
            value={universityFilter}
            onChange={(e) => onUniversityFilterChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">
              {countryFilter === "all" ? "All Universities" : `Universities in ${countryFilter}`}
            </option>
            {universities.map((u) => (
              <option key={`university-${u}`} value={u}>
                {u}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort courses"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            title="Sort courses"
            className={SELECT_CLASS}
          >
            <option value="best">Sort: Best Match</option>
            <option value="tuition-asc">Tuition: Low to High</option>
            <option value="tuition-desc">Tuition: High to Low</option>
            <option value="appfee-asc">Application Fee: Low to High</option>
            <option value="appfee-desc">Application Fee: High to Low</option>
            <option value="no-appfee">No Application Fees</option>
          </select>

          <div className="relative group">
            <GraduationCap
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
            />
            <select
              aria-label="Check eligibility for"
              value={selectedStudentId}
              onChange={(e) => onStudentChange(e.target.value)}
              className={`${SELECT_CLASS} pl-9 min-w-[180px]`}
            >
              <option value="all">Check Eligibility For…</option>
              <option value="guest" className="font-bold text-indigo-600">
                Guest Student (Manual Check)
              </option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.firstName + " " + s.lastName}
                </option>
              ))}
            </select>
            {selectedStudentId === "guest" && (
              <button
                type="button"
                onClick={onEditGuest}
                className="absolute -top-1 -right-1 size-5 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg border-2 border-white"
                title="Edit Guest Details"
              >
                <Edit2 size={10} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition duration-150"
          >
            <Filter size={15} />
            Filters
          </button>

          <div className="flex items-center border border-slate-100 rounded-xl p-1 bg-white">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"}`}
              title="List view"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"}`}
              title="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
