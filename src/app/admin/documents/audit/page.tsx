'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { SurfaceCard } from '@saubio/ui';
import { formatDateTime, useAdminIdentityAudit } from '@saubio/utils';

const ACTION_OPTIONS = [
  { value: 'all', label: 'Toutes les actions' },
  { value: 'submitted', label: 'Soumission' },
  { value: 'under_review', label: 'En revue' },
  { value: 'approved', label: 'Validation' },
  { value: 'rejected', label: 'Rejet' },
  { value: 'reset', label: 'Réinitialisation' },
  { value: 'requested_document', label: 'Demande de reupload' },
  { value: 'note', label: 'Note interne' },
];

const formatDate = (value?: string) => (value ? formatDateTime(value, { dateStyle: 'short', timeStyle: 'short' }) : '—');

export default function AdminDocumentsAuditPage() {
  const [filters, setFilters] = useState({
    providerId: '',
    actorId: '',
    documentId: '',
    action: 'all',
    from: '',
    to: '',
    page: 1,
    limit: 20,
  });
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const auditQuery = useAdminIdentityAudit({
    providerId: filters.providerId.trim() || undefined,
    actorId: filters.actorId.trim() || undefined,
    documentId: filters.documentId.trim() || undefined,
    action: filters.action !== 'all' ? filters.action.toUpperCase() : undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const items = auditQuery.data?.items ?? [];
  const total = auditQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const loading = auditQuery.isLoading;

  const selectedEntry = useMemo(() => {
    if (!items.length) {
      return undefined;
    }
    if (selectedEntryId) {
      return items.find((entry) => entry.id === selectedEntryId) ?? items[0];
    }
    return items[0];
  }, [items, selectedEntryId]);

  useEffect(() => {
    if (!selectedEntryId && items.length) {
      setSelectedEntryId(items[0].id);
    }
  }, [items, selectedEntryId]);

  const handleFilterChange =
    (key: keyof typeof filters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = key === 'limit' ? Number(event.target.value) : event.target.value;
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: 1,
      }));
    };

  const resetFilters = () => {
    setFilters({ providerId: '', actorId: '', documentId: '', action: 'all', from: '', to: '', page: 1, limit: 20 });
    setSelectedEntryId(null);
  };

  const handlePageChange = (delta: number) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(Math.max(1, prev.page + delta), totalPages),
    }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Audit & traçabilité</h1>
        <p className="text-sm text-saubio-slate/70">
          Filtrez toutes les actions menées sur les dossiers prestataires (soumission, révision, décisions, relances) pour garantir une
          traçabilité complète.
        </p>
      </header>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Prestataire ID</span>
            <input
              type="text"
              value={filters.providerId}
              onChange={handleFilterChange('providerId')}
              placeholder="prov_xxx"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Acteur (employé)</span>
            <input
              type="text"
              value={filters.actorId}
              onChange={handleFilterChange('actorId')}
              placeholder="usr_xxx"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Document ID</span>
            <input
              type="text"
              value={filters.documentId}
              onChange={handleFilterChange('documentId')}
              placeholder="doc_xxx"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Action</span>
            <select value={filters.action} onChange={handleFilterChange('action')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm">
              {ACTION_OPTIONS.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Depuis</span>
            <input type="date" value={filters.from} onChange={handleFilterChange('from')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Jusqu&apos;à</span>
            <input type="date" value={filters.to} onChange={handleFilterChange('to')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Résultats / page</span>
            <select value={filters.limit} onChange={handleFilterChange('limit')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm">
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-saubio-forest"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-saubio-slate/70">
            <p>
              {total} événements · Page {filters.page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(-1)}
                disabled={filters.page <= 1 || loading}
                className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-30"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={filters.page >= totalPages || loading}
                className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-30"
              >
                Suivant
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Action</th>
                  <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                  <th className="px-3 py-2 text-left font-semibold">Document</th>
                  <th className="px-3 py-2 text-left font-semibold">Acteur</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-5 text-center" colSpan={5}>
                      Chargement de l&apos;audit…
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`cursor-pointer border-b border-saubio-forest/5 transition hover:bg-saubio-mist/10 ${
                        selectedEntry?.id === entry.id ? 'bg-saubio-mist/15' : ''
                      }`}
                      onClick={() => setSelectedEntryId(entry.id)}
                    >
                      <td className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-saubio-slate/70">{formatDate(entry.createdAt)}</td>
                      <td className="px-3 py-2 font-semibold capitalize text-saubio-forest">{entry.action.replace('_', ' ')}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-saubio-forest">{entry.providerName}</span>
                          <span className="text-saubio-slate/60">{entry.providerId}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/70">
                        {entry.documentLabel ?? '—'}
                        {entry.documentId ? <div className="text-[11px] text-saubio-slate/60">{entry.documentId}</div> : null}
                      </td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/70">
                        {entry.actorLabel ?? 'Système'}
                        {entry.actorId ? <div className="text-[11px] text-saubio-slate/60">{entry.actorId}</div> : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-5 text-center" colSpan={5}>
                      Aucun événement ne correspond aux filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-sm font-semibold text-saubio-forest">Détails de l&apos;événement</p>
          {selectedEntry ? (
            <div className="space-y-3 text-sm text-saubio-slate/80">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/60">Prestataire</p>
                <p className="font-semibold text-saubio-forest">{selectedEntry.providerName}</p>
                <p className="text-xs text-saubio-slate/60">{selectedEntry.providerEmail ?? selectedEntry.providerId}</p>
                <Link href={`/admin/documents/providers/${selectedEntry.providerId}`} className="text-xs font-semibold text-saubio-forest underline">
                  Ouvrir le dossier
                </Link>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/60">Action</p>
                <p className="font-semibold text-saubio-forest uppercase tracking-[0.15em]">{selectedEntry.action.replace('_', ' ')}</p>
                <p className="text-xs text-saubio-slate/60">{formatDate(selectedEntry.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/60">Document</p>
                <p className="font-semibold text-saubio-forest">{selectedEntry.documentLabel ?? '—'}</p>
                <p className="text-xs text-saubio-slate/60">{selectedEntry.documentId ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/60">Acteur</p>
                <p className="font-semibold text-saubio-forest">{selectedEntry.actorLabel ?? 'Système'}</p>
                <p className="text-xs text-saubio-slate/60">{selectedEntry.actorId ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/60">Payload</p>
                {selectedEntry.payload ? (
                  <pre className="max-h-64 overflow-auto rounded-2xl border border-saubio-mist/60 bg-saubio-mist/20 p-3 text-xs text-saubio-slate/80">
                    {JSON.stringify(selectedEntry.payload, null, 2)}
                  </pre>
                ) : (
                  <p className="text-xs text-saubio-slate/60">—</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-saubio-slate/70">Sélectionnez un événement dans la liste pour afficher les détails.</p>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
