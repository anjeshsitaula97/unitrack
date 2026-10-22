"use client";

import { CheckCircle, ChevronDown, Clock, Info, ListChecks, User, XCircle } from "lucide-react";
import type { EligibilityResult } from "@/lib/eligibility";
import type { Student } from "../types";

export default function EnrollmentConfirmStep({
  students,
  selectedStudentId,
  studentName,
  studentEmail,
  eligibility,
  criteriaBlocked,
  onSelectStudent,
  onNameChange,
  onEmailChange,
  onBack,
  onConfirm,
}: {
  students: Student[];
  selectedStudentId: string;
  studentName: string;
  studentEmail: string;
  eligibility: EligibilityResult | null;
  criteriaBlocked: boolean;
  onSelectStudent: (studentId: string) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-6">
          Select a student from your database or enter details manually to complete enrollment.
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
                onChange={(e) => onSelectStudent(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition cursor-pointer appearance-none"
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
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Student full name"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
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
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {eligibility && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ListChecks size={15} className="text-slate-400" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                Admission Criteria
              </span>
            </div>
            {eligibility.allPass ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black ring-1 ring-emerald-500/20">
                <CheckCircle size={11} />
                {eligibility.pending > 0 ? "Met — score pending" : "All criteria met"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black ring-1 ring-rose-500/20">
                <XCircle size={11} />
                Not eligible
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto custom-scrollbar">
            {eligibility.checks.map((check) => (
              <div key={check.key} className="flex items-start gap-3 px-4 py-2.5">
                {check.informational ? (
                  <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
                ) : check.pending ? (
                  <Clock size={15} className="text-amber-500 shrink-0 mt-0.5" />
                ) : check.pass ? (
                  <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold ${check.informational ? "text-slate-600" : "text-slate-700"}`}
                  >
                    {check.label}
                  </p>
                  {check.detail && (
                    <p className="text-[10px] font-medium text-slate-400">{check.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!eligibility && selectedStudentId === "manual" && (
        <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <Info size={12} />
          Eligibility can&apos;t be auto-verified for manually entered students.
        </p>
      )}

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-5 py-2.5 border border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 transition text-xs uppercase tracking-widest"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={criteriaBlocked}
          className="flex-[2] px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {criteriaBlocked ? "Criteria Not Met" : "Confirm Enrollment"}
        </button>
      </div>
    </div>
  );
}
