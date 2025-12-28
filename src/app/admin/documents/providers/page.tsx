'use client';

import { SurfaceCard } from '@saubio/ui';

const PROVIDERS = [
  { name: 'Eco Berlin', type: 'Indépendant', idStatus: 'Validé', insurance: 'À renouveler', iban: 'Validé', reviewer: 'Nina' },
  { name: 'FastClean', type: 'Entreprise', idStatus: 'En attente', insurance: 'Validé', iban: 'Validé', reviewer: 'Marc' },
  { name: 'CleanWave', type: 'Indépendant', idStatus: 'Refusé', insurance: 'En attente', iban: 'Validé', reviewer: 'Sophie' },
];

export default function AdminDocumentsProvidersPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Prestataires & statuts</h1>
        <p className="text-sm text-saubio-slate/70">Filtrez par validé / en attente / refusé / expiré. Accédez aux prévisualisations.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-saubio-slate/70">
          <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
            <option>Statut : Tous</option>
            <option>Validé</option>
            <option>En attente</option>
            <option>Refusé</option>
            <option>Expiré</option>
          </select>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest">Exporter PDF</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Identité</th>
                <th className="px-3 py-2 text-left font-semibold">Assurance</th>
                <th className="px-3 py-2 text-left font-semibold">IBAN</th>
                <th className="px-3 py-2 text-left font-semibold">Assigné à</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {PROVIDERS.map((provider) => (
                <tr key={provider.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{provider.name}</td>
                  <td className="px-3 py-2">{provider.type}</td>
                  <td className="px-3 py-2">{provider.idStatus}</td>
                  <td className="px-3 py-2">{provider.insurance}</td>
                  <td className="px-3 py-2">{provider.iban}</td>
                  <td className="px-3 py-2">{provider.reviewer}</td>
                  <td className="px-3 py-2 text-saubio-forest underline">Prévisualiser</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
