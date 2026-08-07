import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "./session";

export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

function _apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch {
    return null;
  }
}

async function _requireSession() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: apiError("Unauthorized", 401) };
  }
  return { session, error: null };
}

function _requireRole(session: { role?: string } | null, roles: string[]): NextResponse | null {
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
      [field]: { contains: search, mode: "insensitive" as const },
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
