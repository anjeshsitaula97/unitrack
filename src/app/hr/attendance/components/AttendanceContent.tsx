"use client";

import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import {
  Clock,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  MapPin,
  Camera,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
const FaceVerificationModal = lazy(() => import("@/components/hr/FaceVerificationModal"));

const SortHeader = ({
  field,
  children,
  sortField,
  onSort,
}: {
  field: string;
  children: React.ReactNode;
  sortField: string;
  onSort: (field: string) => void;
}) => (
  <th
    className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer select-none hover:text-slate-600"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {children}
      <ArrowUpDown
        size={11}
        className={`transition-opacity ${sortField === field ? "opacity-100 text-indigo-500" : "opacity-30"}`}
      />
    </div>
  </th>
);

const AttendanceStatsCards = ({
  present,
  late,
  absent,
}: {
  present: number;
  late: number;
  absent: number;
}) => (
  <div className="grid grid-cols-3 gap-3 mb-4">
    <div className="bg-emerald-50 rounded-xl p-4 text-center">
      <CheckCircle size={20} className="text-emerald-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-emerald-700">{present}</div>
      <div className="text-xs text-emerald-600 font-medium">Present</div>
    </div>
    <div className="bg-amber-50 rounded-xl p-4 text-center">
      <AlertTriangle size={20} className="text-amber-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-amber-700">{late}</div>
      <div className="text-xs text-amber-600 font-medium">Late</div>
    </div>
    <div className="bg-rose-50 rounded-xl p-4 text-center">
      <XCircle size={20} className="text-rose-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-rose-700">{absent}</div>
      <div className="text-xs text-rose-600 font-medium">Absent</div>
    </div>
  </div>
);

const QuickActionsPanel = ({
  myStatus,
  checking,
  proceedWithAction,
}: {
  myStatus: any;
  checking: boolean;
  proceedWithAction: (action: "checkin" | "checkout") => void;
}) => (
  <div className="card p-5">
    <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
    {myStatus ? (
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Checked in at</p>
          <p className="text-lg font-bold text-slate-800">
            {new Date(myStatus.checkIn).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {myStatus.checkInLat && myStatus.checkInLng && (
            <a
              href={`https://www.google.com/maps?q=${myStatus.checkInLat},${myStatus.checkInLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-indigo-500 flex items-center gap-1 mt-1 hover:underline"
              title="Open in Google Maps"
            >
              <MapPin size={10} /> {myStatus.checkInLat.toFixed(4)},{" "}
              {myStatus.checkInLng.toFixed(4)}
            </a>
          )}
          {myStatus.checkInPhoto && (
            <button
              type="button"
              onClick={() => window.open(myStatus.checkInPhoto, "_blank")}
              className="text-[10px] text-indigo-600 flex items-center gap-1 mt-1 hover:underline"
            >
              <Camera size={10} /> View photo
            </button>
          )}
          {myStatus.checkOut && (
            <>
              <p className="text-xs text-slate-500 mt-2 mb-1">Checked out at</p>
              <p className="text-lg font-bold text-slate-800">
                {new Date(myStatus.checkOut).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {myStatus.checkOutLat && myStatus.checkOutLng && (
                <a
                  href={`https://www.google.com/maps?q=${myStatus.checkOutLat},${myStatus.checkOutLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-500 flex items-center gap-1 mt-1 hover:underline"
                  title="Open in Google Maps"
                >
                  <MapPin size={10} /> {myStatus.checkOutLat.toFixed(4)},{" "}
                  {myStatus.checkOutLng.toFixed(4)}
                </a>
              )}
            </>
          )}
          <div className="mt-3">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                myStatus.status === "Present"
                  ? "bg-emerald-50 text-emerald-700"
                  : myStatus.status === "Late"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
              }`}
            >
              {myStatus.status}
            </span>
          </div>
        </div>
        {!myStatus.checkOut && (
          <button
            type="button"
            onClick={() => proceedWithAction("checkout")}
            disabled={checking}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {checking ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            Face Verification Check Out
          </button>
        )}
      </div>
    ) : (
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <Clock size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Not checked in today</p>
        </div>
        <button
          type="button"
          onClick={() => proceedWithAction("checkin")}
          disabled={checking}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {checking ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
          Face Verification Check In
        </button>
      </div>
    )}
  </div>
);

export default function AttendanceContent() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [checking, setChecking] = useState(false);
  const [myStatus, setMyStatus] = useState<any>(null);
  const me = useRef<any>(null);
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [showVerification, setShowVerification] = useState(false);
  const [pendingAction, setPendingAction] = useState<"checkin" | "checkout" | null>(null);
  const [enrolledDescriptor, setEnrolledDescriptor] = useState<number[] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (statusFilter) params.set("status", statusFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    params.set("sort", sortField);
    params.set("order", sortOrder);
    return params.toString();
  }, [fromDate, toDate, statusFilter, searchQuery, sortField, sortOrder]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = buildQuery();
      const [allRes, meRes] = await Promise.all([
        fetch(`/api/hr/attendance?${query}`),
        fetch("/api/auth/me"),
      ]);
      if (allRes.ok) setRecords(await allRes.json());
      if (meRes.ok) {
        const meData = await meRes.json();
        me.current = meData;
        const today = new Date().toISOString().split("T")[0];
        const myRes = await fetch(`/api/hr/attendance?date=${today}&userId=${meData.id}`);
        if (myRes.ok) {
          const myData = await myRes.json();
          setMyStatus(myData.length > 0 ? myData[0] : null);
        }
      }
    } catch {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
      setPage(1);
    }
  }, [buildQuery]);

  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
    fetchDataRef.current();
  }, [fromDate, toDate, statusFilter, searchQuery]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const proceedWithAction = async (action: "checkin" | "checkout") => {
    if (!me.current) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/hr/employees/${me.current.id}`);
      if (!res.ok) {
        toast.error("Failed to load profile");
        setChecking(false);
        return;
      }
      const profile = await res.json();
      if (!profile.faceDescriptor) {
        toast.error("Face not enrolled. Please enroll your face first.", {
          action: {
            label: "Enroll",
            onClick: () => window.open(`/hr/employees/${me.current.id}/face-enrollment`, "_blank"),
          },
        });
        setChecking(false);
        return;
      }
      setEnrolledDescriptor(JSON.parse(profile.faceDescriptor));
      setPendingAction(action);
      setShowVerification(true);
    } catch {
      toast.error("Failed to verify face enrollment");
    } finally {
      setChecking(false);
    }
  };

  const handleVerificationComplete = async (data: {
    photoUrl: string;
    latitude: number;
    longitude: number;
  }) => {
    if (!pendingAction) return;
    setChecking(true);
    try {
      const res = await fetch("/api/hr/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: pendingAction,
          photo: data.photoUrl,
          latitude: data.latitude,
          longitude: data.longitude,
        }),
      });

      if (res.ok) {
        toast.success(
          pendingAction === "checkin" ? "Checked in successfully" : "Checked out successfully"
        );
        setShowVerification(false);
        setPendingAction(null);
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.error || `Failed to ${pendingAction}`);
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setChecking(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this attendance record?")) return;
    try {
      const res = await fetch(`/api/hr/attendance/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Record deleted");
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to delete");
      }
    } catch {
      toast.error("Error connecting to server");
    }
  };

  const paginated = records.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(records.length / perPage);

  const present = records.filter((r) => r.status === "Present").length;
  const late = records.filter((r) => r.status === "Late").length;
  const absent = records.filter((r) => r.status === "Absent").length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/hr" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          </div>
          <p className="text-sm text-slate-400">
            {records.length} record{records.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-bold text-slate-800">Attendance Report</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
                />
                <span className="text-[10px] text-slate-400">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${showFilters ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                <SlidersHorizontal size={12} /> Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[160px]">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 bg-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

          <AttendanceStatsCards present={present} late={late} absent={absent} />

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/60 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Employee
                  </th>
                  <SortHeader field="checkIn" sortField={sortField} onSort={handleSort}>
                    Check In
                  </SortHeader>
                  <SortHeader field="checkOut" sortField={sortField} onSort={handleSort}>
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
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                      No records match your filters
                    </td>
                  </tr>
                ) : (
                  paginated.map((r: any) => (
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
                                <MapPin size={10} /> {r.checkInLat.toFixed(4)},{" "}
                                {r.checkInLng.toFixed(4)}
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
                                <MapPin size={10} /> {r.checkOutLat.toFixed(4)},{" "}
                                {r.checkOutLng.toFixed(4)}
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
                              onClick={() => window.open(r.checkInPhoto, "_blank")}
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
                          onClick={() => handleDelete(r.id)}
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

          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, records.length)} of{" "}
              {records.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold px-3">
                Page {page} of {totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <QuickActionsPanel
          myStatus={myStatus}
          checking={checking}
          proceedWithAction={proceedWithAction}
        />
      </div>

      {showVerification && pendingAction && enrolledDescriptor && (
        <Suspense fallback={null}>
          <FaceVerificationModal
            action={pendingAction}
            enrolledDescriptor={enrolledDescriptor}
            onComplete={handleVerificationComplete}
            onCancel={() => {
              setShowVerification(false);
              setPendingAction(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
