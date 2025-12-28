'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { useAdminDashboard } from '@saubio/utils';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Users, CalendarCheck2, Euro, AlertTriangle, Percent, Activity } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const LineChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => ({ default: mod.Line })), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
);

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
  });
};

export default function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboard();
  const { data, isLoading, isError } = dashboardQuery;
  const overview = data?.overview;

  const numberFormatter = useMemo(() => new Intl.NumberFormat('fr-FR'), []);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    []
  );
  const preciseCurrencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }),
    []
  );

  const userCards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        icon: Users,
        label: 'Utilisateurs',
        value: numberFormatter.format(overview.users.total),
        helper: 'Tous rôles confondus',
      },
      {
        icon: Users,
        label: 'Prestataires',
        value: numberFormatter.format(overview.users.providers.total),
        helper: `${numberFormatter.format(overview.users.providers.active)} actifs`,
      },
      {
        icon: Users,
        label: 'Clients',
        value: numberFormatter.format(overview.users.clients),
        helper: 'Particuliers + entreprises',
      },
      {
        icon: Users,
        label: 'Employés',
        value: numberFormatter.format(overview.users.employees),
        helper: 'Ops & support',
      },
      {
        icon: Users,
        label: 'Admins',
        value: numberFormatter.format(overview.users.admins),
        helper: 'Accès complet',
      },
    ];
  }, [overview, numberFormatter]);

  const bookingCards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        icon: CalendarCheck2,
        label: 'Réservations totales',
        value: numberFormatter.format(overview.bookings.total),
        helper: 'Depuis l’origine',
      },
      {
        icon: CalendarCheck2,
        label: 'Aujourd’hui',
        value: numberFormatter.format(overview.bookings.today),
        helper: 'Nouvelles réservations',
      },
      {
        icon: CalendarCheck2,
        label: 'Cette semaine',
        value: numberFormatter.format(overview.bookings.thisWeek),
        helper: 'Créées depuis lundi',
      },
      {
        icon: CalendarCheck2,
        label: 'Ce mois',
        value: numberFormatter.format(overview.bookings.thisMonth),
        helper: 'Depuis le 1er',
      },
    ];
  }, [overview, numberFormatter]);

  const financeCards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        icon: Euro,
        label: 'CA aujourd’hui',
        value: currencyFormatter.format(overview.finances.revenue.today),
      },
      {
        icon: Euro,
        label: 'CA cette semaine',
        value: currencyFormatter.format(overview.finances.revenue.week),
      },
      {
        icon: Euro,
        label: 'CA ce mois',
        value: currencyFormatter.format(overview.finances.revenue.month),
      },
    ];
  }, [overview, currencyFormatter]);

  const bookingStatusData = overview
    ? [
        { label: 'Brouillon', value: overview.bookings.statuses.draft },
        { label: 'En attente', value: overview.bookings.statuses.pending },
        { label: 'Confirmé', value: overview.bookings.statuses.confirmed },
        { label: 'Terminé', value: overview.bookings.statuses.completed },
        { label: 'Annulé', value: overview.bookings.statuses.cancelled },
      ]
    : [];

  const cancellationRate = overview?.bookings.cancellationRate ?? 0;
  const conversionRate = overview?.bookings.conversionRate ?? 0;
  const shortNoticePercentage = overview?.bookings.shortNotice.percentage ?? 0;
  const averageBasket = overview ? preciseCurrencyFormatter.format(overview.finances.averageBasket || 0) : '—';
  const occupancyRate = overview?.operations.occupancyRate ?? 0;

  const bookingsChart = overview?.charts.bookingsPerDay ?? [];
  const revenueChart = overview?.charts.revenuePerWeek ?? [];

  const paymentsSummary = overview?.finances.payments;

  const busyProviders = overview?.operations.busyProviders ?? 0;
  const activeProviders = overview?.users.providers.active ?? 0;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-saubio-forest">Dashboard administrateur</h1>
        <p className="text-sm text-saubio-slate/70">
          Visualisez en temps réel l’activité Saubio : utilisateurs, réservations, finances et conformité.
        </p>
      </header>

      {isError ? (
        <ErrorState
          title="Impossible de charger le dashboard"
          description="Un problème technique empêche la récupération des indicateurs."
          onRetry={() => dashboardQuery.refetch()}
        />
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={`dashboard-skeleton-${index}`} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : overview ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {userCards.map((card) => (
              <SurfaceCard key={card.label} className="flex flex-col gap-2 rounded-3xl border border-saubio-forest/10 p-4 shadow-soft-lg">
                <div className="flex items-center gap-2 text-saubio-slate/60">
                  <card.icon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.3em]">{card.label}</span>
                </div>
                <span className="text-2xl font-semibold text-saubio-forest">{card.value}</span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-saubio-slate/60">{card.helper}</span>
              </SurfaceCard>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {bookingCards.map((card) => (
              <SurfaceCard key={card.label} className="rounded-3xl border border-saubio-forest/10 p-4 shadow-soft-lg">
                <div className="flex items-center gap-2 text-saubio-slate/60">
                  <card.icon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.3em]">{card.label}</span>
                </div>
                <span className="text-2xl font-semibold text-saubio-forest">{card.value}</span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-saubio-slate/60">{card.helper}</span>
              </SurfaceCard>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {financeCards.map((card) => (
              <SurfaceCard key={card.label} className="rounded-3xl border border-saubio-forest/10 p-4 shadow-soft-lg">
                <div className="flex items-center gap-2 text-saubio-slate/60">
                  <card.icon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.3em]">{card.label}</span>
                </div>
                <span className="text-2xl font-semibold text-saubio-forest">{card.value}</span>
              </SurfaceCard>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-5 shadow-soft-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Bookings quotidiens</p>
                  <p className="text-lg font-semibold text-saubio-forest">14 derniers jours</p>
                </div>
              </div>
              <div className="mt-4 h-64">
                {bookingsChart.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-saubio-slate/50">
                    Aucune donnée disponible
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bookingsChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e6dd" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDateLabel}
                        tick={{ fill: '#69796d', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{ fill: '#69796d', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        labelFormatter={(value) => formatDateLabel(value as string)}
                        formatter={(val: number) => [numberFormatter.format(val), 'Réservations']}
                        contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#1c332a" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-5 shadow-soft-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Revenus par semaine</p>
                  <p className="text-lg font-semibold text-saubio-forest">8 dernières semaines</p>
                </div>
              </div>
              <div className="mt-4 h-64">
                {revenueChart.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-saubio-slate/50">
                    Aucune donnée disponible
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e6dd" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDateLabel}
                        tick={{ fill: '#69796d', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{ fill: '#69796d', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        labelFormatter={(value) => formatDateLabel(value as string)}
                        formatter={(val: number) => [currencyFormatter.format(val), 'Chiffre d’affaires']}
                        contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" fill="#4f9c7f" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-5 shadow-soft-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Statuts des réservations</p>
              <div className="mt-4 space-y-3">
                {bookingStatusData.map((status) => (
                  <div key={status.label}>
                    <div className="flex items-center justify-between text-sm text-saubio-slate/70">
                      <span>{status.label}</span>
                      <span className="font-semibold text-saubio-forest">{numberFormatter.format(status.value)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-saubio-slate/10">
                      <div
                        className="h-2 rounded-full bg-saubio-forest"
                        style={{
                          width:
                            overview.bookings.total > 0
                              ? `${Math.min(100, (status.value / overview.bookings.total) * 100)}%`
                              : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-5 shadow-soft-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Paiements par statut</p>
              <div className="mt-4 space-y-3 text-sm text-saubio-slate/80">
                <div className="flex items-center justify-between">
                  <span>Réussis</span>
                  <span className="font-semibold text-saubio-forest">{paymentsSummary?.succeeded ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>En attente</span>
                  <span className="font-semibold text-saubio-forest">{paymentsSummary?.pending ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Remboursés</span>
                  <span className="font-semibold text-saubio-forest">{paymentsSummary?.refunded ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Échoués</span>
                  <span className="font-semibold text-saubio-forest">{paymentsSummary?.failed ?? 0}</span>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-5 shadow-soft-lg">
              <div className="flex items-center gap-2 text-saubio-slate/60">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em]">Short notice & occupation</span>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-saubio-forest">
                    {numberFormatter.format(overview.bookings.shortNotice.total)} missions short notice
                  </p>
                  <p className="text-xs text-saubio-slate/60">
                    {shortNoticePercentage}% des réservations sous 24h
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-saubio-slate/10">
                    <div className="h-2 rounded-full bg-amber-400" style={{ width: `${shortNoticePercentage}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-saubio-forest">Occupation prestataires</p>
                  <p className="text-xs text-saubio-slate/60">
                    {busyProviders} prestataires mobilisés sur {activeProviders} actifs
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-saubio-slate/10">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${occupancyRate}%` }} />
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-4 shadow-soft-lg">
              <div className="flex items-center gap-2 text-saubio-slate/60">
                <Percent className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em]">Taux annulation</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-saubio-forest">{cancellationRate}%</p>
            </SurfaceCard>
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-4 shadow-soft-lg">
              <div className="flex items-center gap-2 text-saubio-slate/60">
                <Percent className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em]">Taux conversion</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-saubio-forest">{conversionRate}%</p>
            </SurfaceCard>
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-4 shadow-soft-lg">
              <div className="flex items-center gap-2 text-saubio-slate/60">
                <Euro className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em]">Panier moyen</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-saubio-forest">{averageBasket}</p>
            </SurfaceCard>
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-4 shadow-soft-lg">
              <div className="flex items-center gap-2 text-saubio-slate/60">
                <Activity className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em]">Short notice</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-saubio-forest">{shortNoticePercentage}%</p>
            </SurfaceCard>
          </div>
        </>
      ) : (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 p-6 text-sm text-saubio-slate/70 shadow-soft-lg">
          Les données du dashboard ne sont pas encore disponibles. Veuillez réessayer plus tard.
        </SurfaceCard>
      )}
    </div>
  );
}
