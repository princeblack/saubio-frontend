'use client';

import { SurfaceCard } from '@saubio/ui';

const THREADS = [
  {
    booking: 'BK-2059',
    participants: ['Client (Bio Market)', 'Support Saubio', 'Prestataire FastClean'],
    summary: 'Rappel sur annulation prestataire + replanification',
    messages: 14,
    exportable: true,
    updated: '15 janv. · 12:05',
  },
  {
    booking: 'BK-2061',
    participants: ['Client (Studio Kö.)', 'Support Saubio'],
    summary: 'Facture B2B + attestation',
    messages: 6,
    exportable: false,
    updated: '14 janv. · 20:18',
  },
  {
    booking: 'BK-2062',
    participants: ['Prestataire Eco Berlin', 'Support Saubio'],
    summary: 'Détails mission urgente & consignes matériaux',
    messages: 8,
    exportable: true,
    updated: '14 janv. · 16:44',
  },
];

export default function AdminSupportCommunicationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Historique des communications</h1>
        <p className="text-sm text-saubio-slate/70">Centralisez les échanges client ↔ prestataire ↔ support. Exporte possible pour audit.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Conversations liées aux réservations</p>
            <p className="text-xs text-saubio-slate/60">Recherche par booking, client, prestataire, mot-clé.</p>
          </div>
          <div className="flex gap-2 text-xs text-saubio-slate/70">
            <input type="text" placeholder="Rechercher un booking" className="rounded-full border border-saubio-forest/20 px-3 py-1 outline-none" />
            <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest">Filtrer</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Booking</th>
                <th className="px-3 py-2 text-left font-semibold">Participants</th>
                <th className="px-3 py-2 text-left font-semibold">Résumé</th>
                <th className="px-3 py-2 text-left font-semibold">Messages</th>
                <th className="px-3 py-2 text-left font-semibold">Export</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {THREADS.map((thread) => (
                <tr key={thread.booking} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{thread.booking}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{thread.participants.join(' • ')}</td>
                  <td className="px-3 py-2">{thread.summary}</td>
                  <td className="px-3 py-2">{thread.messages}</td>
                  <td className="px-3 py-2">{thread.exportable ? <span className="text-saubio-forest underline">PDF / Email</span> : '—'}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{thread.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
