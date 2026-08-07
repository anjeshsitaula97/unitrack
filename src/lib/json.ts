/**
 * Safely parses a JSON string into an array.
 * If parsing fails or the result is not an array, it returns a fallback array.
 * If the input is already an array, it returns it directly.
 * If the input is a non-empty string that is not valid JSON, it returns it as a single-element array.
 */
export function safeParseArray<T = string>(data: unknown, fallback: T[] = []): T[] {
  if (data === null || data === undefined) return fallback;
  if (Array.isArray(data)) return data;
  if (typeof data !== "string") return fallback;
  if (!data.trim()) return fallback;

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (_e) {
    // If it's not valid JSON, treat the whole string as a single item if it's not empty
    return [data] as T[];
  }
}
