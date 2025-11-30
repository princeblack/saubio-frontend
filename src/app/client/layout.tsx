'use client';

import type { ReactNode } from 'react';
import type { UserRole } from '@saubio/models';
import { usePathname } from 'next/navigation';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { clientSidebarItems } from '../../components/navigation/clientSidebarConfig';
import { useRequireRole } from '@saubio/utils';

const allowedRoles: UserRole[] = ['client', 'company'];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCheckoutFlow = pathname?.startsWith('/client/checkout');

  if (isCheckoutFlow) {
    const session = useRequireRole({ allowedRoles });
    if (!session.user) {
      return null;
    }
    return children;
  }

  return (
    <RoleLayout allowedRoles={allowedRoles} sidebarItems={clientSidebarItems}>
      {children}
    </RoleLayout>
  );
}
