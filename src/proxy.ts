import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getRoleHome } from "@/lib/role-home";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const getJwtSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length === 0) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("The environment variable JWT_SECRET is not set.");
      } else {
        return "super-secret-default-key-for-dev";
      }
    }
    return secret;
  };

  const isAuthRoute = pathname.startsWith("/login");
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin-dashboard") ||
    pathname.startsWith("/partner-dashboard") ||
    pathname === "/";

  const token = request.cookies.get("auth_token")?.value;
  let verified = false;
  let role: string | undefined;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()));
      verified = true;
      role = payload.role as string | undefined;
    } catch (error) {
      verified = false;
    }
  }

  if (isAuthRoute) {
    if (verified) {
      return NextResponse.redirect(new URL(getRoleHome(role), request.url));
    }
    return NextResponse.next();
  }

  if (isDashboardRoute) {
    if (!verified) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname === "/" && verified) {
      return NextResponse.redirect(new URL(getRoleHome(role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
