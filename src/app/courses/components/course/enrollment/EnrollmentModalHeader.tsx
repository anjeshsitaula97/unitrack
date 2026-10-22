"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, Check, User, X } from "lucide-react";
import type { Course } from "../types";

const STEPS = [
  { id: "details", label: "Course Details", icon: <BookOpen size={12} /> },
  { id: "confirm", label: "Student Details", icon: <User size={12} /> },
  { id: "success", label: "Confirmed", icon: <Check size={12} /> },
];

/**
 * Course identity block plus the three-step progress indicator.
 */
export default function EnrollmentModalHeader({
  course,
  step,
  onClose,
}: {
  course: Course;
  step: "details" | "confirm" | "success";
  onClose: () => void;
}) {
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <>
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
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${
                i <= stepIndex
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {s.icon}
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded-full ${i < stepIndex ? "bg-indigo-500" : "bg-slate-100"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
