'use client';

import { SurfaceCard } from '@saubio/ui';

const AUTOMATIONS = [
  { name: 'Suppression compte', trigger: 'RGPD - Droit à l’effacement', action: 'Anonymiser données + stopper payouts', status: 'Activé' },
  { name: 'Expiration document', trigger: 'Document < 30 j', action: 'Alerte prestataire + blocage missions', status: 'Activé' },
  { name: 'Rapport mensuel compliance', trigger: '1er du mois', action: 'Export PDF + envoi à Legal', status: 'Activé' },
];

export default function AdminComplianceAutomationPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Automatisation & rappels</h1>
        <p className="text-sm text-saubio-slate/70">Suppression, anonymisation, alertes sécurité, rapports automatiques.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Règles automatiques</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouvelle règle</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Déclencheur</th>
                <th className="px-3 py-2 text-left font-semibold">Action</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {AUTOMATIONS.map((automation) => (
                <tr key={automation.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{automation.name}</td>
                  <td className="px-3 py-2">{automation.trigger}</td>
                  <td className="px-3 py-2">{automation.action}</td>
                  <td className="px-3 py-2">{automation.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
