'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard } from '@saubio/ui';
import { Bell, Smartphone, Mail, AlertTriangle } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => ({ default: mod.Line })), { ssr: false });

const KPI = [
  { label: 'Notifications envoyées (24h)', value: '12 450', caption: 'Push + Email + SMS', icon: Bell, tone: 'bg-saubio-sun/50 text-saubio-forest' },
  { label: 'Taux d’ouverture push', value: '48 %', caption: '+6 pts vs semaine -1', icon: Smartphone, tone: 'bg-sky-100 text-sky-900' },
  { label: 'Emails transactionnels', value: '3 850', caption: '98 % livrés', icon: Mail, tone: 'bg-emerald-100 text-emerald-900' },
  { label: 'Notifications en échec', value: '56', caption: 'dont 8 critiques', icon: AlertTriangle, tone: 'bg-rose-100 text-rose-900' },
];

const VOLUME_BY_CHANNEL = [
  { channel: 'Push', value: 7200 },
  { channel: 'Email', value: 4850 },
  { channel: 'SMS', value: 400 },
];

const OPEN_RATE_TREND = [
  { label: 'Lun', push: 42, email: 31 },
  { label: 'Mar', push: 44, email: 33 },
  { label: 'Mer', push: 45, email: 34 },
  { label: 'Jeu', push: 47, email: 33 },
  { label: 'Ven', push: 48, email: 35 },
  { label: 'Sam', push: 52, email: 38 },
  { label: 'Dim', push: 50, email: 36 },
];

const RECENT_NOTIFICATIONS = [
  { id: 'NTF-5021', user: 'Client · Alice M.', event: 'booking.confirmed', channel: 'Email', status: 'Sent', timestamp: '15 janv. · 10:20' },
  { id: 'NTF-5022', user: 'Prestataire · Eco Berlin', event: 'matching.assign', channel: 'Push', status: 'Read', timestamp: '15 janv. · 10:18' },
  { id: 'NTF-5023', user: 'Client · Bio Market', event: 'invoice.generated', channel: 'Email', status: 'Failed', timestamp: '15 janv. · 09:55' },
];

export default function AdminAutomationOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Pilotage des événements</h1>
        <p className="text-sm text-saubio-slate/70">Unifiez push, emails, SMS, webhooks et workflows déclenchés par les événements Saubio.</p>
      </header>

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
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Volume par canal (24h)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VOLUME_BY_CHANNEL}>
                <XAxis dataKey="channel" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f9c7f" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Taux d’ouverture</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={OPEN_RATE_TREND}>
                <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="push" stroke="#1c332a" strokeWidth={3} dot={{ r: 4, fill: '#f5c94c' }} />
                <Line type="monotone" dataKey="email" stroke="#4f9c7f" strokeWidth={3} dot={{ r: 4, fill: '#1c332a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Dernières notifications</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Centre complet</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Notification</th>
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Événement</th>
                <th className="px-3 py-2 text-left font-semibold">Canal</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_NOTIFICATIONS.map((notif) => (
                <tr key={notif.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{notif.id}</td>
                  <td className="px-3 py-2">{notif.user}</td>
                  <td className="px-3 py-2">{notif.event}</td>
                  <td className="px-3 py-2">{notif.channel}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${notif.status === 'Failed' ? 'text-rose-900' : 'text-emerald-900'}`}>{notif.status}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{notif.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
