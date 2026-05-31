import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const getJwtSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length === 0) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('The environment variable JWT_SECRET is not set.');
      } else {
        return 'super-secret-default-key-for-dev';
      }
    }
    return secret;
  };

  const isAuthRoute = pathname.startsWith('/login');
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname === '/';

  const token = request.cookies.get('auth_token')?.value;
  let verified = false;

  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()));
      verified = true;
    } catch (error) {
      verified = false;
    }
  }

  if (isAuthRoute) {
    if (verified) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isDashboardRoute) {
    if (!verified) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname === '/' && verified) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
