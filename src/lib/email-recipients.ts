const MAX_RECIPIENT_DEPTH = 5;
const MAX_RECIPIENTS = 100;

function collectRecipients(
  value: unknown,
  depth: number,
  result: string[],
  seen: Set<string>
): void {
  if (depth > MAX_RECIPIENT_DEPTH) return;

  if (Array.isArray(value)) {
    for (const item of value) {
      if (result.length >= MAX_RECIPIENTS) return;
      collectRecipients(item, depth + 1, result, seen);
    }
    return;
  }

  if (typeof value !== "string") return;

  const trimmed = value.trim();
  if (!trimmed || seen.has(trimmed)) return;

  seen.add(trimmed);
  result.push(trimmed);
}

export function normalizeRecipients(input: unknown): string[] {
  const result: string[] = [];
  collectRecipients(input, 0, result, new Set<string>());
  return result;
}
