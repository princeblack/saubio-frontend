'use client';

import { SurfaceCard } from '@saubio/ui';

const CONSENTS = [
  { user: 'Client · Alice M.', email: 'Opt-in marketing', sms: 'Opt-out', legal: 'Accepté', updated: '15 janv.' },
  { user: 'Client · Bio Market', email: 'Opt-in marketing', sms: 'Opt-in', legal: 'Accepté', updated: '14 janv.' },
  { user: 'Prestataire · Eco Berlin', email: 'Notifications obligatoires', sms: 'Opt-in', legal: 'Accepté', updated: '14 janv.' },
];

export default function AdminAutomationConsentsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Consentements & opt-in</h1>
        <p className="text-sm text-saubio-slate/70">Tracez les préférences email / SMS / push et distinctions légales vs marketing.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Préférences utilisateurs</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Exporter CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Email marketing</th>
                <th className="px-3 py-2 text-left font-semibold">SMS commercial</th>
                <th className="px-3 py-2 text-left font-semibold">Notifications légales</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière MAJ</th>
              </tr>
            </thead>
            <tbody>
              {CONSENTS.map((row) => (
                <tr key={row.user} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{row.user}</td>
                  <td className="px-3 py-2">{row.email}</td>
                  <td className="px-3 py-2">{row.sms}</td>
                  <td className="px-3 py-2">{row.legal}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
