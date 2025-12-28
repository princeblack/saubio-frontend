'use client';

import { useState } from 'react';
import { SurfaceCard, Skeleton, PrimaryButton } from '@saubio/ui';
import { useAdminFinanceExports } from '@saubio/utils';
import { Download } from 'lucide-react';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().split('T')[0]!;
  return { from: format(from), to: format(to) };
};

export default function AdminExportsPage() {
  const [range, setRange] = useState(defaultRange());
  const exportsQuery = useAdminFinanceExports(range);
  const { data, isLoading, isError } = exportsQuery;

  const handleRangeChange = (partial: Partial<typeof range>) => {
    setRange((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Finances & Paiements</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Exports comptables</h1>
        <p className="text-sm text-saubio-slate/70">
          Préparez les fichiers requis (CSV, Excel, PDF) pour la comptabilité ou les audits financiers.
        </p>
      </header>

      <SurfaceCard className="grid gap-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg md:grid-cols-2 lg:grid-cols-4">
        <div className="text-sm text-saubio-slate/70">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Du</p>
          <input
            type="date"
            value={range.from}
            onChange={(event) => handleRangeChange({ from: event.target.value || range.from })}
            className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
          />
        </div>
        <div className="text-sm text-saubio-slate/70">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Au</p>
          <input
            type="date"
            value={range.to}
            onChange={(event) => handleRangeChange({ to: event.target.value || range.to })}
            className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
          />
        </div>
        <div className="text-sm text-saubio-slate/70">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Période analysée</p>
          <p className="mt-2 font-semibold text-saubio-forest">
            {range.from} → {range.to}
          </p>
        </div>
        <div className="text-sm text-saubio-slate/70">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Exports récents</p>
          <p className="mt-2 font-semibold text-saubio-forest">{data?.recent.length ?? 0}</p>
        </div>
      </SurfaceCard>

      {isError ? (
        <ErrorState
          title="Impossible de charger les exports"
          description="L’API finance ne répond pas. Merci de réessayer."
          onRetry={() => exportsQuery.refetch()}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {isLoading && !data
          ? Array.from({ length: 3 }).map((_, index) => (
              <SurfaceCard key={`export-card-skeleton-${index}`} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-4 h-10 w-32" />
              </SurfaceCard>
            ))
          : null}
        {data?.available.map((item) => (
          <SurfaceCard key={item.type} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="text-sm font-semibold text-saubio-forest">{item.label}</p>
            <p className="text-xs text-saubio-slate/60">{item.description}</p>
            <PrimaryButton
              type="button"
              disabled={!item.enabled}
              className="mt-4 inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {item.enabled ? `Exporter (${item.formats.join(', ').toUpperCase()})` : 'Indisponible'}
            </PrimaryButton>
            {!item.enabled ? (
              <p className="mt-2 text-xs text-saubio-slate/60">Le flux sera activé prochainement.</p>
            ) : null}
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Exports générés récemment</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Période</th>
                <th className="px-3 py-2 text-left font-semibold">Format</th>
                <th className="px-3 py-2 text-left font-semibold">Lien</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`exports-table-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td className="px-3 py-4" colSpan={5}>
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-saubio-slate/60">
                    Aucun export généré pour la période.
                  </td>
                </tr>
              ) : null}
              {data?.recent.map((exportItem) => (
                <tr key={exportItem.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="px-3 py-2">{new Date(exportItem.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="px-3 py-2 capitalize">{exportItem.type}</td>
                  <td className="px-3 py-2 text-saubio-slate/60">
                    {exportItem.from} → {exportItem.to}
                  </td>
                  <td className="px-3 py-2 uppercase">{exportItem.format}</td>
                  <td className="px-3 py-2 text-right text-saubio-forest underline">{exportItem.url ? 'Télécharger' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
