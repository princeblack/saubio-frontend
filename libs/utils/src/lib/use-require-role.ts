'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { UserRole } from '@saubio/models';
import { useSession } from './use-session';

interface RequireRoleOptions {
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

export const useRequireRole = ({
  redirectTo,
  allowedRoles,
}: RequireRoleOptions = {}) => {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  const redirectTarget = redirectTo ?? `/login?redirect=${encodeURIComponent(pathname)}`;
  const allowed = useMemo(() => allowedRoles ?? [], [allowedRoles]);

  useEffect(() => {
    const user = session.user;

    if (user === undefined) {
      return;
    }

    if (!user) {
      if (!hasRedirected) {
        setHasRedirected(true);
        router.replace(redirectTarget);
      }
      return;
    }

    setHasRedirected(false);

    if (allowed.length > 0 && !user.roles.some((role) => allowed.includes(role))) {
      router.replace('/403');
    }
  }, [session.user, router, redirectTarget, allowed, hasRedirected]);

  return session;
};
