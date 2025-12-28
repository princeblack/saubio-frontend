'use client';

import { SurfaceCard } from '@saubio/ui';

const INTEGRATIONS = [
  { name: 'Mollie', status: 'OK', notes: 'Token Live', actions: 'Tester paiement' },
  { name: 'Twilio', status: 'OK', notes: 'SMS sandbox', actions: 'Envoyer SMS' },
  { name: 'Firebase Push', status: 'Error', notes: 'Key expirée', actions: 'Régénérer clé' },
  { name: 'Mapbox', status: 'Maintenance', notes: 'Quota 80%', actions: 'Forcer refresh' },
];

export default function AdminDevToolsIntegrationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Intégrations techniques</h1>
        <p className="text-sm text-saubio-slate/70">Testez connecteurs, régénérez clés API, forcez un refresh.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Connecteurs</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Ajouter intégration</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Notes</th>
                <th className="px-3 py-2 text-left font-semibold">Actions rapides</th>
              </tr>
            </thead>
            <tbody>
              {INTEGRATIONS.map((integration) => (
                <tr key={integration.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{integration.name}</td>
                  <td className="px-3 py-2">{integration.status}</td>
                  <td className="px-3 py-2">{integration.notes}</td>
                  <td className="px-3 py-2 text-saubio-forest underline">{integration.actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
