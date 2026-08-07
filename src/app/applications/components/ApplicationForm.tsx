"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  GraduationCap,
  Building2,
  BookOpen,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  interestedCountry?: string;
}

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
}

interface Course {
  id: string;
  name: string;
  level: string;
  universityId: string;
  country: string;
}

export default function ApplicationForm() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [universitySearch, setUniversitySearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [universityDropdownOpen, setUniversityDropdownOpen] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        if (res.ok) {
          const data = await res.json();
          setStudents(Array.isArray(data) ? data : data.data || []);
        }
      } catch {
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedUniversityId) return;

    const fetchCourses = async () => {
      setCourses([]);
      setSelectedCourseId(null);
      setCourseSearch("");
      setLoadingCourses(true);
      try {
        const res = await fetch(`/api/courses?universityId=${selectedUniversityId}`);
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : data.data || []);
        }
      } catch {
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [selectedUniversityId]);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoadingUniversities(true);
      try {
        const res = await fetch("/api/universities");
        if (res.ok) {
          const data = await res.json();
          setUniversities(Array.isArray(data) ? data : data.data || []);
        }
      } catch {
      } finally {
        setLoadingUniversities(false);
      }
    };
    fetchUniversities();
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || null;
  const selectedUniversity = universities.find((u) => u.id === selectedUniversityId) || null;
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || null;

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const filteredUniversities = useMemo(() => {
    let list = universities;
    if (selectedStudent?.interestedCountry) {
      const countryMatch = list.filter(
        (u) => u.country?.toLowerCase() === selectedStudent.interestedCountry!.toLowerCase()
      );
      if (countryMatch.length > 0) list = countryMatch;
    }
    if (universitySearch) {
      const q = universitySearch.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(q) || u.country?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [universities, universitySearch, selectedStudent]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch) return courses;
    const q = courseSearch.toLowerCase();
    return courses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.level?.toLowerCase().includes(q)
    );
  }, [courses, courseSearch]);

  const canSubmit = selectedStudentId && selectedUniversityId && selectedCourseId;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          universityId: selectedUniversityId,
          courseId: selectedCourseId,
        }),
      });
      if (res.ok) {
        toast.success("Application created");
        router.push("/applications");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create application");
      }
    } catch {
      toast.error("Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">New Application</h1>
          <p className="text-sm text-slate-500 mt-0.5">Enroll a student into a university course</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm space-y-6 p-6">
        {/* Student */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <GraduationCap size={12} /> Student
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStudentDropdownOpen(!studentDropdownOpen);
                setStudentSearch("");
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-left transition-all hover:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              {selectedStudent ? (
                <span className="text-slate-800">
                  {selectedStudent.firstName} {selectedStudent.lastName} — {selectedStudent.email}
                </span>
              ) : (
                <span className="text-slate-400">Select a student...</span>
              )}
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {studentDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-48">
                  {loadingStudents ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      <Loader2 className="animate-spin mx-auto" size={16} />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No students found</div>
                  ) : (
                    filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setStudentDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex flex-col ${selectedStudentId === s.id ? "bg-indigo-50 text-indigo-700" : "text-slate-700"}`}
                      >
                        <span className="font-bold">
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400">{s.email}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* University */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Building2 size={12} /> University
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setUniversityDropdownOpen(!universityDropdownOpen);
                setUniversitySearch("");
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-left transition-all hover:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              {selectedUniversity ? (
                <span className="text-slate-800">
                  {selectedUniversity.name} — {selectedUniversity.country}
                </span>
              ) : (
                <span className="text-slate-400">Select a university...</span>
              )}
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {universityDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search universities..."
                      value={universitySearch}
                      onChange={(e) => setUniversitySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-48">
                  {loadingUniversities ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      <Loader2 className="animate-spin mx-auto" size={16} />
                    </div>
                  ) : filteredUniversities.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No universities found
                    </div>
                  ) : (
                    filteredUniversities.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUniversityId(u.id);
                          setUniversityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex flex-col ${selectedUniversityId === u.id ? "bg-indigo-50 text-indigo-700" : "text-slate-700"}`}
                      >
                        <span className="font-bold">{u.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {u.country}
                          {u.city ? `, ${u.city}` : ""}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <BookOpen size={12} /> Course
          </label>
          <div className="relative">
            <button
              type="button"
              disabled={!selectedUniversityId}
              onClick={() => {
                setCourseDropdownOpen(!courseDropdownOpen);
                setCourseSearch("");
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-left transition-all hover:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedCourse ? (
                <span className="text-slate-800">
                  {selectedCourse.name} ({selectedCourse.level})
                </span>
              ) : (
                <span className="text-slate-400">
                  {selectedUniversityId ? "Select a course..." : "Select a university first"}
                </span>
              )}
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {courseDropdownOpen && selectedUniversityId && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-48">
                  {loadingCourses ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      <Loader2 className="animate-spin mx-auto" size={16} />
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No courses at this university
                    </div>
                  ) : (
                    filteredCourses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCourseId(c.id);
                          setCourseDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex flex-col ${selectedCourseId === c.id ? "bg-indigo-50 text-indigo-700" : "text-slate-700"}`}
                      >
                        <span className="font-bold">{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.level}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {selectedStudent && selectedUniversity && selectedCourse && (
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">
              Application Summary
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-bold">Student:</span> {selectedStudent.firstName}{" "}
              {selectedStudent.lastName}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-bold">University:</span> {selectedUniversity.name}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-bold">Course:</span> {selectedCourse.name}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          {submitting ? "Creating..." : "Create Application"}
        </button>
      </div>
    </div>
  );
}
