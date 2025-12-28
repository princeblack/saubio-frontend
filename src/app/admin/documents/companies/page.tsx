'use client';

import { SurfaceCard } from '@saubio/ui';

const COMPANIES = [
  { name: 'Sauber GmbH', kb: 'Validé', vat: 'DE123456', insurance: 'À renouveler', address: 'Alexanderplatz 1, Berlin' },
  { name: 'PureFacility AG', kb: 'En attente', vat: 'DE998877', insurance: 'Validé', address: 'Speicherstadt, Hambourg' },
];

export default function AdminDocumentsCompaniesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Entreprises prestataires</h1>
        <p className="text-sm text-saubio-slate/70">Registres du commerce, VAT, assurances, RIB entreprise.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Documents société</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Ajouter dossier</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Entreprise</th>
                <th className="px-3 py-2 text-left font-semibold">KBIS / Handelsregister</th>
                <th className="px-3 py-2 text-left font-semibold">VAT ID</th>
                <th className="px-3 py-2 text-left font-semibold">Assurance</th>
                <th className="px-3 py-2 text-left font-semibold">Adresse siège</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {COMPANIES.map((company) => (
                <tr key={company.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{company.name}</td>
                  <td className="px-3 py-2">{company.kb}</td>
                  <td className="px-3 py-2">{company.vat}</td>
                  <td className="px-3 py-2">{company.insurance}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{company.address}</td>
                  <td className="px-3 py-2 text-saubio-forest underline">Valider</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
