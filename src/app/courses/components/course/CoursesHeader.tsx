"use client";

import Link from "next/link";
import {
  BookOpen,
  DollarSign,
  Download,
  FileDown,
  GraduationCap,
  Plus,
  Tag,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { buildXlsx, downloadBlob } from "@/lib/spreadsheet";
import StatsStrip, { type StatItem } from "@/components/StatsStrip";
import type { Course } from "./types";

export default function CoursesHeader({
  courses,
  filteredCount,
  facultyCount,
  showInNPR,
  onToggleNPR,
}: {
  courses: Course[];
  filteredCount: number;
  facultyCount: number;
  showInNPR: boolean;
  onToggleNPR: (next: boolean) => void;
}) {
  const stats: StatItem[] = [
    {
      id: "cstrip-total",
      label: "Total Courses",
      value: courses.length.toString(),
      icon: <BookOpen size={14} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "cstrip-active",
      label: "Active",
      value: courses.filter((c) => c.status === "Active").length.toString(),
      icon: <GraduationCap size={14} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "cstrip-draft",
      label: "Draft",
      value: courses.filter((c) => c.status === "Draft").length.toString(),
      icon: <Tag size={14} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      id: "cstrip-enrolled",
      label: "Total Enrolled",
      value: courses.reduce((s, c) => s + (c.enrolled || 0), 0).toLocaleString(),
      icon: <Users size={14} />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Courses</h1>
          <p className="text-sm text-slate-400">
            {filteredCount.toLocaleString()} courses across {facultyCount} faculties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              const headers = [
                [
                  "Name",
                  "University",
                  "Faculty",
                  "DegreeType",
                  "Level",
                  "Credits",
                  "Duration",
                  "Instructor",
                  "InstructorEmail",
                  "Description",
                  "Prerequisites",
                  "Language",
                  "Mode",
                  "AcademicRequirement",
                  "ScoreRequired",
                  "EnglishLanguageType",
                  "EnglishOverallScore",
                  "EnglishReadingScore",
                  "EnglishWritingScore",
                  "EnglishListeningScore",
                  "EnglishSpeakingScore",
                ],
              ];
              downloadBlob(await buildXlsx("Template", headers), "courses_import_template.xlsx");
              toast.success("Excel Template downloaded successfully.");
            }}
            className="btn-secondary"
            title="Download CSV Template"
          >
            <FileDown size={15} />
            Template
          </button>
          <label htmlFor="import-file" className="btn-secondary cursor-pointer">
            <Upload size={15} />
            Import
            <input
              id="import-file"
              type="file"
              className="hidden"
              accept=".csv,.xlsx"
              onChange={(e) => {
                if (e.target.files?.length) {
                  toast.success(`Starting import for ${e.target.files[0].name}...`);
                  e.target.value = "";
                }
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => toast.info("Export initiated — your file will be ready shortly")}
            className="btn-secondary"
          >
            <Download size={15} />
            Export
          </button>
          <Link href="/courses/add" className="btn-primary">
            <Plus size={15} />
            Add Course
          </Link>
          <button
            type="button"
            onClick={() => onToggleNPR(!showInNPR)}
            className={`btn-secondary ${showInNPR ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" : ""}`}
            title="Show in NPR"
          >
            <DollarSign size={15} />
            {showInNPR ? "Showing in NPR" : "Show in NPR"}
          </button>
        </div>
      </div>

      <StatsStrip stats={stats} />
    </>
  );
}
