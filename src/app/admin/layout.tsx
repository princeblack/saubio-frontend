import type { ReactNode } from 'react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { adminSidebarItems } from '../../components/navigation/adminSidebarConfig';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout allowedRoles={['admin']} sidebarItems={adminSidebarItems}>
      {children}
    </RoleLayout>
  );
}
