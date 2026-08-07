"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  FileDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  Clock,
  GraduationCap,
  Tag,
  X,
  CheckCircle,
  User,
  ListChecks,
  Info,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Calendar,
  Zap,
  Check,
  DollarSign,
  FileText,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import { getLatestRates, convertToNPR, formatNPR } from "@/lib/forex";
import { safeParseArray } from "@/lib/json";
import { getCountryFlag } from "@/lib/country-flags";

const formatIntake = (intakeStr: string | null | undefined) => {
  if (!intakeStr) return "TBA";
  try {
    if (intakeStr.startsWith("[")) {
      const intakes = JSON.parse(intakeStr);
      if (Array.isArray(intakes) && intakes.length > 0) {
        // Check if any intake is currently open
        const now = new Date();
        const openIntake = intakes.find((i) => {
          const open = new Date(i.openDate);
          const deadline = new Date(i.deadline);
          return now >= open && now <= deadline;
        });

        if (openIntake) return `${openIntake.name} (Open)`;

        const first = intakes[0];
        return `${first.name}${intakes.length > 1 ? ` (+${intakes.length - 1})` : ""}`;
      }
    }
  } catch (_e) {
    // Fallback to legacy string
  }
  return intakeStr;
};

const getIntakeStatus = (intake: { openDate: string; deadline: string }) => {
  if (!intake.openDate || !intake.deadline) return null;
  const now = new Date();
  const open = new Date(intake.openDate);
  const deadline = new Date(intake.deadline);

  if (now < open) return { label: "Upcoming", className: "text-amber-600 bg-amber-50" };
  if (now > deadline) return { label: "Closed", className: "text-rose-600 bg-rose-50" };
  return { label: "Open", className: "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-500/20" };
};

const getAppStatus = (course: { applicationDeadline?: string | Date | null; status?: string }) => {
  const openCls = "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-500/20";
  const closedCls = "text-red-600 bg-red-50 ring-1 ring-red-500/20";
  if (course.applicationDeadline) {
    const deadline = new Date(course.applicationDeadline);
    if (!isNaN(deadline.getTime())) {
      return deadline < new Date()
        ? { label: "Applications Closed", className: closedCls }
        : { label: "Applications Open", className: openCls };
    }
  }
  return course.status === "Active"
    ? { label: "Applications Open", className: openCls }
    : { label: "Applications Closed", className: closedCls };
};

const statusConfig: Record<string, { label: string; className: string }> = {
  Active: { label: "Active", className: "badge-active" },
  Draft: { label: "Draft", className: "badge-draft" },
  Archived: { label: "Archived", className: "badge-archived" },
};

const levelConfig: Record<string, { className: string }> = {
  Undergraduate: { className: "bg-sky-50 text-sky-700" },
  Postgraduate: { className: "bg-violet-50 text-violet-700" },
  PhD: { className: "bg-amber-50 text-amber-700" },
};

const facultyColors: Record<string, string> = {
  "Computer Science": "bg-indigo-50 text-indigo-700",
  "Business & MBA": "bg-emerald-50 text-emerald-700",
  Engineering: "bg-orange-50 text-orange-700",
  "Medicine & Health": "bg-pink-50 text-pink-700",
  "Arts & Humanities": "bg-purple-50 text-purple-700",
  "Natural Sciences": "bg-teal-50 text-teal-700",
};

interface Course {
  id: string | number;
  name: string;
  university: string;
  universityId: string | number;
  faculty: string;
  degreeType: string;
  level: string;
  credits: number;
  duration: string;
  enrolled?: number;
  status: string;
  startDate?: string | null;
  color?: string;
  initials?: string;
  instructor: string;
  description: string;
  prerequisites: string[];
  intake?: string | null;
  percentageRequired?: string | null;
  gpaRequired?: string | null;
  tuitionFee?: string | null;
  applicationFee?: string | null;
  currency?: string | null;
  quickFilters?: string[];
  universityLogo?: string | null;
  applicationDeadline?: string | Date | null;
  courseCode?: string | null;
  country?: string | null;
  englishOverallScore?: string | null;
  englishLanguageType?: string | null;
}

interface Intake {
  name: string;
  openDate: string;
  deadline: string;
}

interface QuickFilter {
  label: string;
}

interface EducationEntry {
  qualification: string;
  score?: string;
}

interface Student {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  education?: string | EducationEntry[] | null;
  testType?: string | null;
  overallScore?: string | null;
}

interface GuestDetails {
  qualification: string;
  score: string;
  testType: string;
  overallScore: string;
}

interface EnrollmentModalProps {
  course: Course;
  onClose: () => void;
  quickFilters: QuickFilter[];
  students: Student[];
}

