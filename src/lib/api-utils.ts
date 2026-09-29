import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "./session";
import type { SessionPayload } from "./session";
import { checkRoutePermission, checkPermission } from "./rbac";

export type { SessionPayload } from "./session";

export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const session = await verifyAuth(token);
    // Student subjects belong to the student portal and must never reach admin APIs.
    if (session.subject === "student") return null;
    return session;
  } catch {
    return null;
  }
}

export async function getStudentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("student_token")?.value;
  if (!token) return null;
  try {
    const session = await verifyAuth(token);
    if (session.subject !== "student") return null;
    return session;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: apiError("Unauthorized", 401) };
  }
  return { session, error: null };
}

export function requireRole(
  session: SessionPayload | null,
  roles: readonly string[]
): NextResponse | null {
  if (!session || !roles.includes(session.role as string)) {
    return apiError("Forbidden: insufficient permissions", 403);
  }
  return null;
}

export interface PaginationParams {
  page: number;
  perPage: number;
  search: string;
  skip: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("perPage") || "20")));
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * perPage;
  return { page, perPage, search, skip };
}

export function buildSearchFilter(search: string, fields: string[]) {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search },
    })),
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    total,
    page: params.page,
    perPage: params.perPage,
    totalPages: Math.ceil(total / params.perPage),
  };
}

export { checkRoutePermission, checkPermission } from "./rbac";
