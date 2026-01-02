'use client';

import { SurfaceCard } from '@saubio/ui';
import type { AdminSystemIntegrationStatus } from '@saubio/models';
import { Loader2 } from 'lucide-react';
import { useAdminSystemIntegrations } from '@saubio/utils';

const statusTone: Record<AdminSystemIntegrationStatus, string> = {
  active: 'bg-emerald-50 text-emerald-900',
  warning: 'bg-saubio-sun/10 text-saubio-sun/80',
  inactive: 'bg-saubio-slate/10 text-saubio-slate/70',
};

export default function AdminDevToolsIntegrationsPage() {
  const integrationsQuery = useAdminSystemIntegrations();
  const integrations = integrationsQuery.data?.integrations ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Intégrations techniques</h1>
        <p className="text-sm text-saubio-slate/70">
          Statut en temps réel des connecteurs (paiements, e-mails, KYC, stockage) exposés par l&apos;API admin.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Connecteurs monitorés</p>
          <a className="text-xs font-semibold text-saubio-forest underline" href="/admin/system/integrations">
            Tableau complet
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière activité</th>
                <th className="px-3 py-2 text-left font-semibold">Détails</th>
                <th className="px-3 py-2 text-left font-semibold">Liens</th>
              </tr>
            </thead>
            <tbody>
              {integrationsQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Chargement des intégrations…
                  </td>
                </tr>
              ) : integrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucune intégration n&apos;a été déclarée dans l&apos;observabilité système.
                  </td>
                </tr>
              ) : (
                integrations.map((integration) => (
                  <tr key={integration.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-saubio-forest">{integration.name}</p>
                      <p className="text-xs text-saubio-slate/60">{integration.category}</p>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[integration.status]}`}>
                        {integration.status === 'active'
                          ? 'Opérationnel'
                          : integration.status === 'warning'
                          ? 'À surveiller'
                          : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {integration.lastActivityAt
                        ? new Intl.DateTimeFormat('fr-FR', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(integration.lastActivityAt))
                        : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1 text-xs text-saubio-slate/70">
                        {integration.details?.map((detail) => (
                          <p key={`${integration.id}-${detail.label}`}>
                            <span className="font-semibold text-saubio-forest">{detail.label} :</span>{' '}
                            <span className={detail.muted ? 'text-saubio-slate/50' : undefined}>{detail.value}</span>
                          </p>
                        )) ?? '—'}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {integration.links?.length ? (
                        <div className="space-y-1">
                          {integration.links.map((link) => (
                            <a
                              key={`${integration.id}-${link.url}`}
                              href={link.url}
                              className="text-saubio-forest underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-saubio-slate/60">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
