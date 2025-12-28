import type { NextRequest } from 'next/server';

type JwtPayload = {
  roles?: string[];
};

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  employee: '/employee/dashboard',
  company: '/client/dashboard',
  provider: '/prestataire/dashboard',
  client: '/client/dashboard',
};

export function decodeJwt(token?: string): JwtPayload {
  if (!token) return {};
  try {
    const segments = token.split('.');
    if (segments.length < 2) return {};
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

    let json: string;
    if (typeof atob === 'function') {
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    } else if (typeof Buffer !== 'undefined') {
      json = Buffer.from(padded, 'base64').toString('utf8');
    } else {
      return {};
    }

    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function resolveRoleHome(roles: string[] | undefined) {
  if (!roles || roles.length === 0) {
    return '/client/dashboard';
  }
  const priority = ['admin', 'employee', 'company', 'provider', 'client'];
  const match = priority.find((role) => roles.includes(role));
  return ROLE_HOME[match ?? 'client'];
}

export function matchProtectedPath(pathname: string) {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/employee')) return 'employee';
  if (pathname.startsWith('/prestataire')) return 'provider';
  if (pathname.startsWith('/client')) return 'client';
  return null;
}

export function guardAccess(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const payload = decodeJwt(token);
  const roles = payload.roles ?? [];
  const segment = matchProtectedPath(request.nextUrl.pathname);

  if (!segment) {
    return { roles, segment: null, isAllowed: true };
  }

  const allowedMap: Record<string, string[]> = {
    admin: ['admin'],
    employee: ['employee'],
    provider: ['provider', 'employee', 'admin'],
    client: ['client', 'company', 'employee', 'admin'],
  };

  const allowedRoles = allowedMap[segment] ?? [];
  const isAllowed = roles.some((role) => allowedRoles.includes(role));

  return {
    roles,
    segment,
    isAllowed,
  };
}

export function determineRedirect(pathname: string, roles: string[]) {
  const home = resolveRoleHome(roles);
  if (pathname === '/' || pathname === '/dashboard') {
    return home;
  }
  return null;
}
