import { db } from "./db";
import { createNotification } from "./notifications";

export interface ChangeDetail {
  field: string;
  from: string;
  to: string;
}

export function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString();
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function diffChanges(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
  ignore: string[] = ["id", "createdAt", "updatedAt", "password", "faceDescriptor"]
): ChangeDetail[] {
  if (!before || !after) return [];
  const changes: ChangeDetail[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (ignore.includes(key)) continue;
    const from = formatChangeValue(before[key]);
    const to = formatChangeValue(after[key]);
    if (from !== to) {
      changes.push({ field: key, from, to });
    }
  }
  return changes;
}

export function serializeChanges(changes?: ChangeDetail[]): string | undefined {
  return changes && changes.length > 0 ? JSON.stringify(changes) : undefined;
}

export async function getActorName(userId?: string | number | null): Promise<string> {
  if (userId == null || userId === "") return "System";
  try {
    const user = await db.user.findUnique({
      where: { id: Number(userId) },
      select: { name: true },
    });
    return user?.name || "System User";
  } catch {
    return "System User";
  }
}

export async function logActivity(data: {
  actorName: string;
  userId?: string | number | null;
  action: string;
  target: string;
  targetBy?: string;
  actorInitials?: string;
  actorColor?: string;
  changes?: ChangeDetail[];
  details?: string;
}) {
  try {
    const actorInitials =
      data.actorInitials ||
      data.actorName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    const actorColor =
      data.actorColor ||
      ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][Math.floor(Math.random() * 5)];

    await db.activityLog.create({
      data: {
        actorName: data.actorName,
        userId: data.userId != null && data.userId !== "" ? Number(data.userId) : null,
        actorInitials,
        actorColor,
        action: data.action,
        target: data.target,
        targetBy: data.targetBy,
        details: data.details ?? serializeChanges(data.changes),
      },
    });

    // Automatically create notifications for important actions
    if (
      data.action.includes("created") ||
      data.action.includes("invited") ||
      data.action.includes("deleted")
    ) {
      await createNotification({
        title: data.action.charAt(0).toUpperCase() + data.action.slice(1),
        message: `${data.actorName} ${data.action} ${data.target}`,
        type: data.action.includes("deleted") ? "Warning" : "Success",
      });
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
