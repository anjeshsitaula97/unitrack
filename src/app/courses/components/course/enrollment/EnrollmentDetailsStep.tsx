"use client";

import { GraduationCap, Info, ListChecks, Tag } from "lucide-react";
import { formatIntakeLabel } from "@/lib/intake";
import type { Course, Intake } from "../types";

export default function EnrollmentDetailsStep({
  course,
  status,
  levelStyle,
  facultyStyle,
  semesterFee,
  yearlyTuitionLabel,
  courseIntakes,
  selectedIntake,
  onSelectIntake,
  onCancel,
  onProceed,
}: {
  course: Course;
  status: { label: string; className: string };
  levelStyle: { className: string };
  facultyStyle: string;
  semesterFee: boolean;
  yearlyTuitionLabel: string | number | null | undefined;
  courseIntakes: Intake[];
  selectedIntake: string;
  onSelectIntake: (value: string) => void;
  onCancel: () => void;
  onProceed: () => void;
}) {
  return (
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
              <span className="text-[10px] font-bold text-slate-400 uppercase">About Course</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium max-h-[90px] overflow-y-auto pr-2 custom-scrollbar">
              {course.description}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ListChecks size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Prerequisites</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {course.prerequisites.map((p) => (
                <span
                  key={`prereq-${p}`}
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
            <span className="text-sm font-black text-slate-700">{course.duration} Years</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Credits</span>
            <span className="text-sm font-black text-slate-700">{course.credits} Cr.</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Select Intake</span>
            {courseIntakes.length > 0 ? (
              <select
                aria-label="Select intake"
                value={selectedIntake}
                onChange={(e) => onSelectIntake(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 transition cursor-pointer"
              >
                {courseIntakes.map((intake) => (
                  <option key={`intake-opt-${intake.name}`} value={intake.name}>
                    {intake.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-black text-indigo-600">
                {formatIntakeLabel(course.intake)}
              </span>
            )}
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Tuition Fee
            </span>
            <span className="text-lg font-black text-indigo-600">
              {course.currency} {yearlyTuitionLabel}
              <span className="text-xs font-bold text-slate-400"> /yr</span>
            </span>
            {semesterFee && (
              <span className="block text-[10px] font-bold text-slate-400 mt-0.5">
                {course.currency} {course.tuitionFee} per semester (2 semesters/year)
              </span>
            )}
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
          onClick={onCancel}
          className="flex-1 px-5 py-2.5 border border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 transition text-xs uppercase tracking-widest"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onProceed}
          disabled={course.status !== "Active"}
          className="flex-[2] px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition text-xs uppercase tracking-widest disabled:opacity-50"
        >
          Proceed to Enrollment
        </button>
      </div>
    </>
  );
}
