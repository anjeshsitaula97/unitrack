"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getLatestRates } from "@/lib/forex";
import { fetchStudents } from "@/lib/students-api";
import CoursesHeader from "./course/CoursesHeader";
import CoursesPagination from "./course/CoursesPagination";
import CoursesTableView from "./course/CoursesTableView";
import CoursesToolbar from "./course/CoursesToolbar";
import CourseCard from "./course/CourseCard";
import EnrollmentModal from "./course/EnrollmentModal";
import GuestCheckModal from "./course/GuestCheckModal";
import PrerequisiteModal from "./course/PrerequisiteModal";
import { useCourseFilters } from "./course/useCourseFilters";
import type {
  Course,
  CourseFilterOptions,
  GuestDetails,
  QuickFilter,
  Student,
} from "./course/types";

export default function CoursesContent({
  initialData,
  filterOptions,
}: {
  initialData: Course[];
  filterOptions?: CourseFilterOptions;
}) {
  const [coursesData, setCoursesData] = useState<Course[]>(initialData || []);
  const [quickFilters] = useState<QuickFilter[]>([]);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    qualification: "",
    score: "",
    testType: "",
    overallScore: "",
  });
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showInNPR, setShowInNPR] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({ NPR: 1 });
  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
  const [prerequisiteCourse, setPrerequisiteCourse] = useState<Course | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | number; name: string } | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filters = useCourseFilters({
    courses: coursesData,
    students,
    guestDetails,
    filterOptions,
  });

  useEffect(() => {
    fetchStudents()
      .then((data) => setStudents(data as Student[]))
      .catch(() => {});
  }, []);

  /** Toggles NPR pricing and lazily loads the latest FX rates. */
  const handleToggleNPR = (next: boolean) => {
    setShowInNPR(next);
    if (next && Object.keys(rates).length <= 1) {
      getLatestRates()
        .then(setRates)
        .catch(() => {});
    }
  };

  const handleDelete = (id: string | number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/courses/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`"${deleteConfirm.name}" removed from course catalog`);
        setCoursesData((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete course");
      }
    } catch (_err) {
      toast.error("Network error. Failed to delete course.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="animate-fade-in relative block">
      <CoursesHeader
        courses={coursesData}
        filteredCount={filters.filtered.length}
        facultyCount={filters.faculties.length}
        showInNPR={showInNPR}
        onToggleNPR={handleToggleNPR}
      />

      <CoursesToolbar
        search={filters.search}
        onSearchChange={(value) => {
          filters.setSearch(value);
          filters.resetPage();
        }}
        statusFilter={filters.statusFilter}
        onStatusFilterChange={(value) => {
          filters.setStatusFilter(value);
          filters.resetPage();
        }}
        levelFilter={filters.levelFilter}
        onLevelFilterChange={(value) => {
          filters.setLevelFilter(value);
          filters.resetPage();
        }}
        countryFilter={filters.countryFilter}
        onCountryFilterChange={(value) => {
          filters.setCountryFilter(value);
          filters.setUniversityFilter("all");
          filters.resetPage();
        }}
        universityFilter={filters.universityFilter}
        onUniversityFilterChange={(value) => {
          filters.setUniversityFilter(value);
          filters.resetPage();
        }}
        universities={filters.universityOptions}
        countries={filters.countries}
        sortBy={filters.sortBy}
        onSortChange={(value) => {
          filters.setSortBy(value);
          filters.resetPage();
        }}
        selectedStudentId={filters.selectedStudentId}
        onStudentChange={(value) => {
          filters.setSelectedStudentId(value);
          filters.resetPage();
        }}
        students={students}
        onEditGuest={() => setShowGuestModal(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filters.filtered.length === 0 ? (
        <div className="card px-6 py-16 border-none shadow-sm bg-white/50 backdrop-blur-sm text-center">
          <p className="text-sm font-bold text-slate-500">No courses found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search.</p>
        </div>
      ) : viewMode === "list" ? (
        <CoursesTableView
          courses={filters.paginated}
          showInNPR={showInNPR}
          rates={rates}
          onEnroll={setEnrollingCourse}
          onDelete={handleDelete}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 mb-5">
          {filters.paginated.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              expanded={expandedId === course.id}
              onToggle={() => setExpandedId(expandedId === course.id ? null : course.id)}
              onEnroll={setEnrollingCourse}
              onDelete={handleDelete}
              onPrerequisites={setPrerequisiteCourse}
              quickFilters={quickFilters}
              showInNPR={showInNPR}
              rates={rates}
            />
          ))}
        </div>
      )}

      <CoursesPagination
        page={filters.page}
        totalPages={filters.totalPages}
        perPage={filters.perPage}
        total={filters.filtered.length}
        onPageChange={filters.setPage}
        onPerPageChange={(value) => {
          filters.setPerPage(value);
          filters.resetPage();
        }}
      />

      {/* Prerequisites Modal */}
      {prerequisiteCourse && (
        <PrerequisiteModal
          key={prerequisiteCourse.id}
          course={prerequisiteCourse}
          onClose={() => setPrerequisiteCourse(null)}
        />
      )}

      {/* Enrollment Modal */}
      {enrollingCourse && (
        <EnrollmentModal
          key={enrollingCourse.id}
          course={enrollingCourse}
          onClose={() => setEnrollingCourse(null)}
          quickFilters={quickFilters}
          students={students}
          defaultStudentId={
            filters.selectedStudentId !== "all" && filters.selectedStudentId !== "guest"
              ? filters.selectedStudentId
              : undefined
          }
        />
      )}

      {showGuestModal && (
        <GuestCheckModal
          onClose={() => setShowGuestModal(false)}
          onSave={setGuestDetails}
          initialDetails={guestDetails}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Course"
        message={
          deleteConfirm ? `Are you sure you want to delete the course "${deleteConfirm.name}"?` : ""
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
