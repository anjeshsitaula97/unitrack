import { safeJson } from "@/lib/fetch-client";

export interface WorkflowCountry {
  id: string;
  name: string;
  code: string | null;
}

export interface VisaType {
  id: string;
  label: string;
  description: string | null;
}

export interface TimelineTask {
  id: string;
  title: string;
  status?: string | null;
  priority?: string | null;
  dueDate?: string | null;
}

export interface TimelineStage {
  id: string;
  name: string;
  description?: string | null;
  progress: number;
  isActive: boolean;
  completedTasks?: number;
  totalTasks?: number;
  tasks?: TimelineTask[];
  applications?: unknown[];
}

export interface TimelineData {
  stages: TimelineStage[];
  summary?: {
    overallProgress?: number;
    totalStages?: number;
    completedStages?: number;
  };
  visaTasks?: unknown[];
}

export async function fetchWorkflowCountries(): Promise<WorkflowCountry[]> {
  const res = await fetch("/api/learning-hub/countries");
  return res.ok ? res.json() : [];
}

export async function fetchVisaTypes(): Promise<VisaType[]> {
  const res = await fetch("/api/visa-types");
  return res.ok ? res.json() : [];
}

export async function fetchVisaTimeline(
  country: string,
  visaType: string
): Promise<TimelineData | null> {
  const params = new URLSearchParams();
  params.set("country", country);
  params.set("visaType", visaType);
  const res = await fetch(`/api/visa-timeline?${params.toString()}`);
  return safeJson(res);
}
