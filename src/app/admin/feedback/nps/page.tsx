'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard } from '@saubio/ui';
import { useAdminQualitySatisfaction } from '@saubio/utils';
import { Gauge, LineChart as LineIcon, Smile, TrendingUp } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const AreaChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.AreaChart })), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => ({ default: mod.Area })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });

export default function AdminFeedbackNpsPage() {
  const { data, isLoading } = useAdminQualitySatisfaction();
  const stats = data?.stats;
  const timeseries = data?.timeseries ?? [];
  const serviceBreakdown = data?.serviceBreakdown ?? [];
  const cityBreakdown = data?.cityBreakdown ?? [];
  const recentReviews = data?.recentReviews ?? [];

  const kpis = [
    {
      label: 'Score moyen global',
      value: stats?.averageScore ? `${stats.averageScore.toFixed(2)} / 5` : '—',
      caption: `${stats?.totalReviews ?? 0} avis inclus`,
      icon: Gauge,
    },
    {
      label: 'Promoteurs',
      value: `${Math.round((stats?.promoterRate ?? 0) * 100)} %`,
      caption: 'Notes 4-5',
      icon: Smile,
    },
    {
      label: 'Détracteurs',
      value: `${Math.round((stats?.detractorRate ?? 0) * 100)} %`,
      caption: 'Notes 1-2',
      icon: LineIcon,
    },
    {
      label: 'NPS estimé',
      value: stats?.nps !== null && stats?.nps !== undefined ? stats.nps : '—',
      caption: 'Promoteurs - détracteurs',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Feedback & qualité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">NPS & satisfaction clients</h1>
        <p className="text-sm text-saubio-slate/70">
          Visualisez l’évolution des avis, les services les mieux notés et les retours les plus récents.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <SurfaceCard key={card.label} className="flex min-h-[130px] items-center justify-between rounded-3xl p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
                <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
                <p className="text-xs text-saubio-slate/60">{card.caption}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-forest/10 text-saubio-forest">
                <Icon className="h-5 w-5" />
              </span>
            </SurfaceCard>
          );
        })}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-saubio-forest">Tendance satisfaction</p>
              <p className="text-xs text-saubio-slate/60">Moyenne par mois</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseries}>
                <XAxis dataKey="period" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} domain={[0, 5]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#1c332a"
                  fill="#4f9c7f33"
                  strokeWidth={3}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-saubio-forest">Par service</p>
              <p className="text-xs text-saubio-slate/60">Score moyen / nombre d’avis</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceBreakdown}>
                <XAxis dataKey="service" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#f5c94c" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Top villes</p>
        <div className="space-y-3">
          {cityBreakdown.map((city) => (
            <div key={city.city} className="flex items-center justify-between rounded-2xl bg-saubio-forest/5 p-3">
              <div>
                <p className="text-sm font-semibold text-saubio-forest">{city.city}</p>
                <p className="text-xs text-saubio-slate/60">{city.reviewCount} avis</p>
              </div>
              <span className="text-base font-semibold text-saubio-forest">
                {city.averageScore ? city.averageScore.toFixed(2) : '—'} / 5
              </span>
            </div>
          ))}
          {!cityBreakdown.length && (
            <p className="text-sm text-saubio-slate/60">Pas encore assez de données géographiques.</p>
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Avis récents</p>
            <p className="text-xs text-saubio-slate/60">
              Derniers retours clients {isLoading && !recentReviews.length ? '(chargement...)' : ''}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Booking</th>
                <th className="px-3 py-2 text-left font-semibold">Client</th>
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Service</th>
                <th className="px-3 py-2 text-left font-semibold">Note</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentReviews.map((review) => (
                <tr key={review.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{review.booking.id}</td>
                  <td className="px-3 py-2">{review.author.name}</td>
                  <td className="px-3 py-2">{review.provider.name}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{review.booking.service}</td>
                  <td className="px-3 py-2">{review.score.toFixed(1)} / 5</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
              {!recentReviews.length && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun avis disponible pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
