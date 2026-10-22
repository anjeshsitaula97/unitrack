export interface TaskUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: TaskUser | null;
  assigneeId: string | null;
  country: string | null;
  visaType: string | null;
}

export const priorityColors: Record<string, string> = {
  Low: "text-slate-400",
  Medium: "text-blue-500",
  High: "text-amber-500",
  Urgent: "text-red-500",
};

export const statuses = ["Todo", "In Progress", "Review", "Done"];
