'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { MapPin, Activity, AlertTriangle } from 'lucide-react';
import { useAdminAnalyticsZones, formatEuro } from '@saubio/utils';
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

const formatMinutes = (value: number | null) => (value === null ? '–' : `${Math.round(value)} min`);

export default function AdminAnalyticsZonesPage() {
  const [range, setRange] = useState(defaultRange());
  const zonesQuery = useAdminAnalyticsZones(range);
  const data = zonesQuery.data;

  const topCitiesChart = useMemo(() => data?.topCities ?? [], [data?.topCities]);

  const handleRangeChange = (partial: { from?: string; to?: string }) => {
    setRange((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Performance zones & matching</h1>
        <p className="text-sm text-saubio-slate/70">
          Volume de demandes, couverture prestataires et délais de matching par ville / code postal.
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

      {zonesQuery.isError ? (
        <ErrorState
          title="Impossible de charger les zones"
          description="Les indicateurs par zone ne sont pas disponibles."
          onRetry={() => zonesQuery.refetch()}
        />
      ) : zonesQuery.isLoading ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/80 p-6 shadow-soft-lg">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-6 h-64 w-full" />
        </SurfaceCard>
      ) : (
        data && (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Zones suivies</p>
                  <MapPin className="h-5 w-5 text-saubio-forest" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-saubio-forest">{data.rows.length.toLocaleString('fr-FR')}</p>
              </SurfaceCard>
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Demandes analysées</p>
                  <Activity className="h-5 w-5 text-saubio-forest" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-saubio-forest">
                  {data.rows.reduce((sum, row) => sum + row.demand, 0).toLocaleString('fr-FR')}
                </p>
              </SurfaceCard>
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Zones en tension</p>
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-saubio-forest">
                  {data.rows.filter((row) => row.tensionIndex >= 0.7).length.toLocaleString('fr-FR')}
                </p>
              </SurfaceCard>
            </div>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-6 shadow-soft-lg">
              <p className="mb-4 text-sm font-semibold text-saubio-forest">Top villes par volume de demandes</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCitiesChart}>
                    <XAxis dataKey="city" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#1c332a" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-0 shadow-soft-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-saubio-forest/10 text-sm text-saubio-slate">
                  <thead className="bg-saubio-mist/30 text-xs uppercase tracking-[0.3em] text-saubio-forest">
                    <tr>
                      <th className="px-4 py-3 text-left">Ville / CP</th>
                      <th className="px-4 py-3 text-right">Demandes</th>
                      <th className="px-4 py-3 text-right">Prestataires</th>
                      <th className="px-4 py-3 text-right">Taux de match</th>
                      <th className="px-4 py-3 text-right">Délai moyen</th>
                      <th className="px-4 py-3 text-right">Prix moyen</th>
                      <th className="px-4 py-3 text-right">Indice tension</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row) => (
                      <tr key={`${row.city}-${row.postalCode ?? 'all'}`} className="border-b border-saubio-forest/5">
                        <td className="px-4 py-3 font-semibold text-saubio-forest">
                          {row.city}
                          {row.postalCode ? ` (${row.postalCode})` : ''}
                        </td>
                        <td className="px-4 py-3 text-right">{row.demand.toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-3 text-right">{row.providerCount.toLocaleString('fr-FR')}</td>
                        <td className="px-4 py-3 text-right">{(row.matchRate * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right">{formatMinutes(row.avgMatchDelayMinutes)}</td>
                        <td className="px-4 py-3 text-right">{formatEuro(row.priceAvgCents / 100)}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${
                              row.tensionIndex >= 0.7
                                ? 'bg-rose-100 text-rose-900'
                                : row.tensionIndex >= 0.4
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {(row.tensionIndex * 100).toFixed(0)}%
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
