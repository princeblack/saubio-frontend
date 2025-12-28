'use client';

import { Menu, Bell, ChevronDown, Search } from 'lucide-react';
import Image from 'next/image';
import type { FC } from 'react';
import { useMemo } from 'react';
import type { User } from '@saubio/models';

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  user?: User;
  activeTitle?: string;
}

const getInitials = (user?: User) => {
  if (!user) return 'SA';
  const first = (user.firstName ?? '').trim().charAt(0);
  const last = (user.lastName ?? '').trim().charAt(0);
  const initials = `${first}${last}`.trim();
  return initials.length ? initials.toUpperCase() : user.email.charAt(0).toUpperCase();
};

export const AdminHeader: FC<AdminHeaderProps> = ({ sidebarCollapsed, onToggleSidebar, user, activeTitle }) => {
  const initials = useMemo(() => getInitials(user), [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-saubio-forest/10 bg-white/95 shadow-soft-lg backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4 text-saubio-forest">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-saubio-forest/15 bg-white/80 p-3 text-saubio-forest shadow-soft-lg transition hover:border-saubio-forest/40"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden h-10 w-32 sm:block">
            <Image src="/saubio-wordmark.svg" alt="Saubio" fill className="object-contain" sizes="120px" />
          </div>
          {activeTitle ? (
            <div className="hidden text-left sm:block">
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/50">Module actif</p>
              <p className="text-sm font-semibold text-saubio-forest">{activeTitle}</p>
            </div>
          ) : null}
        </div>
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-saubio-forest/10 bg-saubio-mist/70 px-4 py-2">
            <Search className="h-4 w-4 text-saubio-slate/60" />
            <input
              type="search"
              placeholder="Rechercher (missions, utilisateurs, opérations...)"
              className="w-full bg-transparent text-sm text-saubio-slate placeholder:text-saubio-slate/60 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3 text-saubio-slate/70">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 text-xs font-semibold shadow-soft-lg transition hover:border-saubio-forest/40"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-saubio-forest/15 bg-white px-3 py-1.5 text-left shadow-soft-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-saubio-forest/10 text-sm font-semibold text-saubio-forest">
              {initials}
            </div>
            <div className="hidden min-w-[8rem] flex-col text-xs font-semibold text-saubio-slate/80 sm:flex">
              <span className="text-sm text-saubio-forest">{user?.firstName ?? user?.email ?? 'Admin'}</span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-saubio-slate/60">
                {user?.roles?.join(' · ') ?? 'Administrator'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-saubio-slate/60" />
          </div>
        </div>
      </div>
    </header>
  );
};
