"use client";

import { useState } from "react";
import { annualTuition, isSemesterPeriod } from "@/lib/tuition";
import { facultyColors, levelConfig, statusConfig } from "./types";
import type { Course, QuickFilter, Student } from "./types";
import EnrollmentDetailsStep from "./enrollment/EnrollmentDetailsStep";
import EnrollmentConfirmStep from "./enrollment/EnrollmentConfirmStep";
import EnrollmentModalHeader from "./enrollment/EnrollmentModalHeader";
import EnrollmentSuccessStep from "./enrollment/EnrollmentSuccessStep";
import { useEnrollmentForm } from "./enrollment/useEnrollmentForm";

export interface EnrollmentModalProps {
  course: Course;
  onClose: () => void;
  quickFilters: QuickFilter[];
  students: Student[];
  defaultStudentId?: string;
}

export default function EnrollmentModal({
  course,
  onClose,
  quickFilters: _quickFilters,
  students,
  defaultStudentId,
}: EnrollmentModalProps) {
  const [step, setStep] = useState<"details" | "confirm" | "success">("details");
  const form = useEnrollmentForm({ course, students, defaultStudentId });

  const status = statusConfig[course.status] || statusConfig["Draft"];
  const levelStyle = levelConfig[course.level] || { className: "bg-slate-50 text-slate-600" };
  const facultyStyle = facultyColors[course.faculty] || "bg-slate-50 text-slate-600";

  const semesterFee = isSemesterPeriod(course.tuitionFeePeriod);
  const yearlyTuition = annualTuition(course.tuitionFee, course.tuitionFeePeriod);
  const yearlyTuitionLabel = semesterFee
    ? yearlyTuition !== null
      ? yearlyTuition.toLocaleString()
      : course.tuitionFee
    : course.tuitionFee;

  const handleEnroll = () => {
    if (form.handleEnroll()) setStep("success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up overflow-hidden border border-white/20">
        <div className="h-2 w-full shrink-0" style={{ backgroundColor: course.color }} />

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <EnrollmentModalHeader course={course} step={step} onClose={onClose} />

          {step === "details" && (
            <EnrollmentDetailsStep
              course={course}
              status={status}
              levelStyle={levelStyle}
              facultyStyle={facultyStyle}
              semesterFee={semesterFee}
              yearlyTuitionLabel={yearlyTuitionLabel}
              courseIntakes={form.courseIntakes}
              selectedIntake={form.selectedIntake}
              onSelectIntake={form.setSelectedIntake}
              onCancel={onClose}
              onProceed={() => setStep("confirm")}
            />
          )}

          {step === "confirm" && (
            <EnrollmentConfirmStep
              students={students}
              selectedStudentId={form.selectedStudentId}
              studentName={form.studentName}
              studentEmail={form.studentEmail}
              eligibility={form.eligibility}
              criteriaBlocked={form.criteriaBlocked}
              onSelectStudent={form.handleStudentSelect}
              onNameChange={form.setStudentName}
              onEmailChange={form.setStudentEmail}
              onBack={() => setStep("details")}
              onConfirm={handleEnroll}
            />
          )}

          {step === "success" && (
            <EnrollmentSuccessStep
              course={course}
              studentName={form.studentName}
              selectedIntake={form.selectedIntake}
              refNo={form.refNo}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
