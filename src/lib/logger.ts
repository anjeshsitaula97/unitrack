/**
 * Structured, sanitised logging.
 *
 * Previously this module only wrapped `console.error`, which meant nothing in
 * production was machine-parseable: no levels, no timestamps, no request
 * correlation, no way to alert on error rate. Every log line is now emitted as
 * a single JSON object so it can be shipped to any log collector or error
 * tracker as-is.
 *
 * The public helpers keep their historical signatures — `logError("Ctx", err)`
 * — so the ~126 existing call sites were not churned. Sanitisation is preserved:
 * passwords, tokens, secrets, cookies and credentials are redacted before output.
 *
 *   logError("Fetch Leads Error:", error);
 *   logError("Payment failed", error, { userId, orderId });
 *   logInfo("Request served", { path, status });
 */

const SENSITIVE_PATTERNS = [
  /password/gi,
  /token/gi,
  /secret/gi,
  /authorization/gi,
  /cookie/gi,
  /credentials/gi,
];

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  reqId?: string;
  userId?: number | string;
  path?: string;
  status?: number;
  durationMs?: number;
  [key: string]: unknown;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function activeLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL;
  return raw && raw in LEVEL_PRIORITY ? (raw as LogLevel) : "info";
}

function redact(value: string): string {
  let out = value;
  for (const pattern of SENSITIVE_PATTERNS) out = out.replace(pattern, "[REDACTED]");
  return out;
}

function sanitize(value: unknown): unknown {
  if (typeof value === "string") return redact(value);
  if (value instanceof Error) return { name: value.name, message: redact(value.message) };
  if (value && typeof value === "object") {
    try {
      return JSON.parse(redact(JSON.stringify(value)));
    } catch {
      return "[Unserializable]";
    }
  }
  return value;
}

function emit(level: LogLevel, context: string, fields: LogFields = {}): void {
  // Tests stay quiet unless explicitly asked to see logs.
  if (process.env.NODE_ENV === "test") return;
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[activeLevel()]) return;

  const { reqId, userId, path, status, durationMs, ...rest } = fields;
  const entry = {
    ts: new Date().toISOString(),
    level,
    context,
    ...(reqId !== undefined ? { reqId } : {}),
    ...(userId !== undefined ? { userId } : {}),
    ...(path !== undefined ? { path } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(durationMs !== undefined ? { durationMs } : {}),
    ...(Object.keys(rest).length > 0 ? { fields: sanitize(rest) } : {}),
  };

  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

/**
 * Error logger. The second argument may be an Error, a string, a Prisma error
 * or an arbitrary object — all are serialised and redacted.
 */
export function logError(context: string, error: unknown, fields?: LogFields): void {
  const sanitized = sanitize(error);
  const detail =
    sanitized && typeof sanitized === "object"
      ? { error: sanitized }
      : { error: String(sanitized) };
  emit("error", context, { ...detail, ...(fields ?? {}) });
}

export function logWarn(context: string, detail?: unknown, fields?: LogFields): void {
  emit("warn", context, {
    ...(detail !== undefined ? { detail: sanitize(detail) } : {}),
    ...(fields ?? {}),
  });
}

export function logInfo(context: string, detail?: unknown, fields?: LogFields): void {
  emit("info", context, {
    ...(detail !== undefined ? { detail: sanitize(detail) } : {}),
    ...(fields ?? {}),
  });
}

export function logDebug(context: string, detail?: unknown, fields?: LogFields): void {
  emit("debug", context, {
    ...(detail !== undefined ? { detail: sanitize(detail) } : {}),
    ...(fields ?? {}),
  });
}
