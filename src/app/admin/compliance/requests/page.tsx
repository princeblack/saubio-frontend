'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { SurfaceCard } from '@saubio/ui';
import {
  formatDateTime,
  getAdminGdprRequestDownloadUrl,
  useAdminGdprRequests,
  useConfirmGdprDeletionMutation,
  useCreateGdprRequestMutation,
  useRejectGdprRequestMutation,
  useStartGdprRequestMutation,
} from '@saubio/utils';
import type { AdminGdprRequest } from '@saubio/models';

const statusLabels: Record<AdminGdprRequest['status'], string> = {
  pending: 'En attente',
  processing: 'En traitement',
  completed: 'Terminé',
  rejected: 'Rejeté',
};

const statusStyles: Record<AdminGdprRequest['status'], string> = {
  pending: 'bg-amber-50 text-amber-900 border border-amber-100',
  processing: 'bg-sky-50 text-sky-900 border border-sky-100',
  completed: 'bg-emerald-50 text-emerald-900 border border-emerald-100',
  rejected: 'bg-rose-50 text-rose-900 border border-rose-100',
};

const typeLabels: Record<AdminGdprRequest['type'], string> = {
  export: 'Export',
  deletion: 'Suppression',
  rectification: 'Rectification',
};

const formatDate = (value?: string) => (value ? formatDateTime(value, { dateStyle: 'short', timeStyle: 'short' }) : '—');

