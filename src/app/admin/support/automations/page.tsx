'use client';

import { useMemo } from 'react';
import { SurfaceCard, Skeleton, Badge } from '@saubio/ui';
import { useAdminSupportSla, useAdminSupportTickets } from '@saubio/utils';

const STATUS_LABELS: Record<string, string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  waiting_customer: 'En attente client',
  resolved: 'Résolu',
  closed: 'Clos',
};

const PRIORITY_TONE: Record<string, string> = {
  low: 'bg-saubio-slate/10 text-saubio-slate/70',
  medium: 'bg-saubio-sun/30 text-saubio-forest',
  high: 'bg-amber-100 text-amber-900',
  urgent: 'bg-rose-100 text-rose-900',
};

function durationLabel(value: number | null | undefined, unit: 'minutes' | 'hours') {
  if (value === null || value === undefined) return '—';
  const formatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  return `${formatter.format(value)} ${unit === 'minutes' ? 'min' : 'h'}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AdminSupportAutomationsPage() {
  const { data: slaData, isLoading: isSlaLoading } = useAdminSupportSla();
  const { data: ticketData, isLoading: isTicketLoading, isFetching } = useAdminSupportTickets({ pageSize: 100 });
  const tickets = ticketData?.items ?? [];

  const automationCandidates = useMemo(() => {
    const now = Date.now();
    const mapCandidate = (ticket: (typeof tickets)[number], reason: string) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      bookingId: ticket.booking?.id ?? '—',
      note: reason,
      updatedAt: ticket.updatedAt,
    });

    const waiting = tickets.filter((ticket) => ticket.status === 'waiting_customer').map((ticket) => mapCandidate(ticket, 'Relancer le client'));
    const overdue = tickets
      .filter(
        (ticket) => Boolean(ticket.dueAt) && new Date(ticket.dueAt!).getTime() < now && !['resolved', 'closed'].includes(ticket.status)
      )
      .map((ticket) => mapCandidate(ticket, 'Échéance dépassée'));
    const urgent = tickets.filter((ticket) => ticket.priority === 'urgent').map((ticket) => mapCandidate(ticket, 'Priorité critique'));

    const deduped = [...waiting, ...overdue, ...urgent].reduce<typeof waiting>((acc, candidate) => {
      if (acc.find((item) => item.id === candidate.id)) {
        return acc;
      }
      acc.push(candidate);
      return acc;
    }, []);

    return deduped.slice(0, 12);
  }, [tickets]);

  const statusDistribution = useMemo(() => {
    return tickets.reduce<Record<string, number>>((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [tickets]);

  const templateUsage = useMemo(() => {
    const categoryCounts = tickets.reduce<Record<string, number>>((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
  }, [tickets]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Automatisation du support</h1>
        <p className="text-sm text-saubio-slate/70">
          Appuyez-vous sur les données réelles (SLA, tickets en file d’attente, catégories dominantes) pour piloter les workflows.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-4 text-sm font-semibold text-saubio-forest">Indicateurs SLA</p>
        {isSlaLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Première réponse</p>
              <p className="text-2xl font-semibold text-saubio-forest">{durationLabel(slaData?.averageFirstResponseMinutes, 'minutes')}</p>
              <p className="text-xs text-saubio-slate/60">en moyenne</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Résolution</p>
              <p className="text-2xl font-semibold text-saubio-forest">{durationLabel(slaData?.averageResolutionHours, 'hours')}</p>
              <p className="text-xs text-saubio-slate/60">avant clôture</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Satisf. moyenne</p>
              <p className="text-2xl font-semibold text-saubio-forest">
                {slaData?.satisfactionScore !== null && slaData?.satisfactionScore !== undefined ? `${slaData.satisfactionScore.toFixed(1)}/5` : '—'}
              </p>
              <p className="text-xs text-saubio-slate/60">{slaData?.feedbackSampleSize ?? 0} retours</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">&lt; 24h</p>
              <p className="text-2xl font-semibold text-saubio-forest">
                {slaData?.resolution24hRate !== null && slaData?.resolution24hRate !== undefined ? `${slaData.resolution24hRate.toFixed(0)} %` : '—'}
              </p>
              <p className="text-xs text-saubio-slate/60">tickets clos &lt; 24h</p>
            </div>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Tickets ciblés par automatisation</p>
            <p className="text-xs text-saubio-slate/60">Identification des tickets en retard, urgents ou en attente client.</p>
          </div>
        </div>
        {isTicketLoading ? (
          <Skeleton className="h-64 w-full rounded-3xl" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Ticket</th>
                  <th className="px-3 py-2 text-left font-semibold">Booking</th>
                  <th className="px-3 py-2 text-left font-semibold">Priorité</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Recommandation</th>
                  <th className="px-3 py-2 text-left font-semibold">MAJ</th>
                </tr>
              </thead>
              <tbody>
                {automationCandidates.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-saubio-forest/5 last:border-0">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{ticket.subject}</td>
                    <td className="px-3 py-2 text-saubio-forest">{ticket.bookingId}</td>
                    <td className="px-3 py-2">
                      <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_TONE[ticket.priority] ?? ''}`}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">{STATUS_LABELS[ticket.status] ?? ticket.status}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{ticket.note}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDate(ticket.updatedAt)}</td>
                  </tr>
                ))}
                {automationCandidates.length === 0 && !isFetching && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-xs text-saubio-slate/60">
                      Aucun ticket ne nécessite d’automatisation pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Répartition des statuts</p>
            <ul className="mt-3 space-y-2 text-xs text-saubio-slate/70">
              {Object.entries(statusDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between rounded-2xl border border-saubio-forest/10 px-4 py-2">
                    <span className="font-semibold text-saubio-forest">{STATUS_LABELS[status] ?? status}</span>
                    <span>{count}</span>
                  </li>
                ))}
              {Object.keys(statusDistribution).length === 0 && <li className="text-center">Aucune donnée de ticket pour l’instant.</li>}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Templates les plus utilisés</p>
            <div className="mt-3 grid gap-3">
              {templateUsage.map((template) => (
                <div key={template.category} className="rounded-2xl border border-saubio-forest/10 bg-saubio-slate/5 px-4 py-3 text-sm text-saubio-forest">
                  <p className="font-semibold uppercase tracking-[0.2em] text-saubio-slate/60">{template.category.replace('_', ' ')}</p>
                  <p className="text-2xl font-semibold">{template.count}</p>
                  <p className="text-xs text-saubio-slate/60">tickets sur la période</p>
                </div>
              ))}
              {templateUsage.length === 0 && <p className="text-xs text-saubio-slate/60">Pas encore de catégorie dominante.</p>}
            </div>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
