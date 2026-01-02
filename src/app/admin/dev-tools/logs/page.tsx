'use client';

import { SurfaceCard } from '@saubio/ui';
import type { AdminSystemHealthCheck, WebhookDeliveryStatus } from '@saubio/models';
import { Loader2 } from 'lucide-react';
import { useAdminSystemHealth, useAdminWebhookLogs } from '@saubio/utils';

const statusTone: Record<AdminSystemHealthCheck['status'], string> = {
  ok: 'bg-emerald-50 text-emerald-900',
  degraded: 'bg-saubio-sun/10 text-saubio-sun/80',
  down: 'bg-rose-50 text-rose-900',
};

const webhookTone: Record<WebhookDeliveryStatus, string> = {
  received: 'text-saubio-slate/70',
  processing: 'text-saubio-sun/80',
  processed: 'text-emerald-700',
  failed: 'text-rose-700',
  ignored: 'text-saubio-slate/60',
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function AdminDevToolsLogsPage() {
  const healthQuery = useAdminSystemHealth();
  const webhookQuery = useAdminWebhookLogs({ page: 1, pageSize: 10 });
  const checks = healthQuery.data?.checks ?? [];
  const events = webhookQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Observabilité & logs</h1>
        <p className="text-sm text-saubio-slate/70">
          Evenements extraits des endpoints admin (`/employee/system/health` & `/employee/system/logs`). Filtrez depuis la
          page Webhooks si besoin.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Checks critiques</p>
            <span className="text-xs text-saubio-slate/60">
              Mise à jour {formatDateTime(healthQuery.data?.updatedAt)}
            </span>
          </div>
          {healthQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-saubio-slate/60">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement des checks…
            </div>
          ) : checks.length === 0 ? (
            <p className="text-sm text-saubio-slate/60">Aucun check n&apos;a encore été enregistré.</p>
          ) : (
            <div className="space-y-3">
              {checks.map((check) => (
                <div key={check.id} className="rounded-2xl border border-saubio-forest/10 bg-saubio-forest/2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-saubio-forest">{check.label}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[check.status]}`}>
                      {check.status === 'ok' ? 'OK' : check.status === 'degraded' ? 'Dégradé' : 'En panne'}
                    </span>
                  </div>
                  {check.message ? <p className="text-xs text-saubio-slate/60">{check.message}</p> : null}
                  {check.metrics ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-saubio-slate/60">
                      {Object.entries(check.metrics).slice(0, 4).map(([key, value]) => (
                        <div key={`${check.id}-${key}`} className="rounded-xl bg-white/70 px-3 py-1">
                          <p className="uppercase tracking-[0.2em]">{key}</p>
                          <p className="font-semibold text-saubio-forest">{value ?? '—'}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Derniers webhooks entrants</p>
            <a className="text-xs font-semibold text-saubio-forest underline" href="/admin/dev-tools/webhooks">
              Voir tout
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Provider</th>
                  <th className="px-3 py-2 text-left font-semibold">Événement</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Reçu</th>
                </tr>
              </thead>
              <tbody>
                {webhookQuery.isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Chargement des webhooks…
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      Aucun webhook reçu sur la période récente.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2">
                        <p className="font-semibold text-saubio-forest">{event.provider}</p>
                        <p className="text-xs text-saubio-slate/60">{event.eventType ?? '—'}</p>
                      </td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/70">{event.resourceId ?? event.eventId ?? '—'}</td>
                      <td className={`px-3 py-2 text-xs font-semibold ${webhookTone[event.status]}`}>{event.status}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(event.receivedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
