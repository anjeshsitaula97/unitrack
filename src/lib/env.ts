/**
 * Environment contract.
 *
 * The app reads secrets straight from `process.env` in many places and only
 * `JWT_SECRET` has a strength check (inside `session.ts`/`proxy.ts`, at request
 * time). This module centralises the same fail-fast policy for every variable
 * the app cannot run without, plus de-duplication rules that were previously
 * documented only in the security audit:
 *
 *   - `JWT_SECRET`   ≥ 32 chars (enforced by session.ts as well)
 *   - `ENCRYPTION_KEY` ≥ 32 chars AND must differ from `JWT_SECRET`
 *   - `DATABASE_URL` required in every environment
 *
 * Issues are split by severity:
 *
 *   - "error": the app cannot operate correctly → health returns 503, and
 *     `validateEnv()` throws.
 *   - "warn": security/operational hygiene that should be fixed but does not
 *     make the process unusable (e.g. reusing JWT_SECRET as ENCRYPTION_KEY).
 *     These are surfaced by /api/health without taking the instance out of
 *     rotation, since failing liveness on a config advisory would cause an
 *     outage loop rather than fix the config.
 *
 * It is deliberately NOT imported at module scope anywhere: `validateEnv()` is
 * called lazily (health endpoint) so a missing var degrades a request with a
 * clear message instead of crashing the whole process at import time during
 * `next build`.
 */

export type EnvSeverity = "error" | "warn";

export interface ValidEnv {
  DATABASE_URL: string;
  JWT_SECRET: string;
  ENCRYPTION_KEY?: string;
}

export interface EnvIssue {
  variable: string;
  message: string;
  severity: EnvSeverity;
}

const MIN_SECRET_LENGTH = 32;

export function checkEnv(env: NodeJS.ProcessEnv = process.env): {
  ok: boolean;
  issues: EnvIssue[];
  errors: EnvIssue[];
  warnings: EnvIssue[];
} {
  const issues: EnvIssue[] = [];

  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    issues.push({
      variable: "DATABASE_URL",
      message: "DATABASE_URL is required.",
      severity: "error",
    });
  }

  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    issues.push({ variable: "JWT_SECRET", message: "JWT_SECRET is required.", severity: "error" });
  } else if (jwtSecret.length < MIN_SECRET_LENGTH) {
    issues.push({
      variable: "JWT_SECRET",
      message: `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters. Generate with: openssl rand -base64 32`,
      severity: "error",
    });
  }

  const encryptionKey = env.ENCRYPTION_KEY;
  if (encryptionKey) {
    if (encryptionKey.length < MIN_SECRET_LENGTH) {
      issues.push({
        variable: "ENCRYPTION_KEY",
        message: `ENCRYPTION_KEY must be at least ${MIN_SECRET_LENGTH} characters.`,
        severity: "warn",
      });
    }
    if (jwtSecret && encryptionKey === jwtSecret) {
      issues.push({
        variable: "ENCRYPTION_KEY",
        message:
          "ENCRYPTION_KEY must be different from JWT_SECRET (never share key material). Rotate both if they were ever shared.",
        severity: "warn",
      });
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warn");

  // `ok` reflects operational readiness only: no blocking errors.
  return { ok: errors.length === 0, issues, errors, warnings };
}

/** Throws on blocking misconfiguration; returns the validated values on success. */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): ValidEnv {
  const { errors } = checkEnv(env);
  if (errors.length > 0) {
    const detail = errors.map((i) => `${i.variable}: ${i.message}`).join(" ");
    throw new Error(`Invalid environment configuration — ${detail}`);
  }
  return {
    DATABASE_URL: env.DATABASE_URL as string,
    JWT_SECRET: env.JWT_SECRET as string,
    ENCRYPTION_KEY: env.ENCRYPTION_KEY,
  };
}
