'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { useMemo } from 'react';
import { CalendarDays, Clock, AlertTriangle, Ban, ShieldCheck, UserCheck } from 'lucide-react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { formatDateTime, useAdminBookingsOverviewStats } from '@saubio/utils';
import type { BookingStatus } from '@saubio/models';

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
const PieChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => ({ default: mod.Pie })), { ssr: false });

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  minimumFractionDigits: 1,
});

const bookingStatusLabel = (status: BookingStatus) => {
  switch (status) {
    case 'pending_provider':
      return 'En attente prestataire';
    case 'pending_client':
      return 'En attente client';
    case 'confirmed':
      return 'Confirmé';
    case 'in_progress':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    case 'cancelled':
      return 'Annulé';
    case 'disputed':
      return 'Litige';
    case 'draft':
    default:
      return 'Brouillon';
  }
};

const statusTone = (status: BookingStatus) => {
  switch (status) {
    case 'confirmed':
    case 'in_progress':
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending_provider':
    case 'pending_client':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'cancelled':
    case 'disputed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'draft':
    default:
      return 'bg-slate-50 text-saubio-slate border-slate-200';
  }
};

const paymentLabel = (status: string) => {
  switch (status) {
    case 'captured':
    case 'released':
      return 'Payé';
    case 'pending':
    case 'requires_action':
    case 'authorized':
    case 'capture_pending':
    case 'held':
      return 'En attente';
    case 'failed':
    case 'disputed':
      return 'Échec';
    case 'refunded':
      return 'Remboursé';
    default:
      return status;
  }
};

export default function AdminBookingsOverviewPage() {
  const overviewQuery = useAdminBookingsOverviewStats();
  const { data: overview, isLoading, isError, refetch } = overviewQuery;

  const cards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        label: 'Total réservations',
        helper: 'Portefeuille global',
        value: overview.totals.all.toLocaleString('fr-FR'),
        icon: CalendarDays,
        tone: 'bg-saubio-forest/10 text-saubio-forest',
      },
      {
        label: 'À venir',
        helper: 'Prochaines 72h',
        value: overview.totals.upcoming.toLocaleString('fr-FR'),
        icon: Clock,
        tone: 'bg-sky-100 text-sky-900',
      },
      {
        label: 'Short notice',
        helper: `${percentFormatter.format(overview.shortNoticeRatio / 100)} des missions`,
        value: overview.totals.shortNotice.toLocaleString('fr-FR'),
        icon: AlertTriangle,
        tone: 'bg-amber-100 text-amber-900',
      },
      {
        label: 'Terminé',
        helper: '30 derniers jours',
        value: overview.totals.completed.toLocaleString('fr-FR'),
        icon: ShieldCheck,
        tone: 'bg-emerald-100 text-emerald-900',
      },
      {
        label: 'Annulés / Litiges',
        helper: 'Sur la période',
        value: overview.totals.cancelled.toLocaleString('fr-FR'),
        icon: Ban,
        tone: 'bg-rose-100 text-rose-900',
      },
      {
        label: 'CA aujourd’hui',
        helper: 'Paiements capturés',
        value: currencyFormatter.format(overview.financials.revenueTodayCents / 100),
        icon: UserCheck,
        tone: 'bg-saubio-sun/30 text-saubio-forest',
      },
    ];
  }, [overview]);

  const bookingsChart = overview?.charts.bookingsByDay.map((point) => ({
    label: new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' }).format(new Date(point.date)),
    total: point.total,
  }));

  const revenueChart = overview?.charts.revenueByWeek.map((point) => ({
    label: point.week,
    total: point.totalCents / 100,
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Réservations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Pilotage opérationnel</h1>
        <p className="text-sm text-saubio-slate/70">Suivi en temps réel des volumes, risques et paiements.</p>
      </header>

      {isError ? (
        <ErrorState
          title="Impossible de charger les indicateurs"
          description="Merci de réessayer dans quelques instants."
          onRetry={() => refetch()}
        />
      ) : null}

      {isLoading && !overview ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`booking-overview-skeleton-${index}`} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : null}

      {overview ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <SurfaceCard key={card.label} className="flex flex-col gap-2 rounded-3xl p-5 shadow-soft-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
                  <p className="text-xs text-saubio-slate/60">{card.helper}</p>
                </SurfaceCard>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Volume journalier</p>
                <span className="text-xs text-saubio-slate/60">14 derniers jours</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsChart}>
                    <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="total" name="Réservations" fill="#1c332a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">CA hebdomadaire</p>
                <span className="text-xs text-saubio-slate/60">8 dernières semaines</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChart}>
                    <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(value: number) => currencyFormatter.format(value)}
                      tick={{ fill: '#5f6f6e' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip formatter={(value: number) => currencyFormatter.format(value as number)} />
                    <Line type="monotone" dataKey="total" stroke="#4f9c7f" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Répartition statuts</p>
                <span className="text-xs text-saubio-slate/60">Portefeuille global</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.statuses.map((entry) => ({
                        name: bookingStatusLabel(entry.status),
                        value: entry.count,
                      }))}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={85}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Paiements</p>
                <span className="text-xs text-saubio-slate/60">Transactions clients</span>
              </div>
              <ul className="space-y-3 text-sm text-saubio-slate/80">
                {overview.paymentStatuses.map((entry) => (
                  <li key={entry.status} className="flex items-center justify-between rounded-2xl border border-saubio-forest/10 bg-saubio-mist/60 px-3 py-2">
                    <span className="font-semibold text-saubio-forest">{paymentLabel(entry.status)}</span>
                    <span className="text-xs text-saubio-slate/60">{entry.count.toLocaleString('fr-FR')}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </section>

          <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-saubio-forest">Réservations récentes</p>
                <p className="text-xs text-saubio-slate/60">Dernières créations</p>
              </div>
            </div>
            {overview.recent.length === 0 ? (
              <p className="text-sm text-saubio-slate/60">Aucun mouvement récent.</p>
            ) : (
              <div className="space-y-3 text-sm text-saubio-slate/80">
                {overview.recent.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-2xl border border-saubio-forest/10 bg-saubio-mist/60 px-3 py-2">
                    <div>
                      <Link href={`/admin/bookings/${booking.id}`} className="font-semibold text-saubio-forest underline-offset-4 hover:underline">
                        {booking.id}
                      </Link>
                      <p className="text-xs text-saubio-slate/60">{booking.client.name}</p>
                      <p className="text-xs text-saubio-slate/60">{formatDateTime(booking.startAt)}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(booking.status)}`}>
                      {bookingStatusLabel(booking.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>
        </>
      ) : null}
    </div>
  );
}
