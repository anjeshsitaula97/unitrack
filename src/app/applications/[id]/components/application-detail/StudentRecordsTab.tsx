"use client";

import { useRouter } from "next/navigation";
import type { ApplicationDetail } from "./types";

export default function StudentRecordsTab({
  detail,
  studentName,
}: {
  detail: ApplicationDetail;
  studentName: string;
}) {
  const router = useRouter();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 text-sm">
      <p>
        <span className="font-semibold text-slate-800">Name:</span> {studentName}
      </p>
      <p>
        <span className="font-semibold text-slate-800">Email:</span> {detail.student.email}
      </p>
      <p>
        <span className="font-semibold text-slate-800">Phone:</span> {detail.student.phone || "—"}
      </p>
      <p>
        <span className="font-semibold text-slate-800">Nationality:</span>{" "}
        {detail.student.nationality || "—"}
      </p>
      <p>
        <span className="font-semibold text-slate-800">Address:</span>{" "}
        {detail.student.address || "—"}
      </p>
      <button
        type="button"
        onClick={() => router.push(`/students/${detail.studentId}`)}
        className="mt-2 text-[#1d4ed8] font-semibold text-sm hover:underline"
      >
        Open full student profile →
      </button>
    </div>
  );
}
