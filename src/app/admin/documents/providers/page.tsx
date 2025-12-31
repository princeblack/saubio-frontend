'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SurfaceCard } from '@saubio/ui';
import { useAdminIdentityVerifications, useAdminIdentityDocumentTypes } from '@saubio/utils';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'under_review', label: 'En revue' },
  { value: 'approved', label: 'Validé' },
  { value: 'rejected', label: 'Rejeté' },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border border-amber-100',
  under_review: 'bg-sky-50 text-sky-800 border border-sky-100',
  approved: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-100',
};

const renderReviewStatus = (status: string) => {
  const key = status.toLowerCase();
  const classes = STATUS_COLORS[key] ?? STATUS_COLORS.pending;
  const label = STATUS_OPTIONS.find((option) => option.value === key)?.label ?? status;
  return <span className={`inline-flex rounded-full px-3 py-0.5 text-[11px] font-semibold ${classes}`}>{label}</span>;
};

export default function AdminIdentityPendingPage() {
  const [filters, setFilters] = useState({
    status: 'pending',
    documentType: 'all',
    search: '',
    from: '',
    to: '',
    page: 1,
    limit: 10,
  });

  const documentTypesQuery = useAdminIdentityDocumentTypes();
  const verificationsQuery = useAdminIdentityVerifications({
    status: filters.status !== 'all' ? (filters.status as 'pending' | 'under_review' | 'approved' | 'rejected') : undefined,
    documentType: filters.documentType !== 'all' ? filters.documentType : undefined,
    search: filters.search || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const items = verificationsQuery.data?.items ?? [];
  const total = verificationsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ status: 'pending', documentType: 'all', search: '', from: '', to: '', page: 1, limit: 10 });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Vérifications en attente</h1>
        <p className="text-sm text-saubio-slate/70">Filtrez les dossiers soumis et accédez rapidement à chaque pièce pour prendre une décision.</p>
      </header>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-3 md:grid-cols-5">
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Statut</span>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Type de document</span>
            <select
              name="documentType"
              value={filters.documentType}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            >
              <option value="all">Tous les types</option>
              {(documentTypesQuery.data ?? []).map((doc) => (
                <option key={doc.id} value={doc.code}>
                  {doc.label.fr}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Recherche</span>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="email, ID prestataire, prénom"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Du</span>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Au</span>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest"
          >
            Réinitialiser
          </button>
          <span className="text-saubio-slate/60">{total} dossiers</span>
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
                <th className="px-3 py-2 text-left font-semibold">Statut doc</th>
                <th className="px-3 py-2 text-left font-semibold">Statut profil</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {verificationsQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-4 text-center text-sm text-saubio-slate" colSpan={6}>
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
                    <td className="px-3 py-2">{formatDate(row.submittedAt)}</td>
                    <td className="px-3 py-2 space-y-1 text-xs">
                      {renderReviewStatus(row.status)}
                      {row.underReviewBy ? (
                        <p className="text-saubio-slate/60">Par {row.underReviewBy}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 capitalize">{row.currentStatus.replace('_', ' ')}</td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/documents/providers/${row.providerId}`} className="text-saubio-forest underline">
                        Voir dossier
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center text-sm text-saubio-slate" colSpan={6}>
                    Aucun dossier ne correspond aux filtres sélectionnés.
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
