"use client";

import { useMemo, useState } from "react";
import { evaluateCourseEligibility } from "@/lib/eligibility";
import type { Course, CourseFilterOptions, GuestDetails, Student } from "./types";

/**
 * Filtering, sorting and pagination for the course list.
 *
 * Kept out of the component so the component stays readable and the filter
 * rules live in one place.
 */
export function useCourseFilters({
  courses,
  students,
  guestDetails,
  filterOptions,
}: {
  courses: Course[];
  students: Student[];
  guestDetails: GuestDetails;
  filterOptions?: CourseFilterOptions;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [degreeTypeFilter, setDegreeTypeFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [universityFilter, setUniversityFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("best");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");

  const faculties = useMemo(
    () => Array.from(new Set(courses.map((c) => c.faculty))).sort(),
    [courses]
  );

  const computedCountries = useMemo(
    () =>
      Array.from(new Set(courses.map((c) => c.country)))
        .filter((c): c is string => !!c)
        .sort(),
    [courses]
  );

  const countries = filterOptions?.countries?.length ? filterOptions.countries : computedCountries;

  const universityOptions = useMemo(() => {
    if (filterOptions?.universitiesByCountry && countryFilter !== "all") {
      return filterOptions.universitiesByCountry[countryFilter] || [];
    }
    if (filterOptions?.universities && countryFilter === "all") {
      return filterOptions.universities;
    }
    const source =
      countryFilter !== "all" ? courses.filter((c) => c.country === countryFilter) : courses;
    return Array.from(new Set(source.map((c) => c.university))).sort();
  }, [courses, countryFilter, filterOptions]);

  const filtered = useMemo(() => {
    let data = [...courses];

    // Eligibility Check
    if (selectedStudentId !== "all") {
      const student =
        selectedStudentId === "guest"
          ? {
              id: "guest",
              name: "Guest Student",
              education: JSON.stringify([
                { qualification: guestDetails.qualification, score: guestDetails.score },
              ]),
              testType: guestDetails.testType,
              overallScore: guestDetails.overallScore,
            }
          : students.find((s) => String(s.id) === String(selectedStudentId));

      if (student) {
        data = data.filter(
          (c) =>
            evaluateCourseEligibility(
              {
                level: c.level,
                prerequisites: c.prerequisites,
                requirements: c.requirements,
                academicRequirement: c.academicRequirement,
                percentageRequired: c.percentageRequired,
                gpaRequired: c.gpaRequired,
                englishOverallScore: c.englishOverallScore,
                englishLanguageType: c.englishLanguageType,
                englishTestStage: c.englishTestStage,
                englishReadingScore: c.englishReadingScore,
                englishWritingScore: c.englishWritingScore,
                englishListeningScore: c.englishListeningScore,
                englishSpeakingScore: c.englishSpeakingScore,
                englishTests: c.englishTests,
              },
              student
            ).allPass
        );
      }
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.university.toLowerCase().includes(q) ||
          c.faculty.toLowerCase().includes(q) ||
          c.degreeType?.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter((c) => c.status === statusFilter);
    if (facultyFilter !== "all") data = data.filter((c) => c.faculty === facultyFilter);
    if (degreeTypeFilter !== "all") data = data.filter((c) => c.degreeType === degreeTypeFilter);
    if (levelFilter !== "all") data = data.filter((c) => c.level === levelFilter);
    if (universityFilter !== "all") data = data.filter((c) => c.university === universityFilter);
    if (countryFilter !== "all") data = data.filter((c) => c.country === countryFilter);

    if (sortBy === "no-appfee") {
      data = data.filter((c) => !c.applicationFee || (parseFloat(c.applicationFee) || 0) <= 0);
    } else if (sortBy === "tuition-asc" || sortBy === "tuition-desc") {
      data.sort((a, b) => {
        const av = parseFloat(a.tuitionFee || "") || 0;
        const bv = parseFloat(b.tuitionFee || "") || 0;
        return sortBy === "tuition-asc" ? av - bv : bv - av;
      });
    } else if (sortBy === "appfee-asc" || sortBy === "appfee-desc") {
      data.sort((a, b) => {
        const av = parseFloat(a.applicationFee || "") || 0;
        const bv = parseFloat(b.applicationFee || "") || 0;
        return sortBy === "appfee-asc" ? av - bv : bv - av;
      });
    }
    return data;
  }, [
    search,
    statusFilter,
    facultyFilter,
    degreeTypeFilter,
    levelFilter,
    universityFilter,
    countryFilter,
    sortBy,
    courses,
    selectedStudentId,
    students,
    guestDetails,
  ]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  /** Applies a filter change and returns to the first page. */
  const resetPage = () => setPage(1);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    facultyFilter,
    setFacultyFilter,
    degreeTypeFilter,
    setDegreeTypeFilter,
    levelFilter,
    setLevelFilter,
    universityFilter,
    setUniversityFilter,
    countryFilter,
    setCountryFilter,
    sortBy,
    setSortBy,
    page,
    setPage,
    perPage,
    setPerPage,
    selectedStudentId,
    setSelectedStudentId,
    faculties,
    countries,
    universityOptions,
    filtered,
    paginated,
    totalPages,
    resetPage,
  };
}
