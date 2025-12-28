'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton, Badge } from '@saubio/ui';
import { useAdminSupportDisputes, useAdminSupportDispute } from '@saubio/utils';

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
  under_review: 'bg-saubio-sun/40 text-saubio-forest',
  action_required: 'bg-amber-100 text-amber-900',
  refunded: 'bg-emerald-100 text-emerald-900',
  resolved: 'bg-emerald-50 text-emerald-900',
  rejected: 'bg-rose-100 text-rose-900',
};

const formatAmount = (amount?: number | null, currency?: string | null) => {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency ?? 'EUR',
    minimumFractionDigits: 2,
  }).format(amount / 100);
};

export default function AdminSupportDisputesPage() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['value']>('all');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
      pageSize: 25,
    }),
    [status]
  );

  const { data, isLoading } = useAdminSupportDisputes(filters);
  const { data: disputeDetail, isFetching: isDetailLoading } = useAdminSupportDispute(selectedDisputeId ?? undefined);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Litiges & remboursements</h1>
        <p className="text-sm text-saubio-slate/70">Analysez les motifs, montants, remboursements effectués et statut de chaque litige.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold ${
                  status === filter.value ? 'bg-saubio-forest text-white' : 'text-saubio-forest'
                }`}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-3xl" />
          ) : (
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Booking</th>
                  <th className="px-3 py-2 text-left font-semibold">Montant</th>
                  <th className="px-3 py-2 text-left font-semibold">Remboursé</th>
                  <th className="px-3 py-2 text-left font-semibold">Motif</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">MAJ</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((dispute) => (
                  <tr
                    key={dispute.id}
                    className={`cursor-pointer border-b border-saubio-forest/5 transition hover:bg-saubio-forest/5 last:border-0 ${
                      selectedDisputeId === dispute.id ? 'bg-saubio-forest/10' : ''
                    }`}
                    onClick={() => setSelectedDisputeId(dispute.id)}
                  >
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{dispute.id}</td>
                    <td className="px-3 py-2">{dispute.booking?.id ?? '—'}</td>
                    <td className="px-3 py-2">{formatAmount(dispute.paymentAmountCents, dispute.paymentCurrency)}</td>
                    <td className="px-3 py-2">{formatAmount(dispute.refundAmountCents, dispute.refundCurrency)}</td>
                    <td className="px-3 py-2">{dispute.reason || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_TONE[dispute.status] ?? ''}`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {new Date(dispute.updatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
                {data && data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-xs text-saubio-slate/60">
                      Aucun litige ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </SurfaceCard>

      {selectedDisputeId && (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Litige {selectedDisputeId}</p>
          {!disputeDetail || isDetailLoading ? (
            <Skeleton className="h-48 w-full rounded-3xl" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-saubio-forest">{disputeDetail.reason}</p>
                  <p className="text-xs text-saubio-slate/60">
                    Ouvert le {new Date(disputeDetail.openedAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-saubio-slate/60">
                    <Badge className="rounded-full bg-saubio-forest/10 text-saubio-forest">
                      {formatAmount(disputeDetail.paymentAmountCents, disputeDetail.paymentCurrency)}
                    </Badge>
                    {disputeDetail.refundAmountCents ? (
                      <Badge className="rounded-full bg-emerald-100 text-emerald-900">
                        Remboursé {formatAmount(disputeDetail.refundAmountCents, disputeDetail.refundCurrency)}
                      </Badge>
                    ) : null}
                    {disputeDetail.booking && (
                      <Badge className="rounded-full bg-sky-100 text-sky-900">Booking {disputeDetail.booking.id}</Badge>
                    )}
                  </div>
                </div>
                <span className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_TONE[disputeDetail.status] ?? ''}`}>
                  {disputeDetail.status.replace('_', ' ')}
                </span>
              </div>

              {disputeDetail.booking && (
                <div className="grid gap-2 rounded-2xl border border-saubio-forest/10 bg-saubio-slate/5 p-4 text-xs text-saubio-slate/70 md:grid-cols-2">
                  <div>
                    <p className="text-saubio-forest/80">Service</p>
                    <p className="font-semibold text-saubio-forest">{disputeDetail.booking.service}</p>
                  </div>
                  <div>
                    <p className="text-saubio-forest/80">Date & heure</p>
                    <p className="font-semibold text-saubio-forest">
                      {new Date(disputeDetail.booking.startAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-saubio-forest/80">Ville</p>
                    <p className="font-semibold text-saubio-forest">{disputeDetail.booking.city ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-saubio-forest/80">Statut booking</p>
                    <p className="font-semibold text-saubio-forest">{disputeDetail.booking.status.replace('_', ' ')}</p>
                  </div>
                </div>
              )}

              {disputeDetail.messages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-saubio-forest">Timeline & messages</p>
                  <div className="space-y-2 rounded-2xl border border-saubio-forest/10 bg-saubio-slate/5 p-4">
                    {disputeDetail.messages.map((message) => (
                      <div key={message.id} className="rounded-2xl bg-white/80 p-3 shadow-sm">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-saubio-slate/60">
                          <span className="font-semibold text-saubio-forest">{message.author?.name ?? message.role}</span>
                          <span>{new Date(message.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <p className="text-sm text-saubio-slate-900">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {disputeDetail.resolution && (
                <div className="rounded-2xl border border-saubio-forest/10 bg-emerald-50/60 p-4 text-sm text-emerald-900">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Résolution</p>
                  <p>{disputeDetail.resolution}</p>
                </div>
              )}
            </div>
          )}
        </SurfaceCard>
      )}
    </div>
  );
}
