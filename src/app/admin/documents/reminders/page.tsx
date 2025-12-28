'use client';

import { SurfaceCard } from '@saubio/ui';

const REMINDERS = [
  { rule: 'ID expire < 30 j', channel: 'Email + Push prestataire', action: 'Bloque missions si non renouvelé', status: 'Activé' },
  { rule: 'Assurance expirée', channel: 'Ticket compliance + Slack', action: 'Alerte manager', status: 'Activé' },
  { rule: 'IBAN invalide', channel: 'Email + support', action: 'Suspend payouts', status: 'Brouillon' },
];

export default function AdminDocumentsRemindersPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Rappels & automatisations</h1>
        <p className="text-sm text-saubio-slate/70">Définissez notifications avant expiration, blocages automatiques, rapports mensuels.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Règles automatiques</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Créer règle</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Déclencheur</th>
                <th className="px-3 py-2 text-left font-semibold">Canal</th>
                <th className="px-3 py-2 text-left font-semibold">Action</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {REMINDERS.map((reminder) => (
                <tr key={reminder.rule} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{reminder.rule}</td>
                  <td className="px-3 py-2">{reminder.channel}</td>
                  <td className="px-3 py-2">{reminder.action}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${reminder.status === 'Activé' ? 'text-emerald-900' : 'text-saubio-forest'}`}>{reminder.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
