import type { ReactNode } from 'react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { employeeSidebarItems } from '../../components/navigation/employeeSidebarConfig';

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout allowedRoles={['employee']} sidebarItems={employeeSidebarItems}>
      {children}
    </RoleLayout>
  );
}
