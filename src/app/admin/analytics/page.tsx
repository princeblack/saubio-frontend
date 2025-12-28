'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard } from '@saubio/ui';
import { LineChart as LineChartIcon, Target, Users, DollarSign } from 'lucide-react';

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

const KPI = [
  { label: 'Réservations (30 j)', value: '7 420', caption: '+12 % vs mois -1', icon: LineChartIcon, tone: 'bg-saubio-sun/50 text-saubio-forest' },
  { label: 'Revenus générés', value: '€ 612 000', caption: 'Panier moyen €82', icon: DollarSign, tone: 'bg-emerald-100 text-emerald-900' },
  { label: 'Nouveaux prestataires', value: '184', caption: '+23 premium', icon: Users, tone: 'bg-sky-100 text-sky-900' },
  { label: 'Conversion visiteurs → booking', value: '3,8 %', caption: '-0,3 pt vs S-1', icon: Target, tone: 'bg-rose-100 text-rose-900' },
];

const BOOKINGS_TREND = [
  { label: 'S1', bookings: 1200, cancellations: 80 },
  { label: 'S2', bookings: 1450, cancellations: 90 },
  { label: 'S3', bookings: 1500, cancellations: 110 },
  { label: 'S4', bookings: 1700, cancellations: 130 },
];

const ACCEPTANCE_DATA = [
  { segment: 'Smart match', value: 72 },
  { segment: 'Matching manuel', value: 61 },
  { segment: 'Offres directes', value: 82 },
];

export default function AdminAnalyticsOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Tableau analytique global</h1>
        <p className="text-sm text-saubio-slate/70">Réservations, revenus, conversion, nouveaux clients / prestataires… appliquez filtres avancés.</p>
      </header>

      <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
        <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
          <option>Période : 30 derniers jours</option>
          <option>7 jours</option>
          <option>90 jours</option>
        </select>
        <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
          <option>Zone : Global</option>
          <option>Berlin</option>
          <option>Hambourg</option>
        </select>
        <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
          <option>Service : Tous</option>
          <option>Résidentiel</option>
          <option>Bureaux</option>
        </select>
        <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
          <option>Matching : Tous</option>
          <option>Smart</option>
          <option>Manuel</option>
        </select>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Réservations vs annulations (4 dernières semaines)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BOOKINGS_TREND}>
                <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#1c332a" strokeWidth={3} dot={{ r: 4, fill: '#f5c94c' }} />
                <Line type="monotone" dataKey="cancellations" stroke="#f87171" strokeWidth={2} dot={{ r: 4, fill: '#1c332a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Taux d’acceptation prestataires</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ACCEPTANCE_DATA}>
                <XAxis dataKey="segment" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f9c7f" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
