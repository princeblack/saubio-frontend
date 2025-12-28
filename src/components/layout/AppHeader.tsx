'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSession, useLogoutMutation, useNotifications, useNotificationStream } from '@saubio/utils';
import { LoadingIndicator } from '@saubio/ui';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Bell, LifeBuoy, CircleUser, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { resolveRoleHome } from '../../utils/auth';
import { useLanguage } from '../../providers/LanguageProvider';

interface AppHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

export function AppHeader({ sidebarCollapsed, onToggleSidebar, onOpenMobileSidebar }: AppHeaderProps) {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const session = useSession();
  const logoutMutation = useLogoutMutation();

  const displayName = useMemo(() => {
    if (!session.user) {
      return undefined;
    }
    const fullName = `${session.user.firstName ?? ''} ${session.user.lastName ?? ''}`.trim();
    return fullName || session.user.email;
  }, [session.user]);

  const profileLabel = session.user ? displayName ?? t('appNav.profile') : t('nav.login');
  const roles = session.user?.roles ?? [];
  const homeHref = session.user ? resolveRoleHome(roles) : '/';
  const isClient = roles.includes('client') || roles.includes('company');
  const isProvider = roles.includes('provider');
  const isEmployee = roles.includes('employee');
  const isAdmin = roles.includes('admin');

  const profileHref = session.user
    ? isEmployee
      ? '/employee/users'
      : isAdmin
      ? '/admin'
      : isProvider
      ? '/prestataire/profile'
      : '/client/profile'
    : '/login';

  const notificationsHref = session.user
    ? isEmployee
      ? '/employee/tickets'
      : isAdmin
      ? '/admin'
      : isProvider
      ? '/prestataire/notifications'
      : '/client/notifications'
    : '/login';

  const supportHref = session.user
    ? isEmployee
      ? '/employee/support'
      : isAdmin
      ? '/admin'
      : '/client/support'
    : 'mailto:support@saubio.de';

  const fallbackCta = isEmployee ? '/employee/dashboard' : isAdmin ? '/admin' : '/employee/dashboard';
  const ctaHref = isClient ? '/bookings/planning' : isProvider ? '/prestataire/missions' : fallbackCta;
  const sidebarToggleLabel = sidebarCollapsed ? t('appNav.sidebar.show') : t('appNav.sidebar.hide');
  const mobileMenuLabel = t('appNav.sidebar.openMobile');

  return (
    <header className="sticky top-0 z-40 border-b border-saubio-forest/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-saubio-forest/15 bg-white/80 p-2 text-saubio-forest shadow-soft-lg transition hover:border-saubio-forest/40 lg:hidden"
            onClick={onOpenMobileSidebar}
            aria-label={mobileMenuLabel}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden items-center justify-center rounded-xl border border-saubio-forest/15 bg-white/80 p-2 text-saubio-forest shadow-soft-lg transition hover:border-saubio-forest/40 lg:inline-flex"
            onClick={onToggleSidebar}
            aria-label={sidebarToggleLabel}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <Link href={homeHref} className="flex items-center gap-3 text-saubio-forest">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-saubio-sun text-sm font-semibold">
                SB
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Saubio</p>
                <p className="text-[11px] uppercase tracking-[0.32em] text-saubio-slate/60">
                  Rein · Schnell · Grün
                </p>
              </div>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            aria-label={t('language.label')}
            className="hidden rounded-full border border-saubio-forest/15 bg-white/80 px-3 py-1.5 text-xs font-semibold text-saubio-slate/70 shadow-soft-lg/40 transition hover:border-saubio-forest/40 md:block"
            value={language}
            onChange={(event) => changeLanguage(event.target.value)}
          >
            <option value="de">{t('language.de')}</option>
            <option value="en">{t('language.en')}</option>
            <option value="fr">{t('language.fr')}</option>
          </select>
          <select
            aria-label={t('language.label')}
            className="rounded-full border border-saubio-forest/15 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-saubio-slate/70 shadow-soft-lg/40 transition hover:border-saubio-forest/40 md:hidden"
            value={language}
            onChange={(event) => changeLanguage(event.target.value)}
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>
          <NotificationBell
            href={notificationsHref}
            label={t('appNav.notifications')}
            enabled={Boolean(session.user)}
          />
          <HeaderIconButton
            icon={<LifeBuoy className="h-5 w-5" />}
            label={t('appNav.support')}
            href={supportHref}
          />
          <HeaderIconButton
            icon={<CircleUser className="h-5 w-5" />}
            label={profileLabel}
            href={profileHref}
          />
          {session.user && isClient ? (
            <Link
              href={ctaHref}
              className="hidden rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss sm:inline-flex"
            >
              {t('bookingDashboard.ctaCreate')}
            </Link>
          ) : null}
          {session.user ? (
            <button
              type="button"
              onClick={() => logoutMutation.mutate(undefined)}
              className="hidden rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest/40 sm:inline-flex"
            >
              {logoutMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <LoadingIndicator size="xs" />
                  {t('auth.logout.cta')}
                </span>
              ) : (
                t('auth.logout.cta')
              )}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

interface NotificationBellProps {
  href: string;
  label: string;
  enabled: boolean;
}

function NotificationBell({ href, label, enabled }: NotificationBellProps) {
  const { data } = useNotifications({ limit: 10, unread: true }, { enabled });
  useNotificationStream({ enabled });
  const unreadCount = enabled ? data?.length ?? 0 : 0;
  const badge = unreadCount > 0 ? (unreadCount > 9 ? '9+' : `${unreadCount}`) : undefined;
  const labelWithCount = unreadCount > 0 ? `${label} (${unreadCount})` : label;

  return (
    <HeaderIconButton icon={<Bell className="h-5 w-5" />} label={labelWithCount} href={href} badge={badge} />
  );
}

interface HeaderIconButtonProps {
  icon: ReactNode;
  label: string;
  href?: string;
  className?: string;
  badge?: ReactNode;
}

function HeaderIconButton({ icon, label, href, className, badge }: HeaderIconButtonProps) {
  const content = (
    <span className="relative inline-flex">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-saubio-forest/15 bg-white text-saubio-forest shadow-soft-lg transition hover:border-saubio-forest/40">
        {icon}
      </span>
      {badge ? (
        <span className="absolute -right-1 -top-1 rounded-full border border-white bg-saubio-sun px-[3px] py-px text-[10px] font-semibold text-white shadow-soft-sm">
          {badge}
        </span>
      ) : null}
    </span>
  );

  if (href) {
    if (href.startsWith('mailto:')) {
      return (
        <a href={href} className={`relative ${className ?? ''}`} aria-label={label} title={label}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={`relative ${className ?? ''}`} aria-label={label} title={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={`relative ${className ?? ''}`} aria-label={label} title={label}>
      {content}
    </button>
  );
}
