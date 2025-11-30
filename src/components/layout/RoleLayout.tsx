'use client';

import type { ReactNode } from 'react';
import type { UserRole } from '@saubio/models';
import { useEffect, useState } from 'react';
import { Sidebar, type SidebarItem } from '../navigation/Sidebar';
import { AppHeader } from './AppHeader';
import { useLogoutMutation, useRequireRole } from '@saubio/utils';

interface RoleLayoutProps {
  allowedRoles: UserRole[];
  sidebarItems: SidebarItem[];
  children: ReactNode;
}

export function RoleLayout({ allowedRoles, sidebarItems, children }: RoleLayoutProps) {
  const session = useRequireRole({ allowedRoles });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  useEffect(() => {
    const handler = () => logoutMutation.mutate(undefined);
    window.addEventListener('saubio:mobile-logout', handler);
    return () => window.removeEventListener('saubio:mobile-logout', handler);
  }, [logoutMutation]);

  if (!session.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-saubio-mist">
      <AppHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((state) => !state)}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />
      <div className="mx-auto flex w-full max-w-[110rem] gap-6 px-4 pb-12 pt-6 sm:px-8 lg:px-12">
        <Sidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 space-y-8 rounded-3xl border border-saubio-forest/10 bg-white/75 p-6 shadow-soft-lg sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
