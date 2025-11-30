'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export interface SidebarItem {
  href: string;
  labelKey: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ items, collapsed = false, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const flatActive = useMemo(() => {
    if (!pathname) return '';
    const match = items
      .flatMap(flattenItems)
      .find((item) => pathname.startsWith(item.href));
    return match?.href ?? '';
  }, [pathname, items]);

  return (
    <>
      <nav
        className={combineClasses(
          'sticky top-[4.5rem] hidden h-[calc(100vh-6rem)] flex-col gap-4 overflow-y-auto rounded-3xl border border-saubio-forest/10 bg-white/80 p-4 text-sm text-saubio-slate/70 backdrop-blur transition-all duration-200 lg:flex',
          collapsed ? 'min-w-0 max-w-0 opacity-0 pointer-events-none' : 'min-w-[240px]'
        )}
      >
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <SidebarNode key={item.href} item={item} activeHref={flatActive} />
          ))}
        </ul>
      </nav>

      {mobileOpen ? (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/30" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 z-50 flex w-[270px] max-w-[85vw] flex-col overflow-y-auto border-r border-saubio-forest/15 bg-white p-5 shadow-soft-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">Saubio</p>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label={t('appNav.close')}
                className="rounded-full border border-saubio-forest/15 p-2 text-saubio-forest transition hover:border-saubio-forest/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex flex-1 flex-col gap-1">
              {items.map((item) => (
                <SidebarNode key={`mobile-${item.href}`} item={item} activeHref={flatActive} onNavigate={onCloseMobile} />
              ))}
            </ul>
            <button
              type="button"
              className="mt-6 w-full rounded-2xl border border-saubio-forest/20 px-4 py-2 text-center text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest"
              onClick={() => {
                onCloseMobile?.();
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('saubio:mobile-logout'));
                }
              }}
            >
              {t('auth.logout.cta')}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SidebarNode({
  item,
  activeHref,
  onNavigate,
}: {
  item: SidebarItem;
  activeHref: string;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const isActive = activeHref === item.href;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={combineClasses(
          'flex items-center gap-3 rounded-2xl px-3 py-2 font-semibold transition',
          isActive
            ? 'bg-saubio-forest text-white shadow-soft-lg'
            : 'hover:bg-saubio-forest/10 hover:text-saubio-forest'
        )}
      >
        {item.icon ? <span className="text-lg">{item.icon}</span> : null}
        <span>{t(item.labelKey)}</span>
      </Link>
        {item.children && item.children.length > 0 ? (
          <ul className="mt-1 ml-4 flex flex-col gap-1 border-l border-saubio-forest/15 pl-3">
            {item.children.map((child) => (
              <SidebarNode key={child.href} item={child} activeHref={activeHref} onNavigate={onNavigate} />
            ))}
          </ul>
        ) : null}
    </li>
  );
}

function flattenItems(item: SidebarItem): SidebarItem[] {
  return [item, ...(item.children?.flatMap(flattenItems) ?? [])];
}

function combineClasses(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(' ');
}
