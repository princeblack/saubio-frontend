'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Percent, Gift, TrendingUp } from 'lucide-react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { formatEuro, useAdminMarketingOverview } from '@saubio/utils';
import { useMemo, useState } from 'react';

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
const PieChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => ({ default: mod.Pie })), { ssr: false });

const RANGE_OPTIONS = [
  { label: '7 j', value: 7 },
  { label: '30 j', value: 30 },
  { label: '90 j', value: 90 },
];

const PIE_COLORS = ['#1c332a', '#4f9c7f', '#badaa2', '#f5c94c', '#d3dae7'];

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });

const buildRangeParams = (days: number) => {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
};

export default function AdminMarketingOverviewPage() {
  const [rangeDays, setRangeDays] = useState(30);
  const rangeParams = useMemo(() => buildRangeParams(rangeDays), [rangeDays]);
  const overviewQuery = useAdminMarketingOverview(rangeParams);
  const overview = overviewQuery.data;

  const statsCards = useMemo(
    () => [
      {
        label: 'Codes promo actifs',
        value: overview ? `${overview.stats.activePromoCodes}` : '—',
        caption: 'Disponibles immédiatement',
        icon: Gift,
      },
      {
        label: 'Réservations avec promo',
        value: overview ? `${overview.stats.bookingsWithPromo}` : '—',
        caption: `${rangeDays} derniers jours`,
        icon: TrendingUp,
      },
      {
        label: 'Réductions accordées',
        value: overview ? formatEuro(overview.stats.discountGrantedCents / 100) : '—',
        caption: `${rangeDays} derniers jours`,
        icon: Percent,
      },
    ],
    [overview, rangeDays]
  );

  const timelineData = useMemo(
    () =>
      (overview?.timeline ?? []).map((entry) => ({
        date: entry.date,
        usages: entry.usages,
        discount: entry.discountCents / 100,
      })),
    [overview]
  );

  const topCodes = overview?.topCodes ?? [];
  const pieData = useMemo(
    () =>
      topCodes.map((code, index) => ({
        name: code.code,
        value: code.usageCount,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      })),
    [topCodes]
  );

  const recentUsages = overview?.recentUsages ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Marketing & codes promo</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Vue d’ensemble marketing</h1>
        <p className="text-sm text-saubio-slate/70">
          Analyse des codes promo utilisés, réduction accordée et activités récentes sur la période sélectionnée.
        </p>
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRangeDays(option.value)}
              className={`rounded-2xl border px-3 py-1 text-xs font-semibold transition ${
                option.value === rangeDays
                  ? 'border-saubio-forest bg-saubio-forest text-white'
                  : 'border-saubio-forest/20 text-saubio-forest'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <SurfaceCard key={card.label} className="flex items-center justify-between rounded-3xl p-5 shadow-soft-lg">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
                <p className="text-3xl font-semibold text-saubio-forest">
                  {overviewQuery.isLoading ? <Skeleton className="h-8 w-20" /> : card.value}
                </p>
                <p className="text-xs text-saubio-slate/60">{card.caption}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist text-saubio-forest">
                <Icon className="h-5 w-5" />
              </span>
            </SurfaceCard>
          );
        })}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Usage & réduction des promos</p>
            <span className="text-xs text-saubio-slate/60">{rangeDays} derniers jours</span>
          </div>
          <div className="h-64">
            {overviewQuery.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : timelineData.length === 0 ? (
              <p className="text-sm text-saubio-slate/60">Aucune utilisation sur cette période.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#5f6f6e' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => dateFormatter.format(new Date(value))}
                  />
                  <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number | string, key) =>
                      key === 'discount' ? formatEuro(Number(value)) : value
                    }
                    labelFormatter={(value) => dateFormatter.format(new Date(value))}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="usages" name="Utilisations" stroke="#4f9c7f" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="discount" name="Réduction (€)" stroke="#f5c94c" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Top codes promo</p>
            <span className="text-xs text-saubio-slate/60">Part des usages</span>
          </div>
          <div className="h-64">
            {overviewQuery.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : pieData.length === 0 ? (
              <p className="text-sm text-saubio-slate/60">Encore aucune donnée disponible.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {topCodes.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {topCodes.map((code) => (
                <li key={code.id} className="flex items-center justify-between text-saubio-forest">
                  <span className="font-semibold">{code.code}</span>
                  <span className="text-saubio-slate/70">{code.usageCount} utilisation(s)</span>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Utilisations récentes</p>
          <span className="text-xs text-saubio-slate/60">Dernières opérations</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Client</th>
                <th className="px-3 py-2 text-left font-semibold">Code</th>
                <th className="px-3 py-2 text-left font-semibold">Réservation</th>
                <th className="px-3 py-2 text-left font-semibold">Ville</th>
                <th className="px-3 py-2 text-left font-semibold">Réduction</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {overviewQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`usage-skeleton-${index}`} className="border-b border-saubio-forest/5">
                    <td colSpan={7} className="px-3 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : recentUsages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-saubio-slate/60">
                    Aucune utilisation sur la période sélectionnée.
                  </td>
                </tr>
              ) : (
                recentUsages.map((usage) => (
                  <tr key={usage.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 text-saubio-slate/60">{dateFormatter.format(new Date(usage.usedAt))}</td>
                    <td className="px-3 py-2">{usage.client?.name ?? 'Client invité'}</td>
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{usage.code}</td>
                    <td className="px-3 py-2">
                      {usage.bookingId ? (
                        <Link href={`/admin/bookings/${usage.bookingId}`} className="text-saubio-forest underline">
                          {usage.bookingId}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2">{usage.bookingCity ?? '—'}</td>
                    <td className="px-3 py-2">{formatEuro((usage.discountCents ?? 0) / 100)}</td>
                    <td className="px-3 py-2 capitalize">{usage.bookingStatus ?? 'applied'}</td>
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
