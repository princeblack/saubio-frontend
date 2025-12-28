'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Filter, Search } from 'lucide-react';
import { useAdminFinancePayments } from '@saubio/utils';

const STATUS_OPTIONS = [
  { label: 'Tous', value: undefined },
  { label: 'Payé', value: 'captured' },
  { label: 'En attente', value: 'pending' },
  { label: 'Échoué', value: 'failed' },
  { label: 'Remboursé', value: 'refunded' },
];

const METHOD_OPTIONS = [
  { label: 'Tous', value: undefined },
  { label: 'Carte', value: 'card' },
  { label: 'SEPA', value: 'sepa' },
  { label: 'PayPal', value: 'paypal' },
];

const currencyFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

export default function AdminClientPaymentsPage() {
  const [filters, setFilters] = useState({ page: 1, pageSize: 25 });
  const [search, setSearch] = useState('');
  const paymentsQuery = useAdminFinancePayments({ ...filters, search: search || undefined });
  const data = paymentsQuery.data;
  const totalPages = data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1;

  const handleFilterChange = (next: Record<string, unknown>) => {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    paymentsQuery.refetch();
  };

  const rows = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Finances & Paiements</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Paiements clients</h1>
        <p className="text-sm text-saubio-slate/70">
          Suivi détaillé des encaissements clients, statuts PSP et actions de support (remboursement, renvoi facture…).
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="mb-4 flex flex-wrap gap-3" onSubmit={handleSearchSubmit}>
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-saubio-forest/10 bg-saubio-mist px-3">
            <Search className="h-4 w-4 text-saubio-slate/60" />
            <input
              type="text"
              placeholder="Rechercher par ID paiement, client, réservation…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 flex-1 border-none bg-transparent text-sm text-saubio-forest outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm font-semibold text-saubio-forest"
          >
            <Filter className="h-4 w-4" />
            Rechercher
          </button>
        </form>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Statut</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              value={filters.status ?? ''}
              onChange={(event) => handleFilterChange({ status: event.target.value || undefined })}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Moyen de paiement</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              value={filters.method ?? ''}
              onChange={(event) => handleFilterChange({ method: event.target.value || undefined })}
            >
              {METHOD_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Service</p>
            <input
              type="text"
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              placeholder="Résidentiel, Bureaux…"
              value={filters.service ?? ''}
              onChange={(event) => handleFilterChange({ service: event.target.value || undefined })}
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Ville</p>
            <input
              type="text"
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              placeholder="Berlin, Hambourg…"
              value={filters.city ?? ''}
              onChange={(event) => handleFilterChange({ city: event.target.value || undefined })}
            />
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">ID Paiement</th>
                <th className="px-3 py-2 text-left font-semibold">Réservation</th>
                <th className="px-3 py-2 text-left font-semibold">Client</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Montant</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Moyen</th>
                <th className="px-3 py-2 text-left font-semibold">Ville</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentsQuery.isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={`payments-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td colSpan={9} className="px-3 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : rows.length === 0
                  ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-6 text-center text-saubio-slate/60">
                          Aucun paiement pour vos filtres.
                        </td>
                      </tr>
                    )
                  : (
                      rows.map((payment) => (
                        <tr key={payment.id} className="border-b border-saubio-forest/5 last:border-none">
                          <td className="px-3 py-2 font-semibold text-saubio-forest">{payment.id}</td>
                          <td className="px-3 py-2">
                            <Link href={`/admin/bookings/${payment.bookingId}`} className="text-saubio-forest underline">
                              {payment.bookingId}
                            </Link>
                          </td>
                          <td className="px-3 py-2">{payment.client.name}</td>
                          <td className="px-3 py-2 text-saubio-slate/60">{new Date(payment.occurredAt).toLocaleString('fr-FR')}</td>
                          <td className="px-3 py-2">{currencyFormatter.format(payment.amountCents / 100)}</td>
                          <td className="px-3 py-2 capitalize">{payment.status}</td>
                          <td className="px-3 py-2 uppercase">{payment.method ?? '—'}</td>
                          <td className="px-3 py-2">{payment.city ?? '—'}</td>
                          <td className="px-3 py-2 text-right text-saubio-forest underline">Actions</td>
                        </tr>
                      ))
                    )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-saubio-slate/60">
            {data ? `${data.items.length} résultat(s) sur ${data.total}` : '—'}
          </p>
          <div className="flex items-center gap-3">
            <button
              className="rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest"
              disabled={(filters.page ?? 1) <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page ?? 1) - 1) }))}
            >
              Précédent
            </button>
            <span className="text-sm text-saubio-slate/70">
              Page {filters.page ?? 1} / {totalPages}
            </span>
            <button
              className="rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest"
              disabled={(filters.page ?? 1) >= totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, (prev.page ?? 1) + 1) }))}
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
