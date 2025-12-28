'use client';

import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Activity, RefreshCw } from 'lucide-react';
import { useAdminFinanceSettings, formatDateTime } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const providerLabel = (provider: string) => {
  if (provider === 'mollie') return 'Mollie';
  if (provider === 'none') return 'Aucun PSP configuré';
  return provider;
};

const modeLabel = (mode: string) => {
  if (mode === 'production') return 'Production';
  if (mode === 'test') return 'Sandbox';
  return 'Développement';
};

export default function AdminMolliePage() {
  const settingsQuery = useAdminFinanceSettings();
  const { data, isLoading, isError } = settingsQuery;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Finances & Paiements</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Monitoring PSP / Mollie</h1>
        <p className="text-sm text-saubio-slate/70">
          État de l’intégration PSP (mode, webhook, événements récents) et mandats SEPA des prestataires.
        </p>
      </header>

      {isError ? (
        <ErrorState
          title="Impossible de charger les informations PSP"
          description="Vérifiez la connexion réseau ou réessayez plus tard."
          onRetry={() => settingsQuery.refetch()}
        />
      ) : null}

      <SurfaceCard className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Fournisseur</p>
          <p className="text-2xl font-semibold text-saubio-forest">
            {isLoading || !data ? <Skeleton className="h-8 w-48" /> : providerLabel(data.provider)}
          </p>
          <p className="text-xs text-saubio-slate/60">
            {isLoading || !data ? <Skeleton className="mt-1 h-4 w-60" /> : `Mode : ${modeLabel(data.mode)}`}
          </p>
          {data?.webhookUrl ? <p className="text-xs text-saubio-slate/60">Webhook : {data.webhookUrl}</p> : null}
          {data?.webhookHealthy !== null && data?.webhookHealthy !== undefined ? (
            <p className={`text-xs ${data.webhookHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
              Webhook {data.webhookHealthy ? 'opérationnel' : 'à vérifier'}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Activity className="h-10 w-10 rounded-2xl bg-saubio-mist p-2 text-saubio-forest" />
          <button className="rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest" type="button">
            Basculer Sandbox
          </button>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Événements / webhooks récents</p>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest"
              type="button"
              onClick={() => settingsQuery.refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              Rafraîchir
            </button>
          </div>
          <table className="w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="py-2 text-left font-semibold">Date</th>
                <th className="py-2 text-left font-semibold">Événement</th>
                <th className="py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`events-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td className="py-3" colSpan={3}>
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {data?.recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="py-2 text-saubio-slate/60">{formatDateTime(event.createdAt)}</td>
                  <td className="py-2">{event.type}</td>
                  <td className={`py-2 ${event.status === 'succeeded' || event.status === '200' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {event.status}
                  </td>
                </tr>
              ))}
              {data && data.recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-3 text-center text-saubio-slate/60">
                    Aucun événement enregistré récemment.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Mandats SEPA</p>
          </div>
          <table className="w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="py-2 text-left font-semibold">Prestataire</th>
                <th className="py-2 text-left font-semibold">Mandat</th>
                <th className="py-2 text-left font-semibold">Statut</th>
                <th className="py-2 text-left font-semibold">MAJ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`mandates-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td className="py-3" colSpan={4}>
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {data?.mandates.map((mandate) => (
                <tr key={mandate.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="py-2 font-semibold text-saubio-forest">{mandate.providerName}</td>
                  <td className="py-2 text-xs text-saubio-slate/60">{mandate.id}</td>
                  <td className="py-2">{mandate.status}</td>
                  <td className="py-2 text-saubio-slate/60">{formatDateTime(mandate.updatedAt)}</td>
                </tr>
              ))}
              {data && data.mandates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-saubio-slate/60">
                    Aucun mandat récent.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </SurfaceCard>
      </div>
    </div>
  );
}
