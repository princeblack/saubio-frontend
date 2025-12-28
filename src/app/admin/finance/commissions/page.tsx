'use client';

import { useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { useAdminFinanceCommissions, formatEuro, formatDateTime } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().split('T')[0]!;
  return { from: format(from), to: format(to) };
};

const cents = (value: number) => formatEuro(value / 100);

export default function AdminCommissionsPage() {
  const [range, setRange] = useState(defaultRange());
  const [service, setService] = useState('');
  const [city, setCity] = useState('');

  const commissionsQuery = useAdminFinanceCommissions({
    from: range.from,
    to: range.to,
    service: service || undefined,
    city: city || undefined,
  });

  const { data, isLoading, isError } = commissionsQuery;

  const totals = data?.totals ?? { commissionCents: 0, providerShareCents: 0, taxCents: 0, bookings: 0 };

  const handleRangeChange = (partial: Partial<typeof range>) => {
    setRange((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Finances & Paiements</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Frais, taxes & commission</h1>
        <p className="text-sm text-saubio-slate/70">
          Comprenez la répartition des montants (part prestataire, commission Saubio, TVA) pour la période sélectionnée.
        </p>
      </header>

      <SurfaceCard className="grid gap-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg md:grid-cols-2 lg:grid-cols-4">
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
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Service</p>
          <input
            type="text"
            placeholder="Tous les services"
            value={service}
            onChange={(event) => setService(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
          />
        </div>
        <div className="text-sm text-saubio-slate/70">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Ville</p>
          <input
            type="text"
            placeholder="Berlin, Hambourg…"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
          />
        </div>
      </SurfaceCard>

      {isError ? (
        <ErrorState
          title="Impossible de charger les commissions"
          description="Veuillez réessayer ou contacter l’équipe finance."
          onRetry={() => commissionsQuery.refetch()}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Commission Saubio</p>
          <p className="text-3xl font-semibold text-saubio-forest">
            {isLoading ? <Skeleton className="h-8 w-32" /> : cents(totals.commissionCents)}
          </p>
          <p className="text-xs text-saubio-slate/60">Sur {totals.bookings} réservations</p>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Part prestataires</p>
          <p className="text-3xl font-semibold text-saubio-forest">
            {isLoading ? <Skeleton className="h-8 w-32" /> : cents(totals.providerShareCents)}
          </p>
          <p className="text-xs text-saubio-slate/60">Montant reversé</p>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">TVA</p>
          <p className="text-3xl font-semibold text-saubio-forest">
            {isLoading ? <Skeleton className="h-8 w-32" /> : cents(totals.taxCents)}
          </p>
          <p className="text-xs text-saubio-slate/60">Collectée auprès des clients</p>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Réservations analysées</p>
          <p className="text-3xl font-semibold text-saubio-forest">{isLoading ? <Skeleton className="h-8 w-24" /> : totals.bookings}</p>
          <p className="text-xs text-saubio-slate/60">Sur la période sélectionnée</p>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Réservation</th>
                <th className="px-3 py-2 text-left font-semibold">Service</th>
                <th className="px-3 py-2 text-left font-semibold">Ville</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Total</th>
                <th className="px-3 py-2 text-left font-semibold">Part prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Commission</th>
                <th className="px-3 py-2 text-left font-semibold">TVA</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`commissions-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td className="px-3 py-4" colSpan={8}>
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-saubio-slate/60">
                    Aucune réservation sur cette période.
                  </td>
                </tr>
              ) : null}
              {data?.rows.map((row) => (
                <tr key={row.bookingId} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{row.bookingId}</td>
                  <td className="px-3 py-2 capitalize">{row.service ?? '—'}</td>
                  <td className="px-3 py-2">{row.city ?? '—'}</td>
                  <td className="px-3 py-2 text-saubio-slate/60">{formatDateTime(row.startAt)}</td>
                  <td className="px-3 py-2">{cents(row.totalCents)}</td>
                  <td className="px-3 py-2">{cents(row.providerShareCents)}</td>
                  <td className="px-3 py-2 text-rose-700">{cents(row.commissionCents)}</td>
                  <td className="px-3 py-2">{cents(row.taxCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
