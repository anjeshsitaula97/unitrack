"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Tag,
  Clock,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  FileText,
  CheckCircle,
  X,
  Globe,
  MapPin,
  Building2,
  Loader2,
  User,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const formatIntake = (intakeStr: string | undefined) => {
  if (!intakeStr) return "TBA";
  try {
    if (typeof intakeStr === "string" && intakeStr.startsWith("[")) {
      const intakes = JSON.parse(intakeStr);
      if (Array.isArray(intakes) && intakes.length > 0) {
        const first = intakes[0];
        return `${first.name}${intakes.length > 1 ? ` (+${intakes.length - 1})` : ""}`;
      }
    }
  } catch (e) {}
  return intakeStr;
};

const getIntakeStatus = (intake: { openDate: string; deadline: string }) => {
  if (!intake.openDate || !intake.deadline) return null;
  const now = new Date();
  const open = new Date(intake.openDate);
  const deadline = new Date(intake.deadline);
  if (now < open) return { label: "Upcoming", className: "text-amber-600 bg-amber-50" };
  if (now > deadline) return { label: "Closed", className: "text-rose-600 bg-rose-50" };
  return { label: "Open", className: "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-500/20" };
};

interface UniversityInfo {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  city?: string;
  logo?: string;
}

interface CourseDetail {
  id: string;
  name: string;
  university: UniversityInfo;
  universityId: string;
  faculty: string;
  degreeType: string;
  level: string;
  credits: number;
  duration: string;
  enrolled: number;
  status: string;
  startDate: string;
  color: string;
  initials: string;
  instructor: string;
  description: string;
  prerequisites: string;
  intake: string;
  language: string;
  mode: string;
  percentageRequired?: string;
  gpaRequired?: string;
  tuitionFee?: string;
  applicationFee?: string;
  currency?: string;
  courseCode?: string;
}

export default function CourseDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) throw new Error("Failed to load course");
        const data = await res.json();
        if (!cancelled) setCourse(data);
      } catch {
        toast.error("Failed to load course details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const prerequisites = useMemo(() => {
    if (!course?.prerequisites) return [];
    try {
      const parsed = JSON.parse(course.prerequisites);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [course]);

  const intakes = useMemo(() => {
    if (!course?.intake || !course.intake.startsWith("[")) return [];
    try {
      const parsed = JSON.parse(course.intake);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [course]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span className="text-sm font-medium text-slate-400">Loading course details…</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 font-medium mb-4">Course not found</p>
        <button
          onClick={() => router.push("/courses")}
          className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg text-sm font-medium"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-slate-800 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/courses")}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </button>
        <div className="flex items-center gap-2">
          <Link
            href={`/courses/edit/${course.id}`}
            className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Edit2 size={14} className="mr-1.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* Course Title Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5">
          <div
            className="size-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0 shadow-sm"
            style={{ backgroundColor: course.color }}
          >
            {course.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{course.name}</h1>
                {course.courseCode && (
                  <span className="text-sm font-medium text-slate-400 mt-0.5 block uppercase">
                    {course.courseCode}
                  </span>
                )}
              </div>
              <span
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  course.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : course.status === "Draft"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {course.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <Building2 size={14} className="text-slate-400" />
                {course.university.name}
              </span>
              {course.university.country && (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={14} className="text-slate-400" />
                  {course.university.country}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Key Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Program Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Level
                </span>
                <span className="text-sm font-bold text-slate-700">{course.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Degree
                </span>
                <span className="text-sm font-bold text-slate-700">{course.degreeType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Faculty
                </span>
                <span className="text-sm font-bold text-slate-700">{course.faculty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Duration
                </span>
                <span className="text-sm font-bold text-slate-700">{course.duration} Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Credits
                </span>
                <span className="text-sm font-bold text-slate-700">{course.credits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Language
                </span>
                <span className="text-sm font-bold text-slate-700">{course.language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Mode
                </span>
                <span className="text-sm font-bold text-slate-700">{course.mode}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Requirements</h2>
            <div className="space-y-3">
              {course.percentageRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Min. Percentage
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {course.percentageRequired}
                  </span>
                </div>
              )}
              {course.gpaRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Min. GPA
                  </span>
                  <span className="text-sm font-bold text-slate-700">{course.gpaRequired}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Fees</h2>
            <div className="space-y-3">
              {course.tuitionFee && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Tuition
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {course.currency || "USD"} {course.tuitionFee}
                  </span>
                </div>
              )}
              {course.applicationFee && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    App. Fee
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {course.currency || "USD"} {course.applicationFee}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Description</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {course.description}
            </p>
          </div>

          {/* Prerequisites */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Prerequisites & Requirements</h2>
            {prerequisites.length === 0 ? (
              <p className="text-sm text-slate-400">No prerequisites for this course.</p>
            ) : (
              <div className="space-y-2">
                {prerequisites.map((req, i) => (
                  <div
                    key={`prereq-${i}`}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="size-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-700 truncate">{req}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Required document</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Intakes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Available Intakes</h2>
            {intakes.length > 0 ? (
              <div className="space-y-2">
                {intakes.map((intakeItem: any, idx: number) => {
                  const status = getIntakeStatus(intakeItem);
                  return (
                    <div
                      key={`intake-${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{intakeItem.name}</span>
                      </div>
                      {status && (
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${status.className}`}
                        >
                          {status.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">{course.intake || "No intake information"}</p>
            )}
          </div>

          {/* Instructor */}
          {course.instructor && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Instructor</h2>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{course.instructor}</p>
                  <p className="text-xs text-slate-400">Course Instructor</p>
                </div>
              </div>
            </div>
          )}

          {/* Start Date */}
          {course.startDate && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Timeline</h2>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} className="text-slate-400" />
                Starts{" "}
                <strong>
                  {new Date(course.startDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
