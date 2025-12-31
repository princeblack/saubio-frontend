'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { SurfaceCard } from '@saubio/ui';
import type { AdminConsentRecord } from '@saubio/models';
import {
  formatDateTime,
  useAdminConsents,
  useAdminConsentHistory,
} from '@saubio/utils';

const roleFilters = [
  { value: 'all', label: 'Tous' },
  { value: 'client', label: 'Clients' },
  { value: 'provider', label: 'Prestataires' },
  { value: 'employee', label: 'Employés' },
  { value: 'admin', label: 'Admins' },
];

const boolBadge = (value: boolean, label: string) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
      value ? 'bg-emerald-50 text-emerald-800' : 'bg-saubio-mist/30 text-saubio-slate/70'
    }`}
  >
    {label}
  </span>
);

export default function AdminComplianceConsentsPage() {
  const [filters, setFilters] = useState({
    role: 'all',
    search: '',
    from: '',
    to: '',
    page: 1,
    limit: 20,
  });
  const [selectedConsent, setSelectedConsent] = useState<AdminConsentRecord | null>(null);

  const consentsQuery = useAdminConsents({
    role: filters.role !== 'all' ? filters.role?.toUpperCase() : undefined,
    q: filters.search || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
    limit: filters.limit,
  });
  const historyQuery = useAdminConsentHistory(selectedConsent?.user.id);

  const items = consentsQuery.data?.items ?? [];
  const total = consentsQuery.data?.total ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / filters.limit)), [filters.limit, total]);

  const handleFilterChange =
    (key: keyof typeof filters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: 1,
      }));
    };

  const handlePageChange = (delta: number) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(Math.max(1, prev.page + delta), totalPages),
    }));
  };

  const formatDate = (value?: string | null) => (value ? formatDateTime(value, { dateStyle: 'short', timeStyle: 'short' }) : '—');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Gestion des consentements</h1>
        <p className="text-sm text-saubio-slate/70">
          Suivi centralisé des consentements marketing, cookies et préférences utilisateurs avec traçabilité complète.
        </p>
      </header>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Rôle</span>
            <select value={filters.role} onChange={handleFilterChange('role')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm">
              {roleFilters.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70 lg:col-span-2">
            <span className="mb-1 block">Recherche</span>
            <input
              type="text"
              value={filters.search}
              onChange={handleFilterChange('search')}
              placeholder="Email, ID utilisateur, prénom"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Depuis</span>
            <input
              type="date"
              value={filters.from}
              onChange={handleFilterChange('from')}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Jusqu&apos;à</span>
            <input
              type="date"
              value={filters.to}
              onChange={handleFilterChange('to')}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Résultats / page</span>
            <select
              value={filters.limit}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  limit: Number(event.target.value),
                  page: 1,
                }))
              }
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg lg:col-span-2">
          <div className="flex items-center justify-between text-xs text-saubio-slate/70">
            <p>
              {total} enregistrements · Page {filters.page} / {totalPages}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => handlePageChange(-1)}
                disabled={filters.page <= 1 || consentsQuery.isLoading}
                className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={filters.page >= totalPages || consentsQuery.isLoading}
                className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                  <th className="px-3 py-2 text-left font-semibold">Marketing</th>
                  <th className="px-3 py-2 text-left font-semibold">Stats</th>
                  <th className="px-3 py-2 text-left font-semibold">Préférences</th>
                  <th className="px-3 py-2 text-left font-semibold">Source</th>
                  <th className="px-3 py-2 text-left font-semibold">Capturé</th>
                  <th className="px-3 py-2 text-left font-semibold" />
                </tr>
              </thead>
              <tbody>
                {consentsQuery.isLoading ? (
                  <tr>
                    <td className="px-3 py-6 text-center" colSpan={7}>
                      Chargement des consentements…
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((record) => (
                    <tr key={record.id} className="border-b border-saubio-forest/5 last-border-none">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-saubio-forest">{record.user.email}</p>
                        <p className="text-xs text-saubio-slate/60">
                          {record.user.firstName} {record.user.lastName} · {record.user.role.toLowerCase()}
                        </p>
                      </td>
                      <td className="px-3 py-3">{boolBadge(record.consentMarketing, record.consentMarketing ? 'Opt-in' : 'Opt-out')}</td>
                      <td className="px-3 py-3">{boolBadge(record.consentStats, record.consentStats ? 'Autorisé' : 'Bloqué')}</td>
                      <td className="px-3 py-3">
                        {boolBadge(record.consentPreferences, record.consentPreferences ? 'Personnalisé' : 'Minimisé')}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <p className="font-semibold text-saubio-forest">{record.source ?? '—'}</p>
                        <p className="text-saubio-slate/60">{record.channel ?? '—'}</p>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <div>
                          <p className="text-saubio-slate/60">Dernière mise à jour</p>
                          <p className="font-semibold">{formatDate(record.updatedAt)}</p>
                        </div>
                        <div className="mt-1 text-saubio-slate/60">
                          <span className="text-xs">1er consentement</span>
                          <p className="font-semibold text-saubio-forest">{formatDate(record.firstCapturedAt)}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedConsent(record)}
                          className="text-xs font-semibold text-saubio-forest underline"
                        >
                          Voir détail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-6 text-center" colSpan={7}>
                      Aucun consentement ne correspond aux filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <header>
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Historique</p>
            <h2 className="text-lg font-semibold text-saubio-forest">
              {selectedConsent ? selectedConsent.user.email : 'Sélectionnez un utilisateur'}
            </h2>
            {selectedConsent ? (
              <p className="text-xs text-saubio-slate/70">
                Capturé {formatDate(selectedConsent.capturedAt)} · Source {selectedConsent.source ?? '—'}
              </p>
            ) : (
              <p className="text-xs text-saubio-slate/70">Cliquez sur &quot;Voir détail&quot; pour charger le journal complet.</p>
            )}
          </header>

          {selectedConsent ? (
            <div className="space-y-3">
              {historyQuery.isLoading ? (
                <p className="text-sm text-saubio-slate/70">Chargement de l&apos;historique…</p>
              ) : (historyQuery.data ?? []).length ? (
                <ol className="space-y-3">
                  {(historyQuery.data ?? []).map((event) => (
                    <li key={event.id} className="rounded-2xl border border-saubio-forest/10 bg-saubio-mist/20 p-3 text-xs">
                      <div className="flex items-center justify-between text-saubio-slate/70">
                        <span>{formatDate(event.createdAt)}</span>
                        <span>{event.channel ?? '—'}</span>
                      </div>
                      <p className="mt-1 font-semibold text-saubio-forest">{event.actorLabel ?? 'Utilisateur'}</p>
                      <p className="text-saubio-slate/70">
                        Marketing: {event.consentMarketing ? 'Opt-in' : 'Opt-out'} · Stats:{' '}
                        {event.consentStats ? 'Autorisé' : 'Bloqué'} · Préférences:{' '}
                        {event.consentPreferences ? 'Personnalisé' : 'Minimisé'}
                      </p>
                      {event.notes ? <p className="mt-1 text-saubio-slate/70">{event.notes}</p> : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-saubio-slate/70">Aucun événement enregistré pour ce compte.</p>
              )}
            </div>
          ) : null}
        </SurfaceCard>
      </div>
    </div>
  );
}
