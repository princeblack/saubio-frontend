'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { useAdminQualityIncidents, useUpdateAdminQualityIncident } from '@saubio/utils';

const STATUS_OPTIONS = [
  { label: 'Tous', value: undefined },
  { label: 'Ouverts', value: 'open' },
  { label: 'Analyse', value: 'under_review' },
  { label: 'Action requise', value: 'action_required' },
  { label: 'Résolus', value: 'resolved' },
];

const SEVERITIES: Record<'low' | 'medium' | 'high', string> = {
  low: 'Faible',
  medium: 'Modérée',
  high: 'Critique',
};

export default function AdminFeedbackIncidentsPage() {
  const [filters, setFilters] = useState<{ status?: string; severity?: string; page: number }>({ page: 1 });
  const params = useMemo(
    () => ({ page: filters.page, pageSize: 25, status: filters.status, severity: filters.severity }),
    [filters]
  );
  const incidentsQuery = useAdminQualityIncidents(params);
  const updateIncidentMutation = useUpdateAdminQualityIncident();

  const data = incidentsQuery.data;
  const totalPages = data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1;

  const handleChange = (next: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Feedback & qualité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Incidents & litiges qualité</h1>
        <p className="text-sm text-saubio-slate/70">Suivi des litiges liés à la qualité, statut de traitement et sévérité.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Statut</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              value={filters.status ?? ''}
              onChange={(event) => handleChange({ status: event.target.value || undefined })}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Sévérité</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              value={filters.severity ?? ''}
              onChange={(event) => handleChange({ severity: event.target.value || undefined })}
            >
              <option value="">Toutes</option>
              <option value="low">Faible</option>
              <option value="medium">Modérée</option>
              <option value="high">Critique</option>
            </select>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Incident</th>
                <th className="px-3 py-2 text-left font-semibold">Booking</th>
                <th className="px-3 py-2 text-left font-semibold">Client</th>
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Sévérité</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Créé le</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((incident) => (
                <tr key={incident.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{incident.reason}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">
                    {incident.booking.id}
                    <br />
                    {incident.booking.service}
                  </td>
                  <td className="px-3 py-2">{incident.client?.name ?? '—'}</td>
                  <td className="px-3 py-2">{incident.provider?.name ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{SEVERITIES[incident.severity]}</td>
                  <td className="px-3 py-2 capitalize">{incident.status.replace('_', ' ')}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">
                    {new Date(incident.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold text-saubio-forest">
                    {incident.status !== 'resolved' && incident.status !== 'refunded' ? (
                      <button
                        type="button"
                        className="underline"
                        disabled={updateIncidentMutation.isLoading}
                        onClick={() =>
                          updateIncidentMutation.mutate({
                            id: incident.id,
                            payload: { status: 'resolved', resolution: 'Incident clos depuis l’interface admin.' },
                          })
                        }
                      >
                        Marquer résolu
                      </button>
                    ) : (
                      <span className="text-saubio-slate/60">Clôturé</span>
                    )}
                  </td>
                </tr>
              ))}
              {!data?.items.length && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    {incidentsQuery.isLoading ? 'Chargement des incidents…' : 'Aucun incident actif.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="mt-4 flex items-center justify-between text-xs text-saubio-slate/60">
            <p>
              Page {data.page} / {totalPages} — {data.total} incidents
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-2xl border border-saubio-forest/10 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-50"
                disabled={data.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              >
                Précédent
              </button>
              <button
                type="button"
                className="rounded-2xl border border-saubio-forest/10 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-50"
                disabled={data.page >= totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
