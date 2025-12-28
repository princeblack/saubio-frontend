'use client';

import { SurfaceCard } from '@saubio/ui';

const INTEGRATIONS = [
  {
    name: 'Mollie Payments',
    category: 'Paiement',
    status: 'Connecté',
    keys: 'Live + Test',
    logs: '0 erreurs / 24h',
    lastCheck: '15 janv. · 07:45',
  },
  {
    name: 'Twilio SMS',
    category: 'Communication',
    status: 'Connecté',
    keys: 'Live',
    logs: '1 erreur / 24h',
    lastCheck: '15 janv. · 07:40',
  },
  {
    name: 'Firebase Push',
    category: 'Communication',
    status: 'Connecté',
    keys: 'Live + Test',
    logs: 'Ok',
    lastCheck: '15 janv. · 07:35',
  },
  {
    name: 'CDN (Cloudflare)',
    category: 'Stockage',
    status: 'Connecté',
    keys: 'API token',
    logs: 'Ok',
    lastCheck: '15 janv. · 07:32',
  },
  {
    name: 'OpenStreetMap',
    category: 'Maps',
    status: 'Connecté',
    keys: 'clé service',
    logs: '0 erreurs',
    lastCheck: '15 janv. · 07:30',
  },
  {
    name: 'CRM Hubspot',
    category: 'Services internes',
    status: 'Erreur API',
    keys: 'Live',
    logs: 'Timeout lors sync contacts',
    lastCheck: '15 janv. · 07:20',
  },
];

const statusTone: Record<string, string> = {
  Connecté: 'text-emerald-900',
  'Erreur API': 'text-rose-900',
};

export default function AdminSystemIntegrationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Intégrations externes</h1>
        <p className="text-sm text-saubio-slate/70">Ajoutez vos clés API, activez/désactivez des services, et consultez les logs de connexion.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Connecteurs configurés</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Ajouter une intégration</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Catégorie</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Clés / Mode</th>
                <th className="px-3 py-2 text-left font-semibold">Logs récents</th>
                <th className="px-3 py-2 text-left font-semibold">Dernier test</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {INTEGRATIONS.map((integration) => (
                <tr key={integration.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{integration.name}</td>
                  <td className="px-3 py-2">{integration.category}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${statusTone[integration.status] ?? 'text-saubio-forest'}`}>{integration.status}</td>
                  <td className="px-3 py-2">{integration.keys}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{integration.logs}</td>
                  <td className="px-3 py-2">{integration.lastCheck}</td>
                  <td className="px-3 py-2 text-xs text-saubio-forest underline">Tester · Configurer</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
