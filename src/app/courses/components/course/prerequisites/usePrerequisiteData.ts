"use client";

import { useMemo } from "react";
import { safeParseArray } from "@/lib/json";
import type { Course, EnglishTestEntry } from "../types";

export interface PrerequisiteData {
  prerequisites: string[];
  requirements: string[];
  englishTests: EnglishTestEntry[];
  subScores: { label: string; value: string | null | undefined }[];
  hasEnglish: boolean;
  hasAcademic: boolean;
  hasAnything: boolean;
  hasLeftColumn: boolean;
  hasRightColumn: boolean;
  twoColumn: boolean;
}

/**
 * Normalises a course's admission requirement fields into the shape the
 * prerequisite modal renders.
 */
export function usePrerequisiteData(course: Course): PrerequisiteData {
  const prerequisites = useMemo(
    () => (Array.isArray(course.prerequisites) ? course.prerequisites.filter(Boolean) : []),
    [course]
  );

  const requirements = useMemo(() => {
    const raw = Array.isArray(course.requirements)
      ? course.requirements
      : safeParseArray<string>(course.requirements);
    return raw.filter(Boolean).map((r) => (typeof r === "string" ? r : String(r)));
  }, [course]);

  const englishTests = useMemo(() => {
    const raw = Array.isArray(course.englishTests)
      ? course.englishTests
      : safeParseArray<EnglishTestEntry>(course.englishTests);
    return raw.filter(
      (t) => t && (t.type || t.overall || t.reading || t.writing || t.listening || t.speaking)
    );
  }, [course]);

  const subScores = [
    { label: "Reading", value: course.englishReadingScore },
    { label: "Writing", value: course.englishWritingScore },
    { label: "Listening", value: course.englishListeningScore },
    { label: "Speaking", value: course.englishSpeakingScore },
  ].filter((s) => s.value);

  const hasEnglish =
    Boolean(course.englishLanguageType) ||
    Boolean(course.englishOverallScore) ||
    subScores.length > 0 ||
    englishTests.length > 0;

  const hasAcademic =
    Boolean(course.academicRequirement) ||
    Boolean(course.percentageRequired) ||
    Boolean(course.gpaRequired);

  const hasAnything =
    prerequisites.length > 0 || requirements.length > 0 || hasEnglish || hasAcademic;
  const hasLeftColumn = hasAcademic || hasEnglish;
  const hasRightColumn = prerequisites.length > 0 || requirements.length > 0;

  return {
    prerequisites,
    requirements,
    englishTests,
    subScores,
    hasEnglish,
    hasAcademic,
    hasAnything,
    hasLeftColumn,
    hasRightColumn,
    twoColumn: hasLeftColumn && hasRightColumn,
  };
}
