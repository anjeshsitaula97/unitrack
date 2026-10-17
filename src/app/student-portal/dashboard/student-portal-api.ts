export interface PortalStudent {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  nationality?: string | null;
  studyLevel?: string | null;
  interestedCountry?: string | null;
  status?: string | null;
  counselor?: string | null;
  _count?: {
    applications: number;
    payments: number;
    documents: number;
  };
}

export interface VisaTask {
  id: number;
  title: string;
  status: string;
  dueDate: string | null;
}

export interface VisaStage {
  id: number;
  name: string;
  progress: number;
  isActive: boolean;
  tasks: VisaTask[];
}

export interface VisaTimeline {
  stages: VisaStage[];
  summary: {
    completedStages: number;
    totalStages: number;
    overallProgress: number;
  };
}

export async function fetchPortalStudent(): Promise<PortalStudent> {
  const res = await fetch("/api/student-portal/me", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchVisaTimeline(country: string, studentId: number): Promise<VisaTimeline> {
  const res = await fetch(
    `/api/visa-timeline?country=${encodeURIComponent(country)}&studentId=${studentId}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
