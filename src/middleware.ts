import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/mailayar') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/mail-settings') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/icon.svg') ||
    pathname.startsWith('/logo.jpg')
  ) {
    return NextResponse.next();
  }

  // Check auth session cookie
  const session = request.cookies.get('milkiq_session');
  const isAuthenticated = session?.value === 'authenticated';

  if (!isAuthenticated) {
    // If request is an API call, return JSON 401 instead of HTML redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
