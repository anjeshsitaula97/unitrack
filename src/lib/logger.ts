/**
 * Sanitized server-side error logger.
 * Never logs sensitive data (passwords, tokens, PII).
 * Use this instead of console.error in API routes.
 */

const SENSITIVE_PATTERNS = [
  /password/gi,
  /token/gi,
  /secret/gi,
  /authorization/gi,
  /cookie/gi,
  /credentials/gi,
];

function sanitize(obj: unknown): unknown {
  if (typeof obj === "string") {
    let sanitized = obj;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    }
    return sanitized;
  }
  if (obj instanceof Error) {
    return { name: obj.name, message: obj.message };
  }
  if (obj && typeof obj === "object") {
    try {
      const str = JSON.stringify(obj);
      let sanitized = str;
      for (const pattern of SENSITIVE_PATTERNS) {
        sanitized = sanitized.replace(pattern, "[REDACTED]");
      }
      return JSON.parse(sanitized);
    } catch {
      return "[Unserializable]";
    }
  }
  return obj;
}

export function logError(context: string, error: unknown) {
  const sanitized = sanitize(error);
  // Only log in non-test environments
  if (process.env.NODE_ENV !== "test") {
    console.error(`[${context}]`, sanitized);
  }
}
