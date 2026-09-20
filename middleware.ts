import { NextRequest, NextResponse } from 'next/server';

/**
 * Lightweight edge guard: redirect unauthenticated visitors away from
 * platform (/super) and portal (/admin) areas. Real authorization
 * (tenant, role, module) happens server-side in layouts + API routes —
 * this never grants access by itself.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  if ((pathname === '/super' || pathname.startsWith('/super/')) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/super/:path*', '/admin/:path*'],
};
