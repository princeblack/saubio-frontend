'use client';

import { SurfaceCard } from '@saubio/ui';

const SCENARIOS = [
  { name: 'Simuler booking + matching', description: 'Crée un booking sandbox, lance smart match et attribut un prestataire fictif.' },
  { name: 'Simuler paiement Mollie', description: 'Paiement réussi / échoué, ID transaction mock.' },
  { name: 'Simuler absence prestataire', description: 'Force un événement de no-show + litige.' },
];

export default function AdminDevToolsSandboxPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Sandbox testing</h1>
        <p className="text-sm text-saubio-slate/70">Simulez des workflows end-to-end en environnement de test.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {SCENARIOS.map((scenario) => (
          <SurfaceCard key={scenario.name} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 shadow-soft-lg">
            <p className="text-sm font-semibold text-saubio-forest">{scenario.name}</p>
            <p className="text-xs text-saubio-slate/60">{scenario.description}</p>
            <button className="mt-3 rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest">Exécuter</button>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
