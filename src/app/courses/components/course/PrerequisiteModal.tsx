"use client";

import { Info } from "lucide-react";
import PrerequisiteModalHeader from "./PrerequisiteModalHeader";
import AcademicRequirementsSection from "./prerequisites/AcademicRequirementsSection";
import EnglishRequirementsSection from "./prerequisites/EnglishRequirementsSection";
import { OtherRequirementsSection, PrerequisitesSection } from "./prerequisites/RequirementLists";
import { usePrerequisiteData } from "./prerequisites/usePrerequisiteData";
import type { Course } from "./types";

export default function PrerequisiteModal({
  course,
  onClose,
}: {
  course: Course;
  onClose: () => void;
}) {
  const {
    prerequisites,
    requirements,
    englishTests,
    subScores,
    hasEnglish,
    hasAcademic,
    hasAnything,
    hasLeftColumn,
    hasRightColumn,
    twoColumn,
  } = usePrerequisiteData(course);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-slide-up overflow-hidden border border-white/20">
        <PrerequisiteModalHeader course={course} onClose={onClose} />

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div
            className={
              twoColumn
                ? "grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 items-start"
                : "space-y-6"
            }
          >
            {(hasLeftColumn || !hasAnything) && (
              <div className="space-y-6">
                {!hasAnything && (
                  <div className="bg-slate-50 rounded-2xl p-8 text-center">
                    <Info className="mx-auto text-slate-300 mb-2" size={28} />
                    <p className="text-sm text-slate-400 font-medium">
                      No prerequisites or requirements listed for this course.
                    </p>
                  </div>
                )}

                {hasAcademic && <AcademicRequirementsSection course={course} />}

                {hasEnglish && (
                  <EnglishRequirementsSection
                    course={course}
                    englishTests={englishTests}
                    subScores={subScores}
                  />
                )}
              </div>
            )}
            {hasRightColumn && (
              <div className="space-y-6">
                {prerequisites.length > 0 && <PrerequisitesSection prerequisites={prerequisites} />}

                {requirements.length > 0 && (
                  <OtherRequirementsSection requirements={requirements} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition text-xs uppercase tracking-widest"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
