import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getRoleHome } from "@/lib/role-home";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error("The environment variable JWT_SECRET is not set.");
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
  "/login",
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

  const isAuthRoute = pathname.startsWith("/login");

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
      return NextResponse.redirect(new URL(getRoleHome(role), request.url));
    }
    return NextResponse.next();
  }

  if (!verified && !isPublicPath(pathname)) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
