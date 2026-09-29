"use client";

import React, { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  FileDown,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Globe,
  Award,
  BookOpen,
  Users,
  AlertCircle,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import * as XLSX from "xlsx";
import { getCountryFlag } from "@/lib/country-flags";

const statusConfig: Record<string, { label: string; className: string }> = {
  Active: { label: "Active", className: "badge-active" },
  Pending: { label: "Pending", className: "badge-pending" },
  Suspended: { label: "Suspended", className: "badge-suspended" },
};

type SortField = "name" | "country" | "type" | "courses" | "students" | "ranking" | "addedDate";
type SortDir = "asc" | "desc";

interface UniversityRow {
  id: string;
  name: string;
  shortName?: string | null;
  country: string;
  city?: string | null;
  type?: string | null;
  ranking?: string | number | null;
  founded?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  accreditation?: string | string[] | null;
  addedDate: string;
  logo?: string | null;
  color?: string | null;
  initials?: string | null;
  accredited?: boolean;
  courses?: number;
  students?: number;
}

const SortIcon = ({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
}) => {
  if (sortField !== field) return <ChevronsUpDown size={12} className="text-slate-300" />;
  return sortDir === "asc" ? (
    <ChevronUp size={12} className="text-indigo-600" />
  ) : (
    <ChevronDown size={12} className="text-indigo-600" />
  );
};

const formatCities = (cityStr: string | null | undefined) => {
  if (!cityStr) return "N/A";
  try {
    if (typeof cityStr === "string" && cityStr.startsWith("[")) {
      const cities = JSON.parse(cityStr);
      if (Array.isArray(cities) && cities.length > 0) {
        const first = cities[0];
        return `${first}${cities.length > 1 ? ` (+${cities.length - 1})` : ""}`;
      }
    }
  } catch (_e) {}
  return cityStr;
};

const handleExport = (dataToExport: UniversityRow[]) => {
  if (dataToExport.length === 0) {
    toast.error("No data to export");
    return;
  }

  try {
    const exportData = dataToExport.map((u) => ({
      "University Name": u.name,
      "Short Name": u.shortName || "",
      Country: u.country,
      Cities: u.city && u.city.startsWith("[") ? JSON.parse(u.city).join(", ") : u.city || "",
      Type: u.type || "",
      Ranking: u.ranking || "",
      Founded: u.founded || "",
      Website: u.website || "",
      Email: u.email || "",
      Phone: u.phone || "",
      Status: u.status || "",
      Accreditation: u.accreditation || "",
      "Added Date": new Date(u.addedDate).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Universities");
    XLSX.writeFile(wb, `universities_export_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Export completed successfully");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Failed to export data");
  }
};

export default function UniversitiesContent() {
  const [UNIVERSITIES_DATA, setUniversitiesData] = useState<UniversityRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/universities", { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then((data) => {
        const parsed = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setUniversitiesData(parsed);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          toast.error("Failed to load universities database");
          setUniversitiesData([]);
        }
      })
      .finally(() => {
        setIsLoadingData(false);
      });
    return () => ac.abort();
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("addedDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useSyncExternalStore(
    (onStoreChange) => {
      const handleClick = () => {
        setActiveDropdown(null);
        onStoreChange();
      };
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    },
    () => null,
    () => null
  );

  const countries = Array.from(new Set(UNIVERSITIES_DATA.map((u) => u.country))).sort();

  const filtered = useMemo(() => {
    let data = [...UNIVERSITIES_DATA];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (u) =>
          (u.name?.toLowerCase() || "").includes(q) ||
          (u.shortName?.toLowerCase() || "").includes(q) ||
          (u.country?.toLowerCase() || "").includes(q) ||
          (u.city?.toLowerCase() || "").includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter((u) => u.status === statusFilter);
    if (typeFilter !== "all") data = data.filter((u) => u.type === typeFilter);
    if (countryFilter !== "all") data = data.filter((u) => u.country === countryFilter);
    data.sort((a, b) => {
      let aVal: string | number = a[sortField] as string | number;
      let bVal: string | number = b[sortField] as string | number;
      if (sortField === "addedDate") {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [search, statusFilter, typeFilter, countryFilter, sortField, sortDir, UNIVERSITIES_DATA]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelected(selected.length === paginated.length ? [] : paginated.map((u) => u.id));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Move "${name}" to trash? You can restore it from the Trash page for 30 days.`))
      return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/universities/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUniversitiesData((prev) => prev.filter((u) => u.id !== id));
        setSelected((prev) => prev.filter((x) => x !== id));
        toast.success(`"${name}" moved to trash`);
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.error || `Failed to delete "${name}" (HTTP ${res.status})`);
      }
    } catch (_error) {
      toast.error(`Network error. Failed to delete "${name}".`);
    } finally {
      setDeletingId(null);
    }
  };

  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Move ${selected.length} universities to trash?`)) return;

    setIsBulkDeleting(true);
    try {
      const results = await Promise.all(
        selected.map((id) => fetch(`/api/universities/${id}`, { method: "DELETE" }))
      );
      const deleted = selected.filter((_, i) => results[i].ok);
      const failed = results.length - deleted.length;

      if (deleted.length > 0) {
        setUniversitiesData((prev) => prev.filter((u) => !deleted.includes(u.id)));
      }
      setSelected([]);

      if (failed === 0) {
        toast.success(`${deleted.length} universities moved to trash`);
      } else if (deleted.length === 0) {
        toast.error(`Failed to delete ${failed} universities`);
      } else {
        toast.error(`${deleted.length} moved to trash, ${failed} failed`);
      }
    } catch (_error) {
      toast.error("Network error. Bulk delete failed.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCountryFilter("all");
  };

  return (
    <div className="animate-fade-in relative block">
      {isLoadingData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}
      <UniversitiesHeader filtered={filtered} countries={countries} handleExport={handleExport} />

      <UniversityStats universities={UNIVERSITIES_DATA} />

      <div className="card overflow-hidden">
        <SearchFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          countryFilter={countryFilter}
          setCountryFilter={setCountryFilter}
          countries={countries}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setPage={setPage}
        />

        {selected.length > 0 && (
          <BulkActionBar
            selected={selected}
            setSelected={setSelected}
            onExportSelected={() =>
              handleExport(UNIVERSITIES_DATA.filter((u) => selected.includes(u.id)))
            }
            onDeleteSelected={handleBulkDelete}
            isDeleting={isBulkDeleting}
          />
        )}

        {viewMode === "list" ? (
          <UniversityTable
            paginated={paginated}
            selected={selected}
            toggleAll={toggleAll}
            toggleRow={toggleRow}
            sortField={sortField}
            sortDir={sortDir}
            toggleSort={toggleSort}
            deletingId={deletingId}
            handleDelete={handleDelete}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <UniversityGrid
            paginated={paginated}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            handleDelete={handleDelete}
          />
        )}

        <UniversityPagination
          perPage={perPage}
          setPerPage={setPerPage}
          page={page}
          setPage={setPage}
          filtered={filtered}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}

function UniversitiesHeader({
  filtered,
  countries,
  handleExport: exportFn,
}: {
  filtered: UniversityRow[];
  countries: string[];
  handleExport: (data: UniversityRow[]) => void;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Universities</h1>
        <p className="text-sm text-slate-400">
          {filtered.length.toLocaleString()} universities listed across {countries.length} countries
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const headers = [
              [
                "Name",
                "ShortName",
                "Country",
                "Type",
                "Accreditation",
                "Accredited",
                "Website",
                "Email",
                "Phone",
                "Address",
                "Ranking",
                "FoundedYear",
                "Description",
                "Status",
              ],
            ];
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(headers);
            XLSX.utils.book_append_sheet(wb, ws, "Template");
            XLSX.writeFile(wb, "universities_import_template.xlsx");
            toast.success("Excel Template downloaded successfully.");
          }}
          className="btn-secondary"
          title="Download CSV Template"
        >
          <FileDown size={15} />
          Template
        </button>
        <label htmlFor="importFile" className="btn-secondary cursor-pointer">
          <Upload size={15} />
          Import
          <input
            id="importFile"
            type="file"
            className="hidden"
            accept=".csv,.xlsx"
            onChange={(e) => {
              if (e.target.files?.length) {
                toast.success(`Starting import for ${e.target.files[0].name}...`);
                e.target.value = "";
              }
            }}
          />
        </label>
        <button type="button" onClick={() => exportFn(filtered)} className="btn-secondary">
          <Download size={15} />
          Export
        </button>
        <Link href="/universities/add" className="btn-primary">
          <Plus size={15} />
          Add University
        </Link>
      </div>
    </div>
  );
}

function UniversityStats({ universities }: { universities: UniversityRow[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {[
        {
          id: "strip-total",
          label: "Total Listed",
          value: universities.length.toString(),
          icon: <Building2 size={14} />,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          id: "strip-active",
          label: "Active",
          value: universities.filter((u) => u.status === "Active").length.toString(),
          icon: <Globe size={14} />,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          id: "strip-pending",
          label: "Pending Review",
          value: universities.filter((u) => u.status === "Pending").length.toString(),
          icon: <AlertCircle size={14} />,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          id: "strip-suspended",
          label: "Suspended",
          value: universities.filter((u) => u.status === "Suspended").length.toString(),
          icon: <AlertCircle size={14} />,
          color: "text-red-600",
          bg: "bg-red-50",
        },
      ].map((s) => (
        <div key={s.id} className="card px-4 py-3 flex items-center gap-3">
          <div
            className={`size-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}
          >
            {s.icon}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">{s.label}</div>
            <div className={`text-lg font-bold ${s.color} font-tabular`}>{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  countryFilter,
  setCountryFilter,
  countries,
  showFilters,
  setShowFilters,
  viewMode,
  setViewMode,
  setPage,
}: {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  countryFilter: string;
  setCountryFilter: (v: string) => void;
  countries: string[];
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  viewMode: "list" | "grid";
  setViewMode: (v: "list" | "grid") => void;
  setPage: (v: number) => void;
}) {
  return (
    <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search universities, countries..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>

        <select
          value={countryFilter}
          onChange={(e) => {
            setCountryFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
        >
          <option value="all">All Countries</option>
          {countries.map((c) => (
            <option key={`country-opt-${c.replace(/\s+/g, "-")}`} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition-all duration-150 ${showFilters ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
        >
          <Filter size={13} />
          Filters
        </button>

        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            title="List View"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            title="Grid View"
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkActionBar({
  selected,
  setSelected,
  onExportSelected,
  onDeleteSelected,
  isDeleting = false,
}: {
  selected: string[];
  setSelected: (v: string[]) => void;
  onExportSelected: () => void;
  onDeleteSelected: () => void;
  isDeleting?: boolean;
}) {
  return (
    <div className="px-5 py-2.5 bg-indigo-50 border-b border-indigo-200 flex items-center gap-4 animate-slide-up">
      <span className="text-xs font-semibold text-indigo-700">{selected.length} selected</span>
      <button
        type="button"
        onClick={onExportSelected}
        className="text-xs text-indigo-600 hover:underline font-medium"
      >
        Export selected
      </button>
      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={isDeleting}
        className="text-xs text-red-500 hover:underline font-medium disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
      >
        {isDeleting ? "Deleting…" : "Delete selected"}
      </button>
      <button
        type="button"
        onClick={() => setSelected([])}
        className="ml-auto text-xs text-slate-500 hover:text-slate-700 font-medium"
      >
        Clear selection
      </button>
    </div>
  );
}

function UniversityTable({
  paginated,
  selected,
  toggleAll,
  toggleRow,
  sortField,
  sortDir,
  toggleSort,
  deletingId,
  handleDelete,
  onClearFilters,
}: {
  paginated: UniversityRow[];
  selected: string[];
  toggleAll: () => void;
  toggleRow: (id: string) => void;
  sortField: SortField;
  sortDir: SortDir;
  toggleSort: (field: SortField) => void;
  deletingId: string | null;
  handleDelete: (id: string, name: string) => void;
  onClearFilters: () => void;
}) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[900px]">
        <thead className="bg-slate-50/60">
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-5 w-8">
              <input
                type="checkbox"
                checked={selected.length === paginated.length && paginated.length > 0}
                onChange={toggleAll}
                className="size-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer"
              />
            </th>
            {(
              [
                { key: "name", label: "University", sortable: true },
                { key: "country", label: "Country", sortable: true },
                { key: "type", label: "Type", sortable: true },
                { key: null, label: "Accreditation", sortable: false },
                { key: "courses", label: "Courses", sortable: true },
                { key: "students", label: "Students", sortable: true },
                { key: null, label: "Status", sortable: false },
                { key: "addedDate", label: "Added", sortable: true },
                { key: null, label: "", sortable: false },
              ] as { key: SortField | null; label: string; sortable: boolean }[]
            ).map((col, i) => (
              <th
                key={`col-univ-${col.label || i}`}
                className={`text-left p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap ${col.sortable ? "cursor-pointer hover:text-slate-600 select-none" : ""}`}
                onClick={() => col.sortable && col.key && toggleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && col.key && (
                    <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Building2 size={36} className="text-slate-300" />
                  <p className="font-semibold text-slate-500 text-sm">No universities found</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Try adjusting your search or filter criteria. Universities matching your query
                    will appear here.
                  </p>
                  <button type="button" onClick={onClearFilters} className="btn-secondary text-xs">
                    Clear all filters
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            paginated.map((univ) => {
              const status = statusConfig[univ.status] || statusConfig["Active"];
              const isSelected = selected.includes(univ.id);
              const isDeleting = deletingId === univ.id;
              return (
                <tr
                  key={univ.id}
                  className={`group transition-all duration-200 ${isDeleting ? "opacity-0 scale-95" : "opacity-100"} ${isSelected ? "bg-indigo-50/40" : "hover:bg-slate-50"}`}
                >
                  <td className="py-3 px-5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(univ.id)}
                      className="size-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden relative"
                        style={{
                          backgroundColor: univ.logo ? "transparent" : univ.color || undefined,
                        }}
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
                          univ.initials
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/universities/${univ.id}`}
                          className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors truncate max-w-[200px] block"
                        >
                          {univ.name}
                        </Link>
                        <p className="text-[11px] text-slate-400 font-medium">
                          #{univ.ranking} global ranking
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {getCountryFlag(univ.country) && (
                        <Image
                          src={getCountryFlag(univ.country)}
                          alt={`${univ.country} flag`}
                          width={24}
                          height={24}
                          className="w-5 h-3.5 rounded-sm object-cover"
                        />
                      )}
                      <span className="text-xs text-slate-600 font-medium">{univ.country}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${univ.type === "Public" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}
                    >
                      {univ.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <Award
                        size={12}
                        className={univ.accredited ? "text-emerald-500" : "text-slate-300"}
                      />
                      <span
                        className={`text-xs font-medium ${univ.accredited ? "text-slate-700" : "text-slate-400"}`}
                      >
                        {Array.isArray(univ.accreditation)
                          ? univ.accreditation.length > 1
                            ? `${univ.accreditation[0]} +${univ.accreditation.length - 1}`
                            : univ.accreditation[0] || "Pending"
                          : univ.accreditation || "Pending"}
                      </span>
                      {!univ.accredited && (
                        <span className="text-[10px] text-amber-600 font-medium">(Pending)</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 font-tabular">
                        {(univ.courses || 0).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 font-tabular">
                        {(univ.students || 0).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${status.className}`}>{status.label}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs text-slate-500">
                      {new Date(univ.addedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="p-3 pr-5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <Link
                        href={`/universities/${univ.id}`}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        title="View university profile"
                      >
                        <ExternalLink size={13} />
                      </Link>
                      <Link
                        href={`/universities/${univ.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Edit university listing"
                      >
                        <Edit2 size={13} className="text-slate-400" />
                      </Link>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                        title="Move university to trash (restorable for 30 days)"
                        onClick={() => handleDelete(univ.id, univ.name)}
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <MoreHorizontal size={13} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function UniversityGrid({
  paginated,
  activeDropdown,
  setActiveDropdown,
  handleDelete,
}: {
  paginated: UniversityRow[];
  activeDropdown: string | null;
  setActiveDropdown: (v: string | null) => void;
  handleDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {paginated.length === 0 ? (
        <div className="col-span-full py-16 text-center">
          <Building2 size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            No universities found matching your criteria.
          </p>
        </div>
      ) : (
        paginated.map((univ) => {
          const status = statusConfig[univ.status] || statusConfig["Active"];
          return (
            <div
              key={`grid-${univ.id}`}
              className="card overflow-hidden hover:shadow-md transition-all duration-200 group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-teal-300/10 to-transparent pointer-events-none" />
              <div
                className="h-1 w-full relative"
                style={{ backgroundColor: univ.color || undefined }}
              />
              <div className="p-4 relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="size-16 rounded-2xl flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-sm border border-slate-50 overflow-hidden relative"
                      style={{
                        backgroundColor: univ.logo ? "transparent" : univ.color || undefined,
                      }}
                    >
                      {univ.logo ? (
                        <Image
                          src={univ.logo}
                          alt=""
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : (
                        univ.initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors leading-tight mb-1">
                        <Link href={`/universities/${univ.id}`}>{univ.name}</Link>
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 truncate">
                        {getCountryFlag(univ.country) && (
                          <Image
                            src={getCountryFlag(univ.country)}
                            alt={`${univ.country} flag`}
                            width={24}
                            height={24}
                            className="w-5 h-3.5 rounded-sm object-cover"
                          />
                        )}
                        {formatCities(univ.city)}, {univ.country}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${status.className} flex-shrink-0 ml-2`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600`}
                  >
                    {univ.type}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-600`}
                  >
                    <Award size={8} />
                    Rank #{univ.ranking}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <BookOpen size={12} className="text-slate-400" />
                    {univ.courses || 0} Courses
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users size={12} className="text-slate-400" />
                    {univ.students || 0} Students
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                  <Link
                    href={`/universities/${univ.id}`}
                    className="flex-1 py-2 rounded-lg bg-slate-900 text-white text-[11px] font-bold text-center hover:bg-indigo-600 transition-all uppercase tracking-wide"
                  >
                    View Profile
                  </Link>
                  <div className="relative">
                    <button
                      type="button"
                      className={`p-2 rounded-lg border transition-all ${activeDropdown === univ.id ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === univ.id ? null : univ.id);
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>

                    {activeDropdown === univ.id && (
                      <div
                        className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/universities/${univ.id}/edit`}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                        >
                          <Edit2 size={12} className="text-slate-400" />
                          Edit University
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            handleDelete(univ.id, univ.name);
                            setActiveDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 size={12} className="text-red-400" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function UniversityPagination({
  perPage,
  setPerPage,
  page,
  setPage,
  filtered,
  totalPages,
}: {
  perPage: number;
  setPerPage: (v: number) => void;
  page: number;
  setPage: (v: number) => void;
  filtered: UniversityRow[];
  totalPages: number;
}) {
  return (
    <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Show</span>
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(1);
          }}
          className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
        >
          {[10, 20, 50].map((n) => (
            <option key={`perpage-${n}`} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>
          of <strong className="font-tabular">{filtered.length}</strong> universities
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              type="button"
              key={`page-btn-${p}`}
              onClick={() => setPage(p)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-150 ${page === p ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              {p}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
