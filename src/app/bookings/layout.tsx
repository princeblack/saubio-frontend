'use client';

import type { ReactNode } from 'react';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';

export default function BookingsPublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-saubio-mist/40">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 lg:pb-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
