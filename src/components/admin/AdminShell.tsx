'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRequireRole } from '@saubio/utils';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { adminMenu } from './admin-menu';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface Props {
  children: ReactNode;
}

export function AdminShell({ children }: Props) {
  const session = useRequireRole({ allowedRoles: ['admin'] });
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const activeTitle = useMemo(() => {
    const findLabel = (path: string): string | undefined => {
      for (const item of adminMenu) {
        if (item.route && path.startsWith(item.route)) {
          return item.label;
        }
        if (item.children) {
          const child = item.children.find((child) => child.route && path.startsWith(child.route));
          if (child) {
            return `${item.label} • ${child.label}`;
          }
        }
      }
      return undefined;
    };
    return findLabel(pathname ?? '');
  }, [pathname]);

  if (!session.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-saubio-mist text-saubio-slate">
      <AdminHeader
        sidebarCollapsed={collapsed}
        onToggleSidebar={() => setCollapsed((value) => !value)}
        user={session.user}
        activeTitle={activeTitle}
      />
      <div className="mx-auto flex w-full max-w-[110rem] gap-6 px-4 pb-12 pt-6 sm:px-8 lg:px-12">
        <AdminSidebar collapsed={collapsed} />
        <main className="min-h-[70vh] flex-1 rounded-3xl border border-saubio-forest/10 bg-white/90 p-6 shadow-soft-lg sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
