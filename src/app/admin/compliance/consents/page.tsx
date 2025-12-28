'use client';

import { SurfaceCard } from '@saubio/ui';

const CONSENTS = [
  { user: 'Client · Alice M.', marketing: 'Opt-in', cookies: 'Accepté', firstConsent: '15 janv. 2025', lastUpdate: '15 janv.' },
  { user: 'Prestataire · Eco Berlin', marketing: 'Opt-out', cookies: 'Techniques only', firstConsent: '10 nov. 2024', lastUpdate: '12 janv.' },
  { user: 'Client · Bio Market', marketing: 'Opt-in', cookies: 'Accepté', firstConsent: '8 déc. 2024', lastUpdate: '13 janv.' },
];

export default function AdminComplianceConsentsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Gestion des consentements</h1>
        <p className="text-sm text-saubio-slate/70">Cookies, marketing email, analytics, CGU. Export pour la CNIL.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between text-xs text-saubio-slate/70">
          <input placeholder="Rechercher utilisateur" className="rounded-full border border-saubio-forest/20 px-3 py-1 outline-none" />
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest">Exporter CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Marketing</th>
                <th className="px-3 py-2 text-left font-semibold">Cookies</th>
                <th className="px-3 py-2 text-left font-semibold">Consentement initial</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière MAJ</th>
              </tr>
            </thead>
            <tbody>
              {CONSENTS.map((consent) => (
                <tr key={consent.user} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{consent.user}</td>
                  <td className="px-3 py-2">{consent.marketing}</td>
                  <td className="px-3 py-2">{consent.cookies}</td>
                  <td className="px-3 py-2">{consent.firstConsent}</td>
                  <td className="px-3 py-2">{consent.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
