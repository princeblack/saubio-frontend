'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { ActivitySquare, TimerReset, BellRing, ShieldCheck, AlertTriangle, Gauge } from 'lucide-react';
import { useAdminSmartMatchingOverview, useAdminSmartMatchingHistory } from '@saubio/utils';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const LineChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => ({ default: mod.Line })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => ({ default: mod.Legend })), { ssr: false });

const percentFormatter = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });
const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (date: Date) => date.toISOString().split('T')[0];
  return { from: fmt(from), to: fmt(to) };
};

const formatMinutes = (value: number | null | undefined) => {
  if (!value || Number.isNaN(value)) {
    return '—';
  }
  return `${Math.round(value)} min`;
};

const formatDateLabel = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
};

export default function AdminMatchingOverviewPage() {
  const [range, setRange] = useState(defaultRange());
  const overviewQuery = useAdminSmartMatchingOverview(range);
  const overview = overviewQuery.data;
  const historyQuery = useAdminSmartMatchingHistory({ pageSize: 5, ...range });
  const recent = historyQuery.data?.items ?? [];

  const cards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        label: 'Matchings traités',
        value: overview.stats.totalMatches.toString(),
        caption: `${overview.stats.period.from.split('T')[0]} → ${overview.stats.period.to.split('T')[0]}`,
        icon: ActivitySquare,
        tone: 'bg-sky-100 text-sky-900',
      },
      {
        label: 'Taux de succès',
        value: percentFormatter.format(overview.stats.successRate || 0),
        caption: `${overview.stats.successfulMatches} missions attribuées`,
        icon: ShieldCheck,
        tone: 'bg-emerald-50 text-emerald-900',
      },
      {
        label: 'Temps moyen acceptation',
        value: formatMinutes(overview.stats.avgFirstResponseMinutes),
        caption: 'Réponse prestataire',
        icon: TimerReset,
        tone: 'bg-saubio-sun/40 text-saubio-forest',
      },
      {
        label: 'Prestataires contactés',
        value: numberFormatter.format(overview.stats.avgProvidersContacted),
        caption: 'Moyenne par mission',
        icon: BellRing,
        tone: 'bg-slate-200 text-saubio-forest',
      },
      {
        label: 'Temps jusqu’à assignation',
        value: formatMinutes(overview.stats.avgAssignmentMinutes),
        caption: 'Après première invitation',
        icon: Gauge,
        tone: 'bg-saubio-mist/60 text-saubio-forest',
      },
      {
        label: 'Matchings en attente',
        value: overview.stats.pendingMatches.toString(),
        caption: 'Sans prestataire assigné',
        icon: AlertTriangle,
        tone: 'bg-rose-50 text-rose-900',
      },
    ];
  }, [overview]);

  const chartData = useMemo(() => {
    if (!overview) return [];
    return overview.charts.matchesByDay.map((entry) => ({
      label: formatDateLabel(entry.date),
      success: entry.successful,
      failures: Math.max(entry.total - entry.successful, 0),
    }));
  }, [overview]);

  const responseSummary = overview?.charts.responsesByStatus ?? [];
  const engineStatus =
    overview && overview.stats.successRate >= 0.8
      ? { label: 'Moteur opérationnel', tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
      : overview
        ? { label: 'Surveillance renforcée', tone: 'bg-amber-50 text-amber-800 border-amber-200' }
        : undefined;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Smart Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Vue d’ensemble</h1>
        <p className="text-sm text-saubio-slate/70">
          Suivi en temps réel de l’algorithme, des volumes traités et des derniers bookings dispatchés.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-saubio-slate/60">
          <label>
            Du
            <input
              type="date"
              value={range.from}
              onChange={(event) => setRange((prev) => ({ ...prev, from: event.target.value || prev.from }))}
              className="ml-2 rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
            />
          </label>
          <label>
            Au
            <input
              type="date"
              value={range.to}
              onChange={(event) => setRange((prev) => ({ ...prev, to: event.target.value || prev.to }))}
              className="ml-2 rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
            />
          </label>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {overviewQuery.isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <SurfaceCard key={`smart-matching-kpi-${index}`} className="rounded-3xl p-5 shadow-soft-lg">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-20" />
              </SurfaceCard>
            ))
          : cards.map((card) => {
              const Icon = card.icon;
              return (
                <SurfaceCard key={card.label} className="flex items-center justify-between rounded-3xl p-5 shadow-soft-lg">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
                    <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
                    <p className="text-xs text-saubio-slate/60">{card.caption}</p>
                  </div>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </SurfaceCard>
              );
            })}
      </section>

      {engineStatus && (
        <SurfaceCard className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Statut moteur</p>
            <p className="text-lg font-semibold text-saubio-forest">{engineStatus.label}</p>
          </div>
          <span className={`rounded-full border px-4 py-1 text-xs font-semibold ${engineStatus.tone}`}>basé sur {range.from} → {range.to}</span>
        </SurfaceCard>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard className="lg:col-span-2 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Chronique (succès vs échecs)</p>
          <div className="h-64">
            {overviewQuery.isLoading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="success" name="Succès" stroke="#4f9c7f" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="failures" name="Échecs" stroke="#f5c94c" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Réponses prestataires</p>
          {overviewQuery.isLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : (
            <ul className="space-y-2 text-sm text-saubio-slate/80">
              {responseSummary.map((entry) => (
                <li key={entry.status} className="flex items-center justify-between rounded-2xl border border-saubio-forest/10 px-3 py-2">
                  <span className="capitalize">{entry.status}</span>
                  <span className="font-semibold text-saubio-forest">{entry.value}</span>
                </li>
              ))}
              {!responseSummary.length && <li className="text-xs text-saubio-slate/60">Aucune invitation envoyée sur cette période.</li>}
            </ul>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Derniers matchings réalisés</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="py-2 text-left font-semibold">Booking</th>
                <th className="py-2 text-left font-semibold">Client</th>
                <th className="py-2 text-left font-semibold">Service</th>
                <th className="py-2 text-left font-semibold">Résultat</th>
                <th className="py-2 text-left font-semibold">Prestataire</th>
              </tr>
            </thead>
            <tbody>
              {historyQuery.isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`matching-skeleton-${index}`} className="border-b border-saubio-forest/5 last:border-none">
                      <td colSpan={5} className="py-2">
                        <Skeleton className="h-6 w-full rounded-2xl" />
                      </td>
                    </tr>
                  ))
                : recent.map((match) => (
                    <tr key={match.bookingId} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="py-2 font-semibold text-saubio-forest">{match.bookingId}</td>
                      <td className="py-2">{match.client?.name ?? '—'}</td>
                      <td className="py-2 capitalize">{match.service.replace('_', ' ')}</td>
                      <td className="py-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            match.result === 'assigned'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border-rose-200 bg-rose-50 text-rose-800'
                          }`}
                        >
                          {match.result === 'assigned' ? 'Assigné' : 'Non pourvu'}
                        </span>
                      </td>
                      <td className="py-2">{match.provider?.name ?? '—'}</td>
                    </tr>
                  ))}
              {!historyQuery.isLoading && !recent.length && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-xs text-saubio-slate/60">
                    Aucun matching enregistré sur cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