export default function AdminComplianceRequestsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
    page: 1,
    limit: 10,
  });
  const [newRequest, setNewRequest] = useState({
    userId: '',
    type: 'export' as AdminGdprRequest['type'],
    reason: '',
  });
  const requestsQuery = useAdminGdprRequests({
    status: filters.status !== 'all' ? (filters.status as AdminGdprRequest['status']) : undefined,
    type: filters.type !== 'all' ? (filters.type as AdminGdprRequest['type']) : undefined,
    q: filters.search || undefined,
    page: filters.page,
    limit: filters.limit,
  });
  const createMutation = useCreateGdprRequestMutation();
  const startMutation = useStartGdprRequestMutation();
  const confirmDeletionMutation = useConfirmGdprDeletionMutation();
  const rejectMutation = useRejectGdprRequestMutation();

  const items = requestsQuery.data?.items ?? [];
  const total = requestsQuery.data?.total ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / filters.limit)), [total, filters.limit]);
  const queryError =
    requestsQuery.isError && requestsQuery.error
      ? requestsQuery.error instanceof Error
        ? requestsQuery.error.message
        : 'Impossible de charger les demandes.'
      : null;

  const handleCreateRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newRequest.userId.trim()) {
      window.alert("L'ID utilisateur est obligatoire.");
      return;
    }
    createMutation.mutate(
      {
        userId: newRequest.userId.trim(),
        type: newRequest.type,
        reason: newRequest.reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNewRequest((prev) => ({ ...prev, userId: '', reason: '' }));
        },
      }
    );
  };

  const handleStart = (request: AdminGdprRequest) => {
    if (request.status !== 'pending') {
      return;
    }
    startMutation.mutate({ id: request.id });
  };

  const handleConfirm = (request: AdminGdprRequest) => {
    if (request.status !== 'processing') {
      return;
    }
    const notes = window.prompt('Notes internes (optionnel) ?') ?? undefined;
    confirmDeletionMutation.mutate({ id: request.id, payload: notes ? { notes } : undefined });
  };

  const handleReject = (request: AdminGdprRequest) => {
    if (request.status === 'completed' || request.status === 'rejected') {
      return;
    }
    const reason = window.prompt('Motif du rejet (obligatoire) ?');
    if (reason === null) {
      return;
    }
    const trimmed = reason.trim();
    if (!trimmed) {
      window.alert('Merci de détailler le motif du rejet.');
      return;
    }
    rejectMutation.mutate({ id: request.id, payload: { reason: trimmed } });
  };

  const handleDownload = (request: AdminGdprRequest) => {
    const url = getAdminGdprRequestDownloadUrl(request.id);
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Demandes RGPD</h1>
        <p className="text-sm text-saubio-slate/70">
          Centralisez les demandes d&apos;export, de rectification et d&apos;effacement avec un suivi complet et auditable.
        </p>
      </header>

      <SurfaceCard className="space-y-6 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/60">Filtres</p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
                <span className="mb-1 block">Statut</span>
                <select
                  value={filters.status}
                  onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value, page: 1 }))}
                  className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="processing">En traitement</option>
                  <option value="completed">Terminé</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </label>

              <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
                <span className="mb-1 block">Type</span>
                <select
                  value={filters.type}
                  onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value, page: 1 }))}
                  className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="export">Export</option>
                  <option value="deletion">Suppression</option>
                  <option value="rectification">Rectification</option>
                </select>
              </label>

              <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70 md:col-span-2">
                <span className="mb-1 block">Recherche</span>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
                  placeholder="Email, ID utilisateur, référence"
                  className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>

          <form className="space-y-3" onSubmit={handleCreateRequest}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/60">Créer une demande</p>
            <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
              <span className="mb-1 block">ID utilisateur</span>
              <input
                type="text"
                value={newRequest.userId}
                onChange={(event) => setNewRequest((prev) => ({ ...prev, userId: event.target.value }))}
                placeholder="usr_1234..."
                className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
              <span className="mb-1 block">Type</span>
              <select
                value={newRequest.type}
                onChange={(event) =>
                  setNewRequest((prev) => ({ ...prev, type: event.target.value as AdminGdprRequest['type'] }))
                }
                className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
              >
                <option value="export">Export</option>
                <option value="deletion">Suppression</option>
                <option value="rectification">Rectification</option>
              </select>
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
              <span className="mb-1 block">Motif (optionnel)</span>
              <textarea
                value={newRequest.reason}
                onChange={(event) => setNewRequest((prev) => ({ ...prev, reason: event.target.value }))}
                placeholder="Demande client #1234..."
                rows={2}
                className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-forest/90 disabled:opacity-40"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Création…' : 'Enregistrer'}
            </button>
          </form>
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-saubio-slate/70">
          <p>
            {total} demande{total > 1 ? 's' : ''} — page {filters.page} / {totalPages}
          </p>
          <label className="flex items-center gap-2">
            <span className="uppercase tracking-[0.3em]">Page</span>
            <select
              value={filters.limit}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  limit: Number(event.target.value),
                  page: 1,
                }))
              }
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Demande</th>
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Dates</th>
                <th className="px-3 py-2 text-left font-semibold">Revue</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requestsQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={5}>
                    Chargement des demandes…
                  </td>
                </tr>
              ) : queryError ? (
                <tr>
                  <td className="px-3 py-6 text-center text-rose-600" colSpan={5}>
                    {queryError}
                  </td>
                </tr>
              ) : items.length ? (
                items.map((request) => (
                  <tr key={request.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-saubio-forest">{request.id}</p>
                      <p className="text-xs text-saubio-slate/60">{typeLabels[request.type]}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold">{request.user.email}</p>
                      <p className="text-xs text-saubio-slate/60">
                        {request.user.id} · {request.user.role}
                      </p>
                      {request.reason ? <p className="mt-1 text-xs text-saubio-slate/70">Motif: {request.reason}</p> : null}
                      {request.rejectReason ? (
                        <p className="mt-1 text-xs text-red-600">Rejet: {request.rejectReason}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <div>
                        <p className="text-saubio-slate/60">Soumis</p>
                        <p className="font-semibold text-saubio-forest">{formatDate(request.createdAt)}</p>
                      </div>
                      {request.startedAt ? (
                        <div className="mt-2">
                          <p className="text-saubio-slate/60">Démarré</p>
                          <p className="font-semibold">{formatDate(request.startedAt)}</p>
                        </div>
                      ) : null}
                      {request.processedAt ? (
                        <div className="mt-2">
                          <p className="text-saubio-slate/60">Traité</p>
                          <p className="font-semibold">{formatDate(request.processedAt)}</p>
                        </div>
                      ) : null}
                      {request.exportExpiresAt ? (
                        <div className="mt-2">
                          <p className="text-saubio-slate/60">Export valable</p>
                          <p className="font-semibold">{formatDate(request.exportExpiresAt)}</p>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {request.startedBy ? (
                        <p>
                          <span className="text-saubio-slate/60">Démarré par </span>
                          <span className="font-semibold">{request.startedBy}</span>
                        </p>
                      ) : null}
                      {request.processedBy ? (
                        <p>
                          <span className="text-saubio-slate/60">Traité par </span>
                          <span className="font-semibold">{request.processedBy}</span>
                        </p>
                      ) : null}
                      {request.rejectedBy ? (
                        <p className="text-red-600">
                          <span className="text-saubio-slate/60">Rejeté par </span>
                          <span className="font-semibold text-red-600">{request.rejectedBy}</span>
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-2 text-xs font-semibold">
                        {request.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => handleStart(request)}
                            disabled={startMutation.isPending}
                            className="rounded-full border border-saubio-forest/30 px-3 py-1 text-saubio-forest hover:bg-saubio-forest/5 disabled:opacity-40"
                          >
                            Démarrer
                          </button>
                        ) : null}
                        {request.type === 'export' && request.exportAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(request)}
                            className="rounded-full border border-saubio-forest/30 px-3 py-1 text-saubio-forest hover:bg-saubio-forest/5"
                          >
                            Télécharger export
                          </button>
                        ) : null}
                        {request.status === 'processing' && request.type !== 'export' ? (
                          <button
                            type="button"
                            onClick={() => handleConfirm(request)}
                            disabled={confirmDeletionMutation.isPending}
                            className="rounded-full border border-emerald-500/40 px-3 py-1 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                          >
                            {request.type === 'deletion' ? 'Confirmer suppression' : 'Confirmer traitement'}
                          </button>
                        ) : null}
                        {request.status !== 'completed' && request.status !== 'rejected' ? (
                          <button
                            type="button"
                            onClick={() => handleReject(request)}
                            disabled={rejectMutation.isPending}
                            className="rounded-full border border-rose-400/50 px-3 py-1 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                          >
                            Rejeter
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={5}>
                    Aucun dossier ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="rounded-full border border-saubio-forest/20 px-4 py-2 disabled:opacity-30"
            disabled={filters.page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          >
            Précédent
          </button>
          <button
            type="button"
            className="rounded-full border border-saubio-forest/20 px-4 py-2 disabled:opacity-30"
            disabled={filters.page >= totalPages}
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
          >
            Suivant
          </button>
        </div>
      </SurfaceCard>
    </div>
  );
}
