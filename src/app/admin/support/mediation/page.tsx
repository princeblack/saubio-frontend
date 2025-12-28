'use client';

import { SurfaceCard } from '@saubio/ui';

const MEDIATIONS = [
  {
    id: 'MED-701',
    booking: 'BK-2050',
    type: 'Dommage matériel',
    severity: 'Fort',
    manager: 'Sophie',
    status: 'En cours validation',
    actions: ['Demande devis réparation', 'Collecte photos client'],
  },
  {
    id: 'MED-702',
    booking: 'BK-2055',
    type: 'Mission non conforme',
    severity: 'Moyen',
    manager: 'Alex',
    status: 'Résolu',
    actions: ['Avertissement prestataire', 'Remboursement 30 %'],
  },
  {
    id: 'MED-703',
    booking: 'BK-2056',
    type: 'Absence prestataire',
    severity: 'Fort',
    manager: 'Lena',
    status: 'Escaladé manager',
    actions: ['Suspension 48h', 'Relance client + offre commerciale'],
  },
];

export default function AdminSupportMediationPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Médiation & résolution</h1>
        <p className="text-sm text-saubio-slate/70">Suivez les dossiers complexes, pièces justificatives, validations managers et scoring litiges.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Dossiers en médiation</p>
            <p className="text-xs text-saubio-slate/60">Ajoutez commentaires internes, pièces jointes et décisions finales.</p>
          </div>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Ouvrir une médiation</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">ID</th>
                <th className="px-3 py-2 text-left font-semibold">Booking</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Gravité</th>
                <th className="px-3 py-2 text-left font-semibold">Manager</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MEDIATIONS.map((caseItem) => (
                <tr key={caseItem.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{caseItem.id}</td>
                  <td className="px-3 py-2 text-saubio-forest underline">{caseItem.booking}</td>
                  <td className="px-3 py-2">{caseItem.type}</td>
                  <td className="px-3 py-2">{caseItem.severity}</td>
                  <td className="px-3 py-2">{caseItem.manager}</td>
                  <td className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-sky-900">{caseItem.status}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{caseItem.actions.join(' • ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
