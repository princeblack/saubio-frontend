'use client';

import { SurfaceCard } from '@saubio/ui';
import { useAdminServicePricingRules } from '@saubio/utils';
import { AlertCircle } from 'lucide-react';

const formatAmount = (amount?: number | null) => {
  if (typeof amount !== 'number') return '—';
  return `${(amount / 100).toFixed(2)} €`;
};

const formatPercentage = (bps?: number | null) => {
  if (typeof bps !== 'number') return '—';
  return `${(bps / 100).toFixed(1)} %`;
};

export default function AdminServiceExtrasPage() {
  const rulesQuery = useAdminServicePricingRules();
  const rules = rulesQuery.data?.rules ?? [];

  const activeRules = rules.filter((rule) => rule.isActive);
  const inactiveRules = rules.filter((rule) => !rule.isActive);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Services & Tarifs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Surcharges & extras</h1>
        <p className="text-sm text-saubio-slate/70">
          Règles métiers appliquées lors du calcul du prix : short notice, supplement eco, coefficients spéciaux…
        </p>
      </header>

      {rulesQuery.isLoading ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-6 shadow-soft-lg">
          <p className="text-sm text-saubio-slate/70">Chargement des règles de pricing…</p>
        </SurfaceCard>
      ) : rulesQuery.isError ? (
        <SurfaceCard className="rounded-3xl border border-rose-200 bg-white/95 p-6 shadow-soft-lg">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">Impossible d’afficher les surcharges.</p>
          </div>
        </SurfaceCard>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-2">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <p className="text-sm font-semibold text-saubio-forest">Règles actives</p>
              <p className="text-3xl font-semibold text-saubio-forest">{activeRules.length}</p>
              <p className="text-xs text-saubio-slate/60">Priorité la plus élevée : {activeRules[0]?.priority ?? '—'}</p>
            </SurfaceCard>
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <p className="text-sm font-semibold text-saubio-forest">Règles désactivées</p>
              <p className="text-3xl font-semibold text-saubio-forest">{inactiveRules.length}</p>
              <p className="text-xs text-saubio-slate/60">Gardées pour audit ou tests</p>
            </SurfaceCard>
          </section>

          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-saubio-forest">Liste des surcharges</p>
              <span className="text-xs text-saubio-slate/60">{rules.length} règles configurées</span>
            </div>
            <div className="overflow-x-auto text-sm text-saubio-slate/80">
              <table className="min-w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                    <th className="px-3 py-2 text-left font-semibold">Code</th>
                    <th className="px-3 py-2 text-left font-semibold">Type</th>
                    <th className="px-3 py-2 text-left font-semibold">Montant</th>
                    <th className="px-3 py-2 text-left font-semibold">Pourcentage</th>
                    <th className="px-3 py-2 text-left font-semibold">Audience</th>
                    <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2">
                        <p className="font-semibold text-saubio-forest">{rule.code}</p>
                        <p className="text-xs text-saubio-slate/60">{rule.description ?? '—'}</p>
                      </td>
                      <td className="px-3 py-2">{rule.type}</td>
                      <td className="px-3 py-2">{formatAmount(rule.amountCents)}</td>
                      <td className="px-3 py-2">{formatPercentage(rule.percentageBps)}</td>
                      <td className="px-3 py-2 text-xs uppercase text-saubio-slate/60">{rule.audience}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            rule.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rule.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
