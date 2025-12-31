'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { SurfaceCard, Skeleton, Badge } from '@saubio/ui';
import { formatDateTime, useAdminNotificationLogs } from '@saubio/utils';
import type { AdminNotificationLogItem } from '@saubio/models';

const STATUS_LABELS: Record<AdminNotificationLogItem['deliveryStatus'], string> = {
  pending: 'En attente',
  sent: 'Envoyé',
  delivered: 'Livré',
  failed: 'Échec',
  bounced: 'Rejeté',
};

const STATUS_TONES: Record<AdminNotificationLogItem['deliveryStatus'], string> = {
  pending: 'bg-saubio-slate/10 text-saubio-slate/70',
  sent: 'bg-saubio-sun/30 text-saubio-forest',
  delivered: 'bg-emerald-100 text-emerald-900',
  failed: 'bg-rose-100 text-rose-900',
  bounced: 'bg-rose-100 text-rose-900',
};

const CHANNEL_LABELS: Record<AdminNotificationLogItem['channel'], string> = {
  in_app: 'In-app',
  email: 'Email',
  push: 'Push',
};

const TYPE_LABELS: Partial<Record<AdminNotificationLogItem['type'], string>> = {
  booking_status: 'Statut réservation',
  booking_assignment: 'Affectation',
  booking_cancellation: 'Annulation',
  billing: 'Facturation',
  support_update: 'Support',
  matching_progress: 'Matching',
};

const CHANNEL_FILTERS: Array<'all' | AdminNotificationLogItem['channel']> = ['all', 'in_app', 'email', 'push'];
const STATUS_FILTERS: Array<'all' | AdminNotificationLogItem['deliveryStatus']> = [
  'all',
  'pending',
  'sent',
  'delivered',
  'failed',
  'bounced',
];
const TYPE_FILTERS: Array<'all' | AdminNotificationLogItem['type']> = [
  'all',
  'booking_status',
  'booking_assignment',
  'booking_cancellation',
  'billing',
  'support_update',
  'matching_progress',
];

const PAGE_SIZE = 25;

