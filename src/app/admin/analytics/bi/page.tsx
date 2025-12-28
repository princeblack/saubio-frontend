'use client';

import { SurfaceCard } from '@saubio/ui';

const INTEGRATIONS = [
  { name: 'Looker Studio', status: 'Connecté', datasets: 'Bookings, Finance', lastSync: '15 janv. · 07:00' },
  { name: 'Metabase', status: 'Connecté', datasets: 'Smart Match', lastSync: '15 janv. · 06:30' },
  { name: 'PowerBI', status: 'En attente', datasets: 'Prestataires', lastSync: '—' },
];

export default function AdminAnalyticsBIPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">BI avancée & exports</h1>
        <p className="text-sm text-saubio-slate/70">Exports CSV/Excel, API dataframe, intégrations Looker, Metabase, PowerBI, Superset.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Intégrations BI</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouvelle connexion</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Outil</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Datasets</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière synchro</th>
              </tr>
            </thead>
            <tbody>
              {INTEGRATIONS.map((integration) => (
                <tr key={integration.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{integration.name}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${integration.status === 'Connecté' ? 'text-emerald-900' : 'text-rose-900'}`}>{integration.status}</td>
                  <td className="px-3 py-2">{integration.datasets}</td>
                  <td className="px-3 py-2">{integration.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Exports</p>
        <div className="grid gap-4 md:grid-cols-3">
          {['Bookings CSV', 'Finance Excel', 'API DataFrame'].map((exportType) => (
            <div key={exportType} className="rounded-2xl bg-saubio-slate/5 p-4">
              <p className="font-semibold text-saubio-forest">{exportType}</p>
              <p className="text-xs text-saubio-slate/60">Filtrez par période, zone, service.</p>
              <button className="mt-3 rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest">Exporter</button>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
