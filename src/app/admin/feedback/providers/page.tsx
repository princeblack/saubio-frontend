'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { useAdminQualityProviders } from '@saubio/utils';

export default function AdminFeedbackProvidersPage() {
  const [filters, setFilters] = useState<{ search?: string; city?: string; focus?: 'at_risk' | 'top' | undefined; page: number }>({
    page: 1,
  });

  const params = useMemo(
    () => ({
      page: filters.page,
      pageSize: 25,
      search: filters.search,
      city: filters.city,
      focus: filters.focus,
    }),
    [filters]
  );

  const providersQuery = useAdminQualityProviders(params);
  const data = providersQuery.data;
  const totalPages = data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1;

  const handleChange = (next: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Feedback & qualité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Score prestataires</h1>
        <p className="text-sm text-saubio-slate/70">
          Qualité moyenne, volume de missions, incidents ouverts et avis récents pour identifier vos top & bottom prestataires.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Recherche</p>
            <input
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              placeholder="Nom ou email"
              value={filters.search ?? ''}
              onChange={(event) => handleChange({ search: event.target.value || undefined })}
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Ville</p>
            <input
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              placeholder="Berlin, Hambourg…"
              value={filters.city ?? ''}
              onChange={(event) => handleChange({ city: event.target.value || undefined })}
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Focus</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              value={filters.focus ?? ''}
              onChange={(event) =>
                handleChange({ focus: (event.target.value as 'at_risk' | 'top' | undefined) || undefined })
              }
            >
              <option value="">Tous</option>
              <option value="top">Top (score &gt; 4.5)</option>
              <option value="at_risk">À risque (score &lt; 3.5)</option>
            </select>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Ville</th>
                <th className="px-3 py-2 text-left font-semibold">Services</th>
                <th className="px-3 py-2 text-left font-semibold">Score</th>
                <th className="px-3 py-2 text-left font-semibold">Avis</th>
                <th className="px-3 py-2 text-left font-semibold">Avis 30j</th>
                <th className="px-3 py-2 text-left font-semibold">Missions 30j</th>
                <th className="px-3 py-2 text-left font-semibold">Incidents</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((provider) => (
                <tr key={provider.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{provider.name}</td>
                  <td className="px-3 py-2">{provider.city ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">
                    {provider.serviceCategories.length ? provider.serviceCategories.join(', ') : '—'}
                  </td>
                  <td className="px-3 py-2">{provider.ratingAverage ? provider.ratingAverage.toFixed(2) : '—'}</td>
                  <td className="px-3 py-2">{provider.totalReviews}</td>
                  <td className="px-3 py-2">{provider.reviewsLast30Days}</td>
                  <td className="px-3 py-2">{provider.bookingsLast30Days}</td>
                  <td className="px-3 py-2">{provider.incidentsOpen}</td>
                </tr>
              ))}
              {!data?.items.length && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    {providersQuery.isLoading ? 'Chargement des prestataires…' : 'Aucun prestataire ne correspond à vos filtres.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="mt-4 flex items-center justify-between text-xs text-saubio-slate/60">
            <p>
              Page {data.page} / {totalPages} — {data.total} prestataires
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-2xl border border-saubio-forest/10 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-50"
                disabled={data.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              >
                Précédent
              </button>
              <button
                type="button"
                className="rounded-2xl border border-saubio-forest/10 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-50"
                disabled={data.page >= totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
