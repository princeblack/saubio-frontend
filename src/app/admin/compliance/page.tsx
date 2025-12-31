'use client';

import { useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import {
  formatDateTime,
  useAdminConsents,
  useAdminGdprRequests,
  useAdminSecurityIncidents,
  useAdminSecurityLoginAttempts,
} from '@saubio/utils';
import type { AdminGdprRequest } from '@saubio/models';

const statusLabels: Record<AdminGdprRequest['status'], string> = {
  pending: 'En attente',
  processing: 'En traitement',
  completed: 'Terminé',
  rejected: 'Rejeté',
};

const typeLabels: Record<AdminGdprRequest['type'], string> = {
  export: 'Export',
  deletion: 'Suppression',
  rectification: 'Rectification',
};

const badgeStyle: Record<AdminGdprRequest['status'], string> = {
  pending: 'bg-saubio-sun/10 text-saubio-sun/80',
  processing: 'bg-sky-50 text-sky-900',
  completed: 'bg-emerald-50 text-emerald-900',
  rejected: 'bg-rose-50 text-rose-900',
};

export default function AdminComplianceOverviewPage() {
  const gdprListQuery = useAdminGdprRequests({ page: 1, limit: 5 });
  const pendingQuery = useAdminGdprRequests({ status: 'pending', page: 1, limit: 1 });
  const processingQuery = useAdminGdprRequests({ status: 'processing', page: 1, limit: 1 });
  const consentsQuery = useAdminConsents({ page: 1, limit: 1 });
  const loginAttemptsQuery = useAdminSecurityLoginAttempts({ success: false, page: 1, limit: 1 });
  const incidentsQuery = useAdminSecurityIncidents({ status: 'open', page: 1, limit: 4 });

  const requests = gdprListQuery.data?.items ?? [];
  const incidents = incidentsQuery.data?.items ?? [];

  const cards = useMemo(() => {
    const pending = pendingQuery.data?.total ?? 0;
    const processing = processingQuery.data?.total ?? 0;
    const consents = consentsQuery.data?.total ?? 0;
    const incidentsOpen = incidentsQuery.data?.total ?? 0;
    const loginAttempts = loginAttemptsQuery.data?.total ?? 0;

    return [
      { label: 'Demandes RGPD ouvertes', value: pending, helper: `${processing} en traitement` },
      { label: 'Consentements suivis', value: consents, helper: 'Total des utilisateurs suivis côté compliance' },
      { label: 'Incidents sécurité ouverts', value: incidentsOpen, helper: 'Auth / permissions / webhooks' },
      { label: 'Tentatives login refusées', value: loginAttempts, helper: 'Fenêtre courante (derniers rapports)' },
    ];
  }, [pendingQuery.data?.total, processingQuery.data?.total, consentsQuery.data?.total, incidentsQuery.data?.total, loginAttemptsQuery.data?.total]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">RGPD · Sécurité · Paiements</h1>
        <p className="text-sm text-saubio-slate/70">
          Synthèse en temps réel : demandes RGPD, consentements, incidents et tentatives de connexion sensibles.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <SurfaceCard
            key={card.label}
            className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm text-saubio-slate/70 shadow-soft-lg"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">
              {pendingQuery.isLoading || processingQuery.isLoading || consentsQuery.isLoading || incidentsQuery.isLoading || loginAttemptsQuery.isLoading
                ? '…'
                : card.value.toLocaleString('fr-FR')}
            </p>
            <p className="text-xs text-saubio-slate/60">{card.helper}</p>
          </SurfaceCard>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-saubio-forest">Demandes RGPD récentes</p>
              <p className="text-xs text-saubio-slate/60">
                Export, rectification et suppression envoyés par clients, prestataires ou employés.
              </p>
            </div>
            <a href="/admin/compliance/requests" className="text-xs font-semibold text-saubio-forest underline">
              Voir tout
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                  <th className="px-3 py-2 text-left font-semibold">Type</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Mis à jour</th>
                </tr>
              </thead>
              <tbody>
                {gdprListQuery.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      Aucune demande pour le moment.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2 font-semibold text-saubio-forest">{request.id}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">
                        {request.user.email}
                        <span className="block text-[11px] uppercase tracking-[0.2em] text-saubio-slate/40">
                          {request.userRole}
                        </span>
                      </td>
                      <td className="px-3 py-2">{typeLabels[request.type]}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle[request.status]}`}>
                          {statusLabels[request.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(request.updatedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-saubio-forest">Incidents & alertes</p>
              <p className="text-xs text-saubio-slate/60">Autorisations, webhooks, paiements et actions admin.</p>
            </div>
            <a href="/admin/compliance/security" className="text-xs font-semibold text-saubio-forest underline">
              Centre sécurité
            </a>
          </div>
          <div className="space-y-3">
            {incidentsQuery.isLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-saubio-slate/60">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : incidents.length === 0 ? (
              <p className="text-sm text-saubio-slate/60">Aucun incident ouvert.</p>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="rounded-2xl border border-saubio-forest/10 bg-saubio-forest/2 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-saubio-forest">{incident.title}</p>
                    <span className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">{incident.category}</span>
                  </div>
                  <p className="text-xs text-saubio-slate/60">{incident.description ?? '—'}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-saubio-slate/60">
                    <span>Assigné : {incident.assignedTo?.name ?? '—'}</span>
                    <span>{formatDateTime(incident.updatedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
