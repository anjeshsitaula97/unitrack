"use client";

/**
 * Shared client-side notification model + sync bus.
 *
 * The notifications page and the topbar bell live in different React trees, so
 * clearing/deleting from one must reach the other instantly (same tab) and
 * eventually (other tabs, via the SSE stream). This module is the single place
 * both read from and publish to.
 */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  time: string;
  createdAt?: string;
}

export type NotificationEvent =
  | { kind: "replace"; notifications: AppNotification[] }
  | { kind: "removed"; ids: string[] }
  | { kind: "cleared" }
  | { kind: "read"; ids: string[] }
  | { kind: "readAll" };

type Listener = (event: NotificationEvent) => void;

const listeners = new Set<Listener>();

/** Subscribe to cross-component notification changes. Returns an unsubscribe. */
export function subscribeNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Broadcast a change to every subscriber (notifications page + topbar). */
export function emitNotificationEvent(event: NotificationEvent): void {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // A broken listener must never block the others.
    }
  }
}

/** Combine notification lists, de-duplicating by id and keeping newest first. */
export function mergeNotifications(
  incoming: AppNotification[],
  existing: AppNotification[],
  limit = 50
): AppNotification[] {
  const incomingIds = new Set(incoming.map((n) => n.id));
  return [...incoming, ...existing.filter((n) => !incomingIds.has(n.id))].slice(0, limit);
}

/** Singular/plural-free unread count helper. */
export function countUnread(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

/* ── Server mutations ──────────────────────────────────────────────────────
 * Thin wrappers so a delete/clear/read performed anywhere in the app both hits
 * the API and notifies same-tab listeners. */

async function request(url: string, init?: RequestInit): Promise<boolean> {
  try {
    const res = await fetch(url, {
      credentials: "same-origin",
      ...init,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteNotificationRemote(id: string): Promise<boolean> {
  const ok = await request(`/api/notifications?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  if (ok) emitNotificationEvent({ kind: "removed", ids: [id] });
  return ok;
}

export async function clearNotificationsRemote(): Promise<boolean> {
  const ok = await request("/api/notifications", { method: "DELETE" });
  if (ok) emitNotificationEvent({ kind: "cleared" });
  return ok;
}

export async function markNotificationReadRemote(id: string): Promise<boolean> {
  const ok = await request("/api/notifications", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, read: true }),
  });
  if (ok) emitNotificationEvent({ kind: "read", ids: [id] });
  return ok;
}

export async function markAllNotificationsReadRemote(): Promise<boolean> {
  const ok = await request("/api/notifications", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
  if (ok) emitNotificationEvent({ kind: "readAll" });
  return ok;
}
