'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton, Badge } from '@saubio/ui';
import { useAdminSupportTickets, useAdminSupportTicket } from '@saubio/utils';

const STATUS_FILTERS: Array<{ label: string; value: 'all' | 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Ouverts', value: 'open' },
  { label: 'En cours', value: 'in_progress' },
  { label: 'En attente client', value: 'waiting_customer' },
  { label: 'Résolus', value: 'resolved' },
];

const STATUS_TONE: Record<string, string> = {
  open: 'bg-sky-100 text-sky-900',
  in_progress: 'bg-saubio-sun/40 text-saubio-forest',
  waiting_customer: 'bg-amber-100 text-amber-900',
  resolved: 'bg-emerald-100 text-emerald-900',
  closed: 'bg-saubio-slate/20 text-saubio-slate/70',
};

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Basse',
  medium: 'Normale',
  high: 'Haute',
  urgent: 'Critique',
};

export default function AdminSupportTicketsPage() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['value']>('all');
  const filters = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
      pageSize: 25,
    }),
    [status]
  );
  const { data, isLoading } = useAdminSupportTickets(filters);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const { data: ticketDetail } = useAdminSupportTicket(selectedTicketId ?? undefined);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Centre de tickets</h1>
        <p className="text-sm text-saubio-slate/70">Recherchez, filtrez et suivez les tickets clients ou prestataires.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold ${
                  status === filter.value ? 'bg-saubio-forest text-white' : 'text-saubio-forest'
                }`}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-3xl" />
          ) : (
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Sujet</th>
                  <th className="px-3 py-2 text-left font-semibold">Demandeur</th>
                  <th className="px-3 py-2 text-left font-semibold">Booking</th>
                  <th className="px-3 py-2 text-left font-semibold">Priorité</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Assigné à</th>
                  <th className="px-3 py-2 text-left font-semibold">MAJ</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={`cursor-pointer border-b border-saubio-forest/5 transition hover:bg-saubio-forest/5 last:border-0 ${
                      selectedTicketId === ticket.id ? 'bg-saubio-forest/10' : ''
                    }`}
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{ticket.id}</td>
                    <td className="px-3 py-2">{ticket.subject}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{ticket.requester.name}</td>
                    <td className="px-3 py-2 text-saubio-forest">{ticket.booking?.id ?? '—'}</td>
                    <td className="px-3 py-2 text-xs uppercase tracking-wide">{PRIORITY_LABEL[ticket.priority]}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_TONE[ticket.status] ?? ''}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{ticket.assignee?.name ?? 'Non assigné'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {new Date(ticket.updatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
                {data && data.items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-xs text-saubio-slate/60">
                      Aucun ticket ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </SurfaceCard>

      {selectedTicketId && (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Ticket {selectedTicketId}</p>
          {!ticketDetail ? (
            <Skeleton className="h-48 w-full rounded-3xl" />
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-base font-semibold text-saubio-forest">{ticketDetail.ticket.subject}</p>
                <p className="text-xs text-saubio-slate/60">{ticketDetail.ticket.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-saubio-slate/60">
                  <Badge className="rounded-full bg-saubio-forest/10 text-saubio-forest">
                    {PRIORITY_LABEL[ticketDetail.ticket.priority]}
                  </Badge>
                  <Badge className="rounded-full bg-saubio-slate/10 text-saubio-slate/80 capitalize">
                    {ticketDetail.ticket.category.replace('_', ' ')}
                  </Badge>
                  {ticketDetail.ticket.booking && (
                    <Badge className="rounded-full bg-sky-100 text-sky-900">Booking {ticketDetail.ticket.booking.id}</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-saubio-forest">Conversation</p>
                <div className="space-y-2 rounded-2xl border border-saubio-forest/10 bg-saubio-slate/5 p-4">
                  {ticketDetail.messages.map((message) => (
                    <div key={message.id} className="rounded-2xl bg-white/80 p-3 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-saubio-slate/60">
                        <span className="font-semibold text-saubio-forest">{message.author?.name ?? 'Support'}</span>
                        <span>{new Date(message.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <p className="text-sm text-saubio-slate-900">{message.content}</p>
                      {message.internal && <p className="text-[10px] uppercase tracking-wide text-amber-700">Note interne</p>}
                    </div>
                  ))}
                  {ticketDetail.messages.length === 0 && (
                    <p className="text-center text-xs text-saubio-slate/60">Aucun message pour le moment.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </SurfaceCard>
      )}
    </div>
  );
}
