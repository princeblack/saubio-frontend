'use client';

import { useState } from 'react';
import { SurfaceCard, Skeleton, PrimaryButton } from '@saubio/ui';
import { useAdminFinancePayments, formatEuro, formatDateTime } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().split('T')[0]!;
  return { from: format(from), to: format(to) };
};

const cents = (value: number) => formatEuro(value / 100);

export default function AdminRefundsPage() {
  const [range, setRange] = useState(defaultRange());
  const [method, setMethod] = useState('');
  const [service, setService] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const refundsQuery = useAdminFinancePayments({
    status: 'refunded',
    from: range.from,
    to: range.to,
    method: method || undefined,
    service: service || undefined,
    city: city || undefined,
    search: search || undefined,
    page,
    pageSize: 20,
  });

  const { data, isLoading, isError } = refundsQuery;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const handleRangeChange = (partial: Partial<typeof range>) => {
    setRange((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    refundsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Finances & Paiements</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Remboursements & annulations</h1>
        <p className="text-sm text-saubio-slate/70">
          Surveillez les paiements remboursés (litiges, annulations, chargebacks) et retrouvez rapidement les réservations concernées.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={handleSearchSubmit}>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Recherche</p>
            <input
              type="text"
              placeholder="ID paiement, réservation, client…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Méthode</p>
            <select
              value={method}
              onChange={(event) => {
                setMethod(event.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            >
              <option value="">Toutes</option>
              <option value="card">Carte</option>
              <option value="sepa">SEPA</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Service</p>
            <input
              type="text"
              placeholder="Tous les services"
              value={service}
              onChange={(event) => {
                setService(event.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Ville</p>
            <input
              type="text"
              placeholder="Berlin, Hambourg…"
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
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
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm font-semibold text-saubio-forest shadow-soft-sm"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </SurfaceCard>

      {isError ? (
        <ErrorState
          title="Impossible de récupérer les remboursements"
          description="Merci de réessayer dans quelques instants."
          onRetry={() => refundsQuery.refetch()}
        />
      ) : null}

  <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Paiement</th>
                <th className="px-3 py-2 text-left font-semibold">Réservation</th>
                <th className="px-3 py-2 text-left font-semibold">Client</th>
                <th className="px-3 py-2 text-left font-semibold">Montant</th>
                <th className="px-3 py-2 text-left font-semibold">Méthode</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Référence externe</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`refunds-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td className="px-3 py-4" colSpan={7}>
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-saubio-slate/60">
                    Aucun remboursement sur la période sélectionnée.
                  </td>
                </tr>
              ) : null}
              {data?.items.map((payment) => (
                <tr key={payment.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{payment.id}</td>
                  <td className="px-3 py-2">{payment.bookingId ?? '—'}</td>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-saubio-forest">{payment.client.name}</p>
                    <p className="text-xs text-saubio-slate/60">{payment.client.email}</p>
                  </td>
                  <td className="px-3 py-2 text-rose-700">{cents(payment.amountCents)}</td>
                  <td className="px-3 py-2 capitalize">{payment.method ?? '—'}</td>
                  <td className="px-3 py-2 text-saubio-slate/60">{formatDateTime(payment.occurredAt)}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{payment.externalReference ?? '—'}</td>
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
