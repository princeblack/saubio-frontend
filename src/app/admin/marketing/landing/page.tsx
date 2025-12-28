'use client';

import { useMemo } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { AlertTriangle, Plus } from 'lucide-react';
import { useAdminMarketingLandingPages } from '@saubio/utils';

const percent = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return '—';
  }
  return `${(value * 100).toFixed(1)} %`;
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'published':
      return { label: 'Publié', tone: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    case 'archived':
      return { label: 'Archivé', tone: 'bg-saubio-slate/10 text-saubio-slate border border-saubio-slate/30' };
    default:
      return { label: 'Brouillon', tone: 'bg-amber-50 text-amber-700 border border-amber-200' };
  }
};

const numberFormatter = new Intl.NumberFormat('fr-FR');

export default function AdminMarketingLandingPage() {
  const landingQuery = useAdminMarketingLandingPages();
  const data = landingQuery.data;

  const rows = useMemo(() => data?.pages ?? [], [data?.pages]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Marketing & codes promo</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Landing pages & SEO</h1>
        <p className="text-sm text-saubio-slate/70">
          Synchronisez les pages marketing réelles et surveillez leurs performances (trafic, conversions, bounce).
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Pages marketing</p>
            {data && (
              <p className="text-xs text-saubio-slate/60">
                {rows.length} page{rows.length > 1 ? 's' : ''} • actualisé le{' '}
                {new Date(Math.max(...rows.map((row) => Date.parse(row.updatedAt)))).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest disabled:opacity-50">
            <Plus className="h-4 w-4" />
            Nouvelle landing
          </button>
        </div>
        {landingQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`landing-skeleton-${index}`} className="h-14 rounded-2xl" />
            ))}
          </div>
        )}
        {landingQuery.isError && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Impossible de charger les landing pages.</p>
              <p className="text-rose-600/90">
                {landingQuery.error instanceof Error
                  ? landingQuery.error.message
                  : 'Veuillez réessayer dans quelques instants.'}
              </p>
            </div>
          </div>
        )}
        {!landingQuery.isLoading && rows.length === 0 && !landingQuery.isError && (
          <div className="rounded-2xl border border-dashed border-saubio-forest/20 bg-saubio-mist/40 p-6 text-center text-sm text-saubio-slate/70">
            Aucune landing configurée pour le moment.
          </div>
        )}
        {!landingQuery.isLoading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Nom</th>
                  <th className="px-3 py-2 text-left font-semibold">URL</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Trafics</th>
                  <th className="px-3 py-2 text-left font-semibold">Conversion</th>
                  <th className="px-3 py-2 text-left font-semibold">Bounce</th>
                  <th className="px-3 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((page) => {
                  const tone = statusLabel(page.status);
                  return (
                    <tr key={page.id} className="border-b border-saubio-forest/5 last:border-b-0">
                      <td className="px-3 py-3 font-semibold text-saubio-forest">{page.title}</td>
                      <td className="px-3 py-3 text-xs text-saubio-slate/60">{page.path}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${tone.tone}`}>
                          {tone.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-saubio-slate/70">
                        {numberFormatter.format(page.impressions)} vues • {numberFormatter.format(page.leads)} leads
                      </td>
                      <td className="px-3 py-3">{percent(page.conversionRate)}</td>
                      <td className="px-3 py-3">{percent(page.bounceRate)}</td>
                      <td className="px-3 py-3 text-right text-saubio-forest underline">Éditer / SEO</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
