'use client';

import { SurfaceCard } from '@saubio/ui';

const REQUESTS = [
  { id: 'RGPD-1301', user: 'Client · Alice M.', type: 'Accès', status: 'En cours', received: '14 janv.', due: '21 janv.' },
  { id: 'RGPD-1302', user: 'Prestataire · Eco Berlin', type: 'Suppression', status: 'Reçu', received: '15 janv.', due: '30 janv.' },
  { id: 'RGPD-1298', user: 'Client · Bio Market', type: 'Portabilité', status: 'Terminé', received: '10 janv.', due: '17 janv.' },
];

export default function AdminComplianceRequestsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Demandes RGPD</h1>
        <p className="text-sm text-saubio-slate/70">Accès, rectification, effacement, portabilité, retrait consentement.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between text-xs text-saubio-slate/70">
          <input placeholder="ID utilisateur / demande" className="rounded-full border border-saubio-forest/20 px-3 py-1 outline-none" />
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest">Créer une demande</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">ID</th>
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Reçue</th>
                <th className="px-3 py-2 text-left font-semibold">Échéance</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map((request) => (
                <tr key={request.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{request.id}</td>
                  <td className="px-3 py-2">{request.user}</td>
                  <td className="px-3 py-2">{request.type}</td>
                  <td className="px-3 py-2">{request.status}</td>
                  <td className="px-3 py-2">{request.received}</td>
                  <td className="px-3 py-2">{request.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
