'use client';

import { SurfaceCard, Skeleton, Badge } from '@saubio/ui';
import {
  useAdminNotificationRules,
  useUpdateAdminNotificationRule,
} from '@saubio/utils';

const EVENT_LABELS: Record<string, string> = {
  booking_created: 'Réservation créée',
  booking_confirmed: 'Réservation confirmée',
  booking_completed: 'Mission terminée',
  payment_failed: 'Échec paiement',
  matching_progress: 'Progression matching',
  smart_match_triggered: 'Smart Match déclenché',
};

const AUDIENCE_LABELS: Record<string, string> = {
  client: 'Client',
  provider: 'Prestataire',
  admin: 'Équipe interne',
};

const CHANNEL_LABELS: Record<string, string> = {
  in_app: 'In-app',
  email: 'Email',
  push: 'Push',
};

export default function AdminAutomationWorkflowsPage() {
  const rulesQuery = useAdminNotificationRules();
  const updateRule = useUpdateAdminNotificationRule();
  const rules = rulesQuery.data ?? [];

  const toggleRule = (id: string, isActive: boolean) => {
    updateRule.mutate({ id, payload: { isActive: !isActive } });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Automatisations & workflows</h1>
        <p className="text-sm text-saubio-slate/70">Visualisez les règles de déclenchement existantes et activez/désactivez les canaux multi-publics.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Règles actives</p>
          <span className="text-xs text-saubio-slate/60">
            {rulesQuery.isFetching ? 'Actualisation…' : `${rules.length} workflow(s)`}
          </span>
        </div>
        {rulesQuery.isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <SurfaceCard key={index} className="rounded-3xl border border-saubio-forest/10 bg-white p-4 shadow-none">
                <Skeleton className="h-5 w-1/3 rounded-full bg-saubio-mist/80" />
                <Skeleton className="mt-2 h-16 w-full rounded-2xl bg-saubio-mist/60" />
              </SurfaceCard>
            ))}
          </div>
        ) : rules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-saubio-forest/20 bg-saubio-mist/40 p-6 text-center text-sm text-saubio-slate/60">
            Aucune règle n’a été définie pour l’instant.
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => {
              const isMutating = updateRule.isPending && updateRule.variables?.id === rule.id;
              const statusTone = rule.isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-saubio-slate/15 text-saubio-slate/70';
              return (
                <SurfaceCard
                  key={rule.id}
                  className="rounded-3xl border border-saubio-forest/10 bg-white p-4 shadow-none transition hover:border-saubio-forest/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-saubio-forest">{rule.name}</p>
                      <p className="text-xs text-saubio-slate/60">{rule.description ?? 'Pas de description'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
                        {rule.isActive ? 'Activé' : 'Désactivé'}
                      </Badge>
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => toggleRule(rule.id, rule.isActive)}
                        className="rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest disabled:opacity-40"
                      >
                        {rule.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Événement</p>
                      <p className="text-sm text-saubio-forest">{EVENT_LABELS[rule.event] ?? rule.event}</p>
                      <p className="text-xs text-saubio-slate/60">{AUDIENCE_LABELS[rule.audience] ?? rule.audience}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Canaux</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rule.channels.map((channel) => (
                          <span key={channel} className="rounded-full bg-saubio-forest/10 px-3 py-1 text-xs font-semibold text-saubio-forest">
                            {CHANNEL_LABELS[channel] ?? channel}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Timing</p>
                      <p className="text-sm text-saubio-forest">
                        {rule.delaySeconds ? `+${Math.round(rule.delaySeconds / 60)} min` : 'Immédiat'}
                      </p>
                      {rule.template ? (
                        <p className="text-xs text-saubio-slate/60">
                          Template : <span className="font-semibold text-saubio-forest">{rule.template.name}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-saubio-slate/60">Aucun template lié</p>
                      )}
                    </div>
                  </div>
                  {rule.conditions && Object.keys(rule.conditions).length > 0 ? (
                    <div className="mt-4 rounded-2xl border border-saubio-forest/10 bg-saubio-mist/30 p-3 text-xs text-saubio-slate/70">
                      <p className="mb-1 text-[11px] uppercase tracking-[0.3em] text-saubio-slate/50">Conditions</p>
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(rule.conditions, null, 2)}</pre>
                    </div>
                  ) : null}
                </SurfaceCard>
              );
            })}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
