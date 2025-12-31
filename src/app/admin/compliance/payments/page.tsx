'use client';

import { useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { formatDateTime, useAdminSecurityLogs, useAdminSystemIntegrations } from '@saubio/utils';

const statusTone: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-900',
  warning: 'bg-saubio-sun/10 text-saubio-sun/80',
  inactive: 'bg-saubio-slate/10 text-saubio-slate/70',
};

export default function AdminCompliancePaymentsPage() {
  const integrationsQuery = useAdminSystemIntegrations();
  const logsQuery = useAdminSecurityLogs({ category: 'payment', page: 1, limit: 5 });
  const paymentIntegrations = (integrationsQuery.data?.integrations ?? []).filter((integration) =>
    ['Paiement', 'Vérification'].includes(integration.category)
  );

  const summary = useMemo(() => {
    const total = paymentIntegrations.length;
    const active = paymentIntegrations.filter((item) => item.status === 'active').length;
    const warning = paymentIntegrations.filter((item) => item.status === 'warning').length;
    return [
      { label: 'Connecteurs paiement/KYC', value: total },
      { label: 'Actifs', value: active },
      { label: 'Surveillance', value: warning },
    ];
  }, [paymentIntegrations]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Conformité paiement</h1>
        <p className="text-sm text-saubio-slate/70">
          PSD2, AML/KYC, webhooks financiers : suivi des intégrations critiques et logs associés.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((card) => (
          <SurfaceCard
            key={card.label}
            className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm text-saubio-slate/70 shadow-soft-lg"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">
              {integrationsQuery.isLoading ? '…' : card.value.toString()}
            </p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Intégrations paiement & KYC</p>
          <a className="text-xs font-semibold text-saubio-forest underline" href="/admin/system/integrations">
            Voir toutes les intégrations
          </a>
        </div>
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
              {integrationsQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : paymentIntegrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun connecteur configuré.
                  </td>
                </tr>
              ) : (
                paymentIntegrations.map((integration) => (
                  <tr key={integration.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{integration.name}</td>
                    <td className="px-3 py-2">{integration.category}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[integration.status] ?? statusTone.inactive}`}>
                        {integration.status === 'active'
                          ? 'Actif'
                          : integration.status === 'warning'
                            ? 'Surveillance'
                            : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {integration.lastActivityAt ? formatDateTime(integration.lastActivityAt) : '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {integration.details?.slice(0, 3).map((detail) => (
                        <div key={`${integration.id}-${detail.label}`}>
                          <span className="uppercase tracking-[0.2em] text-saubio-slate/40">{detail.label} :</span>{' '}
                          <span className={detail.muted ? 'text-saubio-slate/50' : 'text-saubio-forest'}>{detail.value}</span>
                        </div>
                      )) ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Logs conformité paiement</p>
          <a className="text-xs font-semibold text-saubio-forest underline" href="/admin/compliance/security">
            Centre sécurité
          </a>
        </div>
        <div className="space-y-3">
          {logsQuery.isLoading ? (
            <div className="flex items-center justify-center py-6 text-sm text-saubio-slate/60">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (logsQuery.data?.items ?? []).length === 0 ? (
            <p className="text-sm text-saubio-slate/60">Aucun log &quot;payment&quot; enregistré côté sécurité.</p>
          ) : (
            logsQuery.data!.items.map((log) => (
              <div key={log.id} className="rounded-2xl border border-saubio-forest/10 bg-saubio-forest/2 p-3 text-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                  <span>{log.level}</span>
                  <span>{formatDateTime(log.createdAt)}</span>
                </div>
                <p className="mt-1 font-semibold text-saubio-forest">{log.message}</p>
                <p className="text-xs text-saubio-slate/60">{log.metadata?.context ?? '—'}</p>
              </div>
            ))
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
