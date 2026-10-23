import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getRoleHome, getLoginPathFor, SUPER_ADMIN_DASHBOARD_PATH } from "@/lib/role-home";
import { validateCsrfHeaders } from "@/lib/csrf";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error("The environment variable JWT_SECRET is not set.");
  }
  if (secret.length < 32) {
    throw new Error(
      "JWT_SECRET is too weak: use at least 32 random bytes (e.g. `openssl rand -base64 32`)."
    );
  }
  return secret;
};

/**
 * Routes reachable without an admin session. Everything else requires a valid
 * staff token, so an unauthenticated visitor cannot load the shell of an admin
 * page even though every API already authorises its own requests.
 */
const PUBLIC_PATHS = [
  "/",
  "/customer-story",
  "/login",
  "/appconsole/login",
  "/forgot-password",
  "/reset-password",
  "/join-our-network",
  "/partner-with-us",
  "/checkout/result",
];

/** Prefixes reachable without an admin session. */
const PUBLIC_PREFIXES = [
  // Rewritten to /api/uploads/*, which performs its own per-file authorisation.
  // The proxy must let the request through so that logic can run.
  "/uploads",
  // Owned by the student portal, which authenticates with student_token.
  "/student-portal",
];

/** Prefixes owned by the student portal, which authenticates with student_token. */
const STUDENT_PORTAL_PREFIX = "/student-portal";

/** The public university profile is read-only; /universities/add and /edit are not. */
const PUBLIC_UNIVERSITY_DETAIL = /^\/universities\/\d+\/?$/;

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  if (pathname === STUDENT_PORTAL_PREFIX || pathname.startsWith(`${STUDENT_PORTAL_PREFIX}/`)) {
    return true;
  }
  return PUBLIC_UNIVERSITY_DETAIL.test(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Centralised CSRF defence for every cookie-authenticated mutating API call.
  // A browser always attaches an Origin (or at least Referer) header to a
  // cross-site state-changing request, so a missing/mismatched origin on a
  // non-GET call is rejected here instead of relying on each route to remember.
  // Payment-gateway callbacks are GET redirects (skipped) and non-browser API
  // clients authenticate with an Authorization: Bearer header.
  if (pathname.startsWith("/api/")) {
    const csrf = validateCsrfHeaders(request);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.error || "CSRF validation failed" }, { status: 403 });
    }
  }

  // /api routes authorise their own requests (and /uploads rewrites to /api
  // where file access is enforced per-file), so the page-shell redirects below
  // must never apply to them.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/appconsole/login");

  const token = request.cookies.get("auth_token")?.value;
  let verified = false;
  let role: string | undefined;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()));
      // A student token must never unlock a staff page. The API layer already
      // rejects it; refusing here as well keeps the page shell closed too.
      if (payload.subject !== "student") {
        verified = true;
        role = payload.role as string | undefined;
      }
    } catch (_error) {
      verified = false;
    }
  }

  if (isAuthRoute) {
    if (verified) {
      // A signed-in visitor never needs the form. A Super Admin landing on the
      // console login goes to their dashboard; everyone else to their role home.
      const isConsoleLogin = pathname.startsWith("/appconsole/login");
      const isSuperAdmin = (role || "").trim().toLowerCase() === "super admin";
      const target =
        isConsoleLogin && isSuperAdmin ? SUPER_ADMIN_DASHBOARD_PATH : getRoleHome(role);
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  if (!verified && !isPublicPath(pathname)) {
    // The Super Admin console has its own branded login.
    const loginPath = getLoginPathFor(pathname);
    const url = new URL(loginPath, request.url);
    if (loginPath === "/login" && pathname !== "/") {
      url.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
};
