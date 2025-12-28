'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import {
  CreditCard,
  Euro,
  Banknote,
  Receipt,
  AlertTriangle,
  Percent,
  ActivitySquare,
  Gauge,
  TrendingDown,
} from 'lucide-react';
import { useAdminFinanceOverview } from '@saubio/utils';

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
const AreaChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.AreaChart })), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => ({ default: mod.Area })), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => ({ default: mod.Pie })), { ssr: false });

const currencyFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const percentFormatter = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 2 });

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const iso = (date: Date) => date.toISOString().split('T')[0];
  return { from: iso(from), to: iso(to) };
};

const StatusBadge = ({ status }: { status: string }) => {
  const tone =
    status === 'captured' || status === 'released'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'pending'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : status === 'failed' || status === 'disputed'
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-slate-100 border-slate-200 text-saubio-forest';
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tone}`}>{status}</span>;
};

export default function AdminFinanceOverviewPage() {
  const [range, setRange] = useState(defaultRange());
  const overviewQuery = useAdminFinanceOverview(range);
  const overview = overviewQuery.data;

  const cards = useMemo(() => {
    if (!overview) return [];
    const totalTransactions =
      overview.counts.paymentsSuccess +
      overview.counts.paymentsPending +
      overview.counts.paymentsFailed +
      overview.counts.paymentsRefunded || 1;
    return [
      {
        label: 'Paiements clients',
        value: currencyFormatter.format(overview.totals.grossRevenueCents / 100),
        caption: 'Brut sur la période',
        icon: CreditCard,
        tone: 'bg-sky-100 text-sky-900',
      },
      {
        label: 'Revenus nets plateforme',
        value: currencyFormatter.format(overview.totals.netRevenueCents / 100),
        caption: 'Commissions et frais',
        icon: Euro,
        tone: 'bg-lime-100 text-lime-900',
      },
      {
        label: 'Versements payés',
        value: currencyFormatter.format(overview.totals.payoutPaidCents / 100),
        caption: 'Prestataires rémunérés',
        icon: Banknote,
        tone: 'bg-slate-200 text-saubio-forest',
      },
      {
        label: 'Versements en attente',
        value: currencyFormatter.format(overview.totals.payoutPendingCents / 100),
        caption: 'Batchs restants',
        icon: Receipt,
        tone: 'bg-amber-100 text-amber-900',
      },
      {
        label: 'Montants remboursés',
        value: currencyFormatter.format(overview.totals.refundedAmountCents / 100),
        caption: `${overview.counts.paymentsRefunded} dossiers`,
        icon: AlertTriangle,
        tone: 'bg-rose-100 text-rose-900',
      },
      {
        label: 'Échecs / litiges',
        value: currencyFormatter.format(overview.totals.failedAmountCents / 100),
        caption: `${overview.counts.paymentsFailed} incidents`,
        icon: Percent,
        tone: 'bg-slate-100 text-saubio-forest',
      },
      {
        label: 'Panier moyen',
        value: currencyFormatter.format(
          overview.counts.paymentsSuccess > 0
            ? overview.totals.grossRevenueCents / overview.counts.paymentsSuccess / 100
            : 0
        ),
        caption: 'Transactions réussies',
        icon: ActivitySquare,
        tone: 'bg-saubio-sun/40 text-saubio-forest',
      },
      {
        label: 'Paiements réussis',
        value: percentFormatter.format(overview.counts.paymentsSuccess / totalTransactions),
        caption: `${overview.counts.paymentsSuccess} transactions`,
        icon: Gauge,
        tone: 'bg-emerald-50 text-emerald-900',
      },
      {
        label: 'Taux d’échec',
        value: percentFormatter.format(overview.counts.paymentsFailed / totalTransactions),
        caption: 'Sur la période',
        icon: TrendingDown,
        tone: 'bg-rose-50 text-rose-900',
      },
    ];
  }, [overview, overviewQuery.isLoading]);

  const paymentsChart = overview?.charts.paymentsByDay ?? [];
  const payoutsChart = overview?.charts.payoutsByWeek ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Finances & Paiements</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Vue d’ensemble financière</h1>
        <p className="text-sm text-saubio-slate/70">
          Vision consolidée des encaissements clients, commissions Saubio et versements prestataires.
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

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {overviewQuery.isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <SurfaceCard key={`finance-kpi-${index}`} className="rounded-3xl p-5 shadow-soft-lg">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-20" />
              </SurfaceCard>
            ))
          : cards.map((card) => {
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
                  <p className="text-xs text-saubio-slate/60">{card.caption}</p>
                </SurfaceCard>
              );
            })}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Évolution des paiements</p>
            <span className="text-xs text-saubio-slate/60">{paymentsChart.length} points</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paymentsChart}>
                <XAxis dataKey="date" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => currencyFormatter.format(value / 100)} />
                <Legend />
                <Line type="monotone" dataKey="grossCents" name="Brut" stroke="#1c332a" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="netCents" name="Net" stroke="#4f9c7f" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="failedCents" name="Échec" stroke="#f5c94c" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Statut des transactions</p>
            <span className="text-xs text-saubio-slate/60">Vue instantanée</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Succès', value: overview?.counts.paymentsSuccess ?? 0, fill: '#1c332a' },
                    { name: 'En attente', value: overview?.counts.paymentsPending ?? 0, fill: '#4f9c7f' },
                    { name: 'Échecs', value: overview?.counts.paymentsFailed ?? 0, fill: '#f5c94c' },
                    { name: 'Remboursés', value: overview?.counts.paymentsRefunded ?? 0, fill: '#f87171' },
                  ]}
                  dataKey="value"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1 text-sm text-saubio-slate/70">
            <li className="flex items-center justify-between">
              <span className="font-semibold text-saubio-forest">Succès</span>
              <span>{overview?.counts.paymentsSuccess ?? 0}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-semibold text-saubio-forest">En attente</span>
              <span>{overview?.counts.paymentsPending ?? 0}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-semibold text-saubio-forest">Échecs</span>
              <span>{overview?.counts.paymentsFailed ?? 0}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-semibold text-saubio-forest">Remboursés</span>
              <span>{overview?.counts.paymentsRefunded ?? 0}</span>
            </li>
          </ul>
        </SurfaceCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Brut → frais → net</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={paymentsChart}>
                <XAxis dataKey="date" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => currencyFormatter.format(value / 100)} />
                <Area type="monotone" dataKey="grossCents" stackId="1" stroke="#1c332a" fill="#1c332a33" />
                <Area type="monotone" dataKey="netCents" stackId="1" stroke="#4f9c7f" fill="#4f9c7f55" />
                <Area type="monotone" dataKey="failedCents" stackId="1" stroke="#f5c94c" fill="#f5c94c55" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg lg:col-span-2">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Payouts par semaine</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payoutsChart}>
                <XAxis dataKey="week" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => currencyFormatter.format(value / 100)} />
                <Bar dataKey="amountCents" fill="#1c332a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Paiements récents</p>
          <table className="w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="py-2 text-left font-semibold">ID</th>
                <th className="py-2 text-left font-semibold">Réservation</th>
                <th className="py-2 text-left font-semibold">Client</th>
                <th className="py-2 text-left font-semibold">Montant</th>
                <th className="py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.recent.payments ?? []).map((payment) => (
                <tr key={payment.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="py-2 font-semibold text-saubio-forest">{payment.id}</td>
                  <td className="py-2">{payment.bookingId}</td>
                  <td className="py-2">{payment.client.name}</td>
                  <td className="py-2">{currencyFormatter.format(payment.amountCents / 100)}</td>
                  <td className="py-2">
                    <StatusBadge status={payment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Payouts récents</p>
          <table className="w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="py-2 text-left font-semibold">Prestataire</th>
                <th className="py-2 text-left font-semibold">Montant</th>
                <th className="py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.recent.payouts ?? []).map((payout) => (
                <tr key={payout.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="py-2 font-semibold text-saubio-forest">{payout.provider.name}</td>
                  <td className="py-2">{currencyFormatter.format(payout.amountCents / 100)}</td>
                  <td className="py-2">
                    <StatusBadge status={payout.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SurfaceCard>
      </section>
    </div>
  );
}
