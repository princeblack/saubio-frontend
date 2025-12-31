'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Users, RefreshCcw } from 'lucide-react';
import { useAdminAnalyticsCohorts } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 90 * 24 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().split('T')[0];
  return { from: format(from), to: format(to) };
};

const retentionTone = (value: number) => {
  if (value >= 0.6) return 'bg-emerald-100 text-emerald-900';
  if (value >= 0.3) return 'bg-saubio-mist/50 text-saubio-forest';
  if (value > 0) return 'bg-amber-100 text-amber-900';
  return 'bg-slate-100 text-saubio-slate';
};

const formatPercent = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(value);

export default function AdminAnalyticsCohortsPage() {
  const [range, setRange] = useState(defaultRange());
  const [type, setType] = useState<'client' | 'provider'>('client');
  const cohortsQuery = useAdminAnalyticsCohorts({ ...range, type });
  const data = cohortsQuery.data;

  const totalCohorts = data?.cohorts.length ?? 0;
  const totalUsers = useMemo(
    () => data?.cohorts.reduce((sum, row) => sum + row.size, 0) ?? 0,
    [data?.cohorts]
  );

  const handleRangeChange = (partial: { from?: string; to?: string }) => {
    setRange((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Cohortes & rétention</h1>
        <p className="text-sm text-saubio-slate/70">
          Analysez la rétention des clients et des prestataires à J+7 / J+30 / J+90.
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
          <select
            value={type}
            onChange={(event) => setType(event.target.value as 'client' | 'provider')}
            className="rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
          >
            <option value="client">Clients</option>
            <option value="provider">Prestataires</option>
          </select>
        </div>
      </header>

      {cohortsQuery.isError ? (
        <ErrorState
          title="Impossible de charger les cohortes"
          description="La récupération des données de rétention a échoué."
          onRetry={() => cohortsQuery.refetch()}
        />
      ) : cohortsQuery.isLoading ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/80 p-6 shadow-soft-lg">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-6 h-64 w-full" />
        </SurfaceCard>
      ) : (
        data && (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Cohortes analysées</p>
                  <Users className="h-5 w-5 text-saubio-forest" aria-hidden="true" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-saubio-forest">{totalCohorts}</p>
              </SurfaceCard>
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Population</p>
                  <RefreshCcw className="h-5 w-5 text-saubio-forest" aria-hidden="true" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-saubio-forest">{totalUsers.toLocaleString('fr-FR')}</p>
              </SurfaceCard>
            </div>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-0 shadow-soft-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-saubio-forest/10 text-sm text-saubio-slate">
                  <thead className="bg-saubio-mist/30 text-xs uppercase tracking-[0.3em] text-saubio-forest">
                    <tr>
                      <th className="px-4 py-3 text-left">Cohorte</th>
                      <th className="px-4 py-3 text-left">Size</th>
                      <th className="px-4 py-3 text-left">J+7</th>
                      <th className="px-4 py-3 text-left">J+30</th>
                      <th className="px-4 py-3 text-left">J+90</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cohorts.map((row) => (
                      <tr key={row.cohort} className="border-b border-saubio-forest/5">
                        <td className="px-4 py-3 font-semibold text-saubio-forest">{row.cohort}</td>
                        <td className="px-4 py-3">{row.size.toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${retentionTone(row.retention7)}`}>
                            {formatPercent(row.retention7)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${retentionTone(row.retention30)}`}>
                            {formatPercent(row.retention30)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${retentionTone(row.retention90)}`}>
                            {formatPercent(row.retention90)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SurfaceCard>
          </>
        )
      )}
    </div>
  );
}
