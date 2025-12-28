'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Filter, Search } from 'lucide-react';
import { useAdminQualityReviews, useUpdateAdminQualityReview } from '@saubio/utils';

const STATUS_OPTIONS = [
  { label: 'Tous', value: undefined },
  { label: 'Publié', value: 'published' },
  { label: 'Masqué', value: 'hidden' },
  { label: 'Signalé', value: 'flagged' },
];

export default function AdminFeedbackReviewsPage() {
  const [filters, setFilters] = useState<{ status?: string; service?: string; search?: string; page: number }>({
    page: 1,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const params = useMemo(
    () => ({
      page: filters.page,
      pageSize: 25,
      status: filters.status,
      service: filters.service,
      search: filters.search,
    }),
    [filters]
  );

  const reviewsQuery = useAdminQualityReviews(params);
  const updateReviewMutation = useUpdateAdminQualityReview();

  const data = reviewsQuery.data;
  const totalPages = data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1;

  const onFilterChange = (next: Record<string, string | undefined>) => {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  };

  const onSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onFilterChange({ search: searchTerm || undefined });
  };

  const toggleReviewStatus = (id: string, status: 'published' | 'hidden') => {
    updateReviewMutation.mutate({ id, payload: { status } });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Feedback & qualité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Avis & évaluations</h1>
        <p className="text-sm text-saubio-slate/70">
          Consultez tous les avis clients, filtrez par note / prestataire / service et modérez les retours.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="mb-4 flex flex-wrap gap-3" onSubmit={onSearchSubmit}>
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-saubio-forest/10 bg-saubio-mist px-3">
            <Search className="h-4 w-4 text-saubio-slate/60" />
            <input
              type="text"
              placeholder="Rechercher un booking, un client, un commentaire…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-11 flex-1 border-none bg-transparent text-sm text-saubio-forest outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm font-semibold text-saubio-forest"
          >
            <Filter className="h-4 w-4" />
            Rechercher
          </button>
        </form>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Statut</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              value={filters.status ?? ''}
              onChange={(event) => onFilterChange({ status: event.target.value || undefined })}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Service</p>
            <input
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              placeholder="Résidentiel, bureaux…"
              value={filters.service ?? ''}
              onChange={(event) => onFilterChange({ service: event.target.value || undefined })}
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Page</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              value={filters.page}
              onChange={(event) => setFilters((prev) => ({ ...prev, page: Number(event.target.value) }))}
            >
              {Array.from({ length: totalPages }).map((_, index) => (
                <option key={index} value={index + 1}>
                  Page {index + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Booking</th>
                <th className="px-3 py-2 text-left font-semibold">Client</th>
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Note</th>
                <th className="px-3 py-2 text-left font-semibold">Commentaire</th>
                <th className="px-3 py-2 text-left font-semibold">Service / Ville</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((review) => (
                <tr key={review.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{review.booking.id}</td>
                  <td className="px-3 py-2">{review.author.name}</td>
                  <td className="px-3 py-2">{review.provider.name}</td>
                  <td className="px-3 py-2">{review.score.toFixed(1)} / 5</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{review.comment ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">
                    {review.booking.service} • {review.booking.city ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-saubio-mist px-3 py-1 text-xs font-semibold uppercase tracking-wide text-saubio-slate/80">
                      {review.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold text-saubio-forest">
                    <button
                      type="button"
                      className="mr-2 underline"
                      disabled={updateReviewMutation.isLoading}
                      onClick={() => toggleReviewStatus(review.id, 'published')}
                    >
                      Publier
                    </button>
                    <button
                      type="button"
                      className="underline"
                      disabled={updateReviewMutation.isLoading}
                      onClick={() => toggleReviewStatus(review.id, 'hidden')}
                    >
                      Masquer
                    </button>
                  </td>
                </tr>
              ))}
              {!data?.items.length && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    {reviewsQuery.isLoading ? 'Chargement des avis…' : 'Aucun avis ne correspond à vos filtres.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="mt-4 flex items-center justify-between text-xs text-saubio-slate/60">
            <p>
              Page {data.page} / {totalPages} — {data.total} avis
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-2xl border border-saubio-forest/10 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-50"
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={data.page <= 1}
              >
                Précédent
              </button>
              <button
                type="button"
                className="rounded-2xl border border-saubio-forest/10 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-50"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))
                }
                disabled={data.page >= totalPages}
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
