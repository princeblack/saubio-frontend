'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { formatDateTime, useAdminMarketingLandingPages } from '@saubio/utils';

export default function AdminCmsPagesPage() {
  const landingQuery = useAdminMarketingLandingPages();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const pages = landingQuery.data?.pages ?? [];

  const filtered = useMemo(() => {
    return pages.filter((page) => {
      if (status !== 'all' && page.status !== status) {
        return false;
      }
      if (search) {
        const needle = search.toLowerCase();
        return (
          page.title.toLowerCase().includes(needle) ||
          (page.seoTitle ?? '').toLowerCase().includes(needle) ||
          page.path.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [pages, search, status]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Pages statiques & SEO</h1>
        <p className="text-sm text-saubio-slate/70">
          Retrouvez l&apos;inventaire des pages publiques (accueil, locales, campagnes) avec leurs métas SEO.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-saubio-slate/70">
          <input
            placeholder="Rechercher par titre ou URL"
            className="flex-1 rounded-full border border-saubio-forest/20 px-3 py-1 outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-full border border-saubio-forest/20 px-3 py-1"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
            <option value="archived">Archivé</option>
          </select>
          <a
            className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest"
            href="/admin/marketing/landing"
          >
            Ouvrir l’éditeur
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Titre</th>
                <th className="px-3 py-2 text-left font-semibold">SEO</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière mise à jour</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {landingQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucune page.
                  </td>
                </tr>
              ) : (
                filtered.map((page) => (
                  <tr key={page.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      {page.title}
                      <span className="block text-xs text-saubio-slate/60">{page.path}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{page.seoTitle ?? '—'}</td>
                    <td className="px-3 py-2 capitalize">{page.status}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(page.updatedAt)}</td>
                    <td className="px-3 py-2 text-saubio-forest underline">Éditer</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
