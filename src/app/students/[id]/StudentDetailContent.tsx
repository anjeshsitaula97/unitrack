"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Users,
  Map as MapIcon,
  ShieldCheck,
  GraduationCap,
  Zap,
  FileText,
  Edit2,
  Loader2,
  KeyRound,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  MoreVertical,
  ExternalLink,
  Award,
  BookOpen,
  Mail,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { safeJson } from "@/lib/fetch-client";

const capitalize = (str: string) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const parseList = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
  } catch {
    return [String(value)];
  }
};

const STATUS_META: Record<string, { icon: any; color: string; headerBg: string }> = {
  Approved: {
    icon: CheckCircle2,
    color: "text-[#006e2c]",
    headerBg: "bg-[#006e2c]/5 hover:bg-[#006e2c]/10",
  },
  "In Review": {
    icon: Clock,
    color: "text-[#005bbf]",
    headerBg: "bg-[#005bbf]/5 hover:bg-[#005bbf]/10",
  },
  Submitted: {
    icon: FileText,
    color: "text-[#005bbf]",
    headerBg: "bg-[#005bbf]/5 hover:bg-[#005bbf]/10",
  },
  Pending: {
    icon: Clock,
    color: "text-[#727785]",
    headerBg: "bg-[#727785]/5 hover:bg-[#727785]/10",
  },
  Rejected: {
    icon: XCircle,
    color: "text-[#ba1a1a]",
    headerBg: "bg-[#ba1a1a]/5 hover:bg-[#ba1a1a]/10",
  },
};

const requirementIcon = (req: string) => {
  const r = req.toLowerCase();
  if (r.includes("passport")) return ShieldCheck;
  if (r.includes("transcript")) return FileText;
  if (r.includes("certificate") || r.includes("degree")) return Award;
  if (r.includes("cv") || r.includes("resume")) return User;
  if (r.includes("english") || r.includes("ielts") || r.includes("language")) return BookOpen;
  if (r.includes("grade") || r.includes("marksheet") || r.includes("academic"))
    return GraduationCap;
  if (r.includes("sop") || r.includes("statement")) return FileText;
  if (r.includes("lor") || r.includes("recommendation")) return Mail;
  if (r.includes("work") || r.includes("experience")) return Briefcase;
  return FileText;
};

