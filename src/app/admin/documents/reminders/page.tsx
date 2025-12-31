'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SurfaceCard } from '@saubio/ui';
import {
  useAdminIdentityVerifications,
  useAdminIdentityDocumentTypes,
  useAdminIdentityAudit,
  useResetIdentityVerificationMutation,
} from '@saubio/utils';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const AUDIT_ACTIONS = [
  { value: 'all', label: 'Toutes les actions' },
  { value: 'REJECTED', label: 'Rejet' },
  { value: 'RESET', label: 'Réinitialisation' },
  { value: 'REQUESTED_DOCUMENT', label: 'Demande de reupload' },
  { value: 'APPROVED', label: 'Validation' },
];

export default function AdminIdentityRejectionsPage() {
  const [filters, setFilters] = useState({ search: '', documentType: 'all', page: 1, limit: 10 });
  const [auditFilters, setAuditFilters] = useState({ providerId: '', action: 'all', from: '', to: '', page: 1 });
  const documentTypesQuery = useAdminIdentityDocumentTypes();
  const verificationsQuery = useAdminIdentityVerifications({
    status: 'rejected',
    search: filters.search || undefined,
    documentType: filters.documentType !== 'all' ? filters.documentType : undefined,
    page: filters.page,
    limit: filters.limit,
  });
  const auditQuery = useAdminIdentityAudit({
    providerId: auditFilters.providerId || undefined,
    action: auditFilters.action !== 'all' ? auditFilters.action : undefined,
    from: auditFilters.from || undefined,
    to: auditFilters.to || undefined,
    page: auditFilters.page,
    limit: 10,
  });
  const resetMutation = useResetIdentityVerificationMutation();

  const items = verificationsQuery.data?.items ?? [];
  const total = verificationsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  const auditEntries = auditQuery.data?.items ?? [];
  const auditPages = Math.max(1, Math.ceil((auditQuery.data?.total ?? 0) / 10));

  const handleReopen = (providerId: string, documentId: string) => {
    const reason = window.prompt('Motif envoyé au prestataire ?');
    if (reason === null) {
      return;
    }
    const normalized = reason.trim();
    if (normalized.length < 3) {
      alert('Merci de renseigner un motif (minimum 3 caractères).');
      return;
    }
    resetMutation.mutate({ providerId, documentId, reason: normalized });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Rejets & historique</h1>
        <p className="text-sm text-saubio-slate/70">Analysez les rejets récents, documentez les motifs et relancez les prestataires si nécessaire.</p>
      </header>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Recherche</span>
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
              placeholder="Email, ID prestataire…"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Type doc</span>
            <select
              value={filters.documentType}
              onChange={(event) => setFilters((prev) => ({ ...prev, documentType: event.target.value, page: 1 }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            >
              <option value="all">Tous</option>
              {(documentTypesQuery.data ?? []).map((doc) => (
                <option key={doc.id} value={doc.code}>
                  {doc.label.fr}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Type doc</th>
                <th className="px-3 py-2 text-left font-semibold">Soumis le</th>
                <th className="px-3 py-2 text-left font-semibold">Motif</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {verificationsQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={5}>
                    Chargement…
                  </td>
                </tr>
              ) : items.length ? (
                items.map((row) => (
                  <tr key={row.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      <div className="flex flex-col">
                        <span>{row.providerName}</span>
                        <span className="text-xs text-saubio-slate/60">{row.providerEmail}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">{row.documentLabel}</td>
                    <td className="px-3 py-2">{formatDateTime(row.submittedAt)}</td>
                    <td className="px-3 py-2 text-saubio-slate/80">{row.reason ?? '—'}</td>
                    <td className="px-3 py-2 space-x-3">
                      <Link href={`/admin/documents/providers/${row.providerId}`} className="text-saubio-forest underline">
                        Voir dossier
                      </Link>
                      <button
                        type="button"
                        className="text-xs font-semibold text-saubio-forest underline"
                        onClick={() => handleReopen(row.providerId, row.id)}
                        disabled={resetMutation.isPending}
                      >
                        Réouvrir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={5}>
                    Aucun rejet récent.
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

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={auditFilters.providerId}
            onChange={(event) => setAuditFilters((prev) => ({ ...prev, providerId: event.target.value, page: 1 }))}
            placeholder="Filtrer par ID prestataire"
            className="flex-1 rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
          />
          <select
            value={auditFilters.action}
            onChange={(event) => setAuditFilters((prev) => ({ ...prev, action: event.target.value, page: 1 }))}
            className="rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
          >
            {AUDIT_ACTIONS.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={auditFilters.from}
            onChange={(event) => setAuditFilters((prev) => ({ ...prev, from: event.target.value, page: 1 }))}
            className="rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={auditFilters.to}
            onChange={(event) => setAuditFilters((prev) => ({ ...prev, to: event.target.value, page: 1 }))}
            className="rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Action</th>
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Effectuée par</th>
                <th className="px-3 py-2 text-left font-semibold">Détails</th>
              </tr>
            </thead>
            <tbody>
              {auditQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={5}>
                    Chargement de l’audit…
                  </td>
                </tr>
              ) : auditEntries.length ? (
                auditEntries.map((entry) => (
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
                    <td className="px-3 py-2 text-xs text-saubio-slate/70">
                      {entry.documentLabel ? `${entry.documentLabel} · ` : ''}
                      {entry.payload?.reason ?? entry.payload?.notes ?? '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={5}>
                    Aucun événement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-saubio-slate/70">
            Page {auditFilters.page} / {auditPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-30"
              disabled={auditFilters.page <= 1}
              onClick={() => setAuditFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              Précédent
            </button>
            <button
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-30"
              disabled={auditFilters.page >= auditPages}
              onClick={() => setAuditFilters((prev) => ({ ...prev, page: Math.min(auditPages, prev.page + 1) }))}
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
