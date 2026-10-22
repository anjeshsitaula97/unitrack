"use client";

import { ClipboardList, Languages } from "lucide-react";
import ModalSection from "../ModalSection";
import type { Course, EnglishTestEntry } from "../types";

export default function EnglishRequirementsSection({
  course,
  englishTests,
  subScores,
}: {
  course: Course;
  englishTests: EnglishTestEntry[];
  subScores: { label: string; value: string | null | undefined }[];
}) {
  return (
    <ModalSection icon={<Languages size={14} />} title="English Language Requirements">
      <div className="space-y-3">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                {course.englishLanguageType || "IELTS"}
              </p>
              <p className="text-xs font-semibold text-slate-500">Minimum overall requirement</p>
            </div>
            <span className="text-2xl font-black text-indigo-700 shrink-0">
              {course.englishOverallScore || "—"}
            </span>
          </div>
          {subScores.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-indigo-100">
              {subScores.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    {s.label}
                  </p>
                  <p className="text-sm font-bold text-slate-700">{s.value}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-indigo-100">
            <ClipboardList size={13} className="text-slate-400 shrink-0" />
            <p className="text-[11px] font-semibold text-slate-500">
              {course.englishTestStage === "After Application"
                ? "Score may be submitted before visa lodgement."
                : "Score must be submitted before the application is accepted."}
            </p>
          </div>
        </div>

        {englishTests.length > 0 && (
          <div className="space-y-2">
            {englishTests.map((test) => {
              const rows = [
                { label: "Reading", value: test.reading },
                { label: "Writing", value: test.writing },
                { label: "Listening", value: test.listening },
                { label: "Speaking", value: test.speaking },
              ].filter((r) => r.value);
              return (
                <div
                  key={`english-test-${test.type || "test"}-${test.overall || ""}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black text-slate-700">
                      {test.type || "English Test"}
                    </span>
                    {test.overall && (
                      <span className="text-[11px] font-black text-indigo-700 bg-indigo-100 rounded-full px-2 py-0.5">
                        Overall {test.overall}
                      </span>
                    )}
                  </div>
                  {rows.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                      {rows.map((r) => (
                        <div key={r.label} className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                            {r.label}
                          </p>
                          <p className="text-xs font-bold text-slate-700">{r.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModalSection>
  );
}
