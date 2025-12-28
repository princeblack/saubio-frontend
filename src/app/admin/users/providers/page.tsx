'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton, PrimaryButton } from '@saubio/ui';
import { useAdminProviders } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const PROVIDER_STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'pending', label: 'En attente' },
  { value: 'suspended', label: 'Suspendus' },
];

const formatBadge = (status: string) => {
  if (status?.toLowerCase().includes('verified') || status?.toLowerCase().includes('ready')) {
    return { label: 'Validé', tone: 'border-emerald-500 text-emerald-700' };
  }
  if (status?.toLowerCase().includes('pending')) {
    return { label: 'En attente', tone: 'border-amber-500 text-amber-900' };
  }
  if (status?.toLowerCase().includes('rejected') || status?.toLowerCase().includes('failed')) {
    return { label: 'Refusé', tone: 'border-rose-500 text-rose-700' };
  }
  return { label: status ?? '—', tone: 'border-saubio-forest/30 text-saubio-forest' };
};

export default function AdminProvidersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const providersQuery = useAdminProviders({ page, pageSize: 20, status, search });
  const { data, isLoading, isError } = providersQuery;

  const numberFormatter = useMemo(() => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }), []);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Utilisateurs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Prestataires</h1>
        <p className="text-sm text-saubio-slate/70">
          Vue complète des prestataires Saubio : onboarding, vérification et performance.
        </p>
      </header>

      <SurfaceCard className="flex flex-wrap gap-4 rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Recherche : nom, email..."
          className="min-w-[220px] flex-1 rounded-2xl border border-saubio-forest/10 bg-saubio-mist/60 px-3 py-2 text-sm focus:border-saubio-forest focus:outline-none"
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
        >
          {PROVIDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SurfaceCard>

      {isError ? (
        <ErrorState
          title="Impossible de charger les prestataires"
          description="Merci de réessayer dans quelques instants."
          onRetry={() => providersQuery.refetch()}
        />
      ) : null}

      <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Email</th>
                <th className="px-3 py-2 text-left font-semibold">Ville</th>
                <th className="px-3 py-2 text-left font-semibold">Onboarding</th>
                <th className="px-3 py-2 text-left font-semibold">Identité</th>
                <th className="px-3 py-2 text-left font-semibold">Paiement</th>
                <th className="px-3 py-2 text-left font-semibold">Missions complétées</th>
                <th className="px-3 py-2 text-left font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`providers-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td colSpan={8} className="px-3 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-saubio-slate/60">
                    Aucun prestataire ne correspond à vos filtres.
                  </td>
                </tr>
              ) : null}
              {data?.items.map((provider) => {
                const onboardingBadge = formatBadge(provider.onboardingStatus);
                const identityBadge = formatBadge(provider.identityStatus);
                const payoutBadge = formatBadge(provider.payoutStatus);
                return (
                  <tr key={provider.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{provider.name}</td>
                    <td className="px-3 py-2">{provider.email}</td>
                    <td className="px-3 py-2">{provider.city ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${onboardingBadge.tone}`}>
                        {onboardingBadge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${identityBadge.tone}`}>
                        {identityBadge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${payoutBadge.tone}`}>
                        {payoutBadge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">{provider.missionsCompleted}</td>
                    <td className="px-3 py-2">
                      {provider.ratingCount > 0 ? `${numberFormatter.format(provider.ratingAverage)} (${provider.ratingCount})` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-saubio-slate/60">{data ? `${data.items.length} résultat(s) sur ${data.total}` : '—'}</p>
          <div className="flex items-center gap-3">
            <PrimaryButton variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Précédent
            </PrimaryButton>
            <span className="text-sm text-saubio-slate/70">
              Page {page} / {totalPages}
            </span>
            <PrimaryButton
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Suivant
            </PrimaryButton>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
