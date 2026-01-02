'use client';

import { useState, useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { formatDateTime, useAdminWebhookLogs } from '@saubio/utils';

const STATUS_LABELS: Record<string, string> = {
  received: 'Reçu',
  processing: 'Processing',
  processed: 'Traité',
  failed: 'Échec',
  ignored: 'Ignoré',
};

const statusTone = (status: string) => {
  switch (status) {
    case 'processed':
      return 'text-emerald-800';
    case 'processing':
      return 'text-saubio-forest';
    case 'failed':
      return 'text-rose-800';
    case 'ignored':
      return 'text-saubio-slate/70';
    default:
      return 'text-saubio-slate/70';
  }
};

const PAGE_SIZE = 25;

export default function AdminAutomationWebhooksPage() {
  const [page, setPage] = useState(1);
  const [providerFilter, setProviderFilter] = useState('');

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      provider: providerFilter || undefined,
    }),
    [page, providerFilter]
  );

  const logsQuery = useAdminWebhookLogs(queryParams);
  const data = logsQuery.data;
  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const handlePageChange = (delta: number) => {
    setPage((prev) => Math.min(Math.max(1, prev + delta), totalPages));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Webhooks & intégrations</h1>
        <p className="text-sm text-saubio-slate/70">
          Lecture unifiée des webhooks entrants depuis `/employee/system/webhooks` (paiements, mobile, CRM…).
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-saubio-slate/60">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/70">
            <span className="mb-1 block">Filtrer par provider</span>
            <input
              type="search"
              value={providerFilter}
              onChange={(event) => {
                setProviderFilter(event.target.value);
                setPage(1);
              }}
              placeholder="mollie, push..."
              className="w-64 rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => logsQuery.refetch()}
              disabled={logsQuery.isFetching}
              className="rounded-full border border-saubio-forest/20 px-3 py-1.5 font-semibold text-saubio-forest disabled:opacity-40"
            >
              {logsQuery.isFetching ? (
                <Loader2 className="mr-2 inline h-3.5 w-3.5 animate-spin" />
              ) : null}
              Rafraîchir
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(-1)}
                disabled={page <= 1 || logsQuery.isLoading}
                className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={page >= totalPages || logsQuery.isLoading}
                className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Provider</th>
                <th className="px-3 py-2 text-left font-semibold">Endpoint</th>
                <th className="px-3 py-2 text-left font-semibold">Événement</th>
                <th className="px-3 py-2 text-left font-semibold">Booking / Payment</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
              </tr>
            </thead>
            <tbody>
              {logsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Lecture des webhooks…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun webhook ne correspond à ce filtre.
                  </td>
                </tr>
              ) : (
                items.map((hook) => (
                  <tr key={hook.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-saubio-forest">{hook.provider}</p>
                      <p className="text-xs text-saubio-slate/60">{hook.eventType ?? '—'}</p>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{hook.providerProfile?.name ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/70">{hook.resourceId ?? hook.eventId ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/70">
                      {hook.booking?.id ?? hook.payment?.id ?? '—'}
                    </td>
                    <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${statusTone(hook.status)}`}>
                      {STATUS_LABELS[hook.status] ?? hook.status}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(hook.receivedAt)}</td>
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
