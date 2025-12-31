'use client';

import { useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { formatDateTime, useAdminMarketingLandingPages } from '@saubio/utils';

const percent = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return '—';
  }
  return `${(value * 100).toFixed(1)} %`;
};

export default function AdminCmsBlogPage() {
  const landingQuery = useAdminMarketingLandingPages();
  const data = landingQuery.data?.pages ?? [];

  const topStories = useMemo(
    () => [...data].sort((a, b) => b.conversions - a.conversions).slice(0, 10),
    [data]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Blog & contenus éditoriaux</h1>
        <p className="text-sm text-saubio-slate/70">
          Classement des pages éditoriales les plus performantes (trafic, leads, statut de publication).
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between text-xs text-saubio-slate/70">
          <p>Trié sur les conversions (landing marketing)</p>
          <a className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest" href="/admin/marketing/landing">
            Voir toutes les pages
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Titre</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Trafic</th>
                <th className="px-3 py-2 text-left font-semibold">Conversion</th>
                <th className="px-3 py-2 text-left font-semibold">MAJ</th>
              </tr>
            </thead>
            <tbody>
              {landingQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : topStories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun contenu enregistré.
                  </td>
                </tr>
              ) : (
                topStories.map((page) => (
                  <tr key={page.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      {page.title}
                      <span className="block text-xs text-saubio-slate/60">{page.seoDescription ?? '—'}</span>
                    </td>
                    <td className="px-3 py-2 capitalize">{page.status}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {page.impressions.toLocaleString('fr-FR')} vues • {page.leads.toLocaleString('fr-FR')} leads
                    </td>
                    <td className="px-3 py-2">{percent(page.conversionRate)}</td>
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
