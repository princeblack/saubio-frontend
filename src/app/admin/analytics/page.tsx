'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { LineChart as LineChartIcon, Target, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { useAdminAnalyticsOverview, formatEuro, formatDateTime } from '@saubio/utils';
import { ErrorState } from '../../../components/feedback/ErrorState';

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

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().split('T')[0];
  return { from: format(from), to: format(to) };
};

const formatPercent = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 2 }).format(value);

export default function AdminAnalyticsOverviewPage() {
  const [range, setRange] = useState(defaultRange());
  const overviewQuery = useAdminAnalyticsOverview(range);
  const data = overviewQuery.data;

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: 'Réservations créées',
        value: data.bookings.created.toLocaleString('fr-FR'),
        caption: `${data.bookings.completed.toLocaleString('fr-FR')} complétées`,
        icon: LineChartIcon,
        tone: 'bg-saubio-sun/50 text-saubio-forest',
      },
      {
        label: 'CA brut',
        value: formatEuro(data.payments.grossCents / 100),
        caption: `Commission ${formatEuro(data.payments.commissionCents / 100)}`,
        icon: DollarSign,
        tone: 'bg-emerald-100 text-emerald-900',
      },
      {
        label: 'Nouveaux clients',
        value: data.customers.newClients.toLocaleString('fr-FR'),
        caption: `${data.customers.newProviders.toLocaleString('fr-FR')} prestataires activés`,
        icon: Users,
        tone: 'bg-sky-100 text-sky-900',
      },
      {
        label: 'Taux d’annulation',
        value: formatPercent(data.bookings.cancellationRate.overall),
        caption: `Client: ${formatPercent(data.bookings.cancellationRate.client)} • Prestataire: ${formatPercent(data.bookings.cancellationRate.provider)}`,
        icon: AlertTriangle,
        tone: 'bg-rose-100 text-rose-900',
      },
      {
        label: 'Smart match',
        value: formatPercent(data.bookings.smartMatchShare),
        caption: `${data.bookings.shortNoticeShare * 100 < 1 ? '<1' : Math.round(data.bookings.shortNoticeShare * 100)}% short notice`,
        icon: Target,
        tone: 'bg-saubio-slate/10 text-saubio-forest',
      },
      {
        label: 'Panier moyen',
        value: data.payments.averageOrderValueCents
          ? formatEuro(data.payments.averageOrderValueCents / 100)
          : '–',
        caption: 'Transactions réussies',
        icon: DollarSign,
        tone: 'bg-lime-100 text-lime-900',
      },
    ];
  }, [data]);

  const bookingTrend = data?.trends.bookings ?? [];
  const revenueTrend = data?.trends.revenue ?? [];
  const providerTrend = data?.trends.providers ?? [];

  const handleRangeChange = (partial: { from?: string; to?: string }) => {
    setRange((current) => ({ ...current, ...partial }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Tableau analytique global</h1>
        <p className="text-sm text-saubio-slate/70">
          Réservations, revenus, conversion, nouveaux clients / prestataires… appliquez filtres avancés.
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

      {overviewQuery.isError ? (
        <ErrorState
          title="Impossible de charger les indicateurs"
          description="Vérifiez votre connexion ou réessayez plus tard."
          onRetry={() => overviewQuery.refetch()}
        />
      ) : overviewQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SurfaceCard key={index} className="rounded-3xl border border-saubio-forest/10 bg-white/80 p-5 shadow-soft-lg">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-8 w-24" />
              <Skeleton className="mt-3 h-3 w-36" />
            </SurfaceCard>
          ))}
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
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

          <div className="grid gap-4 lg:grid-cols-2">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Réservations vs annulations</p>
                <p className="text-xs text-saubio-slate/60">
                  Période du {formatDateTime(range.from, { dateStyle: 'short' })} au {formatDateTime(range.to, { dateStyle: 'short' })}
                </p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bookingTrend}>
                    <XAxis dataKey="date" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} />
                    <Legend />
                    <Line type="monotone" dataKey="created" stroke="#1c332a" strokeWidth={3} dot={{ r: 3, fill: '#f5c94c' }} />
                    <Line type="monotone" dataKey="completed" stroke="#4f9c7f" strokeWidth={2} dot={{ r: 3, fill: '#1c332a' }} />
                    <Line type="monotone" dataKey="cancelled" stroke="#f87171" strokeWidth={2} dot={{ r: 3, fill: '#1c332a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <p className="mb-4 text-sm font-semibold text-saubio-forest">Revenus bruts vs commissions</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <XAxis dataKey="date" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value: number) => formatEuro(value / 100)} tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => formatEuro((value as number) / 100)} />
                    <Legend />
                    <Line type="monotone" dataKey="grossCents" stroke="#1c332a" strokeWidth={3} dot={{ r: 3, fill: '#f5c94c' }} name="CA brut" />
                    <Line type="monotone" dataKey="commissionCents" stroke="#4f9c7f" strokeWidth={2} dot={{ r: 3, fill: '#1c332a' }} name="Commissions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>
          </div>

          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="mb-4 text-sm font-semibold text-saubio-forest">Activations prestataires par jour</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={providerTrend}>
                  <XAxis dataKey="date" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => value.toLocaleString('fr-FR')} />
                  <Line type="monotone" dataKey="activated" stroke="#1c332a" strokeWidth={3} dot={{ r: 3, fill: '#f5c94c' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
