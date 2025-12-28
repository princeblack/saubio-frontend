'use client';

import { SurfaceCard } from '@saubio/ui';

const POLICIES = [
  { name: 'Politique confidentialité', version: 'v3.2', published: '15 janv. 2025', editor: 'Legal', status: 'Publié' },
  { name: 'Conditions générales', version: 'v2.9', published: '10 janv. 2025', editor: 'Legal', status: 'Publié' },
  { name: 'Politique cookies', version: 'v1.4', published: '5 janv. 2025', editor: 'Marketing', status: 'Brouillon' },
];

export default function AdminCompliancePoliciesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Politiques & CGU</h1>
        <p className="text-sm text-saubio-slate/70">Versionnez les documents légaux, gérez les diffusions et consentements associés.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Documents publiés</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouvelle version</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Document</th>
                <th className="px-3 py-2 text-left font-semibold">Version</th>
                <th className="px-3 py-2 text-left font-semibold">Publié le</th>
                <th className="px-3 py-2 text-left font-semibold">Éditeur</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {POLICIES.map((policy) => (
                <tr key={policy.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{policy.name}</td>
                  <td className="px-3 py-2">{policy.version}</td>
                  <td className="px-3 py-2">{policy.published}</td>
                  <td className="px-3 py-2">{policy.editor}</td>
                  <td className="px-3 py-2">{policy.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
