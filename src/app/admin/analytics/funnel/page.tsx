'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Target, Filter } from 'lucide-react';
import { useAdminAnalyticsFunnel, formatDateTime } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().split('T')[0];
  return { from: format(from), to: format(to) };
};

const formatPercent = (value: number | null) =>
  value === null ? '—' : new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(value);

export default function AdminAnalyticsFunnelPage() {
  const [range, setRange] = useState(defaultRange());
  const funnelQuery = useAdminAnalyticsFunnel(range);
  const data = funnelQuery.data;

  const steps = data?.steps ?? [];
  const chartData = useMemo(
    () =>
      steps.map((step) => ({
        label: step.label,
        value: step.value,
        conversion: step.conversionRate ?? 0,
      })),
    [steps]
  );

  const handleRangeChange = (partial: { from?: string; to?: string }) => {
    setRange((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Funnel de réservation</h1>
        <p className="text-sm text-saubio-slate/70">
          Suivez chaque étape du parcours client : des leads postcode jusqu’aux prestations complétées.
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

      {funnelQuery.isError ? (
        <ErrorState
          title="Impossible de charger le funnel"
          description="Le service analytics n’a pas répondu."
          onRetry={() => funnelQuery.refetch()}
        />
      ) : funnelQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SurfaceCard key={index} className="rounded-3xl border border-saubio-forest/10 bg-white/80 p-5 shadow-soft-lg">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-4 h-8 w-24" />
              <Skeleton className="mt-3 h-3 w-36" />
            </SurfaceCard>
          ))}
        </div>
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-2">
            {steps.map((step, index) => (
              <SurfaceCard key={step.id} className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{step.label}</p>
                    <p className="text-2xl font-semibold text-saubio-forest">{step.value.toLocaleString('fr-FR')}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/30 text-saubio-forest">
                    <Target className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="text-xs text-saubio-slate/70">
                  Conversion depuis l’étape précédente : {formatPercent(step.conversionRate)}
                </p>
                <div className="rounded-2xl bg-saubio-slate/10 p-3 text-xs text-saubio-slate/80">
                  Dernière mise à jour : {formatDateTime(data?.range.to ?? new Date())}
                </div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-saubio-slate/60">Sequence #{index + 1}</p>
              </SurfaceCard>
            ))}
          </section>

          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-6 shadow-soft-lg">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-saubio-forest">Visualisation funnel</p>
                <p className="text-xs text-saubio-slate/70">
                  Du {formatDateTime(range.from, { dateStyle: 'short' })} au {formatDateTime(range.to, { dateStyle: 'short' })}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-saubio-mist/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-saubio-forest">
                <Filter className="h-4 w-4" aria-hidden="true" />
                {steps.length} étapes
              </span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#5f6f6e' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => value.toLocaleString('fr-FR')}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 1]}
                    tick={{ fill: '#5f6f6e' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => formatPercent(value)}
                  />
                  <Tooltip
                    formatter={(value: number, name) =>
                      name === 'Volume' ? value.toLocaleString('fr-FR') : formatPercent(value as number)
                    }
                    labelFormatter={(label: string) => label}
                  />
                  <Bar dataKey="value" fill="#1c332a" radius={[12, 12, 0, 0]} name="Volume" yAxisId="left" />
                  <Bar dataKey="conversion" fill="#f5c94c" radius={[12, 12, 0, 0]} name="Conversion" yAxisId="right" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
