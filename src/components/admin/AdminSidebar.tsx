'use client';

import Link from 'next/link';
import type { FC } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { adminMenu, type AdminMenuItem } from './admin-menu';

interface AdminSidebarProps {
  collapsed: boolean;
}

const STORAGE_KEY = 'saubio.admin.sidebar-collapsed-items';

export const AdminSidebar: FC<AdminSidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setOpenSections(JSON.parse(stored));
      } catch {
        setOpenSections({});
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(openSections));
  }, [openSections]);

  useEffect(() => {
    const updateForActive = (items: AdminMenuItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length) {
          const childActive = item.children.some((child) => pathname.startsWith(child.route ?? ''));
          if (childActive && !openSections[item.label]) {
            setOpenSections((state) => ({ ...state, [item.label]: true }));
          }
          updateForActive(item.children);
        }
      });
    };
    updateForActive(adminMenu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderChildren = (items: AdminMenuItem[], depth = 0) =>
    items.map((item) => {
      const Icon = item.icon;
      const hasChildren = Boolean(item.children && item.children.length);
      const isActive =
        (item.route && pathname.startsWith(item.route)) ||
        (hasChildren && item.children!.some((child) => child.route && pathname.startsWith(child.route)));
      const showLabel = !collapsed;
      const isOpen = hasChildren ? openSections[item.label] : false;

      if (hasChildren) {
        return (
          <div key={item.label} className="space-y-1">
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-semibold transition ${
                isActive ? 'bg-saubio-forest/10 text-saubio-forest' : 'hover:bg-saubio-forest/5 hover:text-saubio-forest'
              }`}
              onClick={() => {
                setOpenSections((state) => ({ ...state, [item.label]: !state[item.label] }));
              }}
            >
              <span className="flex items-center gap-2">
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {showLabel ? item.label : null}
              </span>
              {showLabel ? (
                isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : null}
            </button>
            <div
              className={`overflow-hidden ${showLabel ? 'pl-4' : 'pl-0'} transition-all ${
                isOpen && showLabel ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="mt-1 space-y-1">
                {renderChildren(item.children!, depth + 1)}
              </div>
            </div>
          </div>
        );
      }

      return (
        <Link
          key={item.label}
          href={item.route ?? '#'}
          className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
            isActive ? 'bg-saubio-forest/10 text-saubio-forest' : 'hover:bg-saubio-forest/5 hover:text-saubio-forest'
          }`}
        >
          {Icon ? <Icon className="h-4 w-4" /> : null}
          {showLabel ? item.label : null}
        </Link>
      );
    });

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } hidden min-h-[calc(100vh-4rem)] flex-col border-r border-saubio-forest/10 bg-white/80 px-3 pb-6 pt-4 text-sm text-saubio-slate/80 shadow-soft-lg lg:flex`}
    >
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-saubio-forest/20 scrollbar-track-transparent">
        <nav className="space-y-1">{renderChildren(adminMenu)}</nav>
      </div>
    </aside>
  );
};
