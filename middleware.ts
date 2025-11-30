import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { guardAccess, determineRedirect, resolveRoleHome } from './src/utils/auth';

export function middleware(request: NextRequest) {
  const { roles, segment, isAllowed } = guardAccess(request);
  const pathname = request.nextUrl.pathname;

  const redirect = determineRedirect(pathname, roles);
  if (redirect) {
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  if (segment && !isAllowed) {
    const home = resolveRoleHome(roles);
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|assets|favicon.ico).*)'],
};
