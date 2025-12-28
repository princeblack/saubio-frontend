'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard } from '@saubio/ui';
import { Server, CloudLightning, Shield, PlugZap } from 'lucide-react';

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
  { label: 'Intégrations actives', value: '12', caption: 'Mollie, Twilio, CRM, CDN…', icon: PlugZap, tone: 'bg-saubio-sun/50 text-saubio-forest' },
  { label: 'Disponibilité backend', value: '99,95 %', caption: '30 derniers jours', icon: Server, tone: 'bg-emerald-100 text-emerald-900' },
  { label: 'Incidents en cours', value: '1', caption: 'File matching dégradée', icon: CloudLightning, tone: 'bg-rose-100 text-rose-900' },
  { label: 'Alertes sécurité', value: '0 critique', caption: 'Dernière semaine', icon: Shield, tone: 'bg-sky-100 text-sky-900' },
];

const HEALTH_TREND = [
  { label: 'Lun', uptime: 99.9 },
  { label: 'Mar', uptime: 99.95 },
  { label: 'Mer', uptime: 99.93 },
  { label: 'Jeu', uptime: 99.96 },
  { label: 'Ven', uptime: 99.98 },
  { label: 'Sam', uptime: 99.90 },
  { label: 'Dim', uptime: 99.97 },
];

const ERROR_LOGS = [
  { service: 'Matching Worker', errors: 18 },
  { service: 'Webhook Runner', errors: 6 },
  { service: 'API GraphQL', errors: 4 },
  { service: 'Notifications', errors: 3 },
];

const INTEGRATIONS = [
  { name: 'Mollie', status: 'Connecté', version: 'v2.4', env: 'Production' },
  { name: 'Twilio SMS', status: 'Connecté', version: 'v1.9', env: 'Production' },
  { name: 'CRM Hubspot', status: 'Erreur API', version: 'v3.1', env: 'Staging' },
];

export default function AdminSystemOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Pilotage technique</h1>
        <p className="text-sm text-saubio-slate/70">Suivez les intégrations externes, la santé des environnements, les clés API et la sécurité.</p>
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
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Uptime backend (7 derniers jours)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HEALTH_TREND}>
                <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis domain={[99.8, 100]} tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="uptime" stroke="#1c332a" strokeWidth={3} dot={{ r: 4, fill: '#f5c94c' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Erreurs par microservice (24h)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ERROR_LOGS}>
                <XAxis dataKey="service" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="errors" fill="#f87171" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Integrations critiques</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Ajouter une intégration</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Version</th>
                <th className="px-3 py-2 text-left font-semibold">Environnement</th>
              </tr>
            </thead>
            <tbody>
              {INTEGRATIONS.map((integration) => (
                <tr key={integration.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{integration.name}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${integration.status === 'Connecté' ? 'text-emerald-900' : 'text-rose-900'}`}>{integration.status}</td>
                  <td className="px-3 py-2">{integration.version}</td>
                  <td className="px-3 py-2">{integration.env}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
