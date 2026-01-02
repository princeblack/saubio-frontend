'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { useAdminNotificationLogs } from '@saubio/utils';
import { aggregateNotificationStats } from '../utils/notification-insights';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const AreaChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.AreaChart })), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => ({ default: mod.Area })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => ({ default: mod.Pie })), { ssr: false });

const RANGE_OPTIONS = [
  { value: 7, label: '7 jours' },
  { value: 14, label: '14 jours' },
  { value: 30, label: '30 jours' },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 500;
const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value ?? 0);

export default function AdminAutomationAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState(14);

  const queryWindow = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - rangeDays * DAY_MS);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [rangeDays]);

  const logsQuery = useAdminNotificationLogs({
    page: 1,
    pageSize: PAGE_SIZE,
    from: queryWindow.from,
    to: queryWindow.to,
  });
  const logs = logsQuery.data?.items ?? [];
  const stats = useMemo(() => aggregateNotificationStats(logs, 'day'), [logs]);
  const successRate = stats.total ? (stats.delivered / stats.total) * 100 : 0;
  const failureRate = stats.total ? ((stats.failed + stats.bounced) / stats.total) * 100 : 0;
  const timelineData = stats.timeline.map((entry) => ({
    label: entry.label,
    delivered: entry.delivered,
    failed: entry.failed,
  }));
  const channelShare = stats.byChannel.map((entry) => ({
    name: entry.channel,
    value: entry.value,
  }));

  const summaryCards = [
    {
      label: `Volume total (${rangeDays} j)`,
      value: formatNumber(stats.total),
      helper: stats.total ? `${formatNumber(stats.total / rangeDays)} / jour en moyenne` : 'Aucun envoi sur cette période',
    },
    {
      label: 'Livraisons confirmées',
      value: `${successRate.toFixed(1)} %`,
      helper: `${formatNumber(stats.delivered)} livrées + ${formatNumber(stats.sent)} envoyées`,
    },
    {
      label: 'Échecs & rebonds',
      value: `${failureRate.toFixed(1)} %`,
      helper: `${formatNumber(stats.failed + stats.bounced)} événements à diagnostiquer`,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Statistiques & KPI notifications</h1>
            <p className="text-sm text-saubio-slate/70">Analyse agrégée basée sur les logs envoyés par l’API admin.</p>
          </div>
          <select
            value={rangeDays}
            onChange={(event) => setRangeDays(Number(event.target.value))}
            className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Fenêtre {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <SurfaceCard key={card.label} className="flex flex-col justify-between rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            {logsQuery.isLoading ? (
              <div className="mt-4 flex items-center gap-2 text-xs text-saubio-slate/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Chargement…
              </div>
            ) : (
              <>
                <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
                <p className="text-xs text-saubio-slate/60">{card.helper}</p>
              </>
            )}
          </SurfaceCard>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Livraisons vs échecs par jour</p>
          <div className="h-64">
            {logsQuery.isLoading ? (
              <Skeleton className="h-full w-full rounded-3xl bg-saubio-mist/40" />
            ) : timelineData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-saubio-slate/60">
                Aucune donnée pour la période.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="delivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1c332a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1c332a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="failed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d32f2f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="delivered" stroke="#1c332a" fill="url(#delivered)" strokeWidth={3} />
                  <Area type="monotone" dataKey="failed" stroke="#d32f2f" fill="url(#failed)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Répartition par canal</p>
          <div className="h-64">
            {logsQuery.isLoading ? (
              <Skeleton className="h-full w-full rounded-3xl bg-saubio-mist/40" />
            ) : channelShare.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-saubio-slate/60">
                Aucune notification sur cette fenêtre.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelShare} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3} label />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
