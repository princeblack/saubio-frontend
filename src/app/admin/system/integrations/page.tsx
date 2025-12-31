'use client';

import { SurfaceCard } from '@saubio/ui';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAdminSystemIntegrations } from '@saubio/utils';

const statusTone = {
  active: 'bg-emerald-50 text-emerald-900',
  warning: 'bg-saubio-sun/10 text-saubio-sun/80',
  inactive: 'bg-rose-50 text-rose-900',
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function AdminSystemIntegrationsPage() {
  const integrationsQuery = useAdminSystemIntegrations();
  const integrations = integrationsQuery.data?.integrations ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Intégrations externes</h1>
            <p className="text-sm text-saubio-slate/70">
              Vérifiez l&apos;état des connecteurs (paiements, emails, stockage, KYC) et consultez les dernières activités.
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            onClick={() => integrationsQuery.refetch()}
            disabled={integrationsQuery.isFetching}
          >
            {integrationsQuery.isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Rafraîchir
          </button>
        </div>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Connecteurs configurés</p>
          <span className="text-xs text-saubio-slate/60">
            {integrations.length} intégration(s) ·{' '}
            {integrations.filter((integration) => integration.status === 'warning').length} alerte(s)
          </span>
        </div>
        {integrationsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-saubio-slate/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement des intégrations…
          </div>
        ) : integrations.length === 0 ? (
          <p className="text-sm text-saubio-slate/70">Aucune intégration détectée pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Nom</th>
                  <th className="px-3 py-2 text-left font-semibold">Catégorie</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Dernier événement</th>
                  <th className="px-3 py-2 text-left font-semibold">Détails</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((integration) => (
                  <tr key={integration.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{integration.name}</td>
                    <td className="px-3 py-2">{integration.category}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusTone[integration.status] ?? 'bg-saubio-slate/10 text-saubio-slate/80'
                        }`}
                      >
                        {integration.status === 'active'
                          ? 'Active'
                          : integration.status === 'warning'
                            ? 'Surveillance'
                            : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatDateTime(integration.lastActivityAt)}</td>
                    <td className="px-3 py-2">
                      <div className="space-y-1 text-xs text-saubio-slate/60">
                        {integration.details?.map((detail) => (
                          <div key={`${integration.id}-${detail.label}`}>
                            <span className="uppercase tracking-[0.2em]">{detail.label} :</span>{' '}
                            <span className={`font-semibold ${detail.muted ? 'text-saubio-slate/60' : 'text-saubio-forest'}`}>
                              {detail.value}
                            </span>
                          </div>
                        )) ?? <span>Aucun détail</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
