'use client';

import { SurfaceCard, Skeleton } from '@saubio/ui';
import { BadgeCheck, Shield } from 'lucide-react';
import { useAdminSmartMatchingPolicies } from '@saubio/utils';

export default function AdminMatchingPoliciesPage() {
  const policiesQuery = useAdminSmartMatchingPolicies();
  const policies = policiesQuery.data?.policies ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Smart Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Politiques business</h1>
        <p className="text-sm text-saubio-slate/70">
          Priorités concrètes appliquées sur le terrain (entreprises partenaires, missions Öko, limitations freelances week-end).
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-saubio-forest">
          <Shield className="h-4 w-4 text-saubio-slate/60" />
          Résultats observés
        </div>
        {policiesQuery.isLoading && (
          <ul className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={`policy-skeleton-${index}`} className="rounded-2xl border border-saubio-forest/10 p-3">
                <Skeleton className="h-5 w-1/3 rounded-2xl" />
                <Skeleton className="mt-2 h-4 w-2/3 rounded-2xl" />
                <Skeleton className="mt-4 h-8 w-full rounded-2xl" />
              </li>
            ))}
          </ul>
        )}
        {!policiesQuery.isLoading && !policies.length && (
          <p className="text-sm text-saubio-slate/60">Aucune donnée disponible sur la période choisie.</p>
        )}
        {!policiesQuery.isLoading && !!policies.length && (
          <ul className="space-y-3 text-sm text-saubio-slate/80">
            {policies.map((policy) => (
              <li key={policy.id} className="rounded-2xl border border-saubio-forest/10 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-saubio-forest">{policy.name}</p>
                    <p className="text-xs text-saubio-slate/60">{policy.description}</p>
                    <p className="text-xs text-saubio-slate/50">
                      Scope : {policy.scope} • Type : {policy.type === 'limit' ? 'Limite' : 'Priorité'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                      policy.enabled ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <BadgeCheck className="h-3 w-3" />
                    {policy.enabled ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
                  <div className="rounded-2xl bg-saubio-mist/70 px-3 py-2">
                    Volume impacté{' '}
                    <span className="font-semibold text-saubio-forest">{policy.stats.impactedBookings}</span>
                  </div>
                  <div className="rounded-2xl bg-saubio-mist/70 px-3 py-2">
                    Respect{' '}
                    <span className="font-semibold text-saubio-forest">
                      {policy.stats.complianceRate !== undefined && policy.stats.complianceRate !== null
                        ? `${(policy.stats.complianceRate * 100).toFixed(1)} %`
                        : '—'}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-saubio-mist/70 px-3 py-2">
                    Breaches <span className="font-semibold text-saubio-forest">{policy.stats.breaches ?? 0}</span>
                  </div>
                </div>
                {!!policy.highlights.length && (
                  <p className="mt-3 text-xs text-saubio-slate/60">→ {policy.highlights.join(' • ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
