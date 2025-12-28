'use client';

import { SurfaceCard } from '@saubio/ui';

const REFERRALS = [
  {
    referrer: 'Alice Martin',
    code: 'ALICE20',
    referred: ['Paul S.', 'Nina V.'],
    status: '2 réservations',
    creditReferrer: '20€',
    creditReferred: '20€',
  },
  {
    referrer: 'Bio Market',
    code: 'BIO40',
    referred: ['Eco Loft'],
    status: '1 paiement en attente',
    creditReferrer: '40€',
    creditReferred: '40€',
  },
];

export default function AdminMarketingReferralsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Marketing & codes promo</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Parrainage & crédit</h1>
        <p className="text-sm text-saubio-slate/70">Configurez les montants “parrain/filleul”, suivez les invitations et leurs conversions.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Parrain</th>
                <th className="px-3 py-2 text-left font-semibold">Code</th>
                <th className="px-3 py-2 text-left font-semibold">Filleuls</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Crédit parrain</th>
                <th className="px-3 py-2 text-left font-semibold">Crédit filleul</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {REFERRALS.map((entry) => (
                <tr key={entry.code} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{entry.referrer}</td>
                  <td className="px-3 py-2">{entry.code}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{entry.referred.join(', ')}</td>
                  <td className="px-3 py-2">{entry.status}</td>
                  <td className="px-3 py-2">{entry.creditReferrer}</td>
                  <td className="px-3 py-2">{entry.creditReferred}</td>
                  <td className="px-3 py-2 text-right text-saubio-forest underline">Détails</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
