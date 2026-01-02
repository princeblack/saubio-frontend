'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { formatEuro, useAdminReferralInvites } from '@saubio/utils';

const STATUS_FILTERS: Array<{ label: string; value: 'all' | 'invited' | 'signed_up' | 'booked' | 'pending_payout' | 'rewarded' }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Invités', value: 'invited' },
  { label: 'Inscrits', value: 'signed_up' },
  { label: 'Mission réalisée', value: 'booked' },
  { label: 'Paiement en attente', value: 'pending_payout' },
  { label: 'Crédit versé', value: 'rewarded' },
];

const STATUS_LABEL: Record<string, string> = {
  invited: 'Invité',
  signed_up: 'Inscrit',
  booked: 'Mission réalisée',
  pending_payout: 'Paiement en attente',
  rewarded: 'Crédit versé',
};

const formatInviteList = (invites: { name?: string | null; email: string }[]) => {
  if (invites.length === 0) return '—';
  return invites.map((invite) => invite.name ?? invite.email).join(', ');
};

export default function AdminMarketingReferralsPage() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['value']>('all');
  const filters = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
    }),
    [status]
  );
  const { data, isLoading } = useAdminReferralInvites(filters);
  const referrals = data?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Marketing & codes promo</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Parrainage & crédit</h1>
        <p className="text-sm text-saubio-slate/70">Suivez les invitations, montants crédités et statuts (mission, paiement, bonus).</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap gap-2 text-xs text-saubio-slate/70">
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
        <div className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-3xl" />
          ) : referrals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-saubio-forest/20 p-8 text-center text-sm text-saubio-slate/60">
              Aucun parrainage ne correspond aux filtres sélectionnés.
            </div>
          ) : (
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Parrain</th>
                  <th className="px-3 py-2 text-left font-semibold">Code</th>
                  <th className="px-3 py-2 text-left font-semibold">Filleuls</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Crédit parrain</th>
                  <th className="px-3 py-2 text-left font-semibold">Crédit filleul</th>
                  <th className="px-3 py-2 text-left font-semibold">MAJ</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((record) => {
                  const invitedTotal = record.invites.reduce((sum, invite) => sum + invite.rewardReferredCents, 0);
                  return (
                    <tr key={record.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2 font-semibold text-saubio-forest">{record.referrer.name}</td>
                      <td className="px-3 py-2">{record.code}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatInviteList(record.invites)}</td>
                      <td className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-saubio-forest">
                        {STATUS_LABEL[record.status] ?? record.status}
                      </td>
                      <td className="px-3 py-2">{formatEuro(record.rewardReferrerCents / 100)}</td>
                      <td className="px-3 py-2">{formatEuro(invitedTotal / 100)}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">
                        {new Date(record.updatedAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
