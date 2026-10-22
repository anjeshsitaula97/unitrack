import { toast } from "sonner";
import type { Subtask } from "./types";

export const deleteItem = async (endpoint: string, id: string, fetchFn: () => void) => {
  if (!confirm("Are you sure you want to delete this?")) return;
  try {
    const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted successfully");
      fetchFn();
    }
  } catch (_err) {
    toast.error("Failed to delete");
  }
};

export const parseSubtasks = (subtasksJson: string): Subtask[] => {
  try {
    return JSON.parse(subtasksJson || "[]");
  } catch {
    return [];
  }
};

export const parseDescriptions = (description: string | null): string[] => {
  let descs: string[] = [];
  if (description) {
    try {
      const p = JSON.parse(description);
      if (Array.isArray(p)) descs = p;
      else descs = [description];
    } catch {
      descs = [description];
    }
  }
  return descs;
};
