'use client';

import { useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import {
  formatDateTime,
  useAdminSecurityIncidents,
  useAdminSecurityLoginAttempts,
  useAdminSecurityLogs,
  useAdminSecuritySessions,
} from '@saubio/utils';
import { Loader2 } from 'lucide-react';

const badgeTone = {
  active: 'bg-emerald-50 text-emerald-900',
  revoked: 'bg-rose-50 text-rose-900',
  expired: 'bg-saubio-slate/10 text-saubio-slate/80',
};

const incidentTone = {
  open: 'bg-rose-50 text-rose-900',
  in_progress: 'bg-saubio-sun/10 text-saubio-sun/80',
  resolved: 'bg-emerald-50 text-emerald-900',
  closed: 'bg-saubio-slate/10 text-saubio-slate/80',
};

export default function AdminSystemSecurityPage() {
  const sessionsQuery = useAdminSecuritySessions({ status: 'active', page: 1, limit: 10 });
  const attemptsQuery = useAdminSecurityLoginAttempts({ success: false, page: 1, limit: 12 });
  const logsQuery = useAdminSecurityLogs({ level: 'warn', page: 1, limit: 8 });
  const incidentsQuery = useAdminSecurityIncidents({ status: 'open', page: 1, limit: 5 });

  const sessions = sessionsQuery.data?.items ?? [];
  const attempts = attemptsQuery.data?.items ?? [];
  const logs = logsQuery.data?.items ?? [];
  const incidents = incidentsQuery.data?.items ?? [];

  const summaryCards = useMemo(() => {
    const activeSessions = sessionsQuery.data?.total ?? 0;
    const riskyAttempts24h = attempts.filter((attempt) => attempt.createdAt).length;
    const openIncidents = incidentsQuery.data?.total ?? 0;
    const warnLogs = logs.filter((log) => log.level !== 'info').length;

    return [
      {
        label: 'Sessions actives',
        value: sessionsQuery.isLoading ? '—' : activeSessions.toString(),
        helper: 'Sessions admin/employee en cours',
      },
      {
        label: 'Tentatives échouées (fenêtre)',
        value: attemptsQuery.isLoading ? '—' : riskyAttempts24h.toString(),
        helper: 'Derniers appels à /auth/login',
      },
      {
        label: 'Incidents ouverts',
        value: incidentsQuery.isLoading ? '—' : openIncidents.toString(),
        helper: 'Suivi SOC (auth, permissions, webhooks)',
      },
      {
        label: 'Logs critiques',
        value: logsQuery.isLoading ? '—' : warnLogs.toString(),
        helper: 'Niveau warn/error sur 50 derniers événements',
      },
    ];
  }, [sessionsQuery, attemptsQuery, logsQuery, incidentsQuery, attempts, logs]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Monitoring sécurité</h1>
        <p className="text-sm text-saubio-slate/70">
          Sessions actives, tentatives d&apos;intrusion, logs critiques et incidents en cours.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <SurfaceCard
            key={card.label}
            className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-saubio-slate/70 shadow-soft-lg"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
            <p className="text-xs">{card.helper}</p>
          </SurfaceCard>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-4">
            <p className="text-sm font-semibold text-saubio-forest">Sessions admin</p>
            <p className="text-xs text-saubio-slate/60">Dernières connexions (JWT actifs / expirés).</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                  <th className="px-3 py-2 text-left font-semibold">Rôle</th>
                  <th className="px-3 py-2 text-left font-semibold">Créée</th>
                  <th className="px-3 py-2 text-left font-semibold">Expire</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {sessionsQuery.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      Aucune session récente.
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2 font-semibold text-saubio-forest">{session.user.email}</td>
                      <td className="px-3 py-2 uppercase text-xs text-saubio-slate/50">{session.user.role}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(session.createdAt)}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(session.expiresAt)}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeTone[session.status]}`}>
                          {session.status === 'active'
                            ? 'Active'
                            : session.status === 'revoked'
                              ? 'Révoquée'
                              : 'Expirée'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-4">
            <p className="text-sm font-semibold text-saubio-forest">Tentatives de connexion</p>
            <p className="text-xs text-saubio-slate/60">Derniers refus (mauvais mot de passe, compte verrouillé, token expiré).</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
                  <th className="px-3 py-2 text-left font-semibold">Email</th>
                  <th className="px-3 py-2 text-left font-semibold">Rôle</th>
                  <th className="px-3 py-2 text-left font-semibold">Origine</th>
                  <th className="px-3 py-2 text-left font-semibold">Raison</th>
                </tr>
              </thead>
              <tbody>
                {attemptsQuery.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : attempts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      Aucune tentative suspecte.
                    </td>
                  </tr>
                ) : (
                  attempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(attempt.createdAt)}</td>
                      <td className="px-3 py-2 text-xs text-saubio-forest">{attempt.email ?? '—'}</td>
                      <td className="px-3 py-2 uppercase text-xs text-saubio-slate/60">{attempt.userRole ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">
                        {attempt.ip ?? '—'}
                        {attempt.country ? <span className="text-[11px] text-saubio-slate/40"> · {attempt.country}</span> : null}
                      </td>
                      <td className="px-3 py-2 text-xs text-rose-700">{attempt.reason ?? 'Échec'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Incidents</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">
            Déclarer un incident
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Titre</th>
                <th className="px-3 py-2 text-left font-semibold">Catégorie</th>
                <th className="px-3 py-2 text-left font-semibold">Sévérité</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Assigné à</th>
                <th className="px-3 py-2 text-left font-semibold">MAJ</th>
              </tr>
            </thead>
            <tbody>
              {incidentsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun incident ouvert.
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => (
                  <tr key={incident.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{incident.title}</td>
                    <td className="px-3 py-2 uppercase text-xs text-saubio-slate/60">{incident.category}</td>
                    <td className="px-3 py-2 uppercase text-xs text-saubio-slate/60">{incident.severity}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${incidentTone[incident.status]}`}>
                        {incident.status === 'in_progress' ? 'En cours' : incident.status === 'closed' ? 'Clos' : 'Ouvert'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{incident.assignedTo?.name ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(incident.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Logs sécurité</p>
          <p className="text-xs text-saubio-slate/60">Filtré sur catégories auth/permissions.</p>
        </div>
        <div className="space-y-2">
          {logsQuery.isLoading ? (
            <div className="flex items-center justify-center py-6 text-sm text-saubio-slate/60">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-saubio-slate/60">Aucun log critique sur la fenêtre consultée.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-saubio-forest/10 bg-saubio-forest/2 px-4 py-3 text-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                  <span>{log.category}</span>
                  <span className="font-semibold text-saubio-forest">{log.level}</span>
                </div>
                <p className="mt-1 font-semibold text-saubio-forest">{log.message}</p>
                <p className="text-xs text-saubio-slate/60">{formatDateTime(log.createdAt)}</p>
                {log.metadata ? (
                  <pre className="mt-2 overflow-x-auto rounded-2xl bg-white/80 p-3 text-[11px] text-saubio-slate/70">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
