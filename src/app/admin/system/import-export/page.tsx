'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  formatDateTime,
  useAdminSystemExportJobs,
  useAdminSystemImportJobs,
} from '@saubio/utils';

const JOB_STATUSES = [
  { label: 'Tous', value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'En cours', value: 'processing' },
  { label: 'Terminés', value: 'completed' },
  { label: 'Échoués', value: 'failed' },
] as const;

const IMPORT_ENTITIES = [
  { label: 'Toutes entités', value: 'all' },
  { label: 'Utilisateurs', value: 'users' },
  { label: 'Prestataires', value: 'providers' },
  { label: 'Bookings', value: 'bookings' },
  { label: 'Paiements', value: 'payments' },
  { label: 'Zones', value: 'zones' },
  { label: 'Services', value: 'services' },
] as const;

const EXPORT_TYPES = [
  { label: 'Bookings', value: 'bookings' },
  { label: 'Paiements', value: 'payments' },
  { label: 'Prestataires', value: 'providers' },
  { label: 'Clients', value: 'clients' },
  { label: 'Disputes', value: 'disputes' },
  { label: 'Finance', value: 'finance' },
] as const;

const statusTone: Record<string, string> = {
  pending: 'bg-saubio-slate/10 text-saubio-slate/80',
  processing: 'bg-saubio-sun/10 text-saubio-sun/80',
  completed: 'bg-emerald-50 text-emerald-900',
  failed: 'bg-rose-50 text-rose-900',
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'processing':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    case 'failed':
      return 'Échoué';
    default:
      return 'En attente';
  }
};

const INITIAL_IMPORT_FILTERS = { status: 'all', entity: 'all' };
const INITIAL_EXPORT_FILTERS = { status: 'all', type: 'all' };

