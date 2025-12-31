'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SurfaceCard } from '@saubio/ui';
import {
  useAdminIdentityVerifications,
  useAdminIdentityDocumentTypes,
  useResetIdentityVerificationMutation,
} from '@saubio/utils';

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminVerifiedProvidersPage() {
  const [filters, setFilters] = useState({ documentType: 'all', search: '', page: 1, limit: 10 });
  const documentTypesQuery = useAdminIdentityDocumentTypes();
  const verificationsQuery = useAdminIdentityVerifications({
    status: 'approved',
    documentType: filters.documentType !== 'all' ? filters.documentType : undefined,
    search: filters.search || undefined,
    page: filters.page,
    limit: filters.limit,
  });
  const resetMutation = useResetIdentityVerificationMutation();

  const items = verificationsQuery.data?.items ?? [];
  const total = verificationsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  const handleRevoke = (providerId: string, documentId: string) => {
    const reason = window.prompt('Motif de la révocation ?');
    if (reason === null) {
      return;
    }
    const normalized = reason.trim();
    if (normalized.length < 3) {
      alert('Merci de préciser un motif (3 caractères minimum).');
      return;
    }
    resetMutation.mutate({ providerId, documentId, reason: normalized });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Prestataires vérifiés</h1>
        <p className="text-sm text-saubio-slate/70">Consultez les prestataires validés et révoquez une vérification en cas d’anomalie.</p>
      </header>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Type de document</span>
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

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70 md:col-span-2">
            <span className="mb-1 block">Recherche</span>
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
              placeholder="Nom, email ou ID prestataire"
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
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Type doc</th>
                <th className="px-3 py-2 text-left font-semibold">Validé le</th>
                <th className="px-3 py-2 text-left font-semibold">Validé par</th>
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
                    <td className="px-3 py-2">{formatDate(row.reviewedAt)}</td>
                    <td className="px-3 py-2">{row.reviewer ?? '—'}</td>
                    <td className="px-3 py-2 space-x-3">
                      <Link href={`/admin/documents/providers/${row.providerId}`} className="text-saubio-forest underline">
                        Voir dossier
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRevoke(row.providerId, row.id)}
                        className="text-xs font-semibold text-red-600 underline"
                        disabled={resetMutation.isPending}
                      >
                        Révoquer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={5}>
                    Aucun prestataire vérifié ne correspond aux filtres.
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
