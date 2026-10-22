"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Edit2, GraduationCap, Trash2, Zap } from "lucide-react";
import { annualTuition, isSemesterPeriod } from "@/lib/tuition";
import { convertToNPR, formatNPR } from "@/lib/forex";
import { getCountryFlag } from "@/lib/country-flags";
import { getAppStatus } from "./courseStatus";
import { levelConfig, statusConfig } from "./types";
import type { Course } from "./types";

export default function CoursesTableView({
  courses,
  showInNPR,
  rates,
  onEnroll,
  onDelete,
}: {
  courses: Course[];
  showInNPR: boolean;
  rates: Record<string, number>;
  onEnroll: (course: Course) => void;
  onDelete: (id: string | number, name: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="card border-none shadow-sm overflow-hidden bg-white">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50/50">
            <tr className="border-b border-slate-100">
              <th className="py-4 px-5 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all courses"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors">
                  Course & Program
                  <ChevronDown size={12} />
                </div>
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors">
                  University
                  <ChevronDown size={12} />
                </div>
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                Level
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                Type
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                Duration
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                Tuition Fee
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                Status
              </th>
              <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                Applications
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {courses.map((course) => {
              const status = statusConfig[course.status] || statusConfig["Draft"];
              const appStatus = getAppStatus(course);
              return (
                <tr key={course.id} className="group hover:bg-slate-50/50 transition duration-200">
                  <td className="py-4 px-5">
                    <input
                      type="checkbox"
                      aria-label={`Select ${course.name}`}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow-sm overflow-hidden border border-slate-100 bg-white relative">
                        {course.universityLogo ? (
                          <Image
                            src={course.universityLogo}
                            alt=""
                            fill
                            className="object-contain p-1"
                            sizes="40px"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center font-bold"
                            style={{ backgroundColor: course.color }}
                          >
                            {course.initials}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="text-sm font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors text-left"
                            onClick={() => router.push(`/courses/${course.id}`)}
                            title="View course details"
                          >
                            {course.name}
                          </button>
                          {course.courseCode && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                              {course.courseCode}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">
                            {course.faculty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 truncate max-w-[150px]">
                        {course.university}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {getCountryFlag(course.country) && (
                          <Image
                            src={getCountryFlag(course.country)}
                            alt=""
                            width={24}
                            height={24}
                            className="w-4 h-3 rounded-sm object-cover"
                          />
                        )}
                        {course.country || "Global"}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${levelConfig[course.level]?.className || "bg-slate-100 text-slate-600"}`}
                    >
                      {course.level}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100/50">
                      <GraduationCap size={10} />
                      {course.degreeType}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700">
                        {course.duration} Years
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {course.credits} Credits
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3 max-w-[140px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-indigo-600 tabular-nums truncate">
                        {showInNPR
                          ? formatNPR(
                              convertToNPR(
                                String(
                                  annualTuition(course.tuitionFee, course.tuitionFeePeriod) ?? 0
                                ),
                                course.currency || "USD",
                                rates
                              )
                            )
                          : `${course.currency || "USD"} ${
                              annualTuition(
                                course.tuitionFee,
                                course.tuitionFeePeriod
                              )?.toLocaleString() ?? "—"
                            }`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {isSemesterPeriod(course.tuitionFeePeriod)
                          ? "per year (2 sem)"
                          : "per year"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.className.replace("badge-", "bg-") + "/10 " + status.className.replace("badge-", "text-")}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${status.className.replace("badge-", "bg-")}`}
                      ></div>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${appStatus.className}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${appStatus.label === "Applications Open" ? "bg-emerald-600" : "bg-rose-600"}`}
                      />
                      {appStatus.label}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition transform translate-x-2 group-hover:translate-x-0">
                      <button
                        type="button"
                        onClick={() => router.push(`/courses/edit/${course.id}`)}
                        className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition"
                        title="Edit Course"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEnroll(course)}
                        className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition"
                        title="Quick Enroll"
                      >
                        <Zap size={16} fill="currentColor" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(course.id, course.name)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
