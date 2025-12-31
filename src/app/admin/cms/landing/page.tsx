'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { formatDateTime, useAdminMarketingLandingPages } from '@saubio/utils';

const statusFilterOptions = [
  { label: 'Tous', value: 'all' },
  { label: 'Publié', value: 'published' },
  { label: 'Brouillon', value: 'draft' },
  { label: 'Archivé', value: 'archived' },
] as const;

const statusTone: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-900',
  draft: 'bg-saubio-sun/10 text-saubio-sun/80',
  archived: 'bg-saubio-slate/10 text-saubio-slate/70',
};

export default function AdminCmsLandingPage() {
  const landingQuery = useAdminMarketingLandingPages();
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilterOptions)[number]['value']>('all');
  const [search, setSearch] = useState('');

  const pages = landingQuery.data?.pages ?? [];

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      if (statusFilter !== 'all' && page.status !== statusFilter) {
        return false;
      }
      if (search) {
        const needle = search.toLowerCase();
        return (
          page.title.toLowerCase().includes(needle) ||
          page.path.toLowerCase().includes(needle) ||
          page.slug.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [pages, statusFilter, search]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Landing pages localisées</h1>
        <p className="text-sm text-saubio-slate/70">
          Sélectionnez les pages SEO par ville / use case, suivez leur statut et synchronisez les mises à jour marketing.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-saubio-slate/70">
          <input
            placeholder="Recherche par titre ou URL"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 rounded-full border border-saubio-forest/20 px-3 py-1 outline-none"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as (typeof statusFilterOptions)[number]['value'])}
            className="rounded-full border border-saubio-forest/20 px-3 py-1"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <a
            className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest"
            href="/admin/marketing/landing"
          >
            Créer / synchroniser
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Titre</th>
                <th className="px-3 py-2 text-left font-semibold">URL</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Impressions</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière édition</th>
              </tr>
            </thead>
            <tbody>
              {landingQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucune page ne correspond à ce filtre.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      {page.title}
                      <span className="block text-xs text-saubio-slate/60">{page.slug}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{page.path}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[page.status] ?? statusTone.draft}`}
                      >
                        {page.status === 'published' ? 'Publié' : page.status === 'archived' ? 'Archivé' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {page.impressions.toLocaleString('fr-FR')} vues • {page.conversions.toLocaleString('fr-FR')} conversions
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(page.updatedAt)}</td>
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
