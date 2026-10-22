"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  CheckCircle,
  FileText,
  PartyPopper,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import type { Course } from "../types";

export default function EnrollmentSuccessStep({
  course,
  studentName,
  selectedIntake,
  refNo,
  onClose,
}: {
  course: Course;
  studentName: string;
  selectedIntake: string;
  refNo: string;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
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
          <strong className="text-slate-700">{studentName}</strong> has been successfully enrolled
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
            <span className="block text-sm font-black text-slate-700 truncate">{studentName}</span>
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
          className="flex-1 px-5 py-2.5 border border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 transition text-xs uppercase tracking-widest"
        >
          Done
        </button>
        <button
          type="button"
          onClick={() => router.push("/applications")}
          className="flex-[2] px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <PartyPopper size={14} /> View Applications
        </button>
      </div>
    </div>
  );
}
