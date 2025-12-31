'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SurfaceCard } from '@saubio/ui';
import { useAdminIdentityAudit } from '@saubio/utils';

const ACTION_OPTIONS = [
  { value: 'all', label: 'Toutes les actions' },
  { value: 'SUBMITTED', label: 'Soumission' },
  { value: 'UNDER_REVIEW', label: 'Ouverture dossier' },
  { value: 'APPROVED', label: 'Validation' },
  { value: 'REJECTED', label: 'Rejet' },
  { value: 'RESET', label: 'Réinitialisation' },
  { value: 'REQUESTED_DOCUMENT', label: 'Reupload demandé' },
];

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminIdentityAuditPage() {
  const [filters, setFilters] = useState({ providerId: '', actorId: '', action: 'all', from: '', to: '', page: 1 });
  const auditQuery = useAdminIdentityAudit({
    providerId: filters.providerId || undefined,
    actorId: filters.actorId || undefined,
    action: filters.action !== 'all' ? filters.action : undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
    limit: 20,
  });

  const entries = auditQuery.data?.items ?? [];
  const total = auditQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Audit & traçabilité</h1>
        <p className="text-sm text-saubio-slate/70">Consultez chaque action (prestataire ou admin) pour reconstituer le workflow complet.</p>
      </header>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">ID prestataire</span>
            <input
              type="text"
              value={filters.providerId}
              onChange={(event) => setFilters((prev) => ({ ...prev, providerId: event.target.value, page: 1 }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">ID agent</span>
            <input
              type="text"
              value={filters.actorId}
              onChange={(event) => setFilters((prev) => ({ ...prev, actorId: event.target.value, page: 1 }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Action</span>
            <select
              value={filters.action}
              onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value, page: 1 }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Du</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value, page: 1 }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Au</span>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value, page: 1 }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
                <th className="px-3 py-2 text-left font-semibold">Action</th>
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Effectué par</th>
                <th className="px-3 py-2 text-left font-semibold">Document</th>
                <th className="px-3 py-2 text-left font-semibold">Détails</th>
              </tr>
            </thead>
            <tbody>
              {auditQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={6}>
                    Chargement…
                  </td>
                </tr>
              ) : entries.length ? (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2">{formatDateTime(entry.createdAt)}</td>
                    <td className="px-3 py-2 capitalize">{entry.action.replace('_', ' ').toLowerCase()}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-saubio-forest">{entry.providerName}</span>
                        <span className="text-xs text-saubio-slate/60">{entry.providerEmail}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">{entry.actorLabel ?? 'Automatique'}</td>
                    <td className="px-3 py-2">
                      {entry.documentId ? (
                        <Link href={`/admin/documents/providers/${entry.providerId}`} className="underline">
                          {entry.documentLabel ?? 'Voir dossier'}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/70">
                      {entry.payload?.reason ?? entry.payload?.notes ?? '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={6}>
                    Aucun événement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-saubio-slate/70">
            Page {filters.page} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-30"
              disabled={filters.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              Précédent
            </button>
            <button
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-30"
              disabled={filters.page >= totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
