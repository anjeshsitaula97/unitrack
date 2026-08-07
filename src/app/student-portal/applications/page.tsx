"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { safeJson } from "@/lib/fetch-client";

interface ApplicationRow {
  id: number;
  status: string;
  appliedDate: string;
  course: {
    name: string;
    level: string | null;
    duration: string | null;
    tuitionFee: number | null;
    currency: string | null;
  };
  university: {
    name: string;
    country: string;
  };
}

const statusIcons: Record<string, LucideIcon> = {
  Submitted: Clock,
  UnderReview: AlertCircle,
  Accepted: CheckCircle,
  Rejected: XCircle,
  Enrolled: CheckCircle,
};

const statusColors: Record<string, string> = {
  Submitted: "text-blue-600 bg-blue-50",
  UnderReview: "text-amber-600 bg-amber-50",
  Accepted: "text-emerald-600 bg-emerald-50",
  Rejected: "text-red-600 bg-red-50",
  Enrolled: "text-purple-600 bg-purple-50",
};

export default function StudentApplications() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student-portal/applications")
      .then(safeJson)
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">My Applications</h1>
        <p className="text-slate-500 text-sm mt-1">
          {applications.length} application{applications.length !== 1 ? "s" : ""} submitted
        </p>
      </div>
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : applications.length === 0 ? (
        <div className="py-20 text-center">
          <FileText className="mx-auto text-slate-200 mb-3" size={48} />
          <p className="text-slate-500 font-medium">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const Icon = statusIcons[app.status] || Clock;
            const color = statusColors[app.status] || "text-slate-600 bg-slate-50";
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{app.course.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {app.university.name}, {app.university.country}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-400">
                      <span>Level: {app.course.level}</span>
                      <span>Duration: {app.course.duration}</span>
                      {app.course.tuitionFee ? (
                        <span>
                          Fee: {app.course.currency} {app.course.tuitionFee}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}
                  >
                    <Icon size={12} />
                    {app.status}
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  Applied: {new Date(app.appliedDate).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
