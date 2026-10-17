"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Building2,
  BookOpen,
  GraduationCap,
  Calendar,
  Mail,
  User,
  Clock,
  Globe,
  CheckCircle2,
  AlertCircle,
  Timer,
  FileText,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/fetch-client";

const statusColors: Record<string, string> = {
  Submitted: "bg-blue-50 text-blue-700 border-blue-100",
  Processing: "bg-amber-50 text-amber-700 border-amber-100",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Rejected: "bg-red-50 text-red-700 border-red-100",
  Pending: "bg-slate-50 text-slate-700 border-slate-100",
};

const statusIcons: Record<string, React.ReactNode> = {
  Submitted: <FileText size={14} />,
  Processing: <Timer size={14} />,
  Approved: <CheckCircle2 size={14} />,
  Rejected: <AlertCircle size={14} />,
  Pending: <Clock size={14} />,
};

interface ApplicationDetail {
  id: string;
  studentId: string;
  universityId: string;
  courseId: string;
  status: string;
  appliedDate: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    nationality?: string;
    address?: string;
  };
  university: {
    id: string;
    name: string;
    country: string;
    city?: string;
    website?: string;
  };
  course: {
    id: string;
    name: string;
    level: string;
    duration?: string;
    tuitionFee?: string;
    currency?: string;
    faculty?: string;
    intake?: string;
  };
}

function ApplicationModalHeader({ id, onClose }: { id: string; onClose: () => void }) {
  return (
    <div className="sticky top-0 bg-white z-10 border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <FileText size={20} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">Application Details</h2>
          <p className="text-xs text-slate-400 font-mono">
            #
            {String(id)
              .substring(String(id).length - 8)
              .toUpperCase()}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition"
      >
        <X size={20} />
      </button>
    </div>
  );
}

function StudentInfoCard({ student }: { student: ApplicationDetail["student"] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        Student Information
      </h3>
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {student.firstName[0]}
            {student.lastName[0]}
          </div>
          <div>
            <p className="font-bold text-slate-800">
              {student.firstName} {student.lastName}
            </p>
            {student.email && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Mail size={10} /> {student.email}
              </p>
            )}
          </div>
        </div>
        {student.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <User size={12} className="text-slate-400" />
            {student.phone}
          </div>
        )}
        {student.nationality && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Globe size={12} className="text-slate-400" />
            {student.nationality}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseInfoCard({
  university,
  course,
}: {
  university: ApplicationDetail["university"];
  course: ApplicationDetail["course"];
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        University & Course
      </h3>
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-slate-400" />
          <div>
            <p className="font-bold text-slate-800 text-sm">{university.name}</p>
            <p className="text-xs text-slate-400">
              {university.city}, {university.country}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-slate-400" />
          <div>
            <p className="font-semibold text-slate-700 text-sm">{course.name}</p>
            <p className="text-xs text-slate-400">{course.faculty || course.level}</p>
          </div>
        </div>
        {course.duration && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={12} className="text-slate-400" />
            Duration: {course.duration}
          </div>
        )}
        {course.intake && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar size={12} className="text-slate-400" />
            Intake: {course.intake}
          </div>
        )}
        {course.tuitionFee && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <GraduationCap size={12} className="text-slate-400" />
            Tuition: {course.currency || "USD"} {course.tuitionFee}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationDetailModal({
  applicationId,
  onClose,
  onStatusChange,
}: {
  applicationId: string;
  onClose: () => void;
  onStatusChange: () => void;
}) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get<ApplicationDetail>(`/api/applications/${applicationId}`, { showError: false })
      .then((d) => {
        if (!active) return;
        setDetail(d);
        setNewStatus(d.status);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        toast.error("Failed to load application details");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === detail?.status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDetail((prev) =>
          prev ? { ...prev, status: updated.status, updatedAt: updated.updatedAt } : null
        );
        toast.success(`Status updated to ${updated.status}`);
        onStatusChange();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : !detail ? (
          <div className="py-20 text-center text-slate-400">Failed to load application</div>
        ) : (
          <>
            <ApplicationModalHeader id={detail.id} onClose={onClose} />

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors[detail.status] || statusColors["Pending"]}`}
                >
                  {statusIcons[detail.status] || statusIcons["Pending"]}
                  {detail.status}
                </span>
                <span className="text-xs text-slate-400">
                  Last updated {new Date(detail.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StudentInfoCard student={detail.student} />
                <CourseInfoCard university={detail.university} course={detail.course} />
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Update Status
                  </h3>
                  {saving && <Loader2 className="animate-spin text-indigo-500" size={16} />}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="relative flex-1">
                    <select
                      aria-label="Application status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Processing">Processing</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Pending">Pending</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={newStatus === detail.status || saving}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
                  >
                    {saving ? "Saving..." : "Update"}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Applied:{" "}
                  {new Date(detail.appliedDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>
                  Updated:{" "}
                  {new Date(detail.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
