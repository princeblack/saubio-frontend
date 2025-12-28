'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { BookingStatus, ListBookingsParams, ServiceCategory } from '@saubio/models';
import { formatDateTime, useAdminBookingList } from '@saubio/utils';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../../components/feedback/ErrorState';
import { Filter, RefreshCcw, Search } from 'lucide-react';

const STATUS_OPTIONS: Array<{ value?: BookingStatus; label: string }> = [
  { value: undefined, label: 'Tous les statuts' },
  { value: 'pending_provider', label: 'En attente prestataire' },
  { value: 'pending_client', label: 'En attente client' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'disputed', label: 'Litige' },
  { value: 'draft', label: 'Brouillon' },
];

const SERVICE_OPTIONS: Array<{ value?: ServiceCategory; label: string }> = [
  { label: 'Tous les services', value: undefined },
  { label: 'Résidentiel', value: 'residential' },
  { label: 'Bureaux', value: 'office' },
  { label: 'Vitres', value: 'windows' },
  { label: 'Éco+', value: 'eco_plus' },
  { label: 'Textile', value: 'carpet' },
  { label: 'Fin de bail', value: 'final' },
  { label: 'Printemps', value: 'spring' },
];

const MODE_OPTIONS = [
  { value: undefined, label: 'Tous les modes' },
  { value: 'smart_match', label: 'Smart Match' },
  { value: 'manual', label: 'Assignation manuelle' },
];

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const statusTone = (status: BookingStatus) => {
  switch (status) {
    case 'confirmed':
    case 'in_progress':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending_provider':
    case 'pending_client':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'completed':
      return 'bg-slate-100 text-saubio-forest border-slate-200';
    case 'disputed':
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'draft':
    default:
      return 'bg-slate-50 text-saubio-slate border-slate-200';
  }
};

const paymentTone = (status?: string | null) => {
  if (!status) return 'bg-slate-100 text-saubio-slate border-slate-200';
  switch (status) {
    case 'captured':
    case 'released':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending':
    case 'requires_action':
    case 'authorized':
    case 'capture_pending':
    case 'held':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'refunded':
    case 'failed':
    case 'disputed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-saubio-slate border-slate-200';
  }
};

const modeLabel = (mode: 'smart_match' | 'manual') =>
  mode === 'smart_match' ? 'Smart Match' : 'Assignation interne';

const bookingStatusLabel = (status: BookingStatus) => {
  switch (status) {
    case 'pending_provider':
      return 'En attente prestataire';
    case 'pending_client':
      return 'En attente client';
    case 'confirmed':
      return 'Confirmé';
    case 'in_progress':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    case 'cancelled':
      return 'Annulé';
    case 'disputed':
      return 'Litige';
    case 'draft':
    default:
      return 'Brouillon';
  }
};

const paymentStatusLabel = (status?: string | null) => {
  if (!status) return '—';
  switch (status) {
    case 'captured':
    case 'released':
      return 'Payé';
    case 'pending':
    case 'requires_action':
    case 'authorized':
    case 'capture_pending':
    case 'held':
      return 'En attente';
    case 'refunded':
      return 'Remboursé';
    case 'failed':
      return 'Échec';
    case 'disputed':
      return 'Litige';
    default:
      return status;
  }
};

const serviceLabel = (service: string) =>
  service
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export interface BookingsListViewProps {
  title: string;
  description: string;
  initialFilters?: Partial<ListBookingsParams>;
  emptyMessage?: string;
}

const toDateInputValue = (value?: string) => {
  if (!value) return '';
  return value.split('T')[0] ?? value;
};

