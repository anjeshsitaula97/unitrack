/**
 * Production-ready rate limiter using MySQL via Prisma.
 * Falls back to in-memory if DB is unavailable.
 *
 * For multi-instance / serverless deployments, migrate to Redis:
 *   npm install ioredis
 *   and replace the db.* calls with Redis INCR + EXPIRE.
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
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    // Use the first hop only; proxies append the client IP last, so take the
    // rightmost entry when present to avoid attacker-controlled values.
    const hops = fwd
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();

  // Try DB-backed rate limiting
  try {
    const windowStart = new Date(now - windowMs);
    const count = await db.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) as count FROM RateLimitLog WHERE \`key\` = ? AND createdAt > ?`,
      key,
      windowStart
    );
    const current = Number(count[0]?.count ?? 0);

    if (current >= maxRequests) {
      const oldest = await db.$queryRawUnsafe<{ createdAt: Date }[]>(
        `SELECT createdAt FROM RateLimitLog WHERE \`key\` = ? ORDER BY createdAt ASC LIMIT 1`,
        key
      );
      const resetIn = oldest[0] ? oldest[0].createdAt.getTime() + windowMs - now : windowMs;
      return { allowed: false, remaining: 0, resetIn: Math.max(0, resetIn) };
    }

    await db.$executeRawUnsafe(
      `INSERT INTO RateLimitLog (\`key\`, createdAt) VALUES (?, ?)`,
      key,
      new Date(now)
    );

    // Periodic cleanup of expired entries
    if (Math.random() < 0.01) {
      await db.$executeRawUnsafe(
        `DELETE FROM RateLimitLog WHERE createdAt < ?`,
        new Date(now - windowMs * 2)
      );
    }

    return { allowed: true, remaining: maxRequests - current - 1, resetIn: windowMs };
  } catch {
    // Fallback to in-memory if RateLimitLog table doesn't exist yet
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
