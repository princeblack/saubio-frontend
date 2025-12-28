'use client';

import { SurfaceCard } from '@saubio/ui';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });

const KPI = [
  { label: 'Prestataires validés', value: '842', caption: '92 % de la base active' },
  { label: 'En attente', value: '78', caption: 'dont 24 critiques' },
  { label: 'Documents expirés', value: '16', caption: 'Rappels envoyés' },
  { label: 'Refusés', value: '9', caption: 'Re-upload demandé' },
];

const DOC_STATUS = [
  { type: 'ID', valid: 780, pending: 40, expired: 10 },
  { type: 'Assurance', valid: 650, pending: 120, expired: 30 },
  { type: 'IBAN', valid: 820, pending: 15, expired: 0 },
];

const PENDING = [
  { provider: 'Eco Berlin', doc: 'Assurance RC Pro', submitted: '14 janv.', status: 'En revue', assigned: 'Nina' },
  { provider: 'FastClean', doc: 'ID - Passeport', submitted: '13 janv.', status: 'Critique', assigned: 'Marc' },
  { provider: 'CleanWave', doc: 'IBAN société', submitted: '12 janv.', status: 'En revue', assigned: 'Sophie' },
];

export default function AdminDocumentsOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Compliance prestataires</h1>
        <p className="text-sm text-saubio-slate/70">Supervisez l’état des pièces d’identité, assurances, IBAN et documents sociétés.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((card) => (
          <SurfaceCard key={card.label} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
            <p className="text-xs text-saubio-slate/60">{card.caption}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-4 text-sm font-semibold text-saubio-forest">Statut par type de document</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DOC_STATUS}>
              <XAxis dataKey="type" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="valid" stackId="a" fill="#1c332a" radius={[10, 10, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="#f5c94c" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expired" stackId="a" fill="#f87171" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Dossiers en attente</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Voir checklist</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Document</th>
                <th className="px-3 py-2 text-left font-semibold">Soumis le</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Assigné</th>
              </tr>
            </thead>
            <tbody>
              {PENDING.map((row) => (
                <tr key={row.provider} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{row.provider}</td>
                  <td className="px-3 py-2">{row.doc}</td>
                  <td className="px-3 py-2">{row.submitted}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.assigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
