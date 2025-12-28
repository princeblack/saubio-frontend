'use client';

import { SurfaceCard } from '@saubio/ui';

const TEMPLATES = [
  { name: 'Confirmation réservation', type: 'Transactionnel', status: 'Publié', lastEdit: '15 janv.' },
  { name: 'Relance facture', type: 'Marketing', status: 'Publié', lastEdit: '14 janv.' },
  { name: 'Smart Match – notification', type: 'Prestataire', status: 'Brouillon', lastEdit: '13 janv.' },
];

export default function AdminCmsEmailPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Templates email</h1>
        <p className="text-sm text-saubio-slate/70">Éditez les emails transactionnels, marketing et prestataires avec variables dynamiques.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xs text-saubio-slate/70">Variables : {'{{firstname}}'}, {'{{booking.date}}'}, {'{{booking.address}}'}, {'{{provider.name}}'}…</div>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouveau template</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière MAJ</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {TEMPLATES.map((template) => (
                <tr key={template.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{template.name}</td>
                  <td className="px-3 py-2">{template.type}</td>
                  <td className="px-3 py-2">{template.status}</td>
                  <td className="px-3 py-2">{template.lastEdit}</td>
                  <td className="px-3 py-2 text-saubio-forest underline">Éditer</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
