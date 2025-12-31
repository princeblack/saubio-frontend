'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import type { WebhookDeliveryStatus } from '@saubio/models';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAdminWebhookLog, useAdminWebhookLogs } from '@saubio/utils';

const STATUSES: Array<{ label: string; value: 'all' | WebhookDeliveryStatus }> = [
  { label: 'Tous les statuts', value: 'all' },
  { label: 'Reçus', value: 'received' },
  { label: 'En cours', value: 'processing' },
  { label: 'Traités', value: 'processed' },
  { label: 'Ignorés', value: 'ignored' },
  { label: 'Échoués', value: 'failed' },
];

const statusTone: Record<WebhookDeliveryStatus, string> = {
  received: 'bg-saubio-forest/5 text-saubio-slate/80',
  processing: 'bg-saubio-sun/10 text-saubio-sun/80',
  processed: 'bg-emerald-50 text-emerald-900',
  failed: 'bg-rose-50 text-rose-900',
  ignored: 'bg-saubio-slate/10 text-saubio-slate/80',
};

const INITIAL_FILTERS = {
  provider: '',
  status: 'all' as 'all' | WebhookDeliveryStatus,
  eventType: '',
  resourceId: '',
  bookingId: '',
  paymentId: '',
  search: '',
  from: '',
  to: '',
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
};

const PAGE_SIZE = 25;

