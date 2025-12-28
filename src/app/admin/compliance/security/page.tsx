'use client';

import { SurfaceCard } from '@saubio/ui';

const SECURITY_EVENTS = [
  { type: 'Login suspect', detail: 'Admin · IP 185.6.* · MFA non confirmé', status: 'Enquête', time: '15 janv. 09:40' },
  { type: 'Mot de passe faible', detail: 'Employé - réinitialisation forcée', status: 'Résolu', time: '14 janv. 11:18' },
  { type: 'Tentative API', detail: 'Rate limit exceeded provider app', status: 'Bloqué', time: '14 janv. 10:03' },
];

export default function AdminComplianceSecurityPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Sécurité technique</h1>
        <p className="text-sm text-saubio-slate/70">MFA, sessions, RBAC, chiffrement, audits. Surveillez les alertes.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Alertes sécurité</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Détail</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Heure</th>
              </tr>
            </thead>
            <tbody>
              {SECURITY_EVENTS.map((event) => (
                <tr key={event.detail} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{event.type}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/70">{event.detail}</td>
                  <td className="px-3 py-2">{event.status}</td>
                  <td className="px-3 py-2">{event.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
