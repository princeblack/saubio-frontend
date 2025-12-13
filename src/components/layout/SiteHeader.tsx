'use client';

import { appConfig } from '@saubio/config';
import { resolveRoleHome } from '../../utils/auth';
import { useLogoutMutation, useSession } from '@saubio/utils';
import { LoadingIndicator } from '@saubio/ui';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../providers/LanguageProvider';
import { Menu, X } from 'lucide-react';

const navItems = [
  { href: '#services', key: 'nav.services' },
  { href: '#prestataires', key: 'nav.providers' },
  { href: '#entreprises', key: 'nav.business' },
  { href: '#tarifs', key: 'nav.pricing' },
  { href: '#faq', key: 'nav.faq' },
];

const roleLinkMap: Record<string, { href: string; labelKey: string }> = {
  admin: { href: '/admin/dashboard', labelKey: 'nav.role.admin' },
  employee: { href: '/admin/dashboard', labelKey: 'nav.role.employee' },
  company: { href: '/client/dashboard', labelKey: 'nav.role.company' },
  provider: { href: '/prestataire/dashboard', labelKey: 'nav.role.provider' },
  client: { href: '/client/dashboard', labelKey: 'nav.role.client' },
};

export function SiteHeader() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const session = useSession();
  const logoutMutation = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const citiesList = useMemo(() => {
    const formatter = new Intl.ListFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-GB' : 'de-DE', {
      style: 'short',
      type: 'conjunction',
    });
    return formatter.format(appConfig.supportedCities.slice(0, 3));
  }, [language]);

  const formattedDate = useMemo(() => {
    const date = new Date(appConfig.launchDiscount.expiresAt);
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-GB' : 'de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }, [language]);

  const roleLinks = useMemo(() => {
    const roles = session.user?.roles ?? [];
    if (!roles.length) return [];
    return roles
      .map((role) => roleLinkMap[role])
      .filter(Boolean)
      .filter(
        (link, index, array) => link && array.findIndex((candidate) => candidate?.href === link.href) === index
      ) as Array<{ href: string; labelKey: string }>;
  }, [session.user?.roles]);

  const primaryLink = useMemo(() => {
    if (!session.user) return null;
    const homeHref = resolveRoleHome(session.user.roles);
    const match =
      roleLinks.find((link) => link.href === homeHref) ??
      roleLinks[0] ??
      { href: homeHref, labelKey: 'nav.role.client' };
    return match;
  }, [roleLinks, session.user]);

  const secondaryLinks = useMemo(() => {
    if (!primaryLink) return [];
    return roleLinks.filter((link) => link.href !== primaryLink.href);
  }, [primaryLink, roleLinks]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const showLaunchBanner = !pathname || pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-saubio-mist/80 backdrop-blur">
      <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between gap-8 px-6 py-4 sm:px-10 lg:h-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <Image
              src="/saubio-wordmark.svg"
              alt="Saubio"
              width={190}
              height={64}
              priority
              className="h-12 w-auto"
            />
            <span className="sr-only">Saubio</span>
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-saubio-forest/15 bg-white/80 p-2 text-saubio-forest shadow-soft-lg transition hover:border-saubio-forest/40 lg:hidden"
            onClick={() => setMobileMenuOpen((state) => !state)}
            aria-label={mobileMenuOpen ? t('nav.closeMenu', 'Fermer le menu') : t('nav.openMenu', 'Ouvrir le menu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-saubio-slate/80 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-saubio-forest"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <select
            aria-label={t('language.label')}
            className="hidden rounded-full border border-saubio-forest/10 bg-white px-3 py-2 text-xs font-semibold text-saubio-slate/70 shadow-soft-lg/20 lg:block"
            value={language}
            onChange={(event) => changeLanguage(event.target.value)}
          >
            <option value="de">{t('language.de')}</option>
            <option value="en">{t('language.en')}</option>
            <option value="fr">{t('language.fr')}</option>
          </select>
          {session.user ? (
            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex flex-col items-start gap-2">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-saubio-forest shadow-soft-lg/20">
                  {t('auth.logout.greeting', {
                    name: `${session.user.firstName ?? ''} ${session.user.lastName ?? ''}`.trim() ||
                      session.user.email,
                  })}
                </span>
                {primaryLink ? (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={primaryLink.href}
                      className="rounded-full bg-saubio-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss"
                    >
                      {t(primaryLink.labelKey)}
                    </Link>
                    {secondaryLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-full border border-saubio-forest/20 px-3 py-1.5 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest/40"
                      >
                        {t(link.labelKey)}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => logoutMutation.mutate(undefined)}
                className="rounded-full border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/40"
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
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-saubio-forest/10 px-4 py-2 text-sm font-semibold text-saubio-forest hover:border-saubio-forest/30 lg:block"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white shadow-soft-lg hover:bg-saubio-moss"
              >
                {t('nav.cta')}
              </Link>
            </>
          )}
        </div>
      </div>
      {mobileMenuOpen ? (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/25" onClick={closeMobileMenu} />
          <div className="fixed inset-x-0 top-0 z-50 mt-20 space-y-6 rounded-b-4xl border border-saubio-forest/10 bg-white px-6 py-6 shadow-soft-2xl">
            <div className="space-y-3 text-sm font-semibold text-saubio-slate/80">
              {navItems.map((item) => (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  className="block rounded-2xl border border-saubio-forest/10 px-4 py-3 hover:border-saubio-forest"
                  onClick={closeMobileMenu}
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>
            <div className="space-y-3 border-t border-saubio-forest/10 pt-4 text-sm">
              {session.user ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                    {t('nav.roleLinks', 'Espaces disponibles')}
                  </p>
                  <div className="flex flex-col gap-2">
                    {primaryLink ? (
                      <Link
                        href={primaryLink.href}
                        className="rounded-full bg-saubio-forest px-4 py-2 text-center text-sm font-semibold text-white"
                        onClick={closeMobileMenu}
                      >
                        {t(primaryLink.labelKey)}
                      </Link>
                    ) : null}
                    {secondaryLinks.map((link) => (
                      <Link
                        key={`secondary-${link.href}`}
                        href={link.href}
                        className="rounded-full border border-saubio-forest/20 px-4 py-2 text-center text-sm font-semibold text-saubio-forest"
                        onClick={closeMobileMenu}
                      >
                        {t(link.labelKey)}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        logoutMutation.mutate(undefined);
                      }}
                      className="rounded-full border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest"
                    >
                      {logoutMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoadingIndicator size="xs" />
                          {t('auth.logout.cta')}
                        </span>
                      ) : (
                        t('auth.logout.cta')
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="rounded-full border border-saubio-forest/10 px-4 py-2 text-center text-sm font-semibold text-saubio-forest"
                    onClick={closeMobileMenu}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-saubio-forest px-4 py-2 text-center text-sm font-semibold text-white"
                    onClick={closeMobileMenu}
                  >
                    {t('nav.cta')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {showLaunchBanner ? (
        <div className="bg-saubio-forest text-xs text-saubio-cream">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8">
            <span className="font-semibold uppercase tracking-[0.38em]">
              {t('promo.label')}
            </span>
            <p className="text-sm lg:text-base">
              {t('promo.message', {
                cities: citiesList,
                date: formattedDate,
              })}
            </p>
            <Link
              href="#hero"
              className="rounded-full bg-saubio-sun px-4 py-2 text-xs font-semibold text-saubio-forest hover:bg-yellow-300"
            >
              {t('promo.cta')}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
