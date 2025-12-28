'use client';

import { SurfaceCard } from '@saubio/ui';

const NOTIFICATIONS = [
  {
    id: 'NTF-5101',
    user: 'Client · Alice M.',
    role: 'Client',
    event: 'booking.reminder',
    booking: 'BK-2058',
    channel: 'Push',
    status: 'Lu',
    sentAt: '15 janv. · 08:00',
  },
  {
    id: 'NTF-5102',
    user: 'Prestataire · Eco Berlin',
    role: 'Prestataire',
    event: 'matching.accepted',
    booking: 'BK-2059',
    channel: 'Push',
    status: 'Envoyé',
    sentAt: '15 janv. · 08:02',
  },
  {
    id: 'NTF-5103',
    user: 'Employé · Nina P.',
    role: 'Employé',
    event: 'support.ticket.assigned',
    booking: 'SUP-3025',
    channel: 'Email',
    status: 'Échoué',
    sentAt: '15 janv. · 08:05',
  },
  {
    id: 'NTF-5104',
    user: 'Client · Bio Market',
    role: 'Client',
    event: 'invoice.generated',
    booking: 'BK-2060',
    channel: 'Email',
    status: 'Envoyé',
    sentAt: '15 janv. · 07:58',
  },
];

export default function AdminAutomationCenterPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Centre de notifications</h1>
        <p className="text-sm text-saubio-slate/70">Consultez toutes les notifications multi-canaux, filtrez par rôles, statuts, événements.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
            <button className="rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold text-saubio-forest">Tous</button>
            <button className="rounded-full border border-saubio-forest/20 px-3 py-1">Clients</button>
            <button className="rounded-full border border-saubio-forest/20 px-3 py-1">Prestataires</button>
            <button className="rounded-full border border-saubio-forest/20 px-3 py-1">Employés</button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
            <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
              <option>Canal : Tous</option>
              <option>Push</option>
              <option>Email</option>
              <option>SMS</option>
            </select>
            <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
              <option>Statut : Tous</option>
              <option>Envoyé</option>
              <option>Lu</option>
              <option>Échoué</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">ID</th>
                <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                <th className="px-3 py-2 text-left font-semibold">Rôle</th>
                <th className="px-3 py-2 text-left font-semibold">Événement</th>
                <th className="px-3 py-2 text-left font-semibold">Booking / Réf.</th>
                <th className="px-3 py-2 text-left font-semibold">Canal</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATIONS.map((notif) => (
                <tr key={notif.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{notif.id}</td>
                  <td className="px-3 py-2">{notif.user}</td>
                  <td className="px-3 py-2">{notif.role}</td>
                  <td className="px-3 py-2">{notif.event}</td>
                  <td className="px-3 py-2">{notif.booking}</td>
                  <td className="px-3 py-2">{notif.channel}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${notif.status === 'Échoué' ? 'text-rose-900' : 'text-emerald-900'}`}>{notif.status}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{notif.sentAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