export default function StudentDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState("general");
  const [detailStatus, setDetailStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingCreds, setGeneratingCreds] = useState(false);
  const [apps, setApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then(safeJson)
      .then((data) => {
        setStudent(data);
        setDetailStatus(data.status);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load student");
        setLoading(false);
      });
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!student || !detailStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: detailStatus }),
      });
      if (res.ok) {
        toast.success("Status updated");
        setStudent({ ...student, status: detailStatus });
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update status");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleGenerateCredentials = async () => {
    if (!student) return;
    setGeneratingCreds(true);
    try {
      const res = await fetch(`/api/students/${student.id}/credentials`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to generate credentials");
        return;
      }
      const data = await res.json();
      toast.success(`Credentials: ${data.email} / ${data.password}`);
      setStudent({ ...student, studentPassword: "" });
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setGeneratingCreds(false);
    }
  };

  const fetchApps = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch(`/api/applications?studentId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setApps(data?.data || data || []);
      }
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (detailTab === "applications" && apps.length === 0 && !loadingApps) {
      queueMicrotask(() => {
        fetchApps();
      });
    }
  }, [detailTab]);

  const appGroups = useMemo(() => {
    const map = new Map<string, { app: any; req: string }[]>();
    apps.forEach((app: any) => {
      const reqs =
        parseList(app.course?.requirements).length > 0
          ? parseList(app.course?.requirements)
          : parseList(app.course?.prerequisites);
      const list = reqs.length > 0 ? reqs : ["View application"];
      list.forEach((req) => {
        const key = app.status || "Submitted";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ app, req });
      });
    });
    return [...map.entries()];
  }, [apps]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!student) {
    return <div className="py-20 text-center text-slate-500 font-medium">Student not found</div>;
  }

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "family", label: "Family", icon: Users },
    { id: "address", label: "Address", icon: MapIcon },
    { id: "passport", label: "Passport", icon: ShieldCheck },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "preferences", label: "Preferences", icon: Zap },
    { id: "applications", label: "Applications", icon: Building2 },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/students")}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="text-indigo-600" size={24} />
          Student Details
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-200">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{capitalize(student.name)}</h2>
              <p className="text-sm text-slate-400">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/files?studentId=${student.id}`)}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
            >
              Applications
            </button>
            <button
              type="button"
              onClick={() => router.push(`/students?edit=${student.id}`)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 pb-0">
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">{capitalize(student.name)}</p>
                <p className="text-xs text-slate-500">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-[10px] font-bold text-slate-400 uppercase">DOB:</span>
              <span className="font-medium">{student.dobAd || student.dobBs || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gender:</span>
              <span className="font-medium">{student.gender || "-"}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={detailStatus}
                onChange={(e) => setDetailStatus(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="In Review">In Review</option>
                <option value="Verified">Verified</option>
                <option value="New Leads">New Leads</option>
                <option value="Processing">Processing</option>
                <option value="Applied">Applied</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Visa Approved">Visa Approved</option>
                <option value="Visa Rejected">Visa Rejected</option>
              </select>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updatingStatus || detailStatus === student.status}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? "..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleGenerateCredentials}
                disabled={generatingCreds}
                className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <KeyRound size={12} />
                {generatingCreds ? "..." : "Credentials"}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-fit mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDetailTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  detailTab === tab.id
                    ? "bg-white text-indigo-600 shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {detailTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "First Name", value: student.firstName },
                { label: "Last Name", value: student.lastName },
                { label: "Phone", value: student.phone },
                { label: "WhatsApp", value: student.whatsappNumber },
                { label: "Email", value: student.email },
                { label: "Nationality", value: student.nationality },
                { label: "DOB (AD)", value: student.dobAd },
                { label: "DOB (BS)", value: student.dobBs },
                { label: "Counselor", value: student.counselor },
              ].map((field) => (
                <div key={field.label} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {field.label}
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">{field.value || "-"}</p>
                </div>
              ))}
            </div>
          )}

          {detailTab === "family" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Marital Status
                </p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">
                  {student.maritalStatus || "-"}
                </p>
              </div>
              {student.spouseName && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Spouse Name
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">{student.spouseName}</p>
                </div>
              )}
              {student.guardianName && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Guardian Name
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">
                    {student.guardianName}
                  </p>
                </div>
              )}
              {student.guardianRelation && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Guardian Relation
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">
                    {student.guardianRelation}
                  </p>
                </div>
              )}
              {student.guardianPhone && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Guardian Phone
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">
                    {student.guardianPhone}
                  </p>
                </div>
              )}
              {student.guardianEmail && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Guardian Email
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">
                    {student.guardianEmail}
                  </p>
                </div>
              )}
            </div>
          )}

          {detailTab === "address" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Permanent", "Temporary"].map((type) => {
                const prefix = type === "Permanent" ? "permanent" : "temporary";
                const fields = [
                  { label: "Province", key: `${prefix}Province` },
                  { label: "District", key: `${prefix}District` },
                  { label: "Municipality", key: `${prefix}Municipality` },
                  { label: "Ward", key: `${prefix}WardNo` },
                  { label: "Address", key: `${prefix}Address` },
                ];
                const hasAny = fields.some((f) => student[f.key]);
                return (
                  <div key={type} className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {type}
                    </p>
                    {hasAny ? (
                      <div className="space-y-1 text-sm">
                        {fields.map(
                          (f) =>
                            student[f.key] && (
                              <p key={f.key}>
                                <span className="font-semibold text-slate-500">{f.label}:</span>{" "}
                                <span className="font-medium text-slate-800">{student[f.key]}</span>
                              </p>
                            )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        {type === "Temporary" ? "Same as permanent" : "Not provided"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {detailTab === "passport" &&
            (student.passportNumber ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Passport No.", value: student.passportNumber },
                  { label: "Issue Place", value: student.passportIssuePlace },
                  { label: "Issue Date", value: student.passportIssueDate },
                  { label: "Expiry Date", value: student.passportExpiryDate },
                ].map((field) => (
                  <div key={field.label} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {field.label}
                    </p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">
                      {field.value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No passport details recorded.</p>
            ))}

          {detailTab === "academic" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Study Level", value: student.studyLevel },
                  { label: "Intake Term", value: student.intakeTerm },
                  { label: "Major", value: student.major },
                  { label: "Test Type", value: student.testType },
                  { label: "Overall Score", value: student.overallScore },
                  { label: "MOI", value: student.moi },
                ].map((field) => (
                  <div key={field.label} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {field.label}
                    </p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">
                      {field.value || "-"}
                    </p>
                  </div>
                ))}
              </div>
              {student.education &&
                (() => {
                  try {
                    const edu =
                      typeof student.education === "string"
                        ? JSON.parse(student.education)
                        : student.education;
                    if (Array.isArray(edu) && edu.length > 0 && edu[0].qualification) {
                      return (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Education History
                          </p>
                          <div className="space-y-2">
                            {edu.map((e: any, i: number) => (
                              <div
                                key={i}
                                className="p-3 bg-white border border-slate-100 rounded-xl text-sm"
                              >
                                <p className="font-medium text-slate-800">
                                  {e.qualification}{" "}
                                  {e.institution && (
                                    <span className="text-slate-400">at {e.institution}</span>
                                  )}
                                </p>
                                {e.score && (
                                  <p className="text-xs text-slate-500">
                                    Score: {e.score} {e.year && `(${e.year})`}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  } catch {}
                  return null;
                })()}
              {(student.admissionEmail || student.studentPassword) && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">
                    Application Credentials
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">
                        Admission Email
                      </p>
                      <p className="text-sm text-slate-800">{student.admissionEmail}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-amber-500 uppercase tracking-tighter">
                        Password
                      </p>
                      <p className="text-sm text-slate-800">{student.studentPassword}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {detailTab === "preferences" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Interested Country", value: student.interestedCountry },
                { label: "Target Universities", value: student.targetUniversities },
                { label: "Work Experience", value: student.workExperience ? "Provided" : "-" },
              ].map((field) => (
                <div key={field.label} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {field.label}
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">{field.value || "-"}</p>
                </div>
              ))}
            </div>
          )}

          {detailTab === "applications" && (
            <div>
              {loadingApps ? (
                <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-sm font-bold">Fetching applications…</p>
                </div>
              ) : apps.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="text-slate-200" size={32} />
                  </div>
                  <p className="text-slate-500 font-bold">No applications found</p>
                  <p className="text-slate-400 text-sm">
                    This student hasn&apos;t applied to any courses yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appGroups.map(([status, items]) => {
                    const meta = STATUS_META[status] || {
                      icon: FileText,
                      color: "text-[#005bbf]",
                      headerBg: "bg-[#005bbf]/5 hover:bg-[#005bbf]/10",
                    };
                    const Icon = meta.icon;
                    return (
                      <div
                        key={status}
                        className="bg-white border border-[#c1c6d6] rounded-xl overflow-hidden shadow-sm"
                      >
                        <button
                          type="button"
                          className={`w-full flex items-center justify-between p-4 border-b border-[#c1c6d6] transition-colors ${meta.headerBg}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={meta.color}>
                              <Icon size={22} />
                            </span>
                            <span className="font-bold text-[#181c20]">
                              {status} ({items.length})
                            </span>
                          </div>
                          <span className="text-[#727785]">
                            <ChevronDown size={20} />
                          </span>
                        </button>
                        <div className="divide-y divide-[#c1c6d6]">
                          {items.map(({ app, req }, i) => {
                            const ReqIcon = requirementIcon(req);
                            return (
                              <div
                                key={`${app.id}-${i}`}
                                onClick={() => router.push(`/applications/${app.id}`)}
                                className="flex items-center justify-between p-4 hover:bg-[#f1f4fa] transition-colors group cursor-pointer"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-[#ebeef4] flex items-center justify-center text-[#005bbf] group-hover:bg-[#d8e2ff] shrink-0">
                                    <ReqIcon size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-[#181c20] block truncate">
                                      {req}
                                    </span>
                                    <span className="text-xs text-[#727785] block truncate">
                                      #{String(app.id).substring(String(app.id).length - 6)} •{" "}
                                      {app.course?.name}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/applications/${app.id}`);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-[#005bbf] text-[#005bbf] rounded-lg text-sm font-semibold hover:bg-[#005bbf]/5"
                                  >
                                    <ExternalLink size={16} />
                                    Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/applications/${app.id}`);
                                    }}
                                    className="p-1.5 text-[#727785] hover:text-[#005bbf]"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {detailTab === "documents" && (
            <div>
              {student.documents && student.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {student.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{doc.type}</p>
                          <p className="text-[10px] text-slate-400 truncate">{doc.name}</p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:underline shrink-0"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No documents uploaded.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
