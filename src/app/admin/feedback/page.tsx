'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard } from '@saubio/ui';
import { useAdminQualityOverview } from '@saubio/utils';
import { AlertTriangle, Award, MessageSquare, Star } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => ({ default: mod.Pie })), { ssr: false });

export default function AdminFeedbackOverviewPage() {
  const { data, isLoading } = useAdminQualityOverview();

  const stats = data?.stats;
  const serviceBreakdown = data?.serviceBreakdown ?? [];
  const cityBreakdown = data?.cityBreakdown ?? [];
  const recentReviews = data?.recentReviews ?? [];

  const kpis = [
    {
      label: 'Note moyenne globale',
      value: stats?.globalAverage ? `${stats.globalAverage.toFixed(2)} / 5` : '—',
      caption: `${stats?.reviewCount ?? 0} avis publiés`,
      icon: Star,
      tone: 'bg-emerald-50 text-emerald-900',
    },
    {
      label: 'Avis (30 derniers jours)',
      value: stats?.reviewCountLast30?.toString() ?? '0',
      caption: `${stats?.reviewCountLast7 ?? 0} sur 7 jours`,
      icon: MessageSquare,
      tone: 'bg-sky-100 text-sky-900',
    },
    {
      label: 'Incidents ouverts',
      value: stats?.openIncidents?.toString() ?? '0',
      caption: 'Smart Match & support',
      icon: AlertTriangle,
      tone: 'bg-amber-100 text-amber-900',
    },
    {
      label: 'Prestataires premium',
      value: data?.topProviders.length ? data.topProviders.length.toString() : '0',
      caption: 'Score > 4.5',
      icon: Award,
      tone: 'bg-saubio-sun/40 text-saubio-forest',
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Feedback & qualité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Vue d’ensemble satisfaction</h1>
        <p className="text-sm text-saubio-slate/70">Suivez les avis, incidents, scores prestataires et tendances qualité.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <SurfaceCard key={card.label} className="flex min-h-[120px] items-center justify-between rounded-3xl p-5 shadow-soft-lg">
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
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Répartition par service</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceBreakdown}>
                <XAxis dataKey="service" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="average" fill="#4f9c7f" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Top villes par satisfaction</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cityBreakdown.map((city, index) => ({
                    ...city,
                    fill: ['#1c332a', '#4f9c7f', '#f5c94c', '#cad4e5', '#9ea7b4'][index % 5],
                  }))}
                  dataKey="average"
                  nameKey="city"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Avis récents</p>
            <p className="text-xs text-saubio-slate/60">
              Derniers retours vérifiés {isLoading && !data ? '(chargement...)' : ''}
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
                <th className="px-3 py-2 text-left font-semibold">Note</th>
                <th className="px-3 py-2 text-left font-semibold">Commentaire</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentReviews.map((review) => (
                <tr key={review.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{review.booking.id}</td>
                  <td className="px-3 py-2">{review.author.name}</td>
                  <td className="px-3 py-2">{review.provider.name}</td>
                  <td className="px-3 py-2">{review.score.toFixed(1)} / 5</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{review.comment ?? '—'}</td>
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
