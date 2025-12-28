'use client';

import { useState } from 'react';
import type { ProviderPayoutStatus } from '@saubio/models';
import { useAdminFinancePayouts, formatEuro, formatDateTime } from '@saubio/utils';
import { SurfaceCard, Skeleton, PrimaryButton } from '@saubio/ui';
import { Filter, Search } from 'lucide-react';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().split('T')[0]!;
  return { from: format(from), to: format(to) };
};

const STATUS_OPTIONS: Array<{ value: 'all' | ProviderPayoutStatus; label: string }> = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En traitement' },
  { value: 'paid', label: 'Payé' },
  { value: 'failed', label: 'Échec' },
];

const statusLabel = (status: ProviderPayoutStatus) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'processing':
      return 'En traitement';
    case 'failed':
      return 'Échec';
    default:
      return 'Payé';
  }
};

const statusTone = (status: ProviderPayoutStatus) => {
  if (status === 'paid') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  if (status === 'processing') return 'bg-sky-50 border-sky-200 text-sky-700';
  if (status === 'pending') return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-rose-50 border-rose-200 text-rose-700';
};

const centsToEuro = (value: number) => formatEuro(value / 100);

export default function AdminProviderPayoutsPage() {
  const [range, setRange] = useState(defaultRange());
  const [status, setStatus] = useState<'all' | ProviderPayoutStatus>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const payoutsQuery = useAdminFinancePayouts({
    from: range.from,
    to: range.to,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
    page,
    pageSize: 20,
  });

  const { data, isLoading, isError } = payoutsQuery;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const handleRangeChange = (partial: Partial<typeof range>) => {
    setRange((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const handleStatusChange = (value: 'all' | ProviderPayoutStatus) => {
    setStatus(value);
    setPage(1);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    payoutsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Finances & Paiements</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Versements prestataires</h1>
        <p className="text-sm text-saubio-slate/70">
          Suivi des montants versés, de l’état des mandats SEPA et des missions couvertes par chaque payout.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="mb-4 flex flex-wrap gap-3" onSubmit={handleSearch}>
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-2xl border border-saubio-forest/10 bg-saubio-mist px-3">
            <Search className="h-4 w-4 text-saubio-slate/60" />
            <input
              type="text"
              placeholder="Recherche : payout, prestataire, IBAN, référence…"
              className="h-11 flex-1 border-none bg-transparent text-sm text-saubio-forest outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm font-semibold text-saubio-forest shadow-soft-sm"
          >
            <Filter className="h-4 w-4" />
            Rechercher
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Statut payout</p>
            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value as 'all' | ProviderPayoutStatus)}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Du</p>
            <input
              type="date"
              value={range.from}
              onChange={(event) => handleRangeChange({ from: event.target.value || range.from })}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Au</p>
            <input
              type="date"
              value={range.to}
              onChange={(event) => handleRangeChange({ to: event.target.value || range.to })}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Résultats</p>
            <p className="mt-2 text-base font-semibold text-saubio-forest">
              {data ? `${data.items.length} / ${data.total}` : '—'}
            </p>
          </div>
        </div>
      </SurfaceCard>

      {isError ? (
        <ErrorState
          title="Impossible de charger les versements"
          description="Un incident technique empêche l’accès aux données financières."
          onRetry={() => payoutsQuery.refetch()}
        />
      ) : null}

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Montant</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Programmé</th>
                <th className="px-3 py-2 text-left font-semibold">Payé</th>
                <th className="px-3 py-2 text-left font-semibold">Référence</th>
                <th className="px-3 py-2 text-left font-semibold">Missions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`payouts-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td className="px-3 py-4" colSpan={7}>
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-saubio-slate/60">
                    Aucun versement ne correspond à vos filtres.
                  </td>
                </tr>
              ) : null}
              {data?.items.map((payout) => (
                <tr key={payout.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="px-3 py-3">
                    <div className="font-semibold text-saubio-forest">{payout.provider.name}</div>
                    <div className="text-xs text-saubio-slate/60">{payout.provider.email}</div>
                    <div className="text-xs text-saubio-slate/60">{payout.provider.ibanMasked ?? 'IBAN indisponible'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-saubio-forest">{centsToEuro(payout.amountCents)}</p>
                    <p className="text-xs text-saubio-slate/60">{payout.currency}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(payout.status)}`}>
                      {statusLabel(payout.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3">{payout.scheduledAt ? formatDateTime(payout.scheduledAt) : '—'}</td>
                  <td className="px-3 py-3">{payout.releasedAt ? formatDateTime(payout.releasedAt) : '—'}</td>
                  <td className="px-3 py-3 text-xs text-saubio-slate/60">{payout.externalReference ?? '—'}</td>
                  <td className="px-3 py-3">{payout.missions?.length ?? 0} mission(s)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-saubio-slate/60">{data ? `${data.items.length} résultat(s)` : '—'}</p>
          <div className="flex items-center gap-3">
            <PrimaryButton variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Précédent
            </PrimaryButton>
            <span className="text-sm text-saubio-slate/70">
              Page {page} / {totalPages}
            </span>
            <PrimaryButton
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Suivant
            </PrimaryButton>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