export default function AdminSystemImportExportPage() {
  const [importFilters, setImportFilters] = useState(INITIAL_IMPORT_FILTERS);
  const [exportFilters, setExportFilters] = useState(INITIAL_EXPORT_FILTERS);

  const importQuery = useAdminSystemImportJobs({
    page: 1,
    pageSize: 15,
    status: importFilters.status === 'all' ? undefined : (importFilters.status as 'pending' | 'processing' | 'completed' | 'failed'),
    entity: importFilters.entity === 'all' ? undefined : (importFilters.entity as typeof importFilters.entity),
  });

  const exportQuery = useAdminSystemExportJobs({
    page: 1,
    pageSize: 10,
    status: exportFilters.status === 'all' ? undefined : (exportFilters.status as 'pending' | 'processing' | 'completed' | 'failed'),
    type: exportFilters.type === 'all' ? undefined : (exportFilters.type as typeof exportFilters.type),
  });

  const imports = importQuery.data?.items ?? [];
  const exports = exportQuery.data?.items ?? [];

  const runningImports = useMemo(() => imports.filter((job) => job.status === 'processing').length, [imports]);
  const failedImports = useMemo(() => imports.filter((job) => job.status === 'failed').length, [imports]);
  const runningExports = useMemo(() => exports.filter((job) => job.status === 'processing').length, [exports]);
  const availableExports = useMemo(() => exports.filter((job) => job.fileUrl).length, [exports]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Import / export</h1>
            <p className="text-sm text-saubio-slate/70">
              Suivez les traitements CSV/JSON (zones, prestataires, pricing) et récupérez les exports (bookings, paiements, RGPD).
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => importQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
              disabled={importQuery.isFetching}
            >
              {importQuery.isFetching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Rafraîchir
            </button>
            <button
              type="button"
              onClick={() => exportQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
              disabled={exportQuery.isFetching}
            >
              {exportQuery.isFetching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Export
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Imports en cours', value: importQuery.isLoading ? '…' : runningImports },
          { label: 'Imports en erreur', value: importQuery.isLoading ? '…' : failedImports },
          { label: 'Exports en cours', value: exportQuery.isLoading ? '…' : runningExports },
          { label: 'Exports prêts au téléchargement', value: exportQuery.isLoading ? '…' : availableExports },
        ].map((card) => (
          <SurfaceCard
            key={card.label}
            className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-saubio-slate/80 shadow-soft-lg"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Imports récents</p>
            <p className="text-xs text-saubio-slate/60">
              CSV/JSON envoyés par les équipes Ops (prestataires, zones, mass-update prix).
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2 text-xs">
            <label className="text-saubio-slate/60">
              Statut
              <select
                value={importFilters.status}
                onChange={(event) => setImportFilters((prev) => ({ ...prev, status: event.target.value }))}
                className="ml-2 rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest focus:border-saubio-forest focus:outline-none"
              >
                {JOB_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-saubio-slate/60">
              Entité
              <select
                value={importFilters.entity}
                onChange={(event) => setImportFilters((prev) => ({ ...prev, entity: event.target.value }))}
                className="ml-2 rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest focus:border-saubio-forest focus:outline-none"
              >
                {IMPORT_ENTITIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Format</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Traitement</th>
                <th className="px-3 py-2 text-left font-semibold">Créé par</th>
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
              </tr>
            </thead>
            <tbody>
              {importQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : imports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun import pour ces filtres.
                  </td>
                </tr>
              ) : (
                imports.map((job) => (
                  <tr key={job.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      <div>{job.label}</div>
                      <p className="text-xs text-saubio-slate/50">Type {job.entity}</p>
                    </td>
                    <td className="px-3 py-2 uppercase">{job.format}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[job.status]}`}>
                        {formatStatus(job.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {job.status === 'processing'
                        ? `${job.processedCount} éléments traités`
                        : job.totalCount
                          ? `${job.processedCount}/${job.totalCount}`
                          : `${job.processedCount}`}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{job.createdBy?.name ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      Créé {formatDateTime(job.createdAt)}
                      {job.completedAt ? (
                        <span className="block text-[11px] text-saubio-slate/50">
                          Terminé {formatDateTime(job.completedAt)}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button className="mt-4 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">
          Nouvel import CSV / JSON
        </button>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Exports générés</p>
            <p className="text-xs text-saubio-slate/60">
              Tableaux destinés à la BI, à la finance ou aux demandes RGPD (liens sécurisés).
            </p>
          </div>
          <div className="ml-auto flex gap-2 text-xs">
            <label className="text-saubio-slate/60">
              Statut
              <select
                value={exportFilters.status}
                onChange={(event) => setExportFilters((prev) => ({ ...prev, status: event.target.value }))}
                className="ml-2 rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest focus:border-saubio-forest focus:outline-none"
              >
                {JOB_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-saubio-slate/60">
              Type
              <select
                value={exportFilters.type}
                onChange={(event) => setExportFilters((prev) => ({ ...prev, type: event.target.value }))}
                className="ml-2 rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest focus:border-saubio-forest focus:outline-none"
              >
                <option value="all">Tous</option>
                {EXPORT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Fichier</th>
                <th className="px-3 py-2 text-left font-semibold">Demandé par</th>
                <th className="px-3 py-2 text-left font-semibold">Disponibilité</th>
              </tr>
            </thead>
            <tbody>
              {exportQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : exports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun export enregistré.
                  </td>
                </tr>
              ) : (
                exports.map((job) => (
                  <tr key={job.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{job.label}</td>
                    <td className="px-3 py-2 text-xs uppercase text-saubio-slate/60">{job.type}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[job.status]}`}>
                        {formatStatus(job.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {job.fileUrl ? (
                        <a href={job.fileUrl} className="font-semibold text-saubio-forest underline" target="_blank" rel="noreferrer">
                          Télécharger
                        </a>
                      ) : (
                        '—'
                      )}
                      {job.expiresAt ? (
                        <span className="block text-[11px] text-saubio-slate/50">
                          Expire {formatDateTime(job.expiresAt)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{job.requestedBy?.name ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      Généré {formatDateTime(job.createdAt)}
                      {job.completedAt ? (
                        <span className="block text-[11px] text-saubio-slate/50">
                          Terminé {formatDateTime(job.completedAt)}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXPORT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            >
              Nouveau export {type.label}
            </button>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
