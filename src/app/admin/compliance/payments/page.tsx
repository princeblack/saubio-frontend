'use client';

import { SurfaceCard } from '@saubio/ui';

const CHECKS = [
  { item: 'PSD2 / Strong Customer Authentication', status: 'Couvert par Mollie', notes: '3DS activé' },
  { item: 'AML / KYC', status: 'Documents prestataires', notes: 'Exigé avant payouts' },
  { item: 'Payout traceabilité', status: 'Ok', notes: 'Mandats SEPA, logs conservés 10 ans' },
];

export default function AdminCompliancePaymentsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Conformité paiement</h1>
        <p className="text-sm text-saubio-slate/70">PSD2, AML, KYC, suivi payouts : vérifiez vos contrôles.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <table className="min-w-full text-sm text-saubio-slate/80">
          <thead>
            <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
              <th className="px-3 py-2 text-left font-semibold">Contrôle</th>
              <th className="px-3 py-2 text-left font-semibold">Statut</th>
              <th className="px-3 py-2 text-left font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {CHECKS.map((check) => (
              <tr key={check.item} className="border-b border-saubio-forest/5 last-border-none">
                <td className="px-3 py-2 font-semibold text-saubio-forest">{check.item}</td>
                <td className="px-3 py-2">{check.status}</td>
                <td className="px-3 py-2">{check.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SurfaceCard>
    </div>
  );
}
