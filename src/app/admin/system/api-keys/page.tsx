'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { formatDateTime, useAdminSystemApiKeys } from '@saubio/utils';

const STATUS_FILTERS = [
  { label: 'Tous', value: 'all' },
  { label: 'Actifs', value: 'active' },
  { label: 'En pause', value: 'paused' },
  { label: 'Révoqués', value: 'revoked' },
] as const;

const statusTone: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-900',
  paused: 'bg-saubio-sun/10 text-saubio-sun/80',
  revoked: 'bg-rose-50 text-rose-900',
};

const INITIAL_FILTERS = {
  status: 'all',
  search: '',
};

export default function AdminSystemApiKeysPage() {
  const [formState, setFormState] = useState(INITIAL_FILTERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  const query = useAdminSystemApiKeys({
    page,
    pageSize: 20,
    status: filters.status === 'all' ? undefined : (filters.status as 'active' | 'paused' | 'revoked'),
    search: filters.search || undefined,
  });

  const keys = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pageSize = query.data?.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const summary = useMemo(() => {
    const active = keys.filter((key) => key.status === 'active').length;
    const paused = keys.filter((key) => key.status === 'paused').length;
    const revoked = keys.filter((key) => key.status === 'revoked').length;
    return [
      { label: 'Clés visibles', value: keys.length },
      { label: 'Actives sur cette page', value: active },
      { label: 'En pause', value: paused },
      { label: 'Révoquées', value: revoked },
    ];
  }, [keys]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters(formState);
    setPage(1);
  };

  const handleReset = () => {
    setFormState(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setPage((current) => {
      if (direction === 'prev') {
        return Math.max(1, current - 1);
      }
      return Math.min(totalPages, current + 1);
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Clés API & permissions</h1>
            <p className="text-sm text-saubio-slate/70">
              Inventaire des clés internes (ops, exports, partenaires), scopes actifs et dernières utilisations.
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            {query.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Rafraîchir
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((card) => (
          <SurfaceCard
            key={card.label}
            className="flex flex-col rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            {query.isLoading ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-saubio-slate/50">
                <Loader2 className="h-3 w-3 animate-spin" />
                Chargement…
              </div>
            ) : (
              <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
            )}
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-3">
          <label className="text-xs text-saubio-slate/60">
            Statut
            <select
              value={formState.status}
              onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 text-xs text-saubio-slate/60">
            Recherche
            <div className="mt-1 flex items-center rounded-2xl border border-saubio-forest/20 px-3 py-2">
              <Search className="h-4 w-4 text-saubio-slate/40" />
              <input
                type="text"
                value={formState.search}
                onChange={(event) => setFormState((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="nom, prefix, propriétaire…"
                className="ml-2 flex-1 bg-transparent text-sm text-saubio-forest focus:outline-none"
              />
            </div>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-full border border-saubio-forest/20 bg-saubio-forest px-4 py-2 text-xs font-semibold text-white"
            >
              Appliquer
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest"
            >
              Réinitialiser
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Scopes</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière utilisation</th>
                <th className="px-3 py-2 text-left font-semibold">Propriétaire</th>
                <th className="px-3 py-2 text-left font-semibold">Rate limit</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    {filters.search || filters.status !== 'all'
                      ? 'Aucune clé ne correspond à vos filtres.'
                      : 'Aucune clé enregistrée pour le moment.'}
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      <div className="text-sm">{key.name}</div>
                      <div className="text-xs text-saubio-slate/50">Prefix {key.prefix}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {key.scopes.length > 0 ? key.scopes.join(', ') : '—'}
                    </td>
                    <td className="px-3 py-2">{key.lastUsedAt ? formatDateTime(key.lastUsedAt) : 'Jamais utilisée'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {key.owner ? (
                        <>
                          <p className="text-sm font-semibold text-saubio-forest">{key.owner.name ?? '—'}</p>
                          <p>{key.owner.email ?? '—'}</p>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2">{key.rateLimitPerDay ? `${key.rateLimitPerDay} req/jour` : '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[key.status]}`}>
                        {key.status === 'active'
                          ? 'Active'
                          : key.status === 'paused'
                            ? 'En pause'
                            : 'Révoquée'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-saubio-slate/60">
          <span>
            Page {page} / {totalPages} · {total} clé(s)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange('prev')}
              disabled={page === 1 || query.isLoading}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => handlePageChange('next')}
              disabled={page === totalPages || query.isLoading}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
