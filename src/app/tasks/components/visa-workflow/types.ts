export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: string | null;
}

export interface EmbassyDetail {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  workingHours: string | null;
}

export interface VisaChecklist {
  id: string;
  title: string;
  description: string | null;
  isRequired: boolean;
}

export interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  description: string | null;
  subtasks: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskForm {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
}

export interface EmbassyForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  workingHours: string;
}

export interface ChecklistForm {
  title: string;
  descriptions: string[];
  isRequired: boolean;
}

export interface StageForm {
  name: string;
  description: string;
  order: number;
}

export type VisaWorkflowTab = "process" | "embassy" | "checklists" | "tasks";

export type TaskView = "grid" | "list";

export interface VisaWorkflowDashboardProps {
  country: string;
  visaType: string;
}

export const _priorityColors: Record<string, string> = {
  Low: "text-slate-400",
  Medium: "text-blue-500",
  High: "text-amber-500",
  Urgent: "text-red-500",
};

export const statuses = ["Todo", "In Progress", "Review", "Done"];
