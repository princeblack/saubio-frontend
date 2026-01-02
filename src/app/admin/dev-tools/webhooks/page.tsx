'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import type { WebhookDeliveryStatus } from '@saubio/models';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAdminWebhookLogs } from '@saubio/utils';

const STATUS_OPTIONS: Array<{ label: string; value: 'all' | WebhookDeliveryStatus }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Reçus', value: 'received' },
  { label: 'En cours', value: 'processing' },
  { label: 'Traités', value: 'processed' },
  { label: 'Échoués', value: 'failed' },
  { label: 'Ignorés', value: 'ignored' },
];

const PAGE_SIZE = 25;

const statusTone: Record<WebhookDeliveryStatus, string> = {
  received: 'bg-saubio-forest/5 text-saubio-slate/80',
  processing: 'bg-saubio-sun/10 text-saubio-sun/80',
  processed: 'bg-emerald-50 text-emerald-900',
  failed: 'bg-rose-50 text-rose-900',
  ignored: 'bg-saubio-slate/10 text-saubio-slate/70',
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function AdminDevToolsWebhooksPage() {
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | WebhookDeliveryStatus,
    provider: '',
    eventType: '',
    search: '',
  });
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      status: filters.status === 'all' ? undefined : filters.status,
      provider: filters.provider || undefined,
      eventType: filters.eventType || undefined,
      search: filters.search || undefined,
    }),
    [filters, page]
  );

  const logsQuery = useAdminWebhookLogs(queryParams);
  const data = logsQuery.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const handleRefresh = () => {
    void logsQuery.refetch();
  };

  const handleInputChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Tests & simulation webhooks</h1>
            <p className="text-sm text-saubio-slate/70">
              Liste alimentée par `/employee/system/logs`. Filtrez par provider, événement, booking/paiement.
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            onClick={handleRefresh}
            disabled={logsQuery.isFetching}
          >
            {logsQuery.isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Rafraîchir
          </button>
        </div>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-saubio-slate/60">
            Provider
            <input
              value={filters.provider}
              onChange={(event) => handleInputChange('provider', event.target.value)}
              placeholder="mollie, push..."
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            />
          </label>
          <label className="text-xs text-saubio-slate/60">
            Statut
            <select
              value={filters.status}
              onChange={(event) => handleInputChange('status', event.target.value)}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-saubio-slate/60">
            Type d&apos;événement
            <input
              value={filters.eventType}
              onChange={(event) => handleInputChange('eventType', event.target.value)}
              placeholder="payment.paid"
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            />
          </label>
          <label className="text-xs text-saubio-slate/60">
            Mot-clé
            <input
              value={filters.search}
              onChange={(event) => handleInputChange('search', event.target.value)}
              placeholder="id booking, trace..."
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Provider</th>
                <th className="px-3 py-2 text-left font-semibold">Événement</th>
                <th className="px-3 py-2 text-left font-semibold">Booking/Paiement</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Reçu</th>
              </tr>
            </thead>
            <tbody>
              {logsQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Lecture des webhooks…
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun webhook enregistré avec ces filtres.
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr key={item.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-saubio-forest">{item.provider}</p>
                      <p className="text-xs text-saubio-slate/60">{item.eventId ?? '—'}</p>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/70">{item.eventType ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/70">
                      {item.booking?.id ?? item.payment?.id ?? item.resourceId ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(item.receivedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-saubio-slate/60">
          <p>
            Page {page} / {totalPages}
          </p>
          <div className="space-x-2">
            <button
              type="button"
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              Précédent
            </button>
            <button
              type="button"
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