function GuestCheckModal({
  onClose,
  onSave,
  initialDetails,
}: {
  onClose: () => void;
  onSave: (details: GuestDetails) => void;
  initialDetails: GuestDetails;
}) {
  const [details, setDetails] = useState<GuestDetails>(initialDetails);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden border border-white/20">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800">Guest Student Details</h3>
            <button type="button" aria-label="Close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="guest-qualification"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                Highest Qualification
              </label>
              <select
                id="guest-qualification"
                value={details.qualification}
                onChange={(e) => setDetails({ ...details, qualification: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all cursor-pointer"
              >
                <option value="">Select Qualification…</option>
                <option value="+2/Grade XII">+2 / Grade XII</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="guest-score"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                GPA / Percentage
              </label>
              <input
                id="guest-score"
                type="text"
                value={details.score}
                onChange={(e) => setDetails({ ...details, score: e.target.value })}
                placeholder="e.g. 3.5 or 75%"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="guest-test-type"
                  className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
                >
                  English Test
                </label>
                <select
                  id="guest-test-type"
                  value={details.testType}
                  onChange={(e) => setDetails({ ...details, testType: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all cursor-pointer"
                >
                  <option value="">Select Test…</option>
                  <option value="IELTS">IELTS</option>
                  <option value="PTE">PTE</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="DuoLingo">DuoLingo</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="guest-overall-score"
                  className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Overall Score
                </label>
                <input
                  id="guest-overall-score"
                  type="text"
                  value={details.overallScore}
                  onChange={(e) => setDetails({ ...details, overallScore: e.target.value })}
                  placeholder="e.g. 7.0 or 65"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(details);
                onClose();
              }}
              className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all text-xs uppercase tracking-widest"
            >
              Save & Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnrollmentModal({
  course,
  onClose,
  quickFilters: _quickFilters,
  students,
}: EnrollmentModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "confirm" | "success">("details");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [refNo, setRefNo] = useState("");

  const courseIntakes = useMemo<Intake[]>(() => {
    try {
      if (course.intake && course.intake.startsWith("[")) {
        return JSON.parse(course.intake);
      }
    } catch (_e) {}
    return [];
  }, [course.intake]);

  const defaultIntake = useMemo(() => {
    if (courseIntakes.length > 0) {
      const now = new Date();
      const open = courseIntakes.find((i) => {
        const o = new Date(i.openDate);
        const d = new Date(i.deadline);
        return now >= o && now <= d;
      });
      return open ? open.name : courseIntakes[0].name;
    }
    return course.intake || "";
  }, [courseIntakes, course.intake]);

  const [selectedIntake, setSelectedIntake] = useState(defaultIntake);

  const status = statusConfig[course.status] || statusConfig["Draft"];
  const levelStyle = levelConfig[course.level] || { className: "bg-slate-50 text-slate-600" };
  const facultyStyle = facultyColors[course.faculty] || "bg-slate-50 text-slate-600";

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (studentId === "manual") {
      setStudentName("");
      setStudentEmail("");
      return;
    }
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setStudentName(student.name);
      setStudentEmail(student.email || "");
    }
  };

  const handleEnroll = () => {
    if (!studentName.trim() || !studentEmail.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setRefNo(`ENR-${Date.now().toString().slice(-8)}`);
    setStep("success");
  };

  const steps = [
    { id: "details", label: "Course Details", icon: <BookOpen size={12} /> },
    { id: "confirm", label: "Student Details", icon: <User size={12} /> },
    { id: "success", label: "Confirmed", icon: <Check size={12} /> },
  ];
  const stepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-slide-up overflow-hidden border border-white/20">
        <div className="h-2 w-full" style={{ backgroundColor: course.color }} />

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-lg overflow-hidden border border-slate-100 bg-white relative">
                {course.universityLogo ? (
                  <Image
                    src={course.universityLogo}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: course.color }}
                  >
                    {course.initials}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{course.name}</h2>
                  {course.courseCode && (
                    <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-tight">
                      {course.courseCode}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-400">{course.university}</p>
              </div>
            </div>
            <button type="button" aria-label="Close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-7">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    i <= stepIndex
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {s.icon}
                  {s.label}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 rounded-full ${i < stepIndex ? "bg-indigo-500" : "bg-slate-100"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {step === "details" && (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`badge ${status.className}`}>{status.label}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${levelStyle.className}`}
                >
                  {course.level}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100`}
                >
                  <GraduationCap size={10} />
                  {course.degreeType}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${facultyStyle} border border-indigo-100/30`}
                >
                  <Tag size={10} />
                  {course.faculty}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        About Course
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium max-h-[90px] overflow-y-auto pr-2 custom-scrollbar">
                      {course.description}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ListChecks size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Prerequisites
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {course.prerequisites.map((p, i) => (
                        <span
                          key={`prereq-${p}-${i}`}
                          className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md text-[10px] font-bold border border-slate-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                    <span className="text-sm font-black text-slate-700">
                      {course.duration} Years
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Credits</span>
                    <span className="text-sm font-black text-slate-700">{course.credits} Cr.</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Select Intake
                    </span>
                    {courseIntakes.length > 0 ? (
                      <select
                        value={selectedIntake}
                        onChange={(e) => setSelectedIntake(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
                      >
                        {courseIntakes.map((intake, idx: number) => (
                          <option key={`intake-opt-${intake.name}-${idx}`} value={intake.name}>
                            {intake.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm font-black text-indigo-600">
                        {formatIntake(course.intake)}
                      </span>
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Tuition Fee
                    </span>
                    <span className="text-lg font-black text-indigo-600">
                      {course.currency} {course.tuitionFee}
                    </span>
                  </div>
                  {course.applicationFee && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Application Fee
                      </span>
                      <span className="text-lg font-black text-emerald-600">
                        {course.currency} {course.applicationFee}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-2.5 border border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  disabled={course.status !== "Active"}
                  className="flex-[2] px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  Proceed to Enrollment
                </button>
              </div>
            </>
          )}

          {step === "confirm" && (
            <div className="animate-fade-in space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-6">
                  Select a student from your database or enter details manually to complete
                  enrollment.
                </p>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="select-student"
                      className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1"
                    >
                      Select Student
                    </label>
                    <div className="relative group">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                        size={18}
                      />
                      <select
                        id="select-student"
                        value={selectedStudentId}
                        onChange={(e) => handleStudentSelect(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all cursor-pointer appearance-none"
                      >
                        <option value="">Choose an existing student…</option>
                        <option value="manual">Enter details manually</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.email || "No email"})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-300 uppercase">
                      Or Manual Details
                    </span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label
                        htmlFor="student-full-name"
                        className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1"
                      >
                        Full Name
                      </label>
                      <input
                        id="student-full-name"
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Student full name"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="student-email"
                        className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1"
                      >
                        Email Address
                      </label>
                      <input
                        id="student-email"
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex-1 px-5 py-2.5 border border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleEnroll}
                  className="flex-[2] px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all text-xs uppercase tracking-widest"
                >
                  Confirm Enrollment
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center pt-2 animate-fade-in">
              <div className="relative size-24 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
                <div className="relative size-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 ring-8 ring-emerald-50">
                  <Check size={44} className="text-white" strokeWidth={3} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 size-9 rounded-full bg-amber-400 border-4 border-white flex items-center justify-center shadow-md">
                  <Zap size={14} className="text-white" fill="currentColor" />
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-800 mb-1.5">Enrollment Confirmed!</h3>
              <p className="text-sm font-medium text-slate-500 mb-6 flex items-center justify-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>
                  <strong className="text-slate-700">{studentName}</strong> has been successfully
                  enrolled
                </span>
                <Sparkles size={13} className="text-amber-400" />
              </p>

              <div className="bg-gradient-to-br from-slate-50 to-indigo-50/70 border border-slate-100 rounded-3xl p-5 mb-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 rounded-2xl flex items-center justify-center text-white text-sm font-black overflow-hidden border border-white bg-white shadow-sm flex-shrink-0">
                    {course.universityLogo ? (
                      <Image
                        src={course.universityLogo}
                        alt=""
                        width={44}
                        height={44}
                        className="object-contain p-1"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: course.color }}
                      >
                        {course.initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{course.name}</p>
                    <p className="text-xs font-bold text-slate-400 truncate">{course.university}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl px-3.5 py-3 shadow-sm border border-slate-50">
                    <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      <User size={10} /> Student
                    </span>
                    <span className="block text-sm font-black text-slate-700 truncate">
                      {studentName}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl px-3.5 py-3 shadow-sm border border-slate-50">
                    <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      <Calendar size={10} /> Intake
                    </span>
                    <span className="block text-sm font-black text-indigo-600">
                      {selectedIntake || "TBA"}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl px-3.5 py-3 shadow-sm border border-slate-50 col-span-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        <FileText size={10} /> Reference No.
                      </span>
                      <span className="block text-sm font-black text-slate-700 font-mono tracking-wider truncate">
                        {refNo}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black ring-1 ring-emerald-500/20 flex-shrink-0">
                      <CheckCircle size={11} /> Enrolled
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-2.5 border border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/applications")}
                  className="flex-[2] px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <PartyPopper size={14} /> View Applications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrerequisiteModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const requirements = useMemo(() => {
    const vals: string[] = [];
    if (Array.isArray(course.prerequisites)) vals.push(...course.prerequisites);
    return vals;
  }, [course]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-slate-800 truncate">{course.name}</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{course.university}</p>
            </div>
            <button type="button" aria-label="Close" onClick={onClose} className="shrink-0 ml-3">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5">
            {/* Prerequisites / Requirements */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Prerequisites & Requirements
              </h4>
              {requirements.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-6 text-center">
                  <p className="text-sm text-slate-400 font-medium">
                    No prerequisites for this course.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {requirements.map((req, i) => (
                    <div
                      key={`prereq-${i}`}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="size-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-700 truncate">{req}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Required document</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Level
                </p>
                <p className="text-sm font-bold text-slate-700">{course.level}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Degree
                </p>
                <p className="text-sm font-bold text-slate-700">{course.degreeType}</p>
              </div>
              {course.percentageRequired && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Min. Percentage
                  </p>
                  <p className="text-sm font-bold text-slate-700">{course.percentageRequired}</p>
                </div>
              )}
              {course.gpaRequired && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Min. GPA
                  </p>
                  <p className="text-sm font-bold text-slate-700">{course.gpaRequired}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  expanded: boolean;
  onToggle: () => void;
  onEnroll: (course: Course) => void;
  onDelete: (id: string | number, name: string) => void;
  onPrerequisites: (course: Course) => void;
  quickFilters: QuickFilter[];
  showInNPR: boolean;
  rates: Record<string, number>;
}

function CourseCard({
  course,
  expanded,
  onToggle,
  onEnroll,
  onDelete,
  onPrerequisites,
  quickFilters,
  showInNPR,
  rates,
}: CourseCardProps) {
  const router = useRouter();
  const status = statusConfig[course.status] || statusConfig["Draft"];
  const levelStyle = levelConfig[course.level] || { className: "bg-slate-50 text-slate-600" };
  const facultyStyle = facultyColors[course.faculty] || "bg-slate-50 text-slate-600";
  const hasPrereqs = Array.isArray(course.prerequisites) && course.prerequisites.length > 0;
  const appStatus = getAppStatus(course);

  return (
    <div className="card overflow-hidden group hover:shadow-md transition-all duration-200 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-blue-300/10 to-transparent pointer-events-none" />
      {/* Color top bar */}
      <div className="h-1.5 w-full relative" style={{ backgroundColor: course.color }} />

      <div className="p-5">
        {/* Header - Name on Top */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className="text-base font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors cursor-pointer"
                onClick={() => router.push(`/courses/${course.id}`)}
                title="View course details"
              >
                {course.name}
              </h3>
              {course.courseCode && (
                <span className="inline-block mt-1 text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                  {course.courseCode}
                </span>
              )}
            </div>
            <span className={`badge ${status.className} flex-shrink-0 ml-2`}>{status.label}</span>
          </div>

          <div className="flex items-center gap-2 mt-3 p-2 bg-slate-50/50 rounded-xl border border-slate-100/50">
            <div className="size-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden border border-slate-100 bg-white shadow-sm relative">
              {course.universityLogo ? (
                <Image
                  src={course.universityLogo}
                  alt=""
                  fill
                  className="object-contain p-1"
                  sizes="32px"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: course.color }}
                >
                  {course.initials}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-slate-500 truncate">{course.university}</p>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-bold">
              {getCountryFlag(course.country) && (
                <Image
                  src={getCountryFlag(course.country)}
                  alt=""
                  width={24}
                  height={24}
                  className="w-4 h-3 rounded-sm object-cover"
                />
              )}
              {course.country || "Global"}
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div className="text-xs text-slate-500 mb-3 h-[90px] overflow-y-auto pr-1 leading-relaxed custom-scrollbar">
          {course.description}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${levelStyle.className}`}
          >
            {course.level}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700`}
          >
            <GraduationCap size={8} />
            {course.degreeType}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${facultyStyle}`}
          >
            <Tag size={8} />
            {course.faculty}
          </span>
          {course.intake && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700">
              <Calendar size={8} />
              {formatIntake(course.intake)}
            </span>
          )}
          {course.quickFilters &&
            course.quickFilters.slice(0, 3).map((f, i) => {
              const filterInfo = quickFilters.find((q) => q.label === f);
              return (
                <span
                  key={`card-qf-${f}-${i}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100"
                >
                  <Zap size={8} />
                  {filterInfo?.label || f}
                </span>
              );
            })}
          {course.quickFilters && course.quickFilters.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-400 border border-slate-100">
              +{course.quickFilters.length - 3} more
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-[1fr_1fr_1.6fr] gap-2 mb-3">
          <div className="text-center min-w-0">
            <p className="text-xs font-bold text-slate-700 font-tabular truncate">
              {course.credits}
            </p>
            <p className="text-[10px] text-slate-400">Credits</p>
          </div>
          <div className="text-center border-x border-slate-100 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">{course.duration} Yrs</p>
            <p className="text-[10px] text-slate-400">Duration</p>
          </div>
          <div className="text-center min-w-0 space-y-0.5">
            <p className="text-xs font-bold text-indigo-600 font-tabular leading-tight">
              {showInNPR
                ? formatNPR(convertToNPR(course.tuitionFee || "0", course.currency || "USD", rates))
                : `${course.currency} ${course.tuitionFee || "—"}`}
            </p>
            {course.applicationFee ? (
              <p className="text-[10px] font-bold text-emerald-600 leading-tight">
                App. Fee:{" "}
                {showInNPR
                  ? formatNPR(convertToNPR(course.applicationFee, course.currency || "USD", rates))
                  : `${course.currency} ${course.applicationFee}`}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400">Tuition</p>
            )}
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-1.5 mb-3">
          <User size={11} className="text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-500 truncate">{course.instructor}</span>
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1 transition-colors"
        >
          <span>{expanded ? "Hide details" : "Show details"}</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fade-in">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Full Description
              </p>
              <div className="text-xs text-slate-600 leading-relaxed max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {course.description}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Prerequisites
              </p>
              <div className="flex flex-wrap gap-1">
                {course.prerequisites.map((p, i) => (
                  <span
                    key={`card-prereq-${p}-${i}`}
                    className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            {course.quickFilters && course.quickFilters.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Quick Filters
                </p>
                <div className="flex flex-wrap gap-1">
                  {course.quickFilters.map((f, i) => {
                    const filterInfo = quickFilters.find((q) => q.label === f);
                    return (
                      <span
                        key={`expanded-qf-${i}`}
                        className="px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded text-[10px] font-medium"
                      >
                        {filterInfo?.label || f}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Percentage Req.
                </p>
                <p className="text-xs text-slate-700 font-medium">
                  {course.percentageRequired || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  GPA Req.
                </p>
                <p className="text-xs text-slate-700 font-medium">{course.gpaRequired || "N/A"}</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Available Intakes
              </p>
              {(() => {
                try {
                  if (course.intake && course.intake.startsWith("[")) {
                    const intakes = JSON.parse(course.intake);
                    if (Array.isArray(intakes) && intakes.length > 0) {
                      return (
                        <div className="space-y-2">
                          {intakes.map((intakeItem, idx) => {
                            const status = getIntakeStatus(intakeItem);
                            return (
                              <div
                                key={`intake-list-${intakeItem.name}-${idx}`}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                              >
                                <div className="flex items-center gap-2">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span className="text-xs font-bold text-slate-700">
                                    {intakeItem.name}
                                  </span>
                                </div>
                                {status && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${status.className}`}
                                  >
                                    {status.label}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                  }
                } catch (_e) {}
                return (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-slate-400" />
                    <span className="text-xs text-slate-500">
                      Intake:{" "}
                      <strong className="text-slate-700">{formatIntake(course.intake)}</strong>
                    </span>
                  </div>
                );
              })()}
            </div>
            {course.startDate && (
              <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-slate-400" />
                <span className="text-xs text-slate-500">
                  Starts{" "}
                  {new Date(course.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div
          className={`mb-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${appStatus.label === "Applications Open" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-red-600 text-white hover:bg-red-700"}`}
        >
          <span className="size-1.5 rounded-full bg-white" />
          {appStatus.label}
        </div>
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onEnroll(course)}
            className="flex-1 btn-primary text-xs py-1.5 justify-center"
          >
            Quick Enroll
          </button>
          {hasPrereqs && (
            <button
              type="button"
              onClick={() => onPrerequisites(course)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors"
              title="View prerequisites"
            >
              <ListChecks size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push(`/courses/edit/${course.id}`)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(course.id, course.name)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-800 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesContent({ initialData }: { initialData?: Course[] }) {
  const router = useRouter();
  const [COURSES_DATA, setCoursesData] = useState<Course[]>(initialData || []);
  const [quickFilters] = useState<QuickFilter[]>([]);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");
  const [guestDetails, setGuestDetails] = useState({
    qualification: "",
    score: "",
    testType: "",
    overallScore: "",
  });
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showInNPR, setShowInNPR] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({ NPR: 1 });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [degreeTypeFilter, setDegreeTypeFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [universityFilter, setUniversityFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("best");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
  const [prerequisiteCourse, setPrerequisiteCourse] = useState<Course | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | number; name: string } | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetch("/api/students?perPage=500")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setStudents(json.data);
      })
      .catch(() => {});
  }, []);

  const _universities = Array.from(new Set(COURSES_DATA.map((c) => c.university))).sort();
  const faculties = Array.from(new Set(COURSES_DATA.map((c) => c.faculty))).sort();
  const _degreeTypes = Array.from(new Set(COURSES_DATA.map((c) => c.degreeType))).sort();
  const countries = Array.from(new Set(COURSES_DATA.map((c) => c.country)))
    .filter((c): c is string => !!c)
    .sort();

  const filtered = useMemo(() => {
    let data = [...COURSES_DATA];

    // Eligibility Check
    if (selectedStudentId !== "all") {
      const student =
        selectedStudentId === "guest"
          ? {
              id: "guest",
              name: "Guest Student",
              education: JSON.stringify([
                { qualification: guestDetails.qualification, score: guestDetails.score },
              ]),
              testType: guestDetails.testType,
              overallScore: guestDetails.overallScore,
            }
          : students.find((s) => s.id === selectedStudentId);

      if (student) {
        data = data.filter((c) => {
          // 1. Level Check
          const studentEdu =
            typeof student.education === "string"
              ? JSON.parse(student.education)
              : student.education || [];
          const hasPlus2 = studentEdu.some(
            (e: EducationEntry) =>
              e.qualification.toLowerCase().includes("+2") ||
              e.qualification.toLowerCase().includes("grade xii")
          );
          const hasBachelor = studentEdu.some((e: EducationEntry) =>
            e.qualification.toLowerCase().includes("bachelor")
          );

          if (c.level === "Undergraduate" && !hasPlus2) return false;
          if (c.level === "Postgraduate" && !hasBachelor) return false;

          // 2. GPA Check
          if (c.gpaRequired) {
            const reqGpa = parseFloat(c.gpaRequired);
            if (!isNaN(reqGpa)) {
              const relevantEdu =
                c.level === "Undergraduate"
                  ? studentEdu.find(
                      (e: EducationEntry) =>
                        e.qualification.toLowerCase().includes("+2") ||
                        e.qualification.toLowerCase().includes("grade xii")
                    )
                  : studentEdu.find((e: EducationEntry) =>
                      e.qualification.toLowerCase().includes("bachelor")
                    );

              const studentGpa = parseFloat(relevantEdu?.score || "0");
              if (isNaN(studentGpa) || studentGpa < reqGpa) return false;
            }
          }

          // 3. English Proficiency Check
          if (c.englishOverallScore) {
            const reqScore = parseFloat(c.englishOverallScore);
            if (!isNaN(reqScore)) {
              if (student.testType !== c.englishLanguageType) return false;
              const studentScore = parseFloat(student.overallScore || "0");
              if (isNaN(studentScore) || studentScore < reqScore) return false;
            }
          }

          return true;
        });
      }
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.university.toLowerCase().includes(q) ||
          c.faculty.toLowerCase().includes(q) ||
          c.degreeType?.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter((c) => c.status === statusFilter);
    if (facultyFilter !== "all") data = data.filter((c) => c.faculty === facultyFilter);
    if (degreeTypeFilter !== "all") data = data.filter((c) => c.degreeType === degreeTypeFilter);
    if (levelFilter !== "all") data = data.filter((c) => c.level === levelFilter);
    if (universityFilter !== "all") data = data.filter((c) => c.university === universityFilter);
    if (countryFilter !== "all") data = data.filter((c) => c.country === countryFilter);

    if (sortBy === "no-appfee") {
      data = data.filter((c) => !c.applicationFee || (parseFloat(c.applicationFee) || 0) <= 0);
    } else if (sortBy === "tuition-asc" || sortBy === "tuition-desc") {
      data.sort((a, b) => {
        const av = parseFloat(a.tuitionFee || "") || 0;
        const bv = parseFloat(b.tuitionFee || "") || 0;
        return sortBy === "tuition-asc" ? av - bv : bv - av;
      });
    } else if (sortBy === "appfee-asc" || sortBy === "appfee-desc") {
      data.sort((a, b) => {
        const av = parseFloat(a.applicationFee || "") || 0;
        const bv = parseFloat(b.applicationFee || "") || 0;
        return sortBy === "appfee-asc" ? av - bv : bv - av;
      });
    }
    return data;
  }, [
    search,
    statusFilter,
    facultyFilter,
    degreeTypeFilter,
    levelFilter,
    universityFilter,
    countryFilter,
    sortBy,
    COURSES_DATA,
    selectedStudentId,
    students,
    guestDetails,
  ]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string | number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/courses/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`"${deleteConfirm.name}" removed from course catalog`);
        setCoursesData((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete course");
      }
    } catch (_err) {
      toast.error("Network error. Failed to delete course.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="animate-fade-in relative block">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Courses</h1>
          <p className="text-sm text-slate-400">
            {(filtered.length || 0).toLocaleString()} courses across {faculties.length} faculties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const headers = [
                [
                  "Name",
                  "University",
                  "Faculty",
                  "DegreeType",
                  "Level",
                  "Credits",
                  "Duration",
                  "Instructor",
                  "InstructorEmail",
                  "Description",
                  "Prerequisites",
                  "Language",
                  "Mode",
                  "AcademicRequirement",
                  "ScoreRequired",
                  "EnglishLanguageType",
                  "EnglishOverallScore",
                  "EnglishReadingScore",
                  "EnglishWritingScore",
                  "EnglishListeningScore",
                  "EnglishSpeakingScore",
                ],
              ];
              const wb = XLSX.utils.book_new();
              const ws = XLSX.utils.aoa_to_sheet(headers);
              XLSX.utils.book_append_sheet(wb, ws, "Template");
              XLSX.writeFile(wb, "courses_import_template.xlsx");
              toast.success("Excel Template downloaded successfully.");
            }}
            className="btn-secondary"
            title="Download CSV Template"
          >
            <FileDown size={15} />
            Template
          </button>
          <label htmlFor="import-file" className="btn-secondary cursor-pointer">
            <Upload size={15} />
            Import
            <input
              id="import-file"
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
          <button
            type="button"
            onClick={() => toast.info("Export initiated — your file will be ready shortly")}
            className="btn-secondary"
          >
            <Download size={15} />
            Export
          </button>
          <Link href="/courses/add" className="btn-primary">
            <Plus size={15} />
            Add Course
          </Link>
          <button
            type="button"
            onClick={() => {
              const newVal = !showInNPR;
              setShowInNPR(newVal);
              if (newVal && Object.keys(rates).length <= 1) {
                getLatestRates().then(setRates);
              }
            }}
            className={`btn-secondary ${showInNPR ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" : ""}`}
            title="Show in NPR"
          >
            <DollarSign size={15} />
            {showInNPR ? "Showing in NPR" : "Show in NPR"}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          {
            id: "cstrip-total",
            label: "Total Courses",
            value: COURSES_DATA.length.toString(),
            icon: <BookOpen size={14} />,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            id: "cstrip-active",
            label: "Active",
            value: COURSES_DATA.filter((c) => c.status === "Active").length.toString(),
            icon: <GraduationCap size={14} />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            id: "cstrip-draft",
            label: "Draft",
            value: COURSES_DATA.filter((c) => c.status === "Draft").length.toString(),
            icon: <Tag size={14} />,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            id: "cstrip-enrolled",
            label: "Total Enrolled",
            value: COURSES_DATA.reduce((s, c) => s + (c.enrolled || 0), 0).toLocaleString(),
            icon: <Users size={14} />,
            color: "text-violet-600",
            bg: "bg-violet-50",
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

      {/* Search + Filter bar */}
      <div className="card px-5 py-4 mb-5 border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, universities, countries..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-100 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs font-bold border border-slate-100 rounded-xl px-4 py-2.5 bg-white text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer hover:border-slate-200 transition-all appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_8px_center] bg-no-repeat"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs font-bold border border-slate-100 rounded-xl px-4 py-2.5 bg-white text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer hover:border-slate-200 transition-all appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_8px_center] bg-no-repeat"
            >
              <option value="all">All Levels</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="PhD">PhD</option>
            </select>

            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs font-bold border border-slate-100 rounded-xl px-4 py-2.5 bg-white text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer hover:border-slate-200 transition-all appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_8px_center] bg-no-repeat"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={`country-${c}`} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              title="Sort courses"
              className="text-xs font-bold border border-slate-100 rounded-xl px-4 py-2.5 bg-white text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer hover:border-slate-200 transition-all appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_8px_center] bg-no-repeat"
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
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  if (e.target.value === "guest") setShowGuestModal(true);
                  setPage(1);
                }}
                className="text-xs font-bold pl-9 pr-8 py-2.5 border border-slate-100 rounded-xl bg-white text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer hover:border-slate-200 transition-all appearance-none min-w-[180px] relative bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_8px_center] bg-no-repeat"
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
                  onClick={() => setShowGuestModal(true)}
                  className="absolute -top-1 -right-1 size-5 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg border-2 border-white"
                  title="Edit Guest Details"
                >
                  <Edit2 size={10} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all duration-150"
            >
              <Filter size={15} />
              Filters
            </button>

            <div className="flex items-center border border-slate-100 rounded-xl p-1 bg-white">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"}`}
                title="List view"
              >
                <List size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"}`}
                title="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {paginated.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <BookOpen size={36} className="text-slate-300" />
            <p className="font-semibold text-slate-500 text-sm">No courses found</p>
            <p className="text-xs text-slate-400 max-w-xs">Try adjusting your search or filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setFacultyFilter("all");
                setDegreeTypeFilter("all");
                setLevelFilter("all");
                setUniversityFilter("all");
              }}
              className="btn-secondary text-xs"
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : viewMode === "list" ? (
        <div className="card border-none shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-5 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors">
                      Course & Program
                      <ChevronDown size={12} />
                    </div>
                  </th>
                  <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors">
                      University
                      <ChevronDown size={12} />
                    </div>
                  </th>
                  <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    Level
                  </th>
                  <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    Type
                  </th>
                  <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    Duration
                  </th>
                  <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    Tuition Fee
                  </th>
                  <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    Status
                  </th>
                  <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    Applications
                  </th>
                  <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((course) => {
                  const status = statusConfig[course.status] || statusConfig["Draft"];
                  const appStatus = getAppStatus(course);
                  return (
                    <tr
                      key={course.id}
                      className="group hover:bg-slate-50/50 transition-all duration-200"
                    >
                      <td className="py-4 px-5">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow-sm overflow-hidden border border-slate-100 bg-white relative">
                            {course.universityLogo ? (
                              <Image
                                src={course.universityLogo}
                                alt=""
                                fill
                                className="object-contain p-1"
                                sizes="40px"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center font-bold"
                                style={{ backgroundColor: course.color }}
                              >
                                {course.initials}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className="text-sm font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors cursor-pointer"
                                onClick={() => router.push(`/courses/${course.id}`)}
                                title="View course details"
                              >
                                {course.name}
                              </p>
                              {course.courseCode && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                  {course.courseCode}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">
                                {course.faculty}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 truncate max-w-[150px]">
                            {course.university}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {getCountryFlag(course.country) && (
                              <Image
                                src={getCountryFlag(course.country)}
                                alt=""
                                width={24}
                                height={24}
                                className="w-4 h-3 rounded-sm object-cover"
                              />
                            )}
                            {course.country || "Global"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${levelConfig[course.level]?.className || "bg-slate-100 text-slate-600"}`}
                        >
                          {course.level}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100/50">
                          <GraduationCap size={10} />
                          {course.degreeType}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700">
                            {course.duration} Years
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {course.credits} Credits
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 max-w-[140px]">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-indigo-600 tabular-nums truncate">
                            {showInNPR
                              ? formatNPR(
                                  convertToNPR(
                                    course.tuitionFee || "0",
                                    course.currency || "USD",
                                    rates
                                  )
                                )
                              : `${course.currency || "USD"} ${course.tuitionFee?.toLocaleString()}`}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            per year
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.className.replace("badge-", "bg-") + "/10 " + status.className.replace("badge-", "text-")}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mr-2 ${status.className.replace("badge-", "bg-")}`}
                          ></div>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${appStatus.className}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${appStatus.label === "Applications Open" ? "bg-emerald-600" : "bg-rose-600"}`}
                          />
                          {appStatus.label}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button
                            type="button"
                            onClick={() => router.push(`/courses/edit/${course.id}`)}
                            className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="Edit Course"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEnrollingCourse(course)}
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all"
                            title="Quick Enroll"
                          >
                            <Zap size={16} fill="currentColor" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(course.id, course.name)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-all"
                            title="Delete Course"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {paginated.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                ...course,
                prerequisites: safeParseArray(course.prerequisites),
                quickFilters: safeParseArray(course.quickFilters),
              }}
              expanded={expandedId === course.id}
              onToggle={() => setExpandedId(expandedId === course.id ? null : course.id)}
              onEnroll={setEnrollingCourse}
              onDelete={handleDelete}
              onPrerequisites={setPrerequisiteCourse}
              quickFilters={quickFilters}
              showInNPR={showInNPR}
              rates={rates}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card px-5 py-4 border-none shadow-sm flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Show
            </span>
            <div className="relative">
              <select
                className="pl-3 pr-8 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 appearance-none cursor-pointer"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">
              of <strong className="text-slate-700 font-black">{filtered.length}</strong> courses
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="size-8 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1 mx-1">
              {(() => {
                const result = [];
                const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
                let lastPushed = 0;
                for (const p of allPages) {
                  if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                    const showEllipsis = result.length > 0 && p - lastPushed > 1;
                    result.push(
                      <React.Fragment key={`page-${p}`}>
                        {showEllipsis && (
                          <span className="px-2 text-slate-300 text-xs font-black">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPage(p)}
                          className={`size-8 rounded-xl text-xs font-black transition-all ${
                            page === p
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110"
                              : "text-slate-400 hover:bg-white hover:text-slate-600"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                    lastPushed = p;
                  }
                }
                return result;
              })()}
            </div>

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="size-8 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Prerequisites Modal */}
      {prerequisiteCourse && (
        <PrerequisiteModal
          key={prerequisiteCourse.id}
          course={prerequisiteCourse}
          onClose={() => setPrerequisiteCourse(null)}
        />
      )}

      {/* Enrollment Modal */}
      {enrollingCourse && (
        <EnrollmentModal
          key={enrollingCourse.id}
          course={enrollingCourse}
          onClose={() => setEnrollingCourse(null)}
          quickFilters={quickFilters}
          students={students}
        />
      )}

      {showGuestModal && (
        <GuestCheckModal
          onClose={() => setShowGuestModal(false)}
          onSave={setGuestDetails}
          initialDetails={guestDetails}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Course"
        message={
          deleteConfirm ? `Are you sure you want to delete the course "${deleteConfirm.name}"?` : ""
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
