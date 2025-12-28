'use client';

import { SurfaceCard } from '@saubio/ui';

const FLAGS = [
  { name: 'matching_v2', description: 'Nouveau moteur Smart Match + scoring éco', status: 'Activé', owner: 'Tech' },
  { name: 'provider_calendar', description: 'Planning prestataire en beta', status: 'Activé (beta)', owner: 'Product' },
  { name: 'payments_provider', description: 'Nouveau flow activation payouts', status: 'Désactivé', owner: 'Tech' },
];

export default function AdminDevToolsFlagsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Feature flags</h1>
        <p className="text-sm text-saubio-slate/70">Activez / désactivez les fonctionnalités expérimentales par rôle ou zone.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Flags actifs</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Ajouter un flag</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Flag</th>
                <th className="px-3 py-2 text-left font-semibold">Description</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Owner</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {FLAGS.map((flag) => (
                <tr key={flag.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-mono text-xs text-saubio-forest">{flag.name}</td>
                  <td className="px-3 py-2">{flag.description}</td>
                  <td className="px-3 py-2">{flag.status}</td>
                  <td className="px-3 py-2">{flag.owner}</td>
                  <td className="px-3 py-2 text-saubio-forest underline">Modifier</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
