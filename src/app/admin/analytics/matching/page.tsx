'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard } from '@saubio/ui';

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

const SMART_MATCH = [
  { label: 'S1', success: 70, refused: 30 },
  { label: 'S2', success: 72, refused: 28 },
  { label: 'S3', success: 75, refused: 25 },
  { label: 'S4', success: 78, refused: 22 },
];

const ACCEPT_TIME = [
  { zone: 'Berlin', value: 2.3 },
  { zone: 'Hambourg', value: 3.1 },
  { zone: 'Munich', value: 1.8 },
  { zone: 'Cologne', value: 2.9 },
];

const PROVIDERS_CONTACTED = [
  { label: 'Standard', value: 5.1 },
  { label: 'Urgent', value: 8.4 },
  { label: 'Récurrent', value: 3.3 },
];

export default function AdminAnalyticsMatchingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Analyse du matching</h1>
        <p className="text-sm text-saubio-slate/70">Taux de smart match, temps avant acceptation, prestataires contactés, zones sous tension.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Smart match — succès vs refus</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SMART_MATCH}>
                <defs>
                  <linearGradient id="success" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c332a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1c332a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="refused" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="success" stroke="#1c332a" fill="url(#success)" strokeWidth={3} />
                <Area type="monotone" dataKey="refused" stroke="#f87171" fill="url(#refused)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Temps moyen avant acceptation (min)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ACCEPT_TIME}>
                <XAxis dataKey="zone" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f9c7f" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Prestataires contactés par scénario</p>
        <div className="grid gap-4 md:grid-cols-3">
          {PROVIDERS_CONTACTED.map((entry) => (
            <div key={entry.label} className="rounded-2xl bg-saubio-slate/5 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{entry.label}</p>
              <p className="text-3xl font-semibold text-saubio-forest">{entry.value}</p>
              <p className="text-xs text-saubio-slate/60">prestataires / mission</p>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
