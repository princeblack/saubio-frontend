'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard } from '@saubio/ui';
import { PieChart as PieChartIcon, Activity, Zap } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const AreaChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.AreaChart })), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => ({ default: mod.Area })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => ({ default: mod.Pie })), { ssr: false });

const KPI = [
  { label: 'Taux d’ouverture global', value: '42 %', caption: 'Email 33% · Push 48%', icon: Activity, tone: 'bg-saubio-sun/50 text-saubio-forest' },
  { label: 'Taux d’échec', value: '0,8 %', caption: 'Mail 0.3% · SMS 2.1%', icon: PieChartIcon, tone: 'bg-rose-100 text-rose-900' },
  { label: 'Coût SMS (30 j)', value: '€182', caption: '0,06 € / SMS', icon: Zap, tone: 'bg-sky-100 text-sky-900' },
];

const CLICK_TREND = [
  { label: 'S1', open: 35, click: 10 },
  { label: 'S2', open: 38, click: 12 },
  { label: 'S3', open: 42, click: 14 },
  { label: 'S4', open: 41, click: 13 },
];

const CHANNEL_SHARE = [
  { name: 'Push', value: 58, fill: '#1c332a' },
  { name: 'Email', value: 38, fill: '#4f9c7f' },
  { name: 'SMS', value: 4, fill: '#f5c94c' },
];

export default function AdminAutomationAnalyticsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Statistiques & KPI notifications</h1>
        <p className="text-sm text-saubio-slate/70">Comprenez les performances d’ouverture, clic, coûts et volumes.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {KPI.map((card) => {
          const Icon = card.icon;
          return (
            <SurfaceCard key={card.label} className="flex items-center justify-between rounded-3xl p-5 shadow-soft-lg">
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
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Ouverture & clics (4 dernières semaines)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CLICK_TREND}>
                <defs>
                  <linearGradient id="open" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c332a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1c332a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="click" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f9c7f" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f9c7f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="open" stroke="#1c332a" fill="url(#open)" strokeWidth={3} />
                <Area type="monotone" dataKey="click" stroke="#4f9c7f" fill="url(#click)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Répartition par canal</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CHANNEL_SHARE} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4} label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
