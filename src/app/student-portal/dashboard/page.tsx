"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CreditCard,
  Folder,
  ArrowRight,
  Loader2,
  CheckCircle,
  Circle,
  Clock,
  Globe,
} from "lucide-react";
import { safeJson } from "@/lib/fetch-client";

interface PortalStudent {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  nationality?: string | null;
  studyLevel?: string | null;
  interestedCountry?: string | null;
  status?: string | null;
  counselor?: string | null;
  _count?: {
    applications: number;
    payments: number;
    documents: number;
  };
}

interface VisaTask {
  id: number;
  title: string;
  status: string;
  dueDate: string | null;
}

interface VisaStage {
  id: number;
  name: string;
  progress: number;
  isActive: boolean;
  tasks: VisaTask[];
}

interface VisaTimeline {
  stages: VisaStage[];
  summary: {
    completedStages: number;
    totalStages: number;
    overallProgress: number;
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<PortalStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<VisaTimeline | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    fetch("/api/student-portal/me")
      .then((r) => {
        if (!r.ok) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((s) => {
        if (s) {
          setStudent(s);
          setLoading(false);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const interestedCountry = student?.interestedCountry;
  const [prevCountry, setPrevCountry] = useState(interestedCountry);

  if (prevCountry !== interestedCountry) {
    setPrevCountry(interestedCountry);
    if (interestedCountry) {
      setLoadingTimeline(true);
    }
  }

  useEffect(() => {
    if (!interestedCountry || !student) return;
    fetch(
      `/api/visa-timeline?country=${encodeURIComponent(interestedCountry)}&studentId=${student.id}`
    )
      .then(safeJson)
      .then((d) => setTimeline(d))
      .catch(() => {})
      .finally(() => setLoadingTimeline(false));
  }, [interestedCountry, student?.id, student]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const timelineStages = timeline?.stages ?? [];
  const timelineSummary = timeline?.summary;

  const links = [
    {
      label: "My Applications",
      icon: FileText,
      href: "/student-portal/applications",
      color: "text-blue-600 bg-blue-50",
      count: student?._count?.applications || 0,
    },
    {
      label: "My Payments",
      icon: CreditCard,
      href: "/student-portal/payments",
      color: "text-emerald-600 bg-emerald-50",
      count: student?._count?.payments || 0,
    },
    {
      label: "My Documents",
      icon: Folder,
      href: "/student-portal/documents",
      color: "text-amber-600 bg-amber-50",
      count: student?._count?.documents || 0,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">
          Welcome, {student?.name?.split(" ")[0] || "Student"}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track your applications, payments, and documents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {links.map((link) => (
          <button
            type="button"
            key={link.href}
            onClick={() => router.push(link.href)}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all text-left group"
          >
            <div
              className={`size-10 rounded-xl ${link.color} flex items-center justify-center mb-3`}
            >
              <link.icon size={20} />
            </div>
            <div className="text-lg font-bold text-slate-800">{link.count}</div>
            <div className="text-sm text-slate-500">{link.label}</div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-indigo-500 transition-colors mt-2"
            />
          </button>
        ))}
      </div>

      {interestedCountry &&
        (loadingTimeline ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-400" size={24} />
          </div>
        ) : timelineStages.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-indigo-600" />
                <h2 className="font-bold text-slate-800">Visa Workflow — {interestedCountry}</h2>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">
                  {timelineSummary?.completedStages || 0}/{timelineSummary?.totalStages || 0} stages
                </span>
                <span className="text-indigo-600 font-bold">
                  {timelineSummary?.overallProgress || 0}%
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${timelineSummary?.overallProgress || 0}%` }}
                />
              </div>
              <div className="space-y-0">
                {timelineStages.map((stage, index: number) => {
                  const Icon =
                    stage.progress === 100 ? CheckCircle : stage.isActive ? Clock : Circle;
                  const color =
                    stage.progress === 100
                      ? "text-emerald-500"
                      : stage.isActive
                        ? "text-indigo-500"
                        : "text-slate-300";
                  const isLast = index === timelineStages.length - 1;
                  return (
                    <div key={stage.id} className="relative flex gap-4 pb-6">
                      {!isLast && (
                        <div
                          className={`absolute left-[15px] top-8 w-0.5 h-full ${stage.progress === 100 ? "bg-emerald-200" : "bg-slate-200"}`}
                        />
                      )}
                      <div className="flex flex-col items-center">
                        <div
                          className={`size-8 rounded-full border-2 flex items-center justify-center ${stage.progress === 100 ? "border-emerald-400 bg-emerald-50" : stage.isActive ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white"}`}
                        >
                          <Icon size={16} className={color} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-bold text-slate-800">{stage.name}</h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              stage.progress === 100
                                ? "text-emerald-600 bg-emerald-50"
                                : stage.isActive
                                  ? "text-indigo-600 bg-indigo-50"
                                  : "text-slate-400 bg-slate-50"
                            }`}
                          >
                            {stage.progress === 100
                              ? "Completed"
                              : stage.isActive
                                ? "In Progress"
                                : "Pending"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all ${stage.progress === 100 ? "bg-emerald-400" : "bg-indigo-400"}`}
                            style={{ width: `${stage.progress}%` }}
                          />
                        </div>
                        {stage.tasks?.length > 0 && (
                          <div className="space-y-1">
                            {stage.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between py-1 px-3 rounded-lg bg-slate-50"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className={`size-2 rounded-full shrink-0 ${task.status === "Done" || task.status === "Completed" ? "bg-emerald-400" : task.status === "In Progress" ? "bg-indigo-400" : "bg-slate-300"}`}
                                  />
                                  <span
                                    className={`text-xs ${task.status === "Done" || task.status === "Completed" ? "text-slate-400 line-through" : "text-slate-700"}`}
                                  >
                                    {task.title}
                                  </span>
                                </div>
                                {task.dueDate && (
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : interestedCountry ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
            <Globe size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-sm font-medium text-slate-500">
              No visa workflow configured for {interestedCountry}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Contact your counselor for more information.
            </p>
          </div>
        ) : null)}

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-bold text-slate-800 mb-4">Quick Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: "Name", value: student?.name },
            { label: "Email", value: student?.email },
            { label: "Phone", value: student?.phone || "-" },
            { label: "Nationality", value: student?.nationality || "-" },
            { label: "Study Level", value: student?.studyLevel || "-" },
            { label: "Interested Country", value: student?.interestedCountry || "-" },
            { label: "Status", value: student?.status || "-" },
            { label: "Counselor", value: student?.counselor || "Not assigned" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {item.label}
              </div>
              <div className="font-medium text-slate-700 mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
