'use client';

import { SurfaceCard, Skeleton } from '@saubio/ui';
import { useAdminSmartMatchingGuardrails } from '@saubio/utils';

const formatDate = (value: string) =>
  new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function AdminMatchingGuardrailsPage() {
  const guardrailsQuery = useAdminSmartMatchingGuardrails();
  const guardrails = guardrailsQuery.data?.guardrails ?? [];

  const providerRules = guardrails.filter((rule) => rule.target === 'provider');
  const clientRules = guardrails.filter((rule) => rule.target === 'client');

  const renderList = (rules: typeof guardrails) => {
    if (guardrailsQuery.isLoading) {
      return (
        <ul className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <li key={`guardrail-skeleton-${index}`} className="rounded-2xl border border-saubio-forest/10 p-3">
              <Skeleton className="h-5 w-1/3 rounded-2xl" />
              <Skeleton className="mt-2 h-4 w-2/3 rounded-2xl" />
            </li>
          ))}
        </ul>
      );
    }

    if (!rules.length) {
      return <p className="text-xs text-saubio-slate/60">Rien à signaler sur cette période.</p>;
    }

    return (
      <ul className="space-y-3 text-sm text-saubio-slate/80">
        {rules.map((rule) => (
          <li key={rule.id} className="rounded-2xl border border-saubio-forest/10 p-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-saubio-forest">{rule.name}</p>
                <span className="text-xs text-saubio-forest">
                  {rule.activeCases} cas • seuil {rule.threshold}
                </span>
              </div>
              <p className="text-xs text-saubio-slate/60">{rule.description}</p>
            </div>
            {!!rule.examples.length && (
              <div className="mt-3 space-y-2 rounded-2xl bg-saubio-mist/70 p-3 text-xs text-saubio-slate/70">
                {rule.examples.slice(0, 3).map((example) => (
                  <div key={`${rule.id}-${example.id}`} className="flex justify-between gap-2">
                    <span className="font-semibold text-saubio-forest">{example.reference}</span>
                    <span>
                      {example.count} évts • {formatDate(example.lastEventAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Smart Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Garde-fous & anti-abus</h1>
        <p className="text-sm text-saubio-slate/70">
          Analyse automatique des comportements prestataires/clients (refus massifs, annulations tardives, brouillons non payés…).
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Prestataires</p>
          {renderList(providerRules)}
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Clients</p>
          {renderList(clientRules)}
        </SurfaceCard>
      </div>
    </div>
  );
}
