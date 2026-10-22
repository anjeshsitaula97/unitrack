export type { ApplicationStatus } from "@/lib/application-statuses";

export interface ApplicationDetail {
  id: string;
  studentId: string;
  universityId: string;
  courseId: string;
  status: string;
  appliedDate: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    nationality?: string;
    address?: string;
  };
  university: {
    id: string;
    name: string;
    country: string;
    city?: string;
    website?: string;
  };
  course: {
    id: string;
    name: string;
    level: string;
    duration?: string;
    tuitionFee?: string;
    currency?: string;
    faculty?: string;
    intake?: string;
    prerequisites?: string;
    requirements?: string;
  };
}

export interface StudentDoc {
  id: string;
  name: string;
  url: string;
  status?: string | null;
  type?: string | null;
  academicDocument?: { id: string; name: string } | null;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  description?: string | null;
  subtasks: string;
}

export interface ApplicationNote {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string } | null;
}

export type ReqFilter = "All" | "Pending" | "Approved" | "Rejected" | "In Review";
export type SectionKey = Exclude<ReqFilter, "All">;
export type MainTab =
  "Requirements" | "Student records" | "Workflow" | "Notes" | "Commission" | "Settings";

export interface MatchedDocRequirement {
  name: string;
  doc: StudentDoc | null;
  isUploaded: boolean;
  isApproved: boolean;
}

export interface MatchedPrerequisite {
  name: string;
  doc: StudentDoc | null;
}

export interface RequirementRow {
  name: string;
  status: string;
}

export type GroupedDocs = Record<SectionKey, StudentDoc[]>;
