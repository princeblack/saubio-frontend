'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { SurfaceCard } from '@saubio/ui';
import {
  formatDateTime,
  useAdminSecuritySessions,
  useAdminSecurityLoginAttempts,
  useAdminSecurityLogs,
  useAdminSecurityIncidents,
  useCreateSecurityIncidentMutation,
  useUpdateSecurityIncidentMutation,
  useRevokeSecuritySessionMutation,
} from '@saubio/utils';

const sessionStatuses = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'expired', label: 'Expirés' },
  { value: 'revoked', label: 'Révoqués' },
];

const roleOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'client', label: 'Clients' },
  { value: 'provider', label: 'Prestataires' },
  { value: 'employee', label: 'Employés' },
  { value: 'admin', label: 'Admins' },
];

const loginResultOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'success', label: 'Succès' },
  { value: 'failure', label: 'Échecs' },
];

const logCategories = [
  { value: 'all', label: 'Toutes catégories' },
  { value: 'auth', label: 'Auth' },
  { value: 'permissions', label: 'Permissions' },
  { value: 'webhook', label: 'Webhooks' },
  { value: 'payment', label: 'Paiements' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Autres' },
];

const logLevels = [
  { value: 'all', label: 'Tous niveaux' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warning' },
  { value: 'error', label: 'Erreur' },
];

const incidentStatuses = [
  { value: 'all', label: 'Tous' },
  { value: 'open', label: 'Ouvert' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'closed', label: 'Clos' },
];

const incidentSeverities = [
  { value: 'all', label: 'Toutes sévérités' },
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'critical', label: 'Critique' },
];

const statusBadge = (status: 'active' | 'revoked' | 'expired') => {
  const palette = {
    active: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
    revoked: 'bg-rose-50 text-rose-700 border border-rose-100',
    expired: 'bg-amber-50 text-amber-800 border border-amber-100',
  };
  const label = {
    active: 'Active',
    revoked: 'Révoquée',
    expired: 'Expirée',
  }[status];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${palette[status]}`}>{label}</span>;
};

const attemptBadge = (success: boolean) =>
  success ? (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Succès</span>
  ) : (
    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">Refusé</span>
  );

export default function AdminComplianceSecurityPage() {
  const [sessionFilters, setSessionFilters] = useState({
    role: 'all',
    status: 'active',
    search: '',
    page: 1,
    limit: 10,
  });
  const [loginFilters, setLoginFilters] = useState({
    search: '',
    from: '',
    to: '',
    result: 'all',
    page: 1,
    limit: 20,
  });
  const [logFilters, setLogFilters] = useState({
    category: 'all',
    level: 'all',
    search: '',
    page: 1,
    limit: 20,
  });
  const [incidentFilters, setIncidentFilters] = useState({
    status: 'open',
    category: 'all',
    severity: 'all',
    search: '',
    page: 1,
    limit: 10,
  });
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    category: 'auth',
    severity: 'medium',
  });
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const sessionsQuery = useAdminSecuritySessions({
    role: sessionFilters.role !== 'all' ? sessionFilters.role : undefined,
    status: sessionFilters.status !== 'all' ? (sessionFilters.status as 'active' | 'revoked' | 'expired') : undefined,
    q: sessionFilters.search || undefined,
    page: sessionFilters.page,
    limit: sessionFilters.limit,
  });
  const attemptsQuery = useAdminSecurityLoginAttempts({
    q: loginFilters.search || undefined,
    from: loginFilters.from || undefined,
    to: loginFilters.to || undefined,
    success:
      loginFilters.result === 'all' ? undefined : loginFilters.result === 'success' ? true : (false as boolean | undefined),
    page: loginFilters.page,
    limit: loginFilters.limit,
  });
  const revokeSession = useRevokeSecuritySessionMutation();
  const logsQuery = useAdminSecurityLogs({
    category: logFilters.category !== 'all' ? (logFilters.category as 'auth' | 'permissions' | 'webhook' | 'payment' | 'admin' | 'other') : undefined,
    level: logFilters.level !== 'all' ? (logFilters.level as 'info' | 'warn' | 'error') : undefined,
    q: logFilters.search || undefined,
    page: logFilters.page,
    limit: logFilters.limit,
  });
  const incidentsQuery = useAdminSecurityIncidents({
    status: incidentFilters.status !== 'all' ? (incidentFilters.status as 'open' | 'in_progress' | 'resolved' | 'closed') : undefined,
    category: incidentFilters.category !== 'all' ? (incidentFilters.category as 'auth' | 'permissions' | 'webhook' | 'payment' | 'admin' | 'other') : undefined,
    severity: incidentFilters.severity !== 'all' ? (incidentFilters.severity as 'low' | 'medium' | 'high' | 'critical') : undefined,
    q: incidentFilters.search || undefined,
    page: incidentFilters.page,
    limit: incidentFilters.limit,
  });
  const createIncident = useCreateSecurityIncidentMutation();
  const updateIncident = useUpdateSecurityIncidentMutation();

  const sessionItems = sessionsQuery.data?.items ?? [];
  const sessionTotal = sessionsQuery.data?.total ?? 0;
  const sessionPages = Math.max(1, Math.ceil(sessionTotal / sessionFilters.limit));

  const attemptItems = attemptsQuery.data?.items ?? [];
  const attemptTotal = attemptsQuery.data?.total ?? 0;
  const attemptPages = Math.max(1, Math.ceil(attemptTotal / loginFilters.limit));
  const logItems = logsQuery.data?.items ?? [];
  const logTotal = logsQuery.data?.total ?? 0;
  const logPages = Math.max(1, Math.ceil(logTotal / logFilters.limit));
  const incidentItems = incidentsQuery.data?.items ?? [];
  const incidentTotal = incidentsQuery.data?.total ?? 0;
  const incidentPages = Math.max(1, Math.ceil(incidentTotal / incidentFilters.limit));

  const selectedIncident = useMemo(() => {
    if (!incidentItems.length) {
      return undefined;
    }
    const existing = incidentItems.find((incident) => incident.id === selectedIncidentId);
    return existing ?? incidentItems[0];
  }, [incidentItems, selectedIncidentId]);

  useEffect(() => {
    if (!selectedIncidentId && incidentItems.length) {
      setSelectedIncidentId(incidentItems[0].id);
    }
  }, [incidentItems, selectedIncidentId]);

  const handleSessionFilterChange =
    (key: keyof typeof sessionFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = key === 'limit' ? Number(event.target.value) : event.target.value;
      setSessionFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key === 'page' ? value : 1,
      }));
    };

  const handleLoginFilterChange =
    (key: keyof typeof loginFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = key === 'limit' ? Number(event.target.value) : event.target.value;
      setLoginFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key === 'page' ? value : 1,
      }));
    };

  const handleRevoke = (sessionId: string) => {
    if (!window.confirm('Révoquer cette session ?')) {
      return;
    }
    revokeSession.mutate({ id: sessionId });
  };

  const handleLogFilterChange =
    (key: keyof typeof logFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = key === 'limit' ? Number(event.target.value) : event.target.value;
      setLogFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key === 'page' ? value : 1,
      }));
    };

  const handleIncidentFilterChange =
    (key: keyof typeof incidentFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = key === 'limit' ? Number(event.target.value) : event.target.value;
      setIncidentFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key === 'page' ? value : 1,
      }));
    };

  const handleCreateIncident = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newIncident.title.trim() || !newIncident.description.trim()) {
      window.alert('Merci de compléter titre et description.');
      return;
    }
    createIncident.mutate(
      {
        title: newIncident.title.trim(),
        description: newIncident.description.trim(),
        category: newIncident.category as any,
        severity: newIncident.severity as any,
      },
      {
        onSuccess: () => {
          setNewIncident({ title: '', description: '', category: 'auth', severity: 'medium' });
        },
      }
    );
  };

  const handleIncidentStatusChange = (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    const message = window.prompt('Ajouter un commentaire (optionnel) ?') ?? undefined;
    updateIncident.mutate({ id, payload: { status, timelineMessage: message || undefined } });
  };

  const handleIncidentAssign = (id: string) => {
    const assignedToId = window.prompt('ID utilisateur à assigner (laissez vide pour retirer)');
    if (assignedToId === null) return;
    updateIncident.mutate({ id, payload: { assignedToId: assignedToId.trim() ? assignedToId.trim() : null } });
  };

  const formatDate = (value?: string) => (value ? formatDateTime(value, { dateStyle: 'short', timeStyle: 'short' }) : '—');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Accès & sessions</h1>
        <p className="text-sm text-saubio-slate/70">Analysez les sessions actives, forcez les déconnexions et contrôlez les tentatives.</p>
      </header>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Rôle</span>
            <select value={sessionFilters.role} onChange={handleSessionFilterChange('role')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm">
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Statut</span>
            <select value={sessionFilters.status} onChange={handleSessionFilterChange('status')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm">
              {sessionStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70 lg:col-span-2">
            <span className="mb-1 block">Recherche</span>
            <input
              type="text"
              value={sessionFilters.search}
              onChange={handleSessionFilterChange('search')}
              placeholder="Email, IP, ID session"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Device</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Ouverte</th>
                <th className="px-3 py-2 text-left font-semibold">Expire</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessionsQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={6}>
                    Chargement des sessions…
                  </td>
                </tr>
              ) : sessionItems.length ? (
                sessionItems.map((session) => (
                  <tr key={session.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-saubio-forest">{session.user.email}</p>
                      <p className="text-xs text-saubio-slate/60">
                        {session.user.firstName} {session.user.lastName} · {session.user.role}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <p className="font-semibold text-saubio-forest">{session.ipAddress ?? '—'}</p>
                      <p className="text-saubio-slate/60">{session.userAgent ?? 'n/a'}</p>
                    </td>
                    <td className="px-3 py-3">{statusBadge(session.status)}</td>
                    <td className="px-3 py-3 text-xs">
                      <p>{formatDate(session.createdAt)}</p>
                      <p className="text-saubio-slate/60">MAJ {formatDate(session.updatedAt)}</p>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <p>{formatDate(session.expiresAt)}</p>
                      {session.revokedAt ? <p className="text-rose-600">Révoquée {formatDate(session.revokedAt)}</p> : null}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleRevoke(session.id)}
                        disabled={session.status !== 'active' || revokeSession.isPending}
                        className="text-xs font-semibold text-rose-600 underline disabled:opacity-30"
                      >
                        Révoquer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={6}>
                    Aucune session selon vos filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-saubio-slate/70">
            Page {sessionFilters.page} / {sessionPages} — {sessionTotal} sessions
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSessionFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={sessionFilters.page <= 1}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setSessionFilters((prev) => ({ ...prev, page: Math.min(sessionPages, prev.page + 1) }))}
              disabled={sessionFilters.page >= sessionPages}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70 lg:col-span-2">
            <span className="mb-1 block">Recherche</span>
            <input
              type="text"
              value={loginFilters.search}
              onChange={handleLoginFilterChange('search')}
              placeholder="Email, IP, user-agent"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Résultat</span>
            <select value={loginFilters.result} onChange={handleLoginFilterChange('result')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm">
              {loginResultOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Depuis</span>
            <input type="date" value={loginFilters.from} onChange={handleLoginFilterChange('from')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
            <span className="mb-1 block">Jusqu&apos;à</span>
            <input type="date" value={loginFilters.to} onChange={handleLoginFilterChange('to')} className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm" />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Email</th>
                <th className="px-3 py-2 text-left font-semibold">Rôle</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Raison</th>
                <th className="px-3 py-2 text-left font-semibold">IP / Agent</th>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {attemptsQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={6}>
                    Chargement des tentatives…
                  </td>
                </tr>
              ) : attemptItems.length ? (
                attemptItems.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-saubio-forest">{attempt.email}</p>
                      <p className="text-xs text-saubio-slate/60">{attempt.provider ?? 'mot de passe'}</p>
                    </td>
                    <td className="px-3 py-3 text-xs">{attempt.userRole ?? '—'}</td>
                    <td className="px-3 py-3">{attemptBadge(attempt.success)}</td>
                    <td className="px-3 py-3 text-xs text-saubio-slate/70">{attempt.reason ?? '—'}</td>
                    <td className="px-3 py-3 text-xs">
                      <p className="font-semibold text-saubio-forest">{attempt.ipAddress ?? '—'}</p>
                      <p className="text-saubio-slate/60">{attempt.userAgent ?? 'n/a'}</p>
                    </td>
                    <td className="px-3 py-3 text-xs">{formatDate(attempt.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={6}>
                    Aucune tentative enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-saubio-slate/70">
            Page {loginFilters.page} / {attemptPages} — {attemptTotal} évènements
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLoginFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={loginFilters.page <= 1}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setLoginFilters((prev) => ({ ...prev, page: Math.min(attemptPages, prev.page + 1) }))}
              disabled={loginFilters.page >= attemptPages}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-saubio-forest">Logs sécurité</h2>
            <p className="text-sm text-saubio-slate/70">Webhook, auth, permissions. Traquez les anomalies.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
            <select value={logFilters.category} onChange={handleLogFilterChange('category')} className="rounded-full border border-saubio-forest/20 px-3 py-1">
              {logCategories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select value={logFilters.level} onChange={handleLogFilterChange('level')} className="rounded-full border border-saubio-forest/20 px-3 py-1">
              {logLevels.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={logFilters.search}
              onChange={handleLogFilterChange('search')}
              placeholder="Recherche"
              className="rounded-full border border-saubio-forest/20 px-3 py-1"
            />
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Catégorie</th>
                <th className="px-3 py-2 text-left font-semibold">Niveau</th>
                <th className="px-3 py-2 text-left font-semibold">Message</th>
                <th className="px-3 py-2 text-left font-semibold">Acteur</th>
              </tr>
            </thead>
            <tbody>
              {logsQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={5}>
                    Chargement des logs…
                  </td>
                </tr>
              ) : logItems.length ? (
                logItems.map((log) => (
                  <tr key={log.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2 text-xs text-saubio-slate/70">{formatDate(log.createdAt)}</td>
                    <td className="px-3 py-2 capitalize">{log.category}</td>
                    <td className="px-3 py-2 capitalize">{log.level}</td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-saubio-forest">{log.message}</p>
                      {log.requestId ? <p className="text-xs text-saubio-slate/60">Req #{log.requestId}</p> : null}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/70">{log.actorEmail ?? '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={5}>
                    Aucun log ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-sm text-saubio-slate/70">
          <span>
            Page {logFilters.page} / {logPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLogFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={logFilters.page <= 1}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setLogFilters((prev) => ({ ...prev, page: Math.min(logPages, prev.page + 1) }))}
              disabled={logFilters.page >= logPages}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-5 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-saubio-forest">Incidents sécurité</h2>
          <p className="text-sm text-saubio-slate/70">Déclarez, assignez et clôturez les incidents critiques.</p>
        </header>
        <form onSubmit={handleCreateIncident} className="grid gap-3 rounded-2xl border border-saubio-forest/10 p-4 md:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-saubio-slate/70">
            <span className="mb-1 block">Titre</span>
            <input
              value={newIncident.title}
              onChange={(event) => setNewIncident((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Webhook Stripe bloqué"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-saubio-slate/70">
            <span className="mb-1 block">Catégorie</span>
            <select
              value={newIncident.category}
              onChange={(event) => setNewIncident((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            >
              {logCategories
                .filter((option) => option.value !== 'all')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                  {option.label}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-saubio-slate/70">
            <span className="mb-1 block">Sévérité</span>
            <select
              value={newIncident.severity}
              onChange={(event) => setNewIncident((prev) => ({ ...prev, severity: event.target.value }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            >
              {['low', 'medium', 'high', 'critical'].map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2 text-xs font-semibold uppercase tracking-[0.2em] text-saubio-slate/70">
            <span className="mb-1 block">Description</span>
            <textarea
              value={newIncident.description}
              onChange={(event) => setNewIncident((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              placeholder="Observations, logs, reproductions…"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="md:col-span-2 rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            disabled={createIncident.isPending}
          >
            {createIncident.isPending ? 'Création…' : 'Créer un incident'}
          </button>
        </form>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
              <select value={incidentFilters.status} onChange={handleIncidentFilterChange('status')} className="rounded-full border border-saubio-forest/20 px-3 py-1">
                {incidentStatuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select value={incidentFilters.category} onChange={handleIncidentFilterChange('category')} className="rounded-full border border-saubio-forest/20 px-3 py-1">
                {logCategories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select value={incidentFilters.severity} onChange={handleIncidentFilterChange('severity')} className="rounded-full border border-saubio-forest/20 px-3 py-1">
                {incidentSeverities.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={incidentFilters.search}
                onChange={handleIncidentFilterChange('search')}
                placeholder="Recherche"
                className="flex-1 rounded-full border border-saubio-forest/20 px-3 py-1"
              />
            </div>
            <div className="max-h-96 overflow-y-auto rounded-2xl border border-saubio-forest/10">
              <ul>
                {incidentsQuery.isLoading ? (
                  <li className="p-4 text-center text-sm text-saubio-slate/70">Chargement…</li>
                ) : incidentItems.length ? (
                  incidentItems.map((incident) => (
                    <li
                      key={incident.id}
                      className={`cursor-pointer border-b border-saubio-forest/5 p-3 text-sm ${
                        incident.id === selectedIncident?.id ? 'bg-saubio-mist/30' : 'bg-white/60'
                      }`}
                      onClick={() => setSelectedIncidentId(incident.id)}
                    >
                      <p className="font-semibold text-saubio-forest">{incident.title}</p>
                      <p className="text-xs text-saubio-slate/60">
                        {incident.category} · {incident.severity}
                      </p>
                      <p className="text-xs text-saubio-slate/60">Statut: {incident.status}</p>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-sm text-saubio-slate/70">Aucun incident.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-saubio-forest/10 p-4">
            {selectedIncident ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-saubio-forest">{selectedIncident.title}</h3>
                    <p className="text-sm text-saubio-slate/70">{selectedIncident.description}</p>
                    <p className="mt-2 text-xs text-saubio-slate/60">
                      {formatDate(selectedIncident.createdAt)} · Sévérité {selectedIncident.severity}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleIncidentAssign(selectedIncident.id)}
                      className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest"
                    >
                      Assigner
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncidentStatusChange(selectedIncident.id, 'in_progress')}
                      className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest"
                    >
                      Marquer en cours
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncidentStatusChange(selectedIncident.id, 'resolved')}
                      className="rounded-full border border-saubio-forest/20 px-3 py-1 text-emerald-600"
                    >
                      Résoudre
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/60">Timeline</p>
                  <ol className="mt-2 space-y-2">
                    {selectedIncident.timeline.length ? (
                      selectedIncident.timeline.map((entry) => (
                        <li key={entry.id} className="rounded-xl border border-saubio-forest/10 bg-saubio-mist/20 p-3 text-xs text-saubio-slate/70">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-saubio-forest">{entry.actorLabel ?? 'Système'}</span>
                            <span>{formatDate(entry.createdAt)}</span>
                          </div>
                          <p className="uppercase text-[10px] tracking-[0.3em] text-saubio-slate/50">{entry.action}</p>
                          {entry.message ? <p className="mt-1">{entry.message}</p> : null}
                        </li>
                      ))
                    ) : (
                      <li className="rounded-xl border border-saubio-forest/10 bg-saubio-mist/20 p-3 text-xs text-saubio-slate/70">
                        Aucun événement enregistré.
                      </li>
                    )}
                  </ol>
                </div>
              </>
            ) : (
              <p className="text-sm text-saubio-slate/70">Sélectionnez un incident pour voir le détail.</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-saubio-slate/70">
          <span>
            Page {incidentFilters.page} / {incidentPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIncidentFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={incidentFilters.page <= 1}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setIncidentFilters((prev) => ({ ...prev, page: Math.min(incidentPages, prev.page + 1) }))}
              disabled={incidentFilters.page >= incidentPages}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
