/**
 * Rate limiting backed by MySQL (`RateLimitLog`).
 *
 * Because counters live in the database, limits are shared correctly across
 * every instance/process hitting the same database — no Redis required for the
 * single-database deployment this app uses.
 *
 * Anti-race design: the previous implementation did `COUNT(*)` and then a
 * separate `INSERT`, in JavaScript, with a network round-trip in between. Two
 * concurrent requests could both observe "19 of 20" and both proceed, letting
 * bursts exceed the limit. The insert is now a single conditional statement:
 *
 *     INSERT ... SELECT key, now
 *     WHERE (SELECT COUNT(*) ... WHERE key = ? AND createdAt > windowStart) < max
 *
 * so the count check and the increment happen in one statement. If the limit is
 * already reached no row is inserted, `$executeRaw` returns 0 affected rows and
 * the request is denied. This fails closed (it can, under extreme concurrency,
 * briefly reject one request that was exactly at the boundary — a safe failure
 * mode for a limiter).
 *
 * For horizontal scaling beyond a shared database, or to remove any reliance on
 * the fallback path, move this to Redis (ioredis: INCR + EXPIRE).
 */

import { db } from "./db";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryMap = new Map<string, RateLimitEntry>();
const MEMORY_MAX_ENTRIES = 10000;

function memoryCleanup() {
  const now = Date.now();
  if (memoryMap.size > MEMORY_MAX_ENTRIES) {
    for (const [key, entry] of memoryMap) {
      if (now > entry.resetAt) memoryMap.delete(key);
    }
  }
}

export function getClientIp(req: Request): string {
  // Proxy headers are only trusted when TRUST_PROXY=true (deployed behind a
  // reverse proxy that overwrites incoming headers). When enabled, the leftmost
  // X-Forwarded-For hop is the original client; any attacker-supplied trailing
  // hops are discarded. When disabled, client-controlled X-Forwarded-For is
  // ignored entirely so it cannot be used to reset rate-limit counters.
  if (process.env.TRUST_PROXY === "true") {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) {
      const hops = fwd
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);
      if (hops.length > 0) return hops[0];
    }
    // cf-connecting-ip / x-real-ip are only meaningful when set by an
    // infrastructure proxy (Cloudflare, nginx) that strips client-supplied
    // values. Without TRUST_PROXY they are attacker-settable and would let
    // any caller rotate a fake IP to reset every rate-limit bucket.
    const edge = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
    if (edge) return edge;
  }
  return "unknown";
}

export async function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();
  const windowStart = new Date(now - windowMs);

  try {
    // Single conditional insert: only succeeds while under the limit.
    const affected = await db.$executeRaw`
      INSERT INTO RateLimitLog (\`key\`, createdAt)
      SELECT ${key}, ${new Date(now)}
      WHERE (
        SELECT COUNT(*) FROM RateLimitLog
        WHERE \`key\` = ${key} AND createdAt > ${windowStart}
      ) < ${maxRequests}
    `;

    if (affected === 0) {
      // Already at (or over) the limit — nothing was written, so deny.
      const oldest = await db.$queryRaw<{ createdAt: Date }[]>`
        SELECT createdAt FROM RateLimitLog
        WHERE \`key\` = ${key} AND createdAt > ${windowStart}
        ORDER BY createdAt ASC LIMIT 1
      `;
      const resetIn = oldest[0] ? oldest[0].createdAt.getTime() + windowMs - now : windowMs;
      return { allowed: false, remaining: 0, resetIn: Math.max(0, resetIn) };
    }

    // This request consumed a slot, so re-count to report accurate `remaining`.
    const counted = await db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM RateLimitLog
      WHERE \`key\` = ${key} AND createdAt > ${windowStart}
    `;
    const current = Number(counted[0]?.count ?? 0);

    // Opportunistic cleanup of expired rows.
    if (Math.random() < 0.01) {
      await db.$executeRaw`
        DELETE FROM RateLimitLog WHERE createdAt < ${new Date(now - windowMs * 2)}
      `;
    }

    return { allowed: true, remaining: Math.max(0, maxRequests - current), resetIn: windowMs };
  } catch {
    // Database unavailable (e.g. RateLimitLog table not migrated yet) — fall
    // back to per-process memory so limiting still works for a single instance.
    memoryCleanup();
    const entry = memoryMap.get(key);

    if (!entry || now > entry.resetAt) {
      memoryMap.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
  }
}

export function rateLimitMiddleware(key: string, maxRequests?: number, windowMs?: number) {
  // Note: this sync wrapper uses the in-memory fallback.
  // For full DB-backed rate limiting, use the async checkRateLimit() directly.
  const result = checkRateLimitSync(key, maxRequests, windowMs);
  const headers = {
    "X-RateLimit-Limit": String(maxRequests || 20),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000)),
  };

  if (!result.allowed) {
    return { allowed: false, headers, error: "Too many requests. Please try again later." };
  }

  return { allowed: true, headers, error: null };
}

function checkRateLimitSync(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  memoryCleanup();
  const entry = memoryMap.get(key);

  if (!entry || now > entry.resetAt) {
    memoryMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
}
