import { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4028",
  "http://localhost:4028",
  "http://127.0.0.1:4028",
].filter((origin) => origin && origin !== "https://yourdomain.com");

/**
 * The origin the request was actually addressed to. Comparing Origin against
 * this keeps the same-origin check working even when NEXT_PUBLIC_APP_URL is
 * unset or still holds a placeholder, which would otherwise reject every real
 * request. `host` is what the browser used to reach us and cannot be spoofed by
 * a third-party page, so it is preferred over the proxy-supplied header.
 */
function getRequestOrigin(req: NextRequest): string | null {
  const host = req.headers.get("host") || req.headers.get("x-forwarded-host");
  if (!host) return null;
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    forwardedProto ||
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

function isAllowedOrigin(candidate: string, req: NextRequest): boolean {
  const configured = ALLOWED_ORIGINS.some((allowed) => {
    try {
      return new URL(candidate).origin === new URL(allowed).origin;
    } catch {
      return false;
    }
  });
  if (configured) return true;

  const own = getRequestOrigin(req);
  if (!own) return false;
  try {
    return new URL(candidate).origin === new URL(own).origin;
  } catch {
    return false;
  }
}

export function validateCsrfHeaders(req: NextRequest): { valid: boolean; error?: string } {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { valid: true };
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    if (!isAllowedOrigin(origin, req)) {
      return { valid: false, error: "CSRF validation failed: invalid origin" };
    }
    return { valid: true };
  }

  if (referer) {
    if (!isAllowedOrigin(referer, req)) {
      return { valid: false, error: "CSRF validation failed: invalid referer" };
    }
    return { valid: true };
  }

  // Neither header is present. A browser always attaches Origin to a
  // cross-site state-changing request, so this is a non-browser client. Those
  // callers must identify themselves with a bearer token, which a cross-site
  // form post cannot set; anything else is rejected rather than waved through.
  const authorization = req.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return { valid: true };
  }

  return {
    valid: false,
    error: "CSRF validation failed: missing origin, referer and authorization",
  };
}
