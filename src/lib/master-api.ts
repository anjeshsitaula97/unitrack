const MASTER_API_URL = process.env.MASTER_API_URL || "http://localhost:5000";
const MASTER_API_KEY = process.env.MASTER_API_KEY || "";

export function isConfigured(): boolean {
  return Boolean(MASTER_API_URL && MASTER_API_KEY);
}

async function masterFetch<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  if (!isConfigured()) return null;

  const url = new URL(`/api/v1${path}`, MASTER_API_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": MASTER_API_KEY },
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;
  return res.json();
}

export interface MasterCourse {
  id: number;
  name: string;
  university: string;
  universityId: number | null;
  faculty: string | null;
  degreeType: string | null;
  level: string;
  credits: number | null;
  duration: string | null;
  status: string;
  description: string | null;
  tuitionFee: string | null;
  applicationFee: string | null;
  currency: string;
  courseCode: string | null;
  country: string | null;
  intake: string | null;
  percentageRequired: string | null;
  gpaRequired: string | null;
  englishLanguageType: string | null;
  englishOverallScore: string | null;
  color: string | null;
  initials: string | null;
  startDate: string | null;
}

export interface MasterUniversity {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  status: string;
  type: string | null;
  accreditation: string | null;
  contactEmail: string | null;
  website: string | null;
  description: string | null;
  logo: string | null;
  color: string | null;
  initials: string | null;
  courseCount: number;
}

export interface MasterApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchMasterCourses(params?: {
  page?: string;
  limit?: string;
  search?: string;
  level?: string;
  faculty?: string;
  country?: string;
  university?: string;
}): Promise<MasterApiResponse<MasterCourse> | null> {
  return masterFetch("/courses", params);
}

export async function fetchMasterCourse(
  id: number
): Promise<{ success: boolean; data: MasterCourse } | null> {
  return masterFetch(`/courses/${id}`);
}

export async function fetchMasterUniversities(params?: {
  page?: string;
  limit?: string;
  search?: string;
  country?: string;
}): Promise<MasterApiResponse<MasterUniversity> | null> {
  return masterFetch("/universities", params);
}

export async function fetchMasterUniversity(
  id: number
): Promise<{ success: boolean; data: MasterUniversity } | null> {
  return masterFetch(`/universities/${id}`);
}

export async function searchMasterCourses(params?: {
  q?: string;
  page?: string;
  limit?: string;
  level?: string;
  faculty?: string;
  degreeType?: string;
  country?: string;
  university?: string;
}): Promise<MasterApiResponse<MasterCourse> | null> {
  return masterFetch("/search", params);
}
