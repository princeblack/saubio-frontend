'use client';

import { useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  useAdminSystemExportJobs,
  useAdminSystemHealth,
  useAdminSystemImportJobs,
  useAdminSystemInfo,
  useAdminSystemIntegrations,
} from '@saubio/utils';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value ?? 0);

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function AdminDevToolsOverviewPage() {
  const healthQuery = useAdminSystemHealth();
  const integrationsQuery = useAdminSystemIntegrations();
  const infoQuery = useAdminSystemInfo();
  const importJobsQuery = useAdminSystemImportJobs({ status: 'pending', pageSize: 1 });
  const exportJobsQuery = useAdminSystemExportJobs({ status: 'pending', pageSize: 1 });

  const webhookCheck = healthQuery.data?.checks.find((check) => check.id === 'webhooks');
  const alertsCount = healthQuery.data?.checks.filter((check) => check.status !== 'ok').length ?? 0;
  const pendingJobs = (importJobsQuery.data?.total ?? 0) + (exportJobsQuery.data?.total ?? 0);
  const enabledFlags = infoQuery.data?.featureFlags.filter((flag) => flag.enabled).length ?? 0;
  const integrationAlerts =
    integrationsQuery.data?.integrations.filter((integration) => integration.status !== 'active').length ?? 0;

  const isLoading =
    healthQuery.isLoading ||
    integrationsQuery.isLoading ||
    infoQuery.isLoading ||
    importJobsQuery.isLoading ||
    exportJobsQuery.isLoading;
  const isRefreshing =
    healthQuery.isFetching ||
    integrationsQuery.isFetching ||
    infoQuery.isFetching ||
    importJobsQuery.isFetching ||
    exportJobsQuery.isFetching;

  const summaryCards = useMemo(
    () => [
      {
        label: 'Jobs en attente',
        value: formatNumber(pendingJobs),
        helper:
          pendingJobs === 0
            ? 'Aucun import/export en file'
            : 'Imports/exports à surveiller dans les data jobs',
      },
      {
        label: 'Webhooks reçus (24h)',
        value: formatNumber(Number(webhookCheck?.metrics?.total24h ?? 0)),
        helper:
          Number(webhookCheck?.metrics?.failed1h ?? 0) > 0
            ? `${webhookCheck?.metrics?.failed1h} erreurs sur la dernière heure`
            : `Dernière activité ${formatDateTime(webhookCheck?.lastCheckedAt)}`,
      },
      {
        label: 'Alertes techniques',
        value: formatNumber(alertsCount),
        helper:
          alertsCount === 0
            ? 'Tous les checks critiques sont OK'
            : 'Consultez le détail dans Observabilité & logs',
      },
      {
        label: 'Feature flags actifs',
        value: formatNumber(enabledFlags),
        helper:
          enabledFlags === 0
            ? 'Aucun flag expérimental activé'
            : 'Flags actifs côté backend et infrastructure',
      },
    ],
    [alertsCount, enabledFlags, pendingJobs, webhookCheck]
  );

  const quickTools = useMemo(
    () => [
      {
        name: 'Pipeline données',
        description: 'Imports et exports de données critiques',
        badge: `${formatNumber(pendingJobs)} job(s) en file`,
        href: '/admin/dev-tools/jobs',
      },
      {
        name: 'Webhooks & observabilité',
        description: 'Derniers événements entrants et état des files',
        badge: `${formatNumber(Number(webhookCheck?.metrics?.total24h ?? 0))} événements/24h`,
        href: '/admin/dev-tools/webhooks',
      },
      {
        name: 'Feature flags',
        description: 'Visibilité sur les fonctionnalités activées',
        badge: `${formatNumber(enabledFlags)} flag(s) actifs`,
        href: '/admin/dev-tools/flags',
      },
      {
        name: 'Intégrations & secrets',
        description: 'Connecteurs paiement, email, KYC…',
        badge:
          integrationAlerts > 0
            ? `${integrationAlerts} intégration(s) à surveiller`
            : 'Toutes les intégrations répondent',
        href: '/admin/dev-tools/integrations',
      },
    ],
    [enabledFlags, integrationAlerts, pendingJobs, webhookCheck]
  );

  const handleRefresh = () => {
    void healthQuery.refetch();
    void integrationsQuery.refetch();
    void infoQuery.refetch();
    void importJobsQuery.refetch();
    void exportJobsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Outils techniques & DevOps</h1>
            <p className="text-sm text-saubio-slate/70">
              Observabilité API, intégrations critiques et data jobs, alimentés par les endpoints admin.
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
          <SurfaceCard key={card.label} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
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

      <SurfaceCard className="grid gap-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg md:grid-cols-2 lg:grid-cols-4">
        {quickTools.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            className="rounded-2xl bg-saubio-slate/5 p-4 text-sm text-saubio-slate/80 transition hover:bg-saubio-slate/10"
          >
            <p className="text-sm font-semibold text-saubio-forest">{tool.name}</p>
            <p className="mt-2 text-xs text-saubio-slate/60">{tool.description}</p>
            <p className="mt-3 text-xs font-semibold text-saubio-forest">{tool.badge}</p>
          </a>
        ))}
      </SurfaceCard>
    </div>
  );
}
