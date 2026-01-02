'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAdminNotificationLogs, formatDateTime } from '@saubio/utils';
import type { AdminNotificationLogItem } from '@saubio/models';
import { aggregateNotificationStats } from './utils/notification-insights';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => ({ default: mod.Line })), { ssr: false });

const CHANNEL_LABELS: Record<AdminNotificationLogItem['channel'], string> = {
  in_app: 'In-app',
  email: 'Email',
  push: 'Push',
};

const STATUS_LABELS: Record<AdminNotificationLogItem['deliveryStatus'], string> = {
  pending: 'En attente',
  sent: 'Envoyé',
  delivered: 'Livré',
  failed: 'Échec',
  bounced: 'Rebond',
};

const STATUS_TONES: Record<AdminNotificationLogItem['deliveryStatus'], string> = {
  pending: 'text-saubio-slate/70',
  sent: 'text-saubio-sun/80',
  delivered: 'text-emerald-800',
  failed: 'text-rose-800',
  bounced: 'text-rose-800',
};

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 200;

const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value ?? 0);

export default function AdminAutomationOverviewPage() {
  const [range, setRange] = useState(() => {
    const to = new Date();
    const from = new Date(to.getTime() - DAY_MS);
    return { from: from.toISOString(), to: to.toISOString() };
  });

  const logsQuery = useAdminNotificationLogs({
    page: 1,
    pageSize: PAGE_SIZE,
    from: range.from,
    to: range.to,
  });
  const logs = logsQuery.data?.items ?? [];
  const stats = useMemo(() => aggregateNotificationStats(logs, 'hour'), [logs]);
  const successRate = stats.total ? (stats.delivered / stats.total) * 100 : 0;
  const failureCount = stats.failed + stats.bounced;
  const recentNotifications = logs.slice(0, 8);
  const isLoading = logsQuery.isLoading;
  const isRefreshing = logsQuery.isFetching;

  const handleRefresh = () => {
    const to = new Date();
    const from = new Date(to.getTime() - DAY_MS);
    setRange({ from: from.toISOString(), to: to.toISOString() });
  };

  const summaryCards = [
    {
      label: 'Notifications envoyées (24h)',
      value: formatNumber(stats.total),
      helper: `${formatNumber(stats.delivered + stats.sent)} livrées / ${formatNumber(failureCount)} en échec`,
    },
    {
      label: 'Taux de succès',
      value: `${successRate.toFixed(1)} %`,
      helper: stats.total ? `${formatNumber(stats.delivered)} livrées confirmées` : 'Aucune notification sur la période',
    },
    {
      label: 'Notifications en file',
      value: formatNumber(stats.pending),
      helper: stats.pending > 0 ? 'Toujours en attente de livraison' : 'Aucune file en attente',
    },
    {
      label: 'Canal dominant',
      value: stats.byChannel[0] ? CHANNEL_LABELS[stats.byChannel[0].channel as AdminNotificationLogItem['channel']] ?? stats.byChannel[0].channel : '—',
      helper: stats.byChannel[0] ? `${formatNumber(stats.byChannel[0].value)} envois sur 24h` : 'Aucune donnée récente',
    },
  ];

  const channelChartData =
    stats.byChannel.length > 0
      ? stats.byChannel.map((entry) => ({
          channel: CHANNEL_LABELS[entry.channel as AdminNotificationLogItem['channel']] ?? entry.channel,
          value: entry.value,
        }))
      : [];

  const timelineData =
    stats.timeline.length > 0
      ? stats.timeline.map((entry) => ({
          label: entry.label,
          delivered: entry.delivered,
          failed: entry.failed,
        }))
      : [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Pilotage des événements</h1>
            <p className="text-sm text-saubio-slate/70">
              Vue consolidée des notifications envoyées via l’API admin sur les dernières 24 heures.
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Rafraîchir
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <SurfaceCard key={card.label} className="flex flex-col justify-between rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            {isLoading ? (
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
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Volume par canal (24h)</p>
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-3xl bg-saubio-mist/40" />
            ) : channelChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-saubio-slate/60">
                Aucune notification récente.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelChartData}>
                  <XAxis dataKey="channel" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f9c7f" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Trend livraisons vs échecs</p>
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-3xl bg-saubio-mist/40" />
            ) : timelineData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-saubio-slate/60">
                Aucun envoi à afficher sur la fenêtre courante.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="delivered" stroke="#1c332a" strokeWidth={3} dot={{ r: 3, fill: '#f5c94c' }} />
                  <Line type="monotone" dataKey="failed" stroke="#d32f2f" strokeWidth={3} dot={{ r: 3, fill: '#d32f2f' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Dernières notifications</p>
          <a className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest" href="/admin/automation/center">
            Centre complet
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Canal</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Template</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Lecture des événements…
                  </td>
                </tr>
              ) : recentNotifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun envoi sur les dernières minutes.
                  </td>
                </tr>
              ) : (
                recentNotifications.map((log) => (
                  <tr key={log.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(log.createdAt)}</td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-saubio-forest">{log.user?.name ?? '—'}</p>
                      <p className="text-xs text-saubio-slate/60">{log.user?.email ?? log.provider?.email ?? '—'}</p>
                    </td>
                    <td className="px-3 py-2">{CHANNEL_LABELS[log.channel]}</td>
                    <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${STATUS_TONES[log.deliveryStatus]}`}>
                      {STATUS_LABELS[log.deliveryStatus]}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{log.templateKey ?? '—'}</td>
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
