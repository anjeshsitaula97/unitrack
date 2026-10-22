"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { evaluateCourseEligibility, type EligibilityResult } from "@/lib/eligibility";
import { parseIntakes } from "@/lib/intake";
import type { Course, Intake, Student } from "../types";

export interface EnrollmentForm {
  studentName: string;
  studentEmail: string;
  selectedStudentId: string;
  selectedIntake: string;
  refNo: string;
  courseIntakes: Intake[];
  eligibility: EligibilityResult | null;
  criteriaBlocked: boolean;
  setStudentName: (value: string) => void;
  setStudentEmail: (value: string) => void;
  setSelectedIntake: (value: string) => void;
  handleStudentSelect: (studentId: string) => void;
  handleEnroll: () => boolean;
}

/**
 * Picks the intake that is currently open, falling back to the first one.
 */
export function pickDefaultIntake(courseIntakes: Intake[], rawIntake?: string | null): string {
  if (courseIntakes.length === 0) return rawIntake || "";
  const now = new Date();
  const open = courseIntakes.find((i) => {
    const o = new Date(i.openDate);
    const d = new Date(i.deadline);
    return now >= o && now <= d;
  });
  return open ? open.name : courseIntakes[0].name;
}

/**
 * Owns the enrollment form state: student selection, intake choice and the
 * admission-eligibility verdict.
 */
export function useEnrollmentForm({
  course,
  students,
  defaultStudentId,
}: {
  course: Course;
  students: Student[];
  defaultStudentId?: string;
}): EnrollmentForm {
  const preselectedStudent =
    students.find((s) => String(s.id) === String(defaultStudentId)) || null;

  const [studentName, setStudentName] = useState(preselectedStudent?.name || "");
  const [studentEmail, setStudentEmail] = useState(preselectedStudent?.email || "");
  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId || "");
  const [refNo, setRefNo] = useState("");

  const courseIntakes = useMemo<Intake[]>(() => parseIntakes(course.intake), [course.intake]);
  const defaultIntake = useMemo(
    () => pickDefaultIntake(courseIntakes, course.intake),
    [courseIntakes, course.intake]
  );
  const [selectedIntake, setSelectedIntake] = useState(defaultIntake);

  const selectedStudent = useMemo(
    () => students.find((s) => String(s.id) === String(selectedStudentId)) || null,
    [students, selectedStudentId]
  );

  const eligibility: EligibilityResult | null = useMemo(() => {
    if (!selectedStudent) return null;
    return evaluateCourseEligibility(
      {
        level: course.level,
        prerequisites: course.prerequisites,
        requirements: course.requirements,
        academicRequirement: course.academicRequirement,
        percentageRequired: course.percentageRequired,
        gpaRequired: course.gpaRequired,
        englishOverallScore: course.englishOverallScore,
        englishLanguageType: course.englishLanguageType,
        englishTestStage: course.englishTestStage,
        englishReadingScore: course.englishReadingScore,
        englishWritingScore: course.englishWritingScore,
        englishListeningScore: course.englishListeningScore,
        englishSpeakingScore: course.englishSpeakingScore,
        englishTests: course.englishTests,
      },
      {
        education: selectedStudent.education,
        testType: selectedStudent.testType,
        overallScore: selectedStudent.overallScore,
        readingScore: selectedStudent.readingScore,
        writingScore: selectedStudent.writingScore,
        listeningScore: selectedStudent.listeningScore,
        speakingScore: selectedStudent.speakingScore,
      }
    );
  }, [selectedStudent, course]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (studentId === "manual") {
      setStudentName("");
      setStudentEmail("");
      return;
    }
    const student = students.find((s) => String(s.id) === String(studentId));
    if (student) {
      setStudentName(student.name);
      setStudentEmail(student.email || "");
    }
  };

  const criteriaBlocked = eligibility ? !eligibility.allPass : false;

  const handleEnroll = () => {
    if (!studentName.trim() || !studentEmail.trim()) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (criteriaBlocked) {
      toast.error("Student does not meet all admission criteria");
      return false;
    }
    setRefNo(`ENR-${Date.now().toString().slice(-8)}`);
    return true;
  };

  return {
    studentName,
    studentEmail,
    selectedStudentId,
    selectedIntake,
    refNo,
    courseIntakes,
    eligibility,
    criteriaBlocked,
    setStudentName,
    setStudentEmail,
    setSelectedIntake,
    handleStudentSelect,
    handleEnroll,
  };
}
