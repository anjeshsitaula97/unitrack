"use client";

import CourseCardDetails from "./CourseCardDetails";
import CourseCardIdentity from "./CourseCardIdentity";
import CourseCardSummary from "./CourseCardSummary";
import { courseHasPrerequisites } from "./courseStatus";
import type { Course, QuickFilter } from "./types";

export interface CourseCardProps {
  course: Course;
  expanded: boolean;
  onToggle: () => void;
  onEnroll: (course: Course) => void;
  onDelete: (id: string | number, name: string) => void;
  onPrerequisites: (course: Course) => void;
  quickFilters: QuickFilter[];
  showInNPR: boolean;
  rates: Record<string, number>;
}

export default function CourseCard({
  course,
  expanded,
  onToggle,
  onEnroll,
  onDelete,
  onPrerequisites,
  quickFilters,
  showInNPR,
  rates,
}: CourseCardProps) {
  const hasPrereqs = courseHasPrerequisites(course);

  return (
    <div className="card overflow-hidden group hover:shadow-md transition duration-200 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-blue-300/10 to-transparent pointer-events-none" />
      {/* Color top bar */}
      <div className="h-1.5 w-full relative" style={{ backgroundColor: course.color }} />

      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <CourseCardIdentity course={course} quickFilters={quickFilters} />

          <CourseCardSummary
            course={course}
            showInNPR={showInNPR}
            rates={rates}
            expanded={expanded}
            hasPrereqs={hasPrereqs}
            onToggle={onToggle}
            onEnroll={onEnroll}
            onDelete={onDelete}
            onPrerequisites={onPrerequisites}
          />
        </div>

        {/* Expanded details */}
        {expanded && <CourseCardDetails course={course} quickFilters={quickFilters} />}
      </div>
    </div>
  );
}
