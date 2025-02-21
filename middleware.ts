import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const protectedCookie = request.cookies.get('protected');

  if (protectedCookie?.value !== '1') {
    return NextResponse.redirect(new URL('/', req.headers.get("x-forwarded-proto") == "https") ? "https://" + request.headers.get('host') : request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/protected',
};
