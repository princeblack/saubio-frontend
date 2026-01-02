'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton, Badge } from '@saubio/ui';
import { useAdminSupportDisputes } from '@saubio/utils';

const STATUS_FILTERS: Array<{ label: string; value: 'all' | 'open' | 'under_review' | 'action_required' | 'refunded' | 'resolved' | 'rejected' }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Ouverts', value: 'open' },
  { label: 'Analyse', value: 'under_review' },
  { label: 'Action requise', value: 'action_required' },
  { label: 'Remboursés', value: 'refunded' },
  { label: 'Résolus', value: 'resolved' },
];

const STATUS_TONE: Record<string, string> = {
  open: 'bg-sky-100 text-sky-900',
  under_review: 'bg-saubio-sun/30 text-saubio-forest',
  action_required: 'bg-amber-100 text-amber-900',
  refunded: 'bg-emerald-100 text-emerald-900',
  resolved: 'bg-emerald-50 text-emerald-900',
  rejected: 'bg-rose-100 text-rose-900',
};

const formatAmount = (amount?: number | null, currency?: string | null) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency ?? 'EUR' }).format(amount / 100);
};

const inferActions = (status: string, refundAmount?: number | null) => {
  const actions: string[] = [];
  if (status === 'action_required') {
    actions.push('Assigner un gestionnaire', 'Collecter pièces justificatives');
  }
  if (status === 'under_review') {
    actions.push('Analyser preuves client/prestataire');
  }
  if (!refundAmount && ['open', 'under_review'].includes(status)) {
    actions.push('Calculer remboursement potentiel');
  }
  if (!actions.length) {
    actions.push('Suivi standard');
  }
  return actions;
};

export default function AdminSupportMediationPage() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['value']>('all');
  const filters = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
      pageSize: 25,
    }),
    [status]
  );
  const { data, isLoading, isFetching } = useAdminSupportDisputes(filters);
  const disputes = data?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Médiation & résolution</h1>
        <p className="text-sm text-saubio-slate/70">
          Suivez les dossiers complexes en cours de médiation, les montants engagés et les prochaines actions recommandées.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Dossiers en médiation</p>
            <p className="text-xs text-saubio-slate/60">Filtrer par statut pour prioriser les résolutions.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatus(filter.value)}
                className={`rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold ${
                  status === filter.value ? 'bg-saubio-forest text-white' : 'text-saubio-forest'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-3xl" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Litige</th>
                  <th className="px-3 py-2 text-left font-semibold">Booking</th>
                  <th className="px-3 py-2 text-left font-semibold">Motif</th>
                  <th className="px-3 py-2 text-left font-semibold">Montant</th>
                  <th className="px-3 py-2 text-left font-semibold">Remboursé</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Actions suggérées</th>
                  <th className="px-3 py-2 text-left font-semibold">MAJ</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute.id} className="border-b border-saubio-forest/5 last:border-0">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{dispute.id}</td>
                    <td className="px-3 py-2">{dispute.booking?.id ?? '—'}</td>
                    <td className="px-3 py-2">{dispute.reason}</td>
                    <td className="px-3 py-2">{formatAmount(dispute.paymentAmountCents, dispute.paymentCurrency)}</td>
                    <td className="px-3 py-2">{formatAmount(dispute.refundAmountCents, dispute.refundCurrency)}</td>
                    <td className="px-3 py-2">
                      <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[dispute.status] ?? ''}`}>
                        {dispute.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{inferActions(dispute.status, dispute.refundAmountCents).join(' • ')}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {new Date(dispute.updatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
                {disputes.length === 0 && !isFetching && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-xs text-saubio-slate/60">
                      Aucun dossier ne correspond au filtre sélectionné.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
