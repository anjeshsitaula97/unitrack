import { NextResponse } from "next/server";
import { baseDb } from "@/lib/base-db";
import { checkEnv } from "@/lib/env";

/**
 * Liveness/readiness probe.
 *
 * Deliberately unauthenticated: it exposes no tenant data, only aggregate
 * health. Load balancers, uptime checks and the CI pipeline use this instead
 * of having to log in and guess. Returns 200 when the database is reachable
 * and the required environment variables are present, 503 otherwise.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BOOT_TIME = Date.now();

async function pingDatabase(): Promise<{ ok: boolean; ms: number; error?: string }> {
  const start = Date.now();
  try {
    await baseDb.$queryRaw`SELECT 1`;
    return { ok: true, ms: Date.now() - start };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : typeof error === "string" ? error : "unknown";
    return { ok: false, ms: Date.now() - start, error: message };
  }
}

export async function GET() {
  const envCheck = checkEnv();
  const database = await pingDatabase();

  // 503 only when the instance cannot actually serve traffic (database down or
  // required config missing). Security *advisories* (warnings) are reported but
  // do not fail readiness — otherwise a config fix would cause an outage loop.
  const ok = envCheck.ok && database.ok;
  const body = {
    status: ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round((Date.now() - BOOT_TIME) / 1000),
    checks: {
      database,
      environment: { ok: envCheck.ok, errors: envCheck.errors, warnings: envCheck.warnings },
    },
  };

  return NextResponse.json(body, {
    status: ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
