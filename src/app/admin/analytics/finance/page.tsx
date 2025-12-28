'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard } from '@saubio/ui';

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

const REVENUE = [
  { label: 'Jan', revenue: 420, commissions: 68, margin: 52 },
  { label: 'Fév', revenue: 460, commissions: 74, margin: 59 },
  { label: 'Mar', revenue: 510, commissions: 82, margin: 63 },
  { label: 'Avr', revenue: 560, commissions: 88, margin: 71 },
];

const SERVICE_SHARE = [
  { service: 'Résidentiel', value: 55 },
  { service: 'Bureaux', value: 27 },
  { service: 'Vitrage', value: 9 },
  { service: 'Fin de bail', value: 9 },
];

const CAC_LTV = [
  { type: 'CAC', value: 34 },
  { type: 'LTV', value: 420 },
];

export default function AdminAnalyticsFinancePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Analyse financière</h1>
        <p className="text-sm text-saubio-slate/70">Revenus par service, commissions, marge, CAC / LTV.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Revenus & marges (K€)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE}>
                <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#1c332a" strokeWidth={3} />
                <Line type="monotone" dataKey="commissions" stroke="#f5c94c" strokeWidth={2} />
                <Line type="monotone" dataKey="margin" stroke="#4f9c7f" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Répartition par service</p>
          <div className="grid gap-3 text-sm text-saubio-slate/80">
            {SERVICE_SHARE.map((item) => (
              <div key={item.service} className="flex items-center justify-between rounded-2xl bg-saubio-slate/5 px-4 py-3">
                <p className="font-semibold text-saubio-forest">{item.service}</p>
                <p>{item.value}%</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">CAC vs LTV</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CAC_LTV}>
              <XAxis dataKey="type" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4f9c7f" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>
    </div>
  );
}
