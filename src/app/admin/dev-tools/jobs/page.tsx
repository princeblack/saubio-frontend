'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import type { AdminSystemExportJobItem, AdminSystemImportJobItem, SystemDataJobStatus } from '@saubio/models';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAdminSystemExportJobs, useAdminSystemImportJobs } from '@saubio/utils';

const STATUS_OPTIONS: Array<{ label: string; value: 'all' | SystemDataJobStatus }> = [
  { label: 'Tous', value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'En cours', value: 'processing' },
  { label: 'Terminé', value: 'completed' },
  { label: 'Échoué', value: 'failed' },
];

const PAGE_SIZE = 15;

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function AdminDevToolsJobsPage() {
  const [tab, setTab] = useState<'imports' | 'exports'>('imports');
  const [importFilters, setImportFilters] = useState({ status: 'all' as 'all' | SystemDataJobStatus, search: '' });
  const [exportFilters, setExportFilters] = useState({ status: 'all' as 'all' | SystemDataJobStatus, search: '' });
  const [importPage, setImportPage] = useState(1);
  const [exportPage, setExportPage] = useState(1);

  const importQueryParams = useMemo(
    () => ({
      page: importPage,
      pageSize: PAGE_SIZE,
      status: importFilters.status === 'all' ? undefined : importFilters.status,
      search: importFilters.search || undefined,
    }),
    [importFilters, importPage]
  );
  const exportQueryParams = useMemo(
    () => ({
      page: exportPage,
      pageSize: PAGE_SIZE,
      status: exportFilters.status === 'all' ? undefined : exportFilters.status,
      search: exportFilters.search || undefined,
    }),
    [exportFilters, exportPage]
  );

  const importQuery = useAdminSystemImportJobs(importQueryParams);
  const exportQuery = useAdminSystemExportJobs(exportQueryParams);

  const activeQuery = tab === 'imports' ? importQuery : exportQuery;
  const activeData = activeQuery.data;
  const totalPages = activeData ? Math.max(1, Math.ceil(activeData.total / activeData.pageSize)) : 1;

  const handleRefresh = () => {
    void importQuery.refetch();
    void exportQuery.refetch();
  };

  const renderRows = () => {
    if (tab === 'imports') {
      const items = importQuery.data?.items ?? [];
      if (importQuery.isLoading) {
        return (
          <tr>
            <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Chargement des jobs import…
            </td>
          </tr>
        );
      }
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
              Aucun job import ne correspond à ces filtres.
            </td>
          </tr>
        );
      }
      return items.map((job) => <ImportRow key={job.id} job={job} />);
    }
    const items = exportQuery.data?.items ?? [];
    if (exportQuery.isLoading) {
      return (
        <tr>
          <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
            Chargement des jobs export…
          </td>
        </tr>
      );
    }
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
            Aucun job export ne correspond à ces filtres.
          </td>
        </tr>
      );
    }
    return items.map((job) => <ExportRow key={job.id} job={job} />);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Jobs queue & data</h1>
            <p className="text-sm text-saubio-slate/70">
              Import/export CSV, synchronisations CRM, génération de rapports – données issues de l&apos;API /employee/system.
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            onClick={handleRefresh}
            disabled={importQuery.isFetching || exportQuery.isFetching}
          >
            {importQuery.isFetching || exportQuery.isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Rafraîchir
          </button>
        </div>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap gap-2 text-xs text-saubio-slate/70">
          {(['imports', 'exports'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-full px-4 py-1.5 font-semibold ${
                tab === value ? 'bg-saubio-forest text-white' : 'border border-saubio-forest/20 text-saubio-forest'
              }`}
            >
              {value === 'imports' ? 'Jobs import' : 'Jobs export'}
            </button>
          ))}
        </div>

        <div className="mb-3 grid gap-3 md:grid-cols-3">
          <label className="text-xs text-saubio-slate/60">
            Statut
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              value={tab === 'imports' ? importFilters.status : exportFilters.status}
              onChange={(event) => {
                if (tab === 'imports') {
                  setImportFilters((prev) => ({ ...prev, status: event.target.value as 'all' | SystemDataJobStatus }));
                  setImportPage(1);
                } else {
                  setExportFilters((prev) => ({ ...prev, status: event.target.value as 'all' | SystemDataJobStatus }));
                  setExportPage(1);
                }
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-saubio-slate/60 md:col-span-2">
            Recherche (label, fichier…)
            <input
              type="text"
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              value={tab === 'imports' ? importFilters.search : exportFilters.search}
              onChange={(event) => {
                if (tab === 'imports') {
                  setImportFilters((prev) => ({ ...prev, search: event.target.value }));
                  setImportPage(1);
                } else {
                  setExportFilters((prev) => ({ ...prev, search: event.target.value }));
                  setExportPage(1);
                }
              }}
              placeholder="newsletter.csv, payout-report..."
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Job</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">{tab === 'imports' ? 'Progression' : 'Résultat'}</th>
                <th className="px-3 py-2 text-left font-semibold">Créé</th>
                <th className="px-3 py-2 text-left font-semibold">Derniere mise à jour</th>
                <th className="px-3 py-2 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-saubio-slate/60">
          <p>
            Page {tab === 'imports' ? importPage : exportPage} / {totalPages}
          </p>
          <div className="space-x-2">
            <button
              type="button"
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
              onClick={() => (tab === 'imports' ? setImportPage((page) => Math.max(1, page - 1)) : setExportPage((page) => Math.max(1, page - 1)))}
              disabled={(tab === 'imports' ? importPage : exportPage) <= 1}
            >
              Précédent
            </button>
            <button
              type="button"
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
              onClick={() =>
                tab === 'imports'
                  ? setImportPage((page) => Math.min(totalPages, page + 1))
                  : setExportPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={(tab === 'imports' ? importPage : exportPage) >= totalPages}
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

const JobStatusChip = ({ status }: { status: SystemDataJobStatus }) => {
  const tone =
    status === 'completed'
      ? 'bg-emerald-50 text-emerald-900'
      : status === 'failed'
      ? 'bg-rose-50 text-rose-900'
      : status === 'processing'
      ? 'bg-saubio-sun/10 text-saubio-sun/80'
      : 'bg-saubio-slate/10 text-saubio-slate/70';
  const label =
    status === 'completed'
      ? 'Terminé'
      : status === 'failed'
      ? 'Échoué'
      : status === 'processing'
      ? 'En cours'
      : 'En attente';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
};

const ImportRow = ({ job }: { job: AdminSystemImportJobItem }) => (
  <tr className="border-b border-saubio-forest/5 last:border-none">
    <td className="px-3 py-2">
      <p className="font-semibold text-saubio-forest">{job.label}</p>
      <p className="text-xs text-saubio-slate/60">{job.entity}</p>
    </td>
    <td className="px-3 py-2">
      <JobStatusChip status={job.status} />
    </td>
    <td className="px-3 py-2 text-xs text-saubio-slate/70">
      {job.processedCount}/{job.totalCount ?? '—'} lignes
    </td>
    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(job.createdAt)}</td>
    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(job.updatedAt)}</td>
    <td className="px-3 py-2 text-xs text-saubio-slate/70">
      {job.errorMessage ? <span className="text-rose-700">{job.errorMessage}</span> : job.sourceFilename ?? '—'}
    </td>
  </tr>
);

const ExportRow = ({ job }: { job: AdminSystemExportJobItem }) => (
  <tr className="border-b border-saubio-forest/5 last:border-none">
    <td className="px-3 py-2">
      <p className="font-semibold text-saubio-forest">{job.label}</p>
      <p className="text-xs text-saubio-slate/60">{job.type}</p>
    </td>
    <td className="px-3 py-2">
      <JobStatusChip status={job.status} />
    </td>
    <td className="px-3 py-2 text-xs text-saubio-slate/70">
      {job.recordCount ? `${job.recordCount} enregistrements` : '—'}
    </td>
    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(job.createdAt)}</td>
    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(job.updatedAt)}</td>
    <td className="px-3 py-2 text-xs text-saubio-slate/70">
      {job.errorMessage ? (
        <span className="text-rose-700">{job.errorMessage}</span>
      ) : job.fileUrl ? (
        <a href={job.fileUrl} className="text-saubio-forest underline" target="_blank" rel="noreferrer">
          Télécharger
        </a>
      ) : (
        '—'
      )}
    </td>
  </tr>
);
