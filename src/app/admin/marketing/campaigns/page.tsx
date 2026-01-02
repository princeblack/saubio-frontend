'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Plus } from 'lucide-react';
import { useAdminMarketingCampaigns } from '@saubio/utils';

const STATUS_FILTERS: Array<{ label: string; value: 'all' | 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' }> = [
  { label: 'Toutes', value: 'all' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Programmées', value: 'scheduled' },
  { label: 'En cours', value: 'running' },
  { label: 'Terminées', value: 'completed' },
  { label: 'En pause', value: 'paused' },
];

const CHANNEL_LABEL: Record<string, string> = {
  email: 'Email',
  push: 'Push',
  in_app: 'In-app',
  sms: 'SMS',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  scheduled: 'Programmée',
  running: 'En cours',
  completed: 'Terminée',
  paused: 'En pause',
};

const formatRate = (value?: number | null) => {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(1)} %`;
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('fr-FR', { dateStyle: 'medium' }) : '—';

export default function AdminMarketingCampaignsPage() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['value']>('all');
  const filters = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
    }),
    [status]
  );
  const { data, isLoading, isFetching } = useAdminMarketingCampaigns(filters);
  const campaigns = data?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Marketing & codes promo</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Campagnes marketing & push</h1>
        <p className="text-sm text-saubio-slate/70">Analysez les performances réelles des emails, push et séquences automatisées.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold transition ${
                  status === filter.value ? 'bg-saubio-forest text-white' : 'text-saubio-forest'
                }`}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest">
            <Plus className="h-4 w-4" />
            Nouvelle campagne
          </button>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-3xl" />
          ) : campaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-saubio-forest/20 p-8 text-center text-sm text-saubio-slate/60">
              Aucune campagne ne correspond aux filtres sélectionnés.
            </div>
          ) : (
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Nom</th>
                  <th className="px-3 py-2 text-left font-semibold">Canal</th>
                  <th className="px-3 py-2 text-left font-semibold">Cible</th>
                  <th className="px-3 py-2 text-left font-semibold">Envois</th>
                  <th className="px-3 py-2 text-left font-semibold">Performances</th>
                  <th className="px-3 py-2 text-left font-semibold">Fenêtre</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{campaign.name}</td>
                    <td className="px-3 py-2">{CHANNEL_LABEL[campaign.channel] ?? campaign.channel}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{campaign.targetAudience ?? '—'}</td>
                    <td className="px-3 py-2">{campaign.sendCount.toLocaleString('fr-FR')}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/70">
                      <div>Ouverture : {formatRate(campaign.openRate)}</div>
                      <div>Clic : {formatRate(campaign.clickRate)}</div>
                      <div>Conv : {formatRate(campaign.conversionRate)}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {formatDate(campaign.scheduledAt)} → {formatDate(campaign.completedAt)}
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-saubio-forest">
                      {STATUS_LABEL[campaign.status] ?? campaign.status}
                      {isFetching && <span className="ml-2 text-[10px] text-saubio-slate/50">MAJ…</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
