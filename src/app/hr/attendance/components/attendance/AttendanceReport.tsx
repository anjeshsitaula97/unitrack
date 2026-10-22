import Pagination from "@/components/Pagination";
import AttendanceFilters from "./AttendanceFilters";
import AttendanceStatsCards from "./AttendanceStatsCards";
import AttendanceTable from "./AttendanceTable";
import type { AttendanceRecord } from "./types";

const AttendanceReport = ({
  records,
  loading,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  sortField,
  onSort,
  showFilters,
  onToggleFilters,
  page,
  perPage,
  onPrev,
  onNext,
  onDelete,
}: {
  records: AttendanceRecord[];
  loading: boolean;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortField: string;
  onSort: (field: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  page: number;
  perPage: number;
  onPrev: () => void;
  onNext: () => void;
  onDelete: (id: number) => void;
}) => {
  const paginated = records.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(records.length / perPage);

  const present = records.filter((r) => r.status === "Present").length;
  const late = records.filter((r) => r.status === "Late").length;
  const absent = records.filter((r) => r.status === "Absent").length;

  return (
    <div className="card p-5 lg:col-span-2">
      <AttendanceFilters
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={onFromDateChange}
        onToDateChange={onToDateChange}
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />

      <AttendanceStatsCards present={present} late={late} absent={absent} />

      <AttendanceTable
        records={paginated}
        loading={loading}
        sortField={sortField}
        onSort={onSort}
        onDelete={onDelete}
      />

      <Pagination
        page={page}
        perPage={perPage}
        total={records.length}
        totalPages={totalPages}
        onPrev={onPrev}
        onNext={onNext}
        padding="px-4"
      />
    </div>
  );
};

export default AttendanceReport;
