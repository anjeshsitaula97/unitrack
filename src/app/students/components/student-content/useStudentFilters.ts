"use client";

import { useMemo, useState } from "react";
import type { EducationEntry, Student, StudentFilterCriteria, StudentFilterState } from "./types";

function matchesAcademicFilter(student: Student) {
  // Stored education is a JSON string; a malformed value must not break
  // the list render, so fall back to "no match" rather than throwing.
  let edu: EducationEntry[] = [];
  if (Array.isArray(student.education)) {
    edu = student.education;
  } else if (student.education) {
    try {
      const parsed = JSON.parse(String(student.education));
      if (Array.isArray(parsed)) edu = parsed;
    } catch {
      edu = [];
    }
  }
  return edu.some((e) => {
    const score = parseFloat(e.score);
    return !isNaN(score) && score >= 3.5;
  });
}

function matchesEnglishFilter(student: Student) {
  const score = parseFloat(student.overallScore || "0");
  if (student.testType === "IELTS") return score >= 7.0;
  if (student.testType === "PTE") return score >= 65;
  return false;
}

function matchesStudent(student: Student, filters: StudentFilterCriteria) {
  const search = filters.searchQuery.toLowerCase();
  const matchesSearch =
    (student.name || "").toLowerCase().includes(search) ||
    (student.email || "").toLowerCase().includes(search);
  if (!matchesSearch) return false;
  if (filters.statusFilter !== "all" && student.status !== filters.statusFilter) return false;
  if (filters.provinceFilter !== "all" && student.permanentProvince !== filters.provinceFilter)
    return false;
  if (filters.genderFilter !== "all" && student.gender !== filters.genderFilter) return false;
  if (filters.academicFilter !== "all" && !matchesAcademicFilter(student)) return false;
  if (filters.englishFilter !== "all" && !matchesEnglishFilter(student)) return false;
  if (filters.branchFilter !== "all" && student.branchId !== filters.branchFilter) return false;
  if (filters.staffFilter !== "all" && student.counselor !== filters.staffFilter) return false;
  return true;
}

export function useStudentFilters(students: Student[] | undefined): StudentFilterState {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [academicFilter, setAcademicFilter] = useState("all");
  const [englishFilter, setEnglishFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setProvinceFilter("all");
    setGenderFilter("all");
    setAcademicFilter("all");
    setEnglishFilter("all");
    setBranchFilter("all");
    setStaffFilter("all");
  };

  const filteredStudents = useMemo(
    () =>
      (students ?? []).filter((s) =>
        matchesStudent(s, {
          searchQuery,
          statusFilter,
          provinceFilter,
          genderFilter,
          academicFilter,
          englishFilter,
          branchFilter,
          staffFilter,
        })
      ),
    [
      students,
      searchQuery,
      statusFilter,
      provinceFilter,
      genderFilter,
      academicFilter,
      englishFilter,
      branchFilter,
      staffFilter,
    ]
  );

  const hasActiveFilters =
    Boolean(searchQuery) ||
    statusFilter !== "all" ||
    provinceFilter !== "all" ||
    genderFilter !== "all" ||
    academicFilter !== "all" ||
    englishFilter !== "all" ||
    branchFilter !== "all" ||
    staffFilter !== "all";

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    provinceFilter,
    setProvinceFilter,
    genderFilter,
    setGenderFilter,
    academicFilter,
    setAcademicFilter,
    englishFilter,
    setEnglishFilter,
    branchFilter,
    setBranchFilter,
    staffFilter,
    setStaffFilter,
    clearFilters,
    hasActiveFilters,
    filteredStudents,
  };
}
