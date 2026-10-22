import type { ApplicationStatus } from "@/lib/application-statuses";
import type { ReqFilter, Subtask } from "./types";

export function appIdShort(id: string | number) {
  const str = String(id);
  const digits = str.replace(/\D/g, "");
  if (digits.length >= 7) return digits.slice(-7);
  return str.slice(-8).toUpperCase();
}

export function initials(first: string, last: string) {
  return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "?";
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizeDocStatus(status?: string | null): ReqFilter {
  const s = (status || "Pending").toLowerCase();
  if (s.includes("reject") || s.includes("declin")) return "Rejected";
  if (s.includes("review") || s.includes("process") || s === "uploaded" || s === "pending")
    return "In Review";
  if (s.includes("approv") || s === "verified" || s === "complete" || s === "completed") {
    return "Approved";
  }
  return "Pending";
}

export function stageOfStatus(status: string, statuses: ApplicationStatus[]): string {
  return statuses.find((s) => s.name === status)?.stage ?? "";
}

export function parseSubtasks(raw: string): Subtask[] {
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export function getStatusBadge(status: string) {
  if (status === "Approved")
    return { label: "Approved", className: "bg-emerald-100 text-emerald-700" };
  if (status === "In Review") return { label: "In Review", className: "bg-blue-100 text-blue-700" };
  if (status === "Rejected") return { label: "Rejected", className: "bg-red-100 text-red-700" };
  if (status === "Missing") return { label: "Missing", className: "bg-amber-100 text-amber-700" };
  return { label: "Pending", className: "bg-amber-100 text-amber-700" };
}
