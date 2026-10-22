"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink } from "lucide-react";
import { formatDate, initials } from "./utils";
import type { ApplicationDetail } from "./types";

export default function ApplicationStudentSidebar({
  detail,
  appCount,
  sideOpen,
  onToggleSide,
}: {
  detail: ApplicationDetail;
  appCount: number;
  sideOpen: string | null;
  onToggleSide: (key: string) => void;
}) {
  const router = useRouter();
  const studentName = `${detail.student.firstName} ${detail.student.lastName}`;

  return (
    <aside className="col-span-12 lg:col-span-3 space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
            {initials(detail.student.firstName, detail.student.lastName)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{studentName}</h3>
            <button
              type="button"
              onClick={() => router.push(`/students/${detail.studentId}`)}
              className="text-sm text-[#1d4ed8] underline text-left"
            >
              {String(detail.studentId).slice(-7)} • {appCount} application
              {appCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Applied:{" "}
          <span className="text-slate-900 font-semibold">{formatDate(detail.appliedDate)}</span>
        </p>
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-sm font-bold text-slate-900 mb-2">Program details</h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-1">
            {detail.course.name} · {detail.course.level}
          </p>
          {detail.course.tuitionFee && (
            <p className="text-xs text-slate-500">
              Tuition: {detail.course.currency || ""} {detail.course.tuitionFee}
            </p>
          )}
          {detail.university.website && (
            <a
              href={detail.university.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Learn more about the university website"
              className="inline-flex items-center gap-1 mt-2 text-xs text-[#1d4ed8] font-bold hover:underline"
            >
              Learn more <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {[
          { key: "Application details", warn: false },
          { key: "Student", warn: !detail.student.email || !detail.student.phone },
          { key: "Exams", warn: false },
          { key: "Payment details", warn: false },
        ].map((item) => (
          <div key={item.key}>
            <button
              type="button"
              onClick={() => onToggleSide(item.key)}
              className="w-full flex justify-between items-center px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2">
                {item.key}
                {item.warn && <span className="text-amber-500 text-xs">⚠</span>}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${sideOpen === item.key ? "rotate-180" : ""}`}
              />
            </button>
            {sideOpen === item.key && (
              <div className="mt-1 px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
                {item.key === "Application details" && (
                  <>
                    <p>
                      <span className="font-semibold text-slate-800">Status:</span> {detail.status}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Updated:</span>{" "}
                      {formatDate(detail.updatedAt)}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">University:</span>{" "}
                      {detail.university.name}, {detail.university.country}
                    </p>
                  </>
                )}
                {item.key === "Student" && (
                  <>
                    <p>
                      <span className="font-semibold text-slate-800">Email:</span>{" "}
                      {detail.student.email || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Phone:</span>{" "}
                      {detail.student.phone || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Nationality:</span>{" "}
                      {detail.student.nationality || "—"}
                    </p>
                  </>
                )}
                {item.key === "Exams" && (
                  <p className="text-slate-500">No exam records attached to this application.</p>
                )}
                {item.key === "Payment details" && (
                  <p className="text-slate-500">
                    {detail.course.tuitionFee
                      ? `Listed tuition: ${detail.course.currency || ""} ${detail.course.tuitionFee}`
                      : "No payment details recorded."}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
