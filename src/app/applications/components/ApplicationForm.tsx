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

interface ComboboxOption<T extends string | number> {
  id: T;
  primary: string;
  secondary?: string;
}

interface ComboboxProps<T extends string | number> {
  id: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  disabledPlaceholder?: string;
  selectedText: string | null;
  searchPlaceholder: string;
  searchAriaLabel: string;
  search: string;
  onSearchChange: (value: string) => void;
  open: boolean;
  onToggle: () => void;
  loading: boolean;
  emptyText: string;
  options: ComboboxOption<T>[];
  selectedId: T | null;
  onSelect: (id: T) => void;
  disabled?: boolean;
}

function Combobox<T extends string | number>({
  id,
  label,
  icon,
  placeholder,
  disabledPlaceholder,
  selectedText,
  searchPlaceholder,
  searchAriaLabel,
  search,
  onSearchChange,
  open,
  onToggle,
  loading,
  emptyText,
  options,
  selectedId,
  onSelect,
  disabled,
}: ComboboxProps<T>) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
      >
        {icon} {label}
      </label>
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-left transition hover:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedText ? (
            <span className="text-slate-800">{selectedText}</span>
          ) : (
            <span className="text-slate-400">
              {disabled && disabledPlaceholder ? disabledPlaceholder : placeholder}
            </span>
          )}
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  aria-label={searchAriaLabel}
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  <Loader2 className="animate-spin mx-auto" size={16} />
                </div>
              ) : options.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">{emptyText}</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelect(option.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors flex flex-col ${selectedId === option.id ? "bg-indigo-50 text-indigo-700" : "text-slate-700"}`}
                  >
                    <span className="font-bold">{option.primary}</span>
                    {option.secondary ? (
                      <span className="text-[10px] text-slate-400">{option.secondary}</span>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StudentFieldProps {
  students: Student[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function StudentField({ students, loading, selectedId, onSelect }: StudentFieldProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected = students.find((s) => s.id === selectedId) || null;

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <Combobox<number>
      id="student-select"
      label="Student"
      icon={<GraduationCap size={12} />}
      placeholder="Select a student..."
      selectedText={
        selected ? `${selected.firstName} ${selected.lastName} — ${selected.email}` : null
      }
      searchPlaceholder="Search students..."
      searchAriaLabel="Search students"
      search={search}
      onSearchChange={setSearch}
      open={open}
      onToggle={() => {
        setOpen(!open);
        setSearch("");
      }}
      loading={loading}
      emptyText="No students found"
      options={filtered.map((s) => ({
        id: s.id,
        primary: `${s.firstName} ${s.lastName}`,
        secondary: s.email,
      }))}
      selectedId={selectedId}
      onSelect={(id) => {
        onSelect(id);
        setOpen(false);
      }}
    />
  );
}

interface UniversityFieldProps {
  universities: University[];
  loading: boolean;
  selectedId: string | null;
  studentCountry?: string;
  onSelect: (id: string) => void;
}

function UniversityField({
  universities,
  loading,
  selectedId,
  studentCountry,
  onSelect,
}: UniversityFieldProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected = universities.find((u) => u.id === selectedId) || null;

  const filtered = useMemo(() => {
    let list = universities;
    if (studentCountry) {
      const countryMatch = list.filter(
        (u) => u.country?.toLowerCase() === studentCountry.toLowerCase()
      );
      if (countryMatch.length > 0) list = countryMatch;
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(q) || u.country?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [universities, search, studentCountry]);

  return (
    <Combobox<string>
      id="university-select"
      label="University"
      icon={<Building2 size={12} />}
      placeholder="Select a university..."
      selectedText={selected ? `${selected.name} — ${selected.country}` : null}
      searchPlaceholder="Search universities..."
      searchAriaLabel="Search universities"
      search={search}
      onSearchChange={setSearch}
      open={open}
      onToggle={() => {
        setOpen(!open);
        setSearch("");
      }}
      loading={loading}
      emptyText="No universities found"
      options={filtered.map((u) => ({
        id: u.id,
        primary: u.name,
        secondary: u.city ? `${u.country}, ${u.city}` : u.country,
      }))}
      selectedId={selectedId}
      onSelect={(id) => {
        onSelect(id);
        setOpen(false);
      }}
    />
  );
}

interface CourseFieldProps {
  courses: Course[];
  loading: boolean;
  selectedId: string | null;
  universityId: string | null;
  onSelect: (id: string) => void;
}

function CourseField({ courses, loading, selectedId, universityId, onSelect }: CourseFieldProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected = courses.find((c) => c.id === selectedId) || null;

  const filtered = useMemo(() => {
    if (!search) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.level?.toLowerCase().includes(q)
    );
  }, [courses, search]);

  return (
    <Combobox<string>
      id="course-select"
      label="Course"
      icon={<BookOpen size={12} />}
      placeholder="Select a course..."
      disabledPlaceholder="Select a university first"
      disabled={!universityId}
      selectedText={selected ? `${selected.name} (${selected.level})` : null}
      searchPlaceholder="Search courses..."
      searchAriaLabel="Search courses"
      search={search}
      onSearchChange={setSearch}
      open={open && !!universityId}
      onToggle={() => {
        setOpen(!open);
        setSearch("");
      }}
      loading={loading}
      emptyText="No courses at this university"
      options={filtered.map((c) => ({
        id: c.id,
        primary: c.name,
        secondary: c.level,
      }))}
      selectedId={selectedId}
      onSelect={(id) => {
        onSelect(id);
        setOpen(false);
      }}
    />
  );
}

interface ApplicationSummaryProps {
  student: Student | null;
  university: University | null;
  course: Course | null;
}

function ApplicationSummary({ student, university, course }: ApplicationSummaryProps) {
  if (!student || !university || !course) return null;
  return (
    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1">
      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">
        Application Summary
      </p>
      <p className="text-sm text-slate-700">
        <span className="font-bold">Student:</span> {student.firstName} {student.lastName}
      </p>
      <p className="text-sm text-slate-700">
        <span className="font-bold">University:</span> {university.name}
      </p>
      <p className="text-sm text-slate-700">
        <span className="font-bold">Course:</span> {course.name}
      </p>
    </div>
  );
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

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students", { signal: controller.signal });
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
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUniversities = async () => {
      setLoadingUniversities(true);
      try {
        const res = await fetch("/api/universities", { signal: controller.signal });
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
    return () => controller.abort();
  }, []);

  const handleUniversitySelect = (id: string | null) => {
    setSelectedUniversityId(id);
    if (id) {
      setCourses([]);
      setSelectedCourseId(null);
      setLoadingCourses(true);
    }
  };

  useEffect(() => {
    if (!selectedUniversityId) return;
    const controller = new AbortController();
    fetch(`/api/courses?universityId=${selectedUniversityId}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setCourses(Array.isArray(data) ? data : data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
    return () => controller.abort();
  }, [selectedUniversityId]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || null;
  const selectedUniversity = universities.find((u) => u.id === selectedUniversityId) || null;
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || null;

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
          type="button"
          aria-label="Go back"
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
        <StudentField
          students={students}
          loading={loadingStudents}
          selectedId={selectedStudentId}
          onSelect={setSelectedStudentId}
        />
        <UniversityField
          universities={universities}
          loading={loadingUniversities}
          selectedId={selectedUniversityId}
          studentCountry={selectedStudent?.interestedCountry}
          onSelect={handleUniversitySelect}
        />
        <CourseField
          key={selectedUniversityId ?? "none"}
          courses={courses}
          loading={loadingCourses}
          selectedId={selectedCourseId}
          universityId={selectedUniversityId}
          onSelect={setSelectedCourseId}
        />
        <ApplicationSummary
          student={selectedStudent}
          university={selectedUniversity}
          course={selectedCourse}
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          {submitting ? "Creating..." : "Create Application"}
        </button>
      </div>
    </div>
  );
}
