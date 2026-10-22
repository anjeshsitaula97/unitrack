import type { Course } from "./types";

/** Whether a course lists any admission requirement worth showing. */
export function courseHasPrerequisites(course: Course): boolean {
  return (
    (Array.isArray(course.prerequisites) && course.prerequisites.length > 0) ||
    (Array.isArray(course.requirements) && course.requirements.length > 0) ||
    (Array.isArray(course.englishTests) && course.englishTests.length > 0) ||
    Boolean(course.englishOverallScore) ||
    Boolean(course.englishLanguageType) ||
    Boolean(course.gpaRequired) ||
    Boolean(course.percentageRequired) ||
    Boolean(course.academicRequirement)
  );
}

/** Whether applications are still open for a course. */
export function getAppStatus(course: {
  applicationDeadline?: string | Date | null;
  status?: string;
}): { label: string; className: string } {
  const openCls = "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-500/20";
  const closedCls = "text-red-600 bg-red-50 ring-1 ring-red-500/20";
  if (course.applicationDeadline) {
    const deadline = new Date(course.applicationDeadline);
    if (!isNaN(deadline.getTime())) {
      return deadline < new Date()
        ? { label: "Applications Closed", className: closedCls }
        : { label: "Applications Open", className: openCls };
    }
  }
  return course.status === "Active"
    ? { label: "Applications Open", className: openCls }
    : { label: "Applications Closed", className: closedCls };
}
