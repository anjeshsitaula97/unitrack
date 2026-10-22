"use client";

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AttendanceReport from "./attendance/AttendanceReport";
import QuickActionsPanel from "./attendance/QuickActionsPanel";
import type { AttendanceAction, AttendanceRecord, CurrentUser } from "./attendance/types";

const FaceVerificationModal = lazy(() => import("@/components/hr/FaceVerificationModal"));

export default function AttendanceContent() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [checking, setChecking] = useState(false);
  const [myStatus, setMyStatus] = useState<AttendanceRecord | null>(null);
  const me = useRef<CurrentUser | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [showVerification, setShowVerification] = useState(false);
  const [pendingAction, setPendingAction] = useState<AttendanceAction | null>(null);
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
        fetch("/api/auth/me", { credentials: "include" }),
      ]);
      if (allRes.ok) setRecords((await allRes.json()) as AttendanceRecord[]);
      if (meRes.ok) {
        const meData = (await meRes.json()) as CurrentUser;
        me.current = meData;
        const today = new Date().toISOString().split("T")[0];
        const myRes = await fetch(`/api/hr/attendance?date=${today}&userId=${meData.id}`);
        if (myRes.ok) {
          const myData = (await myRes.json()) as AttendanceRecord[];
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
  }, [fetchData]);
  useEffect(() => {
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

  const proceedWithAction = async (action: AttendanceAction) => {
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
            onClick: () => window.open(`/hr/employees/${me.current!.id}/face-enrollment`, "_blank"),
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

  const handleDelete = async (id: number) => {
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
        <AttendanceReport
          records={records}
          loading={loading}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          sortField={sortField}
          onSort={handleSort}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          page={page}
          perPage={perPage}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(Math.ceil(records.length / perPage), p + 1))}
          onDelete={handleDelete}
        />

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
