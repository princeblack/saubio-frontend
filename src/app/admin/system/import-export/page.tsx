'use client';

import { SurfaceCard } from '@saubio/ui';

const IMPORT_TASKS = [
  { name: 'Import utilisateurs B2B', format: 'CSV', status: 'Terminé', processed: '312 lignes', createdAt: '15 janv. · 08:05' },
  { name: 'Import zones Berlin', format: 'JSON', status: 'En cours', processed: '45 / 120', createdAt: '15 janv. · 07:50' },
];

const EXPORT_TYPES = [
  { label: 'Export bookings', description: 'CSV ou JSON · Plage de dates', action: 'Exporter' },
  { label: 'Export paiements', description: 'CSV · Comptabilité / QuickBooks', action: 'Exporter' },
  { label: 'Export prestataires', description: 'CSV · Infos onboarding & KYC', action: 'Exporter' },
];

export default function AdminSystemImportExportPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Import / export</h1>
        <p className="text-sm text-saubio-slate/70">Importez des données (utilisateurs, zones, tarifs) et exportez bookings, paiements, etc.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-4 text-sm font-semibold text-saubio-forest">Imports récents</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Format</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Lignes traitées</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {IMPORT_TASKS.map((task) => (
                <tr key={task.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{task.name}</td>
                  <td className="px-3 py-2">{task.format}</td>
                  <td className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">{task.status}</td>
                  <td className="px-3 py-2">{task.processed}</td>
                  <td className="px-3 py-2">{task.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="mt-4 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouvel import CSV / JSON</button>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-3">
        {EXPORT_TYPES.map((exportType) => (
          <SurfaceCard key={exportType.label} className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 shadow-soft-lg">
            <p className="text-sm font-semibold text-saubio-forest">{exportType.label}</p>
            <p className="text-xs text-saubio-slate/60">{exportType.description}</p>
            <button className="rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest">{exportType.action}</button>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
