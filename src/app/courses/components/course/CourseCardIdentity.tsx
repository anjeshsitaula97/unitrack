"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, GraduationCap, Tag, User, Zap } from "lucide-react";
import { getCountryFlag } from "@/lib/country-flags";
import { formatIntakeLabel } from "@/lib/intake";
import { facultyColors, levelConfig, statusConfig } from "./types";
import type { Course, QuickFilter } from "./types";

/**
 * Left-hand column of a course card: identity, logo, description and badges.
 */
export default function CourseCardIdentity({
  course,
  quickFilters,
}: {
  course: Course;
  quickFilters: QuickFilter[];
}) {
  const router = useRouter();
  const status = statusConfig[course.status] || statusConfig["Draft"];
  const levelStyle = levelConfig[course.level] || { className: "bg-slate-50 text-slate-600" };
  const facultyStyle = facultyColors[course.faculty] || "bg-slate-50 text-slate-600";
  const countryFlag = getCountryFlag(course.country);

  return (
    <div className="flex-1 min-w-0">
      {/* Header - Name on Top */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className="text-2xl font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors truncate text-left"
          onClick={() => router.push(`/courses/${course.id}`)}
          title="View course details"
        >
          {course.name}
        </button>
        <span className={`badge ${status.className} flex-shrink-0`}>{status.label}</span>
        {course.courseCode && (
          <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
            {course.courseCode}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2">
        <div className="size-16 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0 overflow-hidden border border-slate-100 bg-white relative">
          {course.universityLogo ? (
            <Image
              src={course.universityLogo}
              alt=""
              fill
              className="object-contain p-0.5"
              sizes="64px"
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
        <span className="text-xl font-bold text-slate-800 truncate">{course.university}</span>
      </div>

      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1 text-slate-400 font-semibold flex-shrink-0">
          {countryFlag && (
            <Image
              src={countryFlag}
              alt=""
              width={16}
              height={16}
              className="w-3.5 h-2.5 rounded-sm object-cover"
            />
          )}
          {course.country || "Global"}
        </span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1 text-slate-400 font-semibold truncate">
          <User size={11} className="flex-shrink-0" />
          {course.instructor}
        </span>
      </div>

      {/* Short Description */}
      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
        {course.description}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm ring-1 ring-inset ring-black/5 ${levelStyle.className}`}
        >
          <span className="size-1.5 rounded-full bg-current opacity-70" />
          {course.level}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm ring-1 ring-inset ring-black/5 bg-blue-50 text-blue-700">
          <GraduationCap size={13} />
          {course.degreeType}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm ring-1 ring-inset ring-black/5 ${facultyStyle}`}
        >
          <Tag size={13} />
          {course.faculty}
        </span>
        {course.intake && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm ring-1 ring-inset ring-black/5 bg-emerald-50 text-emerald-700">
            <Calendar size={13} />
            {formatIntakeLabel(course.intake)}
          </span>
        )}
        {course.quickFilters &&
          course.quickFilters.slice(0, 2).map((f) => (
            <span
              key={`card-qf-${f}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm ring-1 ring-inset ring-black/5 bg-purple-50 text-purple-700"
            >
              <Zap size={13} />
              {quickFilters.find((q) => q.label === f)?.label || f}
            </span>
          ))}
        {course.quickFilters && course.quickFilters.length > 2 && (
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm ring-1 ring-inset ring-black/5 bg-slate-50 text-slate-500">
            +{course.quickFilters.length - 2} more
          </span>
        )}
      </div>
    </div>
  );
}
