import type { IntakeEntry } from "@/lib/intake";

export interface Course {
  id: string | number;
  name: string;
  university: string;
  universityId: string | number;
  faculty: string;
  degreeType: string;
  level: string;
  credits: number;
  duration: string;
  enrolled?: number;
  status: string;
  startDate?: string | null;
  color?: string;
  initials?: string;
  instructor: string;
  description: string;
  prerequisites: string[];
  intake?: string | null;
  percentageRequired?: string | null;
  gpaRequired?: string | null;
  tuitionFee?: string | null;
  applicationFee?: string | null;
  currency?: string | null;
  tuitionFeePeriod?: string | null;
  quickFilters?: string[];
  universityLogo?: string | null;
  applicationDeadline?: string | Date | null;
  courseCode?: string | null;
  country?: string | null;
  englishOverallScore?: string | null;
  englishLanguageType?: string | null;
  englishTestStage?: string | null;
  englishReadingScore?: string | null;
  englishWritingScore?: string | null;
  englishListeningScore?: string | null;
  englishSpeakingScore?: string | null;
  englishTests?: EnglishTestEntry[];
  requirements?: string[];
  academicRequirement?: string | null;
  language?: string | null;
  mode?: string | null;
}

export interface EnglishTestEntry {
  type?: string;
  overall?: string;
  reading?: string;
  writing?: string;
  listening?: string;
  speaking?: string;
}

export type Intake = IntakeEntry;

export interface QuickFilter {
  label: string;
}

export interface EducationEntry {
  qualification: string;
  score?: string;
}

export interface Student {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  education?: string | EducationEntry[] | null;
  testType?: string | null;
  overallScore?: string | null;
  readingScore?: string | null;
  writingScore?: string | null;
  listeningScore?: string | null;
  speakingScore?: string | null;
  moi?: string | null;
}

export interface GuestDetails {
  qualification: string;
  score: string;
  testType: string;
  overallScore: string;
}

export interface CourseFilterOptions {
  universities: string[];
  universitiesByCountry: Record<string, string[]>;
  countries: string[];
}

export const statusConfig: Record<string, { label: string; className: string }> = {
  Active: { label: "Active", className: "badge-active" },
  Draft: { label: "Draft", className: "badge-draft" },
  Archived: { label: "Archived", className: "badge-archived" },
};

export const levelConfig: Record<string, { className: string }> = {
  Undergraduate: { className: "bg-sky-50 text-sky-700" },
  Postgraduate: { className: "bg-violet-50 text-violet-700" },
  PhD: { className: "bg-amber-50 text-amber-700" },
};

export const facultyColors: Record<string, string> = {
  "Computer Science": "bg-indigo-50 text-indigo-700",
  "Business & MBA": "bg-emerald-50 text-emerald-700",
  Engineering: "bg-orange-50 text-orange-700",
  "Medicine & Health": "bg-pink-50 text-pink-700",
  "Arts & Humanities": "bg-purple-50 text-purple-700",
  "Natural Sciences": "bg-teal-50 text-teal-700",
};