export default function AdminAutomationCenterPage() {
  const [channelFilter, setChannelFilter] = useState<(typeof CHANNEL_FILTERS)[number]>('all');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);
  const [selectedLog, setSelectedLog] = useState<AdminNotificationLogItem | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      channel: channelFilter === 'all' ? undefined : channelFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
      search: deferredSearch.trim() || undefined,
    }),
    [page, channelFilter, statusFilter, typeFilter, deferredSearch]
  );

  const logsQuery = useAdminNotificationLogs(queryParams);
  const logs = logsQuery.data?.items ?? [];
  const totalPages = logsQuery.data ? Math.max(1, Math.ceil(logsQuery.data.total / logsQuery.data.pageSize)) : 1;

  useEffect(() => {
    if (logs.length === 0) {
      setSelectedLog(null);
      return;
    }
    if (!selectedLog || !logs.find((log) => log.id === selectedLog.id)) {
      setSelectedLog(logs[0]);
    }
  }, [logs, selectedLog]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const resetFilters = () => {
    setChannelFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Centre de notifications</h1>
        <p className="text-sm text-saubio-slate/70">Suivez tous les envois (email, push, in-app), diagnostiquez les erreurs et filtrez par acteur.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 grid gap-4 rounded-2xl border border-saubio-forest/10 bg-saubio-mist/40 p-4 text-sm text-saubio-slate/80 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Recherche</label>
            <input
              type="search"
              placeholder="ID, email, booking…"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="w-full rounded-2xl border border-saubio-forest/10 bg-white px-4 py-2 text-sm text-saubio-forest shadow-inner focus:border-saubio-forest focus:outline-none"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Canal</label>
              <select
                className="w-full rounded-2xl border border-saubio-forest/10 bg-white px-3 py-2 text-sm text-saubio-forest shadow-inner"
                value={channelFilter}
                onChange={(event) => {
                  setChannelFilter(event.target.value as (typeof CHANNEL_FILTERS)[number]);
                  setPage(1);
                }}
              >
                {CHANNEL_FILTERS.map((value) => (
                  <option key={value} value={value}>
                    {value === 'all' ? 'Tous' : CHANNEL_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Statut</label>
              <select
                className="w-full rounded-2xl border border-saubio-forest/10 bg-white px-3 py-2 text-sm text-saubio-forest shadow-inner"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as (typeof STATUS_FILTERS)[number]);
                  setPage(1);
                }}
              >
                {STATUS_FILTERS.map((value) => (
                  <option key={value} value={value}>
                    {value === 'all' ? 'Tous' : STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Type</label>
              <select
                className="w-full rounded-2xl border border-saubio-forest/10 bg-white px-3 py-2 text-sm text-saubio-forest shadow-inner"
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value as (typeof TYPE_FILTERS)[number]);
                  setPage(1);
                }}
              >
                {TYPE_FILTERS.map((value) => (
                  <option key={value} value={value}>
                    {value === 'all' ? 'Tous' : TYPE_LABELS[value] ?? value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70 lg:col-span-2">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest"
            >
              Réinitialiser
            </button>
            <span className="inline-flex items-center text-xs text-saubio-slate/60">
              {logsQuery.isFetching ? 'Actualisation…' : logsQuery.data ? `${logsQuery.data.total} notification(s)` : '—'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Canal</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Booking</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {logsQuery.isLoading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="border-b border-saubio-forest/5">
                    <td className="px-3 py-4" colSpan={6}>
                      <Skeleton className="h-5 w-full rounded-full bg-saubio-mist/80" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-saubio-slate/60" colSpan={6}>
                    Aucune notification ne correspond à ces filtres.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className={`cursor-pointer border-b border-saubio-forest/5 transition hover:bg-saubio-mist/50 ${
                      selectedLog?.id === log.id ? 'bg-saubio-mist/60' : ''
                    }`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-3 py-3 text-xs text-saubio-slate/60">{formatDateTime(log.createdAt)}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-saubio-forest">{log.user?.name ?? '—'}</div>
                      <div className="text-xs text-saubio-slate/60">{log.user?.email ?? '—'}</div>
                    </td>
                    <td className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                      {CHANNEL_LABELS[log.channel]}
                    </td>
                    <td className="px-3 py-3 text-sm text-saubio-forest">{TYPE_LABELS[log.type] ?? log.type}</td>
                    <td className="px-3 py-3 text-xs text-saubio-slate/60">{log.booking?.id ?? '—'}</td>
                    <td className="px-3 py-3">
                      <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONES[log.deliveryStatus]}`}>
                        {STATUS_LABELS[log.deliveryStatus]}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-saubio-slate/70">
          <p>
            Page {logsQuery.data?.page ?? page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || logsQuery.isFetching}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= totalPages || logsQuery.isFetching}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Détails de la notification</p>
        {!selectedLog ? (
          <p className="text-sm text-saubio-slate/60">Sélectionnez une ligne pour afficher le détail.</p>
        ) : (
          <div className="space-y-4 text-sm text-saubio-slate/80">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Horodatage</p>
                <p className="font-semibold text-saubio-forest">{formatDateTime(selectedLog.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Statut</p>
                <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONES[selectedLog.deliveryStatus]}`}>
                  {STATUS_LABELS[selectedLog.deliveryStatus]}
                </Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Canal</p>
                <p className="font-semibold text-saubio-forest">{CHANNEL_LABELS[selectedLog.channel]}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Template</p>
                <p className="font-semibold text-saubio-forest">{selectedLog.templateKey ?? '—'}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Utilisateur cible</p>
                {selectedLog.user ? (
                  <>
                    <p className="font-semibold text-saubio-forest">{selectedLog.user.name}</p>
                    <p className="text-xs text-saubio-slate/60">{selectedLog.user.email}</p>
                  </>
                ) : (
                  <p className="text-saubio-slate/60">—</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Booking</p>
                {selectedLog.booking ? (
                  <>
                    <p className="font-semibold text-saubio-forest">{selectedLog.booking.id}</p>
                    <p className="text-xs text-saubio-slate/60">
                      {selectedLog.booking.city ?? '—'} • {selectedLog.booking.service}
                    </p>
                  </>
                ) : (
                  <p className="text-saubio-slate/60">—</p>
                )}
              </div>
            </div>
            {selectedLog.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Erreur</p>
                <p className="font-semibold">{selectedLog.error.code}</p>
                {selectedLog.error.message ? <p className="text-xs">{selectedLog.error.message}</p> : null}
              </div>
            ) : null}
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Payload</p>
              <pre className="mt-2 max-h-64 overflow-auto rounded-2xl border border-saubio-forest/10 bg-saubio-mist/40 p-3 text-xs text-saubio-slate/80">
                {JSON.stringify(selectedLog.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
