'use client';

import { SurfaceCard } from '@saubio/ui';
import { useAdminServicePricingMatrix, useAdminServiceCatalog, formatEuro } from '@saubio/utils';
import { AlertCircle } from 'lucide-react';

const formatRate = (cents?: number | null) => {
  if (typeof cents !== 'number') return '—';
  return formatEuro(cents / 100);
};

const formatHours = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(1)} h`;
};

export default function AdminPricingPage() {
  const matrixQuery = useAdminServicePricingMatrix();
  const catalogQuery = useAdminServiceCatalog();

  const rows = matrixQuery.data?.rows ?? [];

  const avgRate =
    rows.length > 0
      ? rows.reduce((acc, row) => acc + (row.avgHourlyRateCents ?? 0), 0) /
        rows.filter((row) => typeof row.avgHourlyRateCents === 'number').length
      : null;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Services & Tarifs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Grille tarifaire</h1>
        <p className="text-sm text-saubio-slate/70">
          Taux horaires moyens déclarés par les prestataires actifs, durée moyenne des missions et nombre de réservations par service.
        </p>
      </header>

      {matrixQuery.isLoading ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-6 shadow-soft-lg">
          <p className="text-sm text-saubio-slate/70">Chargement de la grille tarifaire…</p>
        </SurfaceCard>
      ) : matrixQuery.isError ? (
        <SurfaceCard className="rounded-3xl border border-rose-200 bg-white/95 p-6 shadow-soft-lg">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">Impossible d’afficher la grille tarifaire pour le moment.</p>
          </div>
        </SurfaceCard>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Tarif horaire moyen</p>
              <p className="text-3xl font-semibold text-saubio-forest">{formatRate(avgRate ?? null)}</p>
              <p className="text-xs text-saubio-slate/60">Basé sur les prestataires actifs</p>
            </SurfaceCard>
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Prestataires actifs</p>
              <p className="text-3xl font-semibold text-saubio-forest">
                {rows.reduce((acc, row) => acc + (row.activeProviderCount ?? 0), 0)}
              </p>
              <p className="text-xs text-saubio-slate/60">Somme sur tous les services</p>
            </SurfaceCard>
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Réservations suivies</p>
              <p className="text-3xl font-semibold text-saubio-forest">
                {rows.reduce((acc, row) => acc + (row.bookingsCount ?? 0), 0)}
              </p>
              <p className="text-xs text-saubio-slate/60">Historique cumulé</p>
            </SurfaceCard>
          </section>

          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-saubio-forest">Tarifs par service</p>
              <span className="text-xs text-saubio-slate/60">{rows.length} services suivis</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-saubio-slate/80">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                    <th className="px-3 py-2 text-left font-semibold">Service</th>
                    <th className="px-3 py-2 text-left font-semibold">Prestataires actifs</th>
                    <th className="px-3 py-2 text-left font-semibold">Tarif moyen</th>
                    <th className="px-3 py-2 text-left font-semibold">Min / Max</th>
                    <th className="px-3 py-2 text-left font-semibold">Durée moyenne</th>
                    <th className="px-3 py-2 text-left font-semibold">Réservations</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.serviceId} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2">
                        <p className="font-semibold text-saubio-forest">
                          {catalogQuery.data?.services.find((service) => service.id === row.serviceId)?.title ?? row.serviceName}
                        </p>
                      </td>
                      <td className="px-3 py-2">{row.activeProviderCount ?? 0}</td>
                      <td className="px-3 py-2 font-semibold text-saubio-forest">{formatRate(row.avgHourlyRateCents)}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">
                        {formatRate(row.minHourlyRateCents)} → {formatRate(row.maxHourlyRateCents)}
                      </td>
                      <td className="px-3 py-2">{formatHours(row.avgDurationHours)}</td>
                      <td className="px-3 py-2">{row.bookingsCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
