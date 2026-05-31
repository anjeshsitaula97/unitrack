import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("The environment variable JWT_SECRET is not set.");
    }
    return "super-secret-default-key-for-dev";
  }
  return secret;
}

async function verifyToken(token: string) {
  try {
    await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/api", "/_next", "/favicon.ico"];
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

  if (isPublic) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value ?? req.cookies.get("auth-token")?.value;
  const isValid = token ? await verifyToken(token) : false;

  if (!isValid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets and API routes
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
