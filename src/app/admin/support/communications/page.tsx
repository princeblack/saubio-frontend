'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton, Badge } from '@saubio/ui';
import { useAdminSupportTickets } from '@saubio/utils';

const CHANNEL_TONE: Record<string, string> = {
  app: 'bg-sky-100 text-sky-900',
  email: 'bg-saubio-sun/30 text-saubio-forest',
  phone: 'bg-amber-100 text-amber-900',
  chat: 'bg-saubio-slate/15 text-saubio-forest',
};

function formatParticipants(participants: Array<string | undefined>) {
  return participants.filter(Boolean).join(' • ');
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AdminSupportCommunicationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'>('all');

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      pageSize: 25,
    }),
    [search, statusFilter]
  );

  const { data, isLoading, isFetching } = useAdminSupportTickets(filters);
  const threads = data?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Historique des communications</h1>
        <p className="text-sm text-saubio-slate/70">
          Visualisez les échanges réels client ↔ prestataire ↔ support (tickets et messages) en temps réel.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Conversations liées aux réservations</p>
            <p className="text-xs text-saubio-slate/60">Recherche par booking, client, prestataire ou mot-clé.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest outline-none"
            >
              <option value="all">Tous statuts</option>
              <option value="open">Ouverts</option>
              <option value="in_progress">En cours</option>
              <option value="waiting_customer">En attente client</option>
              <option value="resolved">Résolus</option>
              <option value="closed">Clos</option>
            </select>
            <input
              type="text"
              placeholder="Rechercher un ticket ou booking"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-full border border-saubio-forest/20 px-3 py-1 text-saubio-forest outline-none placeholder:text-saubio-slate/60"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-3xl" />
          ) : (
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Ticket</th>
                  <th className="px-3 py-2 text-left font-semibold">Participants</th>
                  <th className="px-3 py-2 text-left font-semibold">Sujet</th>
                  <th className="px-3 py-2 text-left font-semibold">Messages</th>
                  <th className="px-3 py-2 text-left font-semibold">Canal</th>
                  <th className="px-3 py-2 text-left font-semibold">Dernière activité</th>
                </tr>
              </thead>
              <tbody>
                {threads.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-saubio-forest/5 last:border-0">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      {ticket.booking?.id ?? '—'}
                      <div className="text-[11px] font-normal uppercase tracking-[0.3em] text-saubio-slate/60">#{ticket.id}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {formatParticipants([ticket.requester?.name, ticket.assignee?.name, ticket.booking?.providerName]) || 'Support Saubio'}
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-saubio-forest">{ticket.subject}</p>
                      <p className="text-xs text-saubio-slate/60 line-clamp-2">{ticket.description}</p>
                    </td>
                    <td className="px-3 py-2 text-center">{ticket.messageCount}</td>
                    <td className="px-3 py-2">
                      <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${CHANNEL_TONE[ticket.channel] ?? 'bg-saubio-slate/10 text-saubio-forest'}`}>
                        {ticket.channel}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDate(ticket.updatedAt)}</td>
                  </tr>
                ))}
                {threads.length === 0 && !isFetching && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-xs text-saubio-slate/60">
                      Aucun échange ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
