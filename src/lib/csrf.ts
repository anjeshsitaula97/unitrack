import { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4028",
  "http://localhost:4028",
  "http://127.0.0.1:4028",
];

export function validateCsrfHeaders(req: NextRequest): { valid: boolean; error?: string } {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { valid: true };
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    try {
      const originUrl = new URL(origin);
      const isAllowed = ALLOWED_ORIGINS.some(
        (allowed) => originUrl.origin === new URL(allowed).origin
      );
      if (!isAllowed) {
        return { valid: false, error: "CSRF validation failed: invalid origin" };
      }
    } catch {
      return { valid: false, error: "CSRF validation failed: malformed origin" };
    }
  } else if (referer) {
    try {
      const refererUrl = new URL(referer);
      const isAllowed = ALLOWED_ORIGINS.some(
        (allowed) => refererUrl.origin === new URL(allowed).origin
      );
      if (!isAllowed) {
        return { valid: false, error: "CSRF validation failed: invalid referer" };
      }
    } catch {
      return { valid: false, error: "CSRF validation failed: malformed referer" };
    }
  }
  // If neither origin nor referer is present, allow (could be a direct API call from a non-browser client like Postman or the master API)

  return { valid: true };
}