export default function AdminSystemLogsPage() {
  const [formState, setFormState] = useState(INITIAL_FILTERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      provider: filters.provider || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
      eventType: filters.eventType || undefined,
      resourceId: filters.resourceId || undefined,
      bookingId: filters.bookingId || undefined,
      paymentId: filters.paymentId || undefined,
      search: filters.search || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    [filters, page]
  );

  const logsQuery = useAdminWebhookLogs(queryParams);
  const detailQuery = useAdminWebhookLog(selectedId ?? undefined);
  const data = logsQuery.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const handleFiltersSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters(formState);
    setPage(1);
  };

  const handleReset = () => {
    setFormState(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Webhooks & logs</h1>
            <p className="text-sm text-saubio-slate/70">
              Historique des webhooks entrants (Mollie & co), statut de traitement et payload lié à un booking/paiement.
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            onClick={() => logsQuery.refetch()}
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
        <form onSubmit={handleFiltersSubmit} className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-saubio-slate/60">
            Provider
            <input
              type="text"
              value={formState.provider}
              onChange={(event) => setFormState((prev) => ({ ...prev, provider: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              placeholder="mollie"
            />
          </label>
          <label className="text-xs text-saubio-slate/60">
            Statut
            <select
              value={formState.status}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, status: event.target.value as 'all' | WebhookDeliveryStatus }))
              }
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            >
              {STATUSES.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-saubio-slate/60">
            Type d&apos;événement
            <input
              type="text"
              value={formState.eventType}
              onChange={(event) => setFormState((prev) => ({ ...prev, eventType: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              placeholder="payment.paid"
            />
          </label>
          <label className="text-xs text-saubio-slate/60">
            Resource ID
            <input
              type="text"
              value={formState.resourceId}
              onChange={(event) => setFormState((prev) => ({ ...prev, resourceId: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              placeholder="tr_xxx"
            />
          </label>
          <label className="text-xs text-saubio-slate/60">
            Booking ID
            <input
              type="text"
              value={formState.bookingId}
              onChange={(event) => setFormState((prev) => ({ ...prev, bookingId: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              placeholder="bk_..."
            />
          </label>
          <label className="text-xs text-saubio-slate/60">
            Payment ID
            <input
              type="text"
              value={formState.paymentId}
              onChange={(event) => setFormState((prev) => ({ ...prev, paymentId: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              placeholder="pay_..."
            />
          </label>
          <label className="text-xs text-saubio-slate/60">
            Mot-clé
            <input
              type="text"
              value={formState.search}
              onChange={(event) => setFormState((prev) => ({ ...prev, search: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              placeholder="id mollie, erreur…"
            />
          </label>
          <label className="text-xs text-saubio-slate/60">
            Du
            <input
              type="date"
              value={formState.from}
              onChange={(event) => setFormState((prev) => ({ ...prev, from: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            />
          </label>
          <label className="text-xs text-saubio-slate/60">
            Au
            <input
              type="date"
              value={formState.to}
              onChange={(event) => setFormState((prev) => ({ ...prev, to: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 rounded-full border border-saubio-forest/20 bg-saubio-forest px-4 py-2 text-xs font-semibold text-white"
            >
              Appliquer
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
                <th className="px-3 py-2 text-left font-semibold">Provider</th>
                <th className="px-3 py-2 text-left font-semibold">Événement</th>
                <th className="px-3 py-2 text-left font-semibold">Ressource</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Contexte</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logsQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-6 text-center text-xs text-saubio-slate/60" colSpan={7}>
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  </td>
                </tr>
              ) : data && data.items.length > 0 ? (
                data.items.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-b border-saubio-forest/5 last-border-none ${
                      log.id === selectedId ? 'bg-saubio-forest/5' : ''
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{formatDateTime(log.receivedAt)}</td>
                    <td className="px-3 py-2">{log.provider}</td>
                    <td className="px-3 py-2">
                      <div className="text-saubio-forest">{log.eventType ?? 'n/a'}</div>
                      <div className="text-xs text-saubio-slate/60">{log.eventId ?? log.resourceId ?? '—'}</div>
                    </td>
                    <td className="px-3 py-2">{log.resourceId ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[log.status]}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {log.booking ? (
                        <div>
                          Booking <span className="font-semibold text-saubio-forest">{log.booking.id}</span>
                        </div>
                      ) : null}
                      {log.payment ? (
                        <div>
                          Payment <span className="font-semibold text-saubio-forest">{log.payment.id}</span>
                        </div>
                      ) : null}
                      {log.user ? (
                        <div>
                          User <span className="font-semibold text-saubio-forest">{log.user.email ?? log.user.id}</span>
                        </div>
                      ) : null}
                      {!log.booking && !log.payment && !log.user ? '—' : null}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-forest underline">
                      <button type="button" onClick={() => setSelectedId(log.id)}>
                        Inspecter
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-6 text-center text-xs text-saubio-slate/60" colSpan={7}>
                    Aucun événement pour ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data ? (
          <div className="mt-4 flex items-center justify-between text-xs text-saubio-slate/60">
            <p>
              Page {data.page} / {totalPages} · {data.total} événements
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-40"
                disabled={data.page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Précédent
              </button>
              <button
                type="button"
                className="rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-40"
                disabled={data.page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        ) : null}
      </SurfaceCard>

      {selectedId ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-saubio-forest">Détail webhook</p>
              <p className="text-xs text-saubio-slate/60">{selectedId}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest"
            >
              Fermer
            </button>
          </div>
          {detailQuery.isLoading ? (
            <div className="flex items-center gap-2 text-xs text-saubio-slate/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement du payload…
            </div>
          ) : detailQuery.data ? (
            <div className="space-y-3 text-xs text-saubio-slate/80">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="uppercase tracking-[0.2em] text-saubio-slate/40">Provider</p>
                  <p className="font-semibold text-saubio-forest">{detailQuery.data.provider}</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.2em] text-saubio-slate/40">Statut</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[detailQuery.data.status]}`}>
                    {detailQuery.data.status}
                  </span>
                </div>
                <div>
                  <p className="uppercase tracking-[0.2em] text-saubio-slate/40">Reçu</p>
                  <p className="font-semibold text-saubio-forest">{formatDateTime(detailQuery.data.receivedAt)}</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.2em] text-saubio-slate/40">Traité</p>
                  <p className="font-semibold text-saubio-forest">{formatDateTime(detailQuery.data.processedAt)}</p>
                </div>
              </div>
              {detailQuery.data.errorMessage ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3 text-rose-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Erreur</p>
                  <p>{detailQuery.data.errorMessage}</p>
                </div>
              ) : null}
              <div>
                <p className="mb-1 font-semibold text-saubio-forest">Payload</p>
                <pre className="max-h-72 overflow-auto rounded-2xl bg-saubio-forest/5 p-3 font-mono text-[11px] text-saubio-slate/80">
                  {JSON.stringify(detailQuery.data.payload ?? detailQuery.data.metadata ?? {}, null, 2)}
                </pre>
              </div>
              {detailQuery.data.headers ? (
                <div>
                  <p className="mb-1 font-semibold text-saubio-forest">Headers</p>
                  <pre className="max-h-48 overflow-auto rounded-2xl bg-saubio-forest/5 p-3 font-mono text-[11px] text-saubio-slate/80">
                    {JSON.stringify(detailQuery.data.headers, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-saubio-slate/60">Impossible de charger ce webhook.</p>
          )}
        </SurfaceCard>
      ) : null}
    </div>
  );
}
