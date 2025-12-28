'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton, PrimaryButton } from '@saubio/ui';
import { useAdminClients } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'active', label: 'Actifs' },
  { value: 'invited', label: 'Invitations' },
  { value: 'suspended', label: 'Suspendus' },
];

const statusTone = (status: string) => {
  if (status === 'active') return 'border-emerald-500 text-emerald-700';
  if (status === 'invited') return 'border-amber-500 text-amber-900';
  return 'border-rose-500 text-rose-700';
};

const statusLabel = (status: string) => {
  if (status === 'active') return 'Actif';
  if (status === 'invited') return 'Invité';
  return 'Suspendu';
};

export default function AdminClientsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const clientsQuery = useAdminClients({ page, pageSize: 20, status, search });
  const { data, isLoading, isError } = clientsQuery;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }),
    []
  );
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('fr-FR'), []);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Utilisateurs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Clients</h1>
        <p className="text-sm text-saubio-slate/70">
          Liste détaillée des clients Saubio avec filtres, nombre de réservations et statut de compte.
        </p>
      </header>

      <SurfaceCard className="flex flex-wrap gap-4 rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
        <input
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Recherche : nom, email, téléphone..."
          className="min-w-[220px] flex-1 rounded-2xl border border-saubio-forest/10 bg-saubio-mist/60 px-3 py-2 text-sm focus:border-saubio-forest focus:outline-none"
        />
        <select
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
          className="rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SurfaceCard>

      {isError ? (
        <ErrorState
          title="Impossible de charger les clients"
          description="Un incident technique empêche la récupération des données."
          onRetry={() => clientsQuery.refetch()}
        />
      ) : null}

      <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Email</th>
                <th className="px-3 py-2 text-left font-semibold">Téléphone</th>
                <th className="px-3 py-2 text-left font-semibold">Inscription</th>
                <th className="px-3 py-2 text-left font-semibold">Réservations</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière réservation</th>
                <th className="px-3 py-2 text-left font-semibold">Total dépensé</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`clients-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td colSpan={8} className="px-3 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {data && data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-saubio-slate/60">
                    Aucun client ne correspond à vos filtres.
                  </td>
                </tr>
              ) : null}
              {data?.items.map((client) => (
                <tr key={client.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{client.name}</td>
                  <td className="px-3 py-2">{client.email}</td>
                  <td className="px-3 py-2">{client.phone ?? '—'}</td>
                  <td className="px-3 py-2">{dateFormatter.format(new Date(client.createdAt))}</td>
                  <td className="px-3 py-2">{client.totalBookings}</td>
                  <td className="px-3 py-2">
                    {client.lastBooking ? dateFormatter.format(new Date(client.lastBooking.startAt)) : '—'}
                  </td>
                  <td className="px-3 py-2">{currencyFormatter.format((client.totalSpentCents ?? 0) / 100)}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusTone(client.status)}`}>
                      {statusLabel(client.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-saubio-slate/60">
            {data ? `${data.items.length} résultat(s) sur ${data.total}` : '—'}
          </p>
          <div className="flex items-center gap-3">
            <PrimaryButton
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
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
