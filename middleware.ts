import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { wrapMiddlewareWithSentry } from '@sentry/nextjs';

export const middleware = wrapMiddlewareWithSentry(function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const session = request.cookies.get('partenaires_session');
    if (!session?.value) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|monitoring).*)',
  ],
};
