'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@saubio/models';
import { formatDateTime, useAdminConsents } from '@saubio/utils';

const ROLE_FILTERS: Array<{ label: string; value: 'all' | UserRole }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Clients', value: 'client' },
  { label: 'Prestataires', value: 'provider' },
  { label: 'Employés', value: 'employee' },
  { label: 'Admins', value: 'admin' },
];

const PAGE_SIZE = 25;

const boolBadge = (value: boolean, label: string) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
      value ? 'bg-emerald-50 text-emerald-800' : 'bg-saubio-mist/30 text-saubio-slate/70'
    }`}
  >
    {label}
  </span>
);

export default function AdminAutomationConsentsPage() {
  const [filters, setFilters] = useState({
    role: 'all' as 'all' | UserRole,
    search: '',
    page: 1,
  });

  const consentsQuery = useAdminConsents({
    role: filters.role === 'all' ? undefined : (filters.role.toUpperCase() as Uppercase<UserRole>),
    q: filters.search || undefined,
    page: filters.page,
    limit: PAGE_SIZE,
  });

  const records = consentsQuery.data?.items ?? [];
  const total = consentsQuery.data?.total ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, role: event.target.value as 'all' | UserRole, page: 1 }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }));
  };

  const handlePageChange = (delta: number) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(Math.max(1, prev.page + delta), totalPages),
    }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Consentements & opt-in</h1>
        <p className="text-sm text-saubio-slate/70">
          Préférences marketing et légales directement issues des endpoints compliance / consents.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/70">
            <span className="mb-1 block">Rôle utilisateur</span>
            <select
              value={filters.role}
              onChange={handleRoleChange}
              className="w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            >
              {ROLE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/70">
            <span className="mb-1 block">Recherche</span>
            <input
              type="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Email, ID utilisateur…"
              className="w-full rounded-2xl border border-saubio-forest/20 px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-saubio-slate/60">
          <p>
            {total} enregistrements · Page {filters.page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(-1)}
              disabled={filters.page <= 1 || consentsQuery.isLoading}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={filters.page >= totalPages || consentsQuery.isLoading}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Marketing</th>
                <th className="px-3 py-2 text-left font-semibold">Stats</th>
                <th className="px-3 py-2 text-left font-semibold">Préférences</th>
                <th className="px-3 py-2 text-left font-semibold">Source</th>
                <th className="px-3 py-2 text-left font-semibold">Maj</th>
              </tr>
            </thead>
            <tbody>
              {consentsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Chargement des consentements…
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun consentement ne correspond à ces filtres.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-saubio-forest">
                        {record.user.firstName || record.user.lastName
                          ? `${record.user.firstName ?? ''} ${record.user.lastName ?? ''}`.trim()
                          : record.user.email}
                      </p>
                      <p className="text-xs text-saubio-slate/60">{record.user.email}</p>
                    </td>
                    <td className="px-3 py-2">{boolBadge(record.consentMarketing, record.consentMarketing ? 'Opt-in' : 'Opt-out')}</td>
                    <td className="px-3 py-2">{boolBadge(record.consentStats, record.consentStats ? 'Opt-in' : 'Opt-out')}</td>
                    <td className="px-3 py-2">
                      {boolBadge(record.consentPreferences, record.consentPreferences ? 'Personnalisé' : 'Standard')}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{record.source ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(record.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
