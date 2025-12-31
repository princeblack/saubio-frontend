'use client';

import { useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import type { AdminSystemStatus } from '@saubio/models';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAdminSystemHealth, useAdminSystemIntegrations } from '@saubio/utils';

const statusTone: Record<AdminSystemStatus, string> = {
  ok: 'text-emerald-900 bg-emerald-50',
  degraded: 'text-saubio-sun/80 bg-saubio-sun/10',
  down: 'text-rose-900 bg-rose-50',
};

const statusLabel: Record<AdminSystemStatus, string> = {
  ok: 'Opérationnel',
  degraded: 'Dégradé',
  down: 'En panne',
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function AdminSystemOverviewPage() {
  const healthQuery = useAdminSystemHealth();
  const integrationsQuery = useAdminSystemIntegrations();

  const health = healthQuery.data;
  const integrations = integrationsQuery.data?.integrations ?? [];
  const isLoading = healthQuery.isLoading || integrationsQuery.isLoading;
  const isRefreshing = healthQuery.isFetching || integrationsQuery.isFetching;

  const summaryCards = useMemo(() => {
    const activeIntegrations = integrations.filter((integration) => integration.status === 'active').length;
    const warningIntegrations = integrations.filter((integration) => integration.status === 'warning').length;
    const checksInAlert = health?.checks.filter((check) => check.status !== 'ok').length ?? 0;
    const webhookCheck = health?.checks.find((check) => check.id === 'webhooks');
    const totalWebhooks = Number(webhookCheck?.metrics?.total24h ?? 0);
    const failedWebhooks = Number(webhookCheck?.metrics?.failed1h ?? 0);

    return [
      {
        label: 'Statut global',
        value: health ? statusLabel[health.status] : 'En attente',
        badgeTone: health ? statusTone[health.status] : 'bg-saubio-slate/20 text-saubio-slate/80',
        helper: health ? `Mis à jour ${formatDateTime(health.updatedAt)}` : 'En attente des données système',
      },
      {
        label: 'Intégrations actives',
        value: activeIntegrations.toString(),
        helper:
          warningIntegrations > 0
            ? `${warningIntegrations} intégration(s) à surveiller`
            : 'Toutes les intégrations critiques répondent',
      },
      {
        label: 'Checks critiques',
        value: checksInAlert.toString(),
        helper: checksInAlert > 0 ? 'Des composants signalent un état dégradé' : 'Aucune alerte critique',
      },
      {
        label: 'Webhooks (24h)',
        value: totalWebhooks.toString(),
        helper:
          failedWebhooks > 0
            ? `${failedWebhooks} erreur(s) dernière heure`
            : 'Tous les événements ont été traités',
      },
    ];
  }, [health, integrations]);

  const handleRefresh = () => {
    void healthQuery.refetch();
    void integrationsQuery.refetch();
  };

  const topIntegrations = integrations.slice(0, 5);
  const criticalChecks = (health?.checks ?? []).slice(0, 4);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Pilotage technique</h1>
            <p className="text-sm text-saubio-slate/70">
              Suivez en temps réel l&apos;état de la plateforme, les intégrations critiques et les webhooks reçus.
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Rafraîchir
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <SurfaceCard
            key={card.label}
            className="flex flex-col rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            {isLoading ? (
              <div className="mt-4 flex items-center text-saubio-slate/50">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-xs">Chargement…</span>
              </div>
            ) : (
              <>
                <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
                <p className="text-xs text-saubio-slate/60">{card.helper}</p>
              </>
            )}
          </SurfaceCard>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Composants critiques</p>
            <a className="text-xs font-semibold text-saubio-forest underline" href="/admin/system/status">
              Voir le détail
            </a>
          </div>
          <div className="space-y-3">
            {criticalChecks.length === 0 ? (
              <p className="text-sm text-saubio-slate/60">
                {isLoading ? 'Analyse en cours…' : 'Tous les checks principaux sont OK'}
              </p>
            ) : (
              criticalChecks.map((check) => (
                <div
                  key={check.id}
                  className="rounded-2xl border border-saubio-forest/10 bg-saubio-forest/2 p-3 text-sm text-saubio-slate/80"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-saubio-forest">{check.label}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[check.status]}`}>
                      {statusLabel[check.status]}
                    </span>
                  </div>
                  {check.message ? (
                    <p className="mt-1 text-xs text-saubio-slate/60">{check.message}</p>
                  ) : null}
                  {check.metrics ? (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-saubio-slate/60">
                      {Object.entries(check.metrics)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={`${check.id}-${key}`} className="rounded-xl bg-white/60 px-3 py-1">
                            <p className="uppercase tracking-[0.2em]">{key}</p>
                            <p className="font-semibold text-saubio-forest">{value}</p>
                          </div>
                        ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Integrations critiques</p>
            <a className="text-xs font-semibold text-saubio-forest underline" href="/admin/system/integrations">
              Gérer les intégrations
            </a>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-saubio-slate/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement des intégrations…
            </div>
          ) : topIntegrations.length === 0 ? (
            <p className="text-sm text-saubio-slate/60">Aucune intégration configurée pour le moment.</p>
          ) : (
            <div className="divide-y divide-saubio-forest/10">
              {topIntegrations.map((integration) => (
                <div key={integration.id} className="py-3 text-sm text-saubio-slate/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-saubio-forest">{integration.name}</p>
                      <p className="text-xs text-saubio-slate/60">{integration.category}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        integration.status === 'active'
                          ? 'bg-emerald-50 text-emerald-900'
                          : integration.status === 'warning'
                            ? 'bg-saubio-sun/10 text-saubio-sun/80'
                            : 'bg-rose-50 text-rose-900'
                      }`}
                    >
                      {integration.status === 'active'
                        ? 'Active'
                        : integration.status === 'warning'
                          ? 'Surveillance'
                          : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-2 text-xs text-saubio-slate/60 sm:grid-cols-2">
                    {integration.details?.slice(0, 3).map((detail) => (
                      <div key={`${integration.id}-${detail.label}`}>
                        <p className="uppercase tracking-[0.2em]">{detail.label}</p>
                        <p className={`font-semibold ${detail.muted ? 'text-saubio-slate/60' : 'text-saubio-forest'}`}>
                          {detail.value}
                        </p>
                      </div>
                    ))}
                    <div>
                      <p className="uppercase tracking-[0.2em]">Dernière activité</p>
                      <p className="font-semibold text-saubio-forest">{formatDateTime(integration.lastActivityAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>

      {!isLoading && (healthQuery.isError || integrationsQuery.isError) ? (
        <SurfaceCard className="flex items-center gap-3 rounded-3xl border border-rose-100 bg-rose-50/60 p-4 text-sm text-rose-900">
          <AlertCircle className="h-4 w-4" />
          Impossible de récupérer toutes les informations système. Réessayez plus tard.
        </SurfaceCard>
      ) : null}
    </div>
  );
}
