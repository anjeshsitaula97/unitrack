export function readActiveCookie(): string {
  if (typeof document === "undefined") return "all";
  const match = document.cookie.match(/(?:^|; )active_consultancy=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "all";
}

export const emptySubscribe = () => () => {};

/** Convert an ISO timestamp into the `yyyy-mm-dd` a date input expects. */
export function toDateInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Days until expiry, negative when past. Null when no expiry is set. */
export function daysToExpiry(value: string | null): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