export function BookingsListView({
  title,
  description,
  initialFilters = {},
  emptyMessage = 'Aucune réservation ne correspond à vos filtres.',
}: BookingsListViewProps) {
  const [filters, setFilters] = useState<ListBookingsParams>({
    page: 1,
    pageSize: 25,
    ...initialFilters,
  });
  const [searchTerm, setSearchTerm] = useState(initialFilters.search ?? '');
  const bookingsQuery = useAdminBookingList(filters);

  const data = bookingsQuery.data;
  const totalPages = data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1;
  const items = data?.items ?? [];

  const handleFiltersUpdate = (updates: Partial<ListBookingsParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      page: updates.page ?? 1,
    }));
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleFiltersUpdate({ search: searchTerm ? searchTerm.trim() : undefined });
  };

  const handleResetFilters = () => {
    setSearchTerm(initialFilters.search ?? '');
    setFilters({
      page: 1,
      pageSize: initialFilters.pageSize ?? 25,
      ...initialFilters,
    });
  };

  const paginationLabel = useMemo(() => {
    if (!data) return '';
    const start = (data.page - 1) * data.pageSize + 1;
    const end = Math.min(data.page * data.pageSize, data.total);
    return `${start.toLocaleString('fr-FR')}–${end.toLocaleString('fr-FR')} sur ${data.total.toLocaleString('fr-FR')}`;
  }, [data]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Réservations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">{title}</h1>
        <p className="text-sm text-saubio-slate/70">{description}</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="mb-4 flex flex-wrap gap-3" onSubmit={handleSearchSubmit}>
          <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-2xl border border-saubio-forest/10 bg-saubio-mist px-3">
            <Search className="h-4 w-4 text-saubio-slate/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher par ID, client, email, prestataire…"
              className="h-11 flex-1 border-none bg-transparent text-sm text-saubio-forest outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm font-semibold text-saubio-forest shadow-soft-sm"
          >
            <Filter className="h-4 w-4" />
            Rechercher
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm font-semibold text-saubio-forest/70 shadow-soft-sm"
          >
            Réinitialiser
          </button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1 text-sm text-saubio-slate/70 min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Fenêtre de prestation</p>
            <div className="grid w-full gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={toDateInputValue(filters.startFrom)}
                onChange={(event) => handleFiltersUpdate({ startFrom: event.target.value || undefined })}
                className="w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              />
              <input
                type="date"
                value={toDateInputValue(filters.startTo)}
                onChange={(event) => handleFiltersUpdate({ startTo: event.target.value || undefined })}
                className="w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              />
            </div>
          </div>
          <div className="text-sm text-saubio-slate/70 min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Statut</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              value={filters.statuses?.[0] ?? ''}
              onChange={(event) =>
                handleFiltersUpdate({
                  statuses: event.target.value ? [event.target.value as BookingStatus] : undefined,
                })
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-saubio-slate/70 min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Service</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              value={filters.service ?? ''}
              onChange={(event) =>
                handleFiltersUpdate({
                  service: (event.target.value || undefined) as ServiceCategory | undefined,
                })
              }
            >
              {SERVICE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-saubio-slate/70 min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Mode</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              value={filters.mode ?? ''}
              onChange={(event) =>
                handleFiltersUpdate({
                  mode: (event.target.value || undefined) as 'smart_match' | 'manual' | undefined,
                })
              }
            >
              {MODE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Ville</p>
            <input
              type="text"
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              value={filters.city ?? ''}
              onChange={(event) => handleFiltersUpdate({ city: event.target.value || undefined })}
              placeholder="Berlin, Hambourg…"
            />
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Code postal</p>
            <input
              type="text"
              maxLength={10}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              value={filters.postalCode ?? ''}
              onChange={(event) => handleFiltersUpdate({ postalCode: event.target.value || undefined })}
              placeholder="10115…"
            />
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest">
            <input
              type="checkbox"
              checked={filters.shortNotice ?? false}
              onChange={(event) => handleFiltersUpdate({ shortNotice: event.target.checked || undefined })}
              className="rounded border-saubio-forest text-saubio-forest focus:ring-saubio-forest"
            />
            <span>Short notice (&lt; 48h)</span>
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest">
            <input
              type="checkbox"
              checked={filters.hasProvider ?? false}
              onChange={(event) => handleFiltersUpdate({ hasProvider: event.target.checked || undefined })}
              className="rounded border-saubio-forest text-saubio-forest focus:ring-saubio-forest"
            />
            <span>Prestataire assigné</span>
          </label>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Résultats</p>
            <p className="text-sm text-saubio-slate/70">{paginationLabel || '—'}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/10 px-3 py-2 text-xs font-semibold text-saubio-forest"
            onClick={() => bookingsQuery.refetch()}
            disabled={bookingsQuery.isFetching}
          >
            <RefreshCcw className="h-4 w-4" />
            {bookingsQuery.isFetching ? 'Actualisation…' : 'Actualiser'}
          </button>
        </div>

        {bookingsQuery.isError ? (
          <ErrorState
            title="Impossible de charger les réservations"
            description="Une erreur est survenue, merci de réessayer."
            onRetry={() => bookingsQuery.refetch()}
          />
        ) : null}

        {bookingsQuery.isLoading && !data ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`booking-table-skeleton-${index}`} className="h-16 rounded-3xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-saubio-forest/15 bg-white/70 p-6 text-center text-sm text-saubio-slate/60">
            {emptyMessage}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Créneau</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Prestataire</th>
                  <th className="px-3 py-2">Ville</th>
                  <th className="px-3 py-2">Montant</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Paiement</th>
                </tr>
              </thead>
              <tbody>
                {items.map((booking) => (
                  <tr key={booking.id} className="border-b border-saubio-forest/5 last:border-0">
                    <td className="px-3 py-3 font-semibold text-saubio-forest">
                      <Link href={`/admin/bookings/${booking.id}`} className="underline-offset-4 hover:underline">
                        {booking.id}
                      </Link>
                      {booking.shortNotice ? (
                        <span className="ml-2 rounded-full bg-saubio-sun/30 px-2 py-0.5 text-xs font-semibold text-saubio-forest">
                          URGENT
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-saubio-forest">{formatDateTime(booking.startAt)}</p>
                      <p className="text-xs text-saubio-slate/60">{formatDateTime(booking.endAt)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-saubio-forest">{serviceLabel(booking.service)}</p>
                      <p className="text-xs text-saubio-slate/60">{modeLabel(booking.mode)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-saubio-forest">{booking.client.name}</p>
                      <p className="text-xs text-saubio-slate/60">{booking.client.email ?? '—'}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-saubio-forest">
                        {booking.provider ? booking.provider.name : 'Non assigné'}
                      </p>
                      <p className="text-xs text-saubio-slate/60">{booking.matchingRetryCount} retentatives</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-saubio-forest">
                        {booking.city}
                      </p>
                      <p className="text-xs text-saubio-slate/60">{booking.postalCode}</p>
                    </td>
                    <td className="px-3 py-3 font-semibold text-saubio-forest">
                      {currencyFormatter.format(booking.totalCents / 100)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(booking.status)}`}>
                        {bookingStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${paymentTone(booking.paymentStatus)}`}>
                        {paymentStatusLabel(booking.paymentStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>

      {items.length > 0 && data ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-saubio-forest/10 bg-white/80 p-4 text-sm text-saubio-slate/70 shadow-soft-sm">
          <span>
            Page {data.page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-2xl border border-saubio-forest/10 px-4 py-2 font-semibold text-saubio-forest disabled:opacity-40"
              onClick={() => handleFiltersUpdate({ page: Math.max((filters.page ?? 1) - 1, 1) })}
              disabled={(filters.page ?? 1) <= 1 || bookingsQuery.isFetching}
            >
              Précédent
            </button>
            <button
              type="button"
              className="rounded-2xl border border-saubio-forest/10 px-4 py-2 font-semibold text-saubio-forest disabled:opacity-40"
              onClick={() => handleFiltersUpdate({ page: Math.min((filters.page ?? 1) + 1, totalPages) })}
              disabled={(filters.page ?? 1) >= totalPages || bookingsQuery.isFetching}
            >
              Suivant
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
