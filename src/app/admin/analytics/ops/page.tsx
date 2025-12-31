'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { AlertTriangle, LifeBuoy, MessageCircle, Clock } from 'lucide-react';
import { useAdminAnalyticsOps, formatEuro, formatDateTime } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const AreaChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.AreaChart })), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => ({ default: mod.Area })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().split('T')[0];
  return { from: format(from), to: format(to) };
};

const formatPercent = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(value);

export default function AdminAnalyticsOpsPage() {
  const [range, setRange] = useState(defaultRange());
  const opsQuery = useAdminAnalyticsOps(range);
  const data = opsQuery.data;

  const handleRangeChange = (partial: { from?: string; to?: string }) => {
    setRange((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Qualité & opérations</h1>
        <p className="text-sm text-saubio-slate/70">
          Annulations, litiges, SLA support et performance Smart Match sur la période sélectionnée.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-saubio-slate/60">
          <label>
            Du
            <input
              type="date"
              value={range.from}
              onChange={(event) => handleRangeChange({ from: event.target.value || range.from })}
              className="ml-2 rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
            />
          </label>
          <label>
            Au
            <input
              type="date"
              value={range.to}
              onChange={(event) => handleRangeChange({ to: event.target.value || range.to })}
              className="ml-2 rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
            />
          </label>
        </div>
      </header>

      {opsQuery.isError ? (
        <ErrorState
          title="Impossible de charger les indicateurs opérations"
          description="Merci de réessayer plus tard."
          onRetry={() => opsQuery.refetch()}
        />
      ) : opsQuery.isLoading ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/80 p-6 shadow-soft-lg">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-6 h-64 w-full" />
        </SurfaceCard>
      ) : (
        data && (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Annulations</p>
                  <AlertTriangle className="h-5 w-5 text-rose-700" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-saubio-forest">{data.cancellations.total.toLocaleString('fr-FR')}</p>
                <p className="text-xs text-saubio-slate/70">Client {data.cancellations.client} • Prestataire {data.cancellations.provider}</p>
              </SurfaceCard>
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Litiges & remboursements</p>
                  <LifeBuoy className="h-5 w-5 text-saubio-forest" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-saubio-forest">{data.disputes.opened.toLocaleString('fr-FR')}</p>
                <p className="text-xs text-saubio-slate/70">
                  Remboursé {formatEuro(data.disputes.refundCents / 100)} • {data.disputes.resolved} résolus
                </p>
              </SurfaceCard>
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support</p>
                  <MessageCircle className="h-5 w-5 text-saubio-forest" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-saubio-forest">{data.support.ticketsOpened.toLocaleString('fr-FR')}</p>
                <p className="text-xs text-saubio-slate/70">
                  Résolus {data.support.ticketsResolved.toLocaleString('fr-FR')} • {data.support.avgResolutionHours ?? '–'}h moyennes
                </p>
              </SurfaceCard>
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Smart match</p>
                  <Clock className="h-5 w-5 text-saubio-forest" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-saubio-forest">{data.smartMatch.invitations.toLocaleString('fr-FR')}</p>
                <p className="text-xs text-saubio-slate/70">
                  Acceptation {formatPercent(data.smartMatch.acceptanceRate)} • {data.smartMatch.avgResponseMinutes ?? '–'} min
                </p>
              </SurfaceCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <p className="mb-4 text-sm font-semibold text-saubio-forest">Trend annulations</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.cancellations.trend}>
                      <defs>
                        <linearGradient id="cancelGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="#f87171" fill="url(#cancelGradient)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </SurfaceCard>
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <p className="mb-4 text-sm font-semibold text-saubio-forest">Qualité</p>
                <ul className="space-y-3 text-sm text-saubio-slate/80">
                  <li className="flex items-center justify-between">
                    <span>Note moyenne</span>
                    <span className="font-semibold text-saubio-forest">
                      {data.quality.averageRating ? data.quality.averageRating.toFixed(2) : '–'}/5
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Incidents qualité</span>
                    <span className="font-semibold text-saubio-forest">{data.quality.incidentCount}</span>
                  </li>
                </ul>
                <p className="mt-4 text-xs text-saubio-slate/60">Dernière mise à jour {formatDateTime(data.range.to)}</p>
              </SurfaceCard>
            </div>
          </>
        )
      )}
    </div>
  );
}
