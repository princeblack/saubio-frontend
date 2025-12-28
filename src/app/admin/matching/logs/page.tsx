'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Search } from 'lucide-react';
import { SERVICE_CATALOG } from '@saubio/models';
import {
  useAdminSmartMatchingHistory,
  useAdminSmartMatchingDetail,
} from '@saubio/utils';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdminMatchingLogsPage() {
  const [inputs, setInputs] = useState({ search: '', service: 'all', result: 'all' });
  const [applied, setApplied] = useState(inputs);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const historyQuery = useAdminSmartMatchingHistory({
    page,
    pageSize,
    search: applied.search || undefined,
    service: applied.service === 'all' ? undefined : applied.service,
    result: applied.result === 'all' ? undefined : (applied.result as 'assigned' | 'unassigned'),
  });
  const items = historyQuery.data?.items ?? [];
  const totalPages = historyQuery.data ? Math.ceil(historyQuery.data.total / historyQuery.data.pageSize) : 1;
  const [selected, setSelected] = useState<string | null>(null);
  const detailQuery = useAdminSmartMatchingDetail(selected ?? undefined);
  const detail = detailQuery.data;

  const invitationSummary = useMemo(() => {
    if (!detail) return [];
    return detail.invitations;
  }, [detail]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setApplied(inputs);
    setPage(1);
  };

  const handleReset = () => {
    const reset = { search: '', service: 'all', result: 'all' };
    setInputs(reset);
    setApplied(reset);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Smart Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Journal de matching</h1>
        <p className="text-sm text-saubio-slate/70">Trace complète des invitations envoyées, réponses prestataires et assignations.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
          <label className="flex items-center gap-2 rounded-2xl border border-saubio-forest/10 bg-saubio-mist px-3">
            <Search className="h-4 w-4 text-saubio-slate/60" />
            <input
              type="text"
              value={inputs.search}
              onChange={(event) => setInputs((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="ID booking, client…"
              className="h-11 flex-1 border-none bg-transparent text-sm text-saubio-forest outline-none"
            />
          </label>
          <select
            value={inputs.service}
            onChange={(event) => setInputs((prev) => ({ ...prev, service: event.target.value }))}
            className="rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
          >
            <option value="all">Tous services</option>
            {SERVICE_CATALOG.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
          <select
            value={inputs.result}
            onChange={(event) => setInputs((prev) => ({ ...prev, result: event.target.value }))}
            className="rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
          >
            <option value="all">Tous résultats</option>
            <option value="assigned">Assigné</option>
            <option value="unassigned">Non pourvu</option>
          </select>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest">
              Rechercher
            </button>
            <button type="button" onClick={handleReset} className="rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm text-saubio-slate/70">
              Réinitialiser
            </button>
          </div>
        </form>
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">Tentatives récentes</p>
            <p className="text-xs text-saubio-slate/60">
              Page {page} / {totalPages || 1}
            </p>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="py-2 text-left font-semibold">Booking</th>
                  <th className="py-2 text-left font-semibold">Client</th>
                  <th className="py-2 text-left font-semibold">Invitations</th>
                  <th className="py-2 text-left font-semibold">Résultat</th>
                  <th className="py-2 text-left font-semibold">Créé le</th>
                </tr>
              </thead>
              <tbody>
                {historyQuery.isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <tr key={`history-skel-${index}`}>
                        <td colSpan={5} className="py-2">
                          <Skeleton className="h-6 w-full rounded-2xl" />
                        </td>
                      </tr>
                    ))
                  : items.map((entry) => (
                      <tr
                        key={entry.bookingId}
                        className={`cursor-pointer border-b border-saubio-forest/5 last:border-none ${
                          entry.bookingId === selected ? 'bg-saubio-mist/50' : 'bg-transparent'
                        }`}
                        onClick={() => setSelected(entry.bookingId)}
                      >
                        <td className="py-2 font-semibold text-saubio-forest">{entry.bookingId}</td>
                        <td className="py-2">{entry.client?.name ?? '—'}</td>
                        <td className="py-2 text-xs">
                          <span className="font-semibold text-saubio-forest">{entry.invitations.accepted}</span> acpt •{' '}
                          <span className="font-semibold text-saubio-slate/70">{entry.invitations.declined}</span> ref •{' '}
                          <span className="font-semibold text-saubio-slate/50">{entry.invitations.pending}</span> en attente
                        </td>
                        <td className="py-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              entry.result === 'assigned'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-rose-200 bg-rose-50 text-rose-800'
                            }`}
                          >
                            {entry.result === 'assigned' ? 'Assigné' : 'Non pourvu'}
                          </span>
                        </td>
                        <td className="py-2 text-xs text-saubio-slate/60">{formatDateTime(entry.createdAt)}</td>
                      </tr>
                    ))}
                {!historyQuery.isLoading && !items.length && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-xs text-saubio-slate/60">
                      Aucun matching trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm text-saubio-forest disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => (historyQuery.data && prev < totalPages ? prev + 1 : prev))}
              className="rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm text-saubio-forest disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Détail du matching</p>
          {!selected && <p className="text-xs text-saubio-slate/60">Sélectionnez un booking pour afficher la trace.</p>}
          {selected && detailQuery.isLoading && <Skeleton className="h-40 w-full rounded-2xl" />}
          {selected && detail && (
            <div className="space-y-4 text-sm text-saubio-slate/80">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Booking</p>
                <p className="font-semibold text-saubio-forest">{detail.booking.id}</p>
                <p className="text-xs text-saubio-slate/60">
                  {detail.booking.service} • {formatDateTime(detail.booking.startAt)}
                </p>
              </div>
              <div className="rounded-2xl bg-saubio-mist/60 p-3 text-xs text-saubio-slate/60">
                {detail.summary.invitations.total} invitations • Acceptées {detail.summary.invitations.accepted} • Refusées{' '}
                {detail.summary.invitations.declined} • Expirées {detail.summary.invitations.expired}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Timeline</p>
                <ul className="mt-2 space-y-2 text-xs">
                  {detail.timeline.map((event) => (
                    <li key={`${event.type}-${event.timestamp}`} className="rounded-2xl border border-saubio-forest/10 px-3 py-2">
                      <p className="font-semibold text-saubio-forest capitalize">
                        {event.type} {event.provider ? `• ${event.provider.name}` : ''}
                      </p>
                      <p className="text-saubio-slate/60">{formatDateTime(event.timestamp)}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Prestataires contactés</p>
                <ul className="mt-2 space-y-2 text-xs">
                  {invitationSummary.map((invitation) => (
                    <li key={invitation.id} className="rounded-2xl border border-saubio-forest/10 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-saubio-forest">{invitation.provider.name}</span>
                        <span className="capitalize">{invitation.status}</span>
                      </div>
                      <p className="text-saubio-slate/60">Invité le {formatDateTime(invitation.invitedAt)}</p>
                      {invitation.respondedAt && <p className="text-saubio-slate/60">Réponse le {formatDateTime(invitation.respondedAt)}</p>}
                    </li>
                  ))}
                  {!invitationSummary.length && (
                    <li className="text-xs text-saubio-slate/60">Aucune invitation enregistrée pour ce booking.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
