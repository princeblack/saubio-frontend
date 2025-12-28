'use client';

import { SurfaceCard } from '@saubio/ui';

const KPI = [
  { label: 'Demandes RGPD ouvertes', value: '3', caption: 'Accès / effacement / portabilité' },
  { label: 'Consentements marketing actifs', value: '4 280', caption: 'Clients opt-in' },
  { label: 'Alertes sécurité', value: '1', caption: 'Login suspect détecté' },
  { label: 'Documents juridiques', value: '8', caption: 'Dernière mise à jour 15 janv.' },
];

const REQUESTS = [
  { id: 'RGPD-1201', user: 'Client · Alice M.', type: 'Droit d’accès', status: 'En cours', deadline: '20 janv.' },
  { id: 'RGPD-1202', user: 'Prestataire · Eco Berlin', type: 'Suppression', status: 'Reçu', deadline: '25 janv.' },
  { id: 'RGPD-1203', user: 'Client · Bio Market', type: 'Portabilité', status: 'Terminé', deadline: '12 janv.' },
];

export default function AdminComplianceOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">RGPD · Sécurité · Paiements</h1>
        <p className="text-sm text-saubio-slate/70">Suivez consentements, demandes utilisateurs, alertes sécurité et versions légales.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((card) => (
          <SurfaceCard key={card.label} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
            <p className="text-xs text-saubio-slate/60">{card.caption}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Demandes RGPD en cours</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouvelle demande</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">ID</th>
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
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
                  <td className="px-3 py-2">{request.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
