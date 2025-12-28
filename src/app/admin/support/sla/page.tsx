'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { TimerReset, Gauge, Activity } from 'lucide-react';
import { useAdminSupportSla } from '@saubio/utils';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const LineChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => ({ default: mod.Line })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });

const formatDuration = (minutes?: number | null) => {
  if (minutes === null || minutes === undefined) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${mins.toString().padStart(2, '0')}` : `${mins} min`;
};

export default function AdminSupportSlaPage() {
  const { data, isLoading } = useAdminSupportSla();

  const kpis = [
    {
      label: 'Temps réponse moyen',
      value: data?.averageFirstResponseMinutes !== null && data?.averageFirstResponseMinutes !== undefined ? formatDuration(data.averageFirstResponseMinutes) : '—',
      caption: 'Sur la période sélectionnée',
      icon: TimerReset,
      tone: 'bg-saubio-sun/50 text-saubio-forest',
    },
    {
      label: 'Temps résolution moyen',
      value: data?.averageResolutionHours !== null && data?.averageResolutionHours !== undefined ? `${data.averageResolutionHours.toFixed(1)} h` : '—',
      caption: 'Temps entre ouverture et fermeture',
      icon: Gauge,
      tone: 'bg-sky-100 text-sky-900',
    },
    {
      label: 'Score satisfaction',
      value:
        data?.satisfactionScore !== null && data?.satisfactionScore !== undefined
          ? `${data.satisfactionScore.toFixed(1)} / 5`
          : '—',
      caption:
        data?.feedbackSampleSize && data.feedbackSampleSize > 0
          ? `Basé sur ${data.feedbackSampleSize.toLocaleString('fr-FR')} retours`
          : 'Pas de sondage sur la période',
      icon: Activity,
      tone: 'bg-emerald-100 text-emerald-900',
    },
  ];

  const responseTrend = data?.responseTrend ?? [];
  const volumeByDay = data?.volumeByDay ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">SLA & KPI Support</h1>
        <p className="text-sm text-saubio-slate/70">Mesurez les temps de traitement, la satisfaction et le volume des demandes.</p>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <SurfaceCard key={card.label} className="flex items-center justify-between rounded-3xl p-5 shadow-soft-lg">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
                {isLoading ? <Skeleton className="mt-3 h-7 w-20 rounded-full" /> : <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>}
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
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Temps moyen de réponse (min)</p>
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-3xl" />
            ) : responseTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-saubio-slate/60">Pas de données suffisantes.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTrend}>
                  <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#1c332a" strokeWidth={3} dot={{ r: 4, fill: '#f5c94c' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Volume tickets par jour</p>
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-3xl" />
            ) : volumeByDay.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-saubio-slate/60">Pas de données suffisantes.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeByDay}>
                  <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f9c7f" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
