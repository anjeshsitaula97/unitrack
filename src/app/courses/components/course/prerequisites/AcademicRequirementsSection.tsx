"use client";

import { GraduationCap } from "lucide-react";
import ModalSection from "../ModalSection";
import type { Course } from "../types";

export default function AcademicRequirementsSection({ course }: { course: Course }) {
  return (
    <ModalSection icon={<GraduationCap size={14} />} title="Academic Requirements">
      <div className="space-y-3">
        {course.academicRequirement && (
          <p className="text-sm text-slate-600 leading-relaxed">{course.academicRequirement}</p>
        )}
        {(course.percentageRequired || course.gpaRequired) && (
          <div className="grid grid-cols-2 gap-3">
            {course.percentageRequired && (
              <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                  Min. Percentage
                </p>
                <p className="text-sm font-bold text-slate-700">{course.percentageRequired}</p>
              </div>
            )}
            {course.gpaRequired && (
              <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                  Min. GPA
                </p>
                <p className="text-sm font-bold text-slate-700">{course.gpaRequired}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ModalSection>
  );
}
