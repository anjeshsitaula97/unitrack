"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  ClipboardList,
  FileText,
  GraduationCap,
  CreditCard,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { safeJson } from "@/lib/fetch-client";

const stepMeta = [
  { label: "Personal Info", icon: User },
  { label: "Documents", icon: FileText },
  { label: "Application", icon: ClipboardList },
  { label: "Admission", icon: GraduationCap },
  { label: "Payment", icon: CreditCard },
  { label: "Visa", icon: Shield },
];

const emptyStepData = (step: number) => ({
  step,
  completed: false,
  data: {},
});

export default function OnboardingContent() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/students?perPage=100")
      .then(safeJson)
      .then((data) => {
        setStudents(data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadProgress = async (studentId: string) => {
    try {
      const res = await fetch(`/api/onboarding?studentId=${studentId}`);
      const data = await safeJson(res);
      const steps = data?.length > 0 ? data : stepMeta.map((_, i) => emptyStepData(i + 1));
      setProgress(steps);
      const sd: Record<string, any> = {};
      steps.forEach((s: any) => {
        sd[s.step] = s.data || {};
      });
      setStepData(sd);
      setCurrentStep(steps.findIndex((s: any) => !s.completed));
      if (currentStep === -1 || steps.every((s: any) => s.completed)) setCurrentStep(0);
    } catch {
      setProgress(stepMeta.map((_, i) => emptyStepData(i + 1)));
      setStepData({});
      setCurrentStep(0);
    }
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    loadProgress(student.id);
  };

  const updateStepData = (key: string, value: any) => {
    setStepData((prev) => ({
      ...prev,
      [currentStep + 1]: { ...(prev[currentStep + 1] || {}), [key]: value },
    }));
  };

  const saveProgress = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const stepIndex = currentStep + 1;
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          step: stepIndex,
          data: stepData[stepIndex] || {},
          completed: true,
        }),
      });
      if (res.ok) {
        toast.success(`Step ${stepIndex} completed`);
        loadProgress(selectedStudent.id);
      } else toast.error("Save failed");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          Student Onboarding
        </h1>
      </div>

      {!selectedStudent ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search student by name or email..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            {students.map((student) => (
              <button
                type="button"
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3"
              >
                <div className="size-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                  {student.firstName?.[0]}
                  {student.lastName?.[0]}
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-white text-sm">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {student.email} &middot; {student.nationality || "N/A"}
                  </div>
                </div>
                <ChevronRight size={16} className="ml-auto text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="size-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {selectedStudent.firstName?.[0]}
              {selectedStudent.lastName?.[0]}
            </div>
            <div>
              <div className="font-bold text-slate-800 dark:text-white">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </div>
              <div className="text-xs text-slate-400">{selectedStudent.email}</div>
            </div>
          </div>

          <div className="flex justify-between mb-8">
            {stepMeta.map((step, i) => {
              const prog = progress[i];
              const completed = prog?.completed;
              const isActive = i === currentStep;
              const Icon = step.icon;
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className="flex flex-col items-center gap-1 relative"
                >
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center transition-all ${completed ? "bg-emerald-500 text-white" : isActive ? "bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-800" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}
                  >
                    {completed ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? "text-indigo-600" : completed ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">
              {stepMeta[currentStep].label}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {currentStep === 0 && (
                <>
                  {[
                    "firstName",
                    "lastName",
                    "email",
                    "phone",
                    "nationality",
                    "dateOfBirth",
                    "gender",
                    "address",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type={field === "dateOfBirth" ? "date" : "text"}
                        value={stepData[1]?.[field] || ""}
                        onChange={(e) => updateStepData(field, e.target.value)}
                        placeholder={field}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </>
              )}
              {currentStep === 1 && (
                <>
                  {[
                    "passportNumber",
                    "passportExpiry",
                    "transcriptFile",
                    "recommendationLetter",
                    "statementOfPurpose",
                    "resume",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      {field === "transcriptFile" ||
                      field === "recommendationLetter" ||
                      field === "statementOfPurpose" ||
                      field === "resume" ? (
                        <input
                          type="file"
                          className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/20 file:text-indigo-600 dark:file:text-indigo-400"
                          onChange={(e) => updateStepData(field, e.target.files?.[0]?.name || "")}
                        />
                      ) : (
                        <input
                          type={field === "passportExpiry" ? "date" : "text"}
                          value={stepData[2]?.[field] || ""}
                          onChange={(e) => updateStepData(field, e.target.value)}
                          placeholder={field}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                </>
              )}
              {currentStep === 2 && (
                <>
                  {[
                    "preferredUniversity",
                    "preferredCourse",
                    "intake",
                    "applicationFee",
                    "essay",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type={field === "intake" ? "date" : "text"}
                        value={stepData[3]?.[field] || ""}
                        onChange={(e) => updateStepData(field, e.target.value)}
                        placeholder={field}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </>
              )}
              {currentStep === 3 && (
                <>
                  {[
                    "offerLetterDate",
                    "offerStatus",
                    "acceptanceDeadline",
                    "conditionalRequirements",
                    "scholarshipOffered",
                    "scholarshipAmount",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      {field === "offerStatus" ? (
                        <select
                          value={stepData[4]?.[field] || ""}
                          onChange={(e) => updateStepData(field, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select...</option>
                          {["Received", "Accepted", "Rejected", "Deferred", "Conditional"].map(
                            (o) => (
                              <option key={o}>{o}</option>
                            )
                          )}
                        </select>
                      ) : (
                        <input
                          type={
                            field.includes("Date") || field.includes("Deadline") ? "date" : "text"
                          }
                          value={stepData[4]?.[field] || ""}
                          onChange={(e) => updateStepData(field, e.target.value)}
                          placeholder={field}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                </>
              )}
              {currentStep === 4 && (
                <>
                  {[
                    "tuitionFee",
                    "depositPaid",
                    "depositAmount",
                    "paymentDate",
                    "paymentMethod",
                    "financialProof",
                    "sponsorName",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      {field === "paymentMethod" ? (
                        <select
                          value={stepData[5]?.[field] || ""}
                          onChange={(e) => updateStepData(field, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select...</option>
                          {[
                            "Bank Transfer",
                            "Credit Card",
                            "Wire Transfer",
                            "Cash",
                            "Scholarship",
                          ].map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : field.includes("Date") ? (
                        <input
                          type="date"
                          value={stepData[5]?.[field] || ""}
                          onChange={(e) => updateStepData(field, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <input
                          type={
                            field.includes("Amount") || field.includes("Fee") ? "number" : "text"
                          }
                          value={stepData[5]?.[field] || ""}
                          onChange={(e) => updateStepData(field, e.target.value)}
                          placeholder={field}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                </>
              )}
              {currentStep === 5 && (
                <>
                  {[
                    "visaType",
                    "visaStatus",
                    "visaApplicationDate",
                    "visaApprovalDate",
                    "biometricsDate",
                    "interviewDate",
                    "visaValidity",
                    "visaRejectionReason",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      {field === "visaStatus" ? (
                        <select
                          value={stepData[6]?.[field] || ""}
                          onChange={(e) => updateStepData(field, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select...</option>
                          {[
                            "Not Started",
                            "Documents Submitted",
                            "Biometrics Completed",
                            "Interview Scheduled",
                            "Approved",
                            "Rejected",
                            "Visa Received",
                          ].map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : field.includes("Date") ? (
                        <input
                          type="date"
                          value={stepData[6]?.[field] || ""}
                          onChange={(e) => updateStepData(field, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={stepData[6]?.[field] || ""}
                          onChange={(e) => updateStepData(field, e.target.value)}
                          placeholder={field}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={saveProgress}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
              >
                {saving && <Loader2 className="animate-spin" size={16} />} Complete Onboarding
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
