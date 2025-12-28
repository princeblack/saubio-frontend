'use client';

import { SurfaceCard } from '@saubio/ui';

const ALERTS = [
  { type: 'Tentatives login échouées', value: '28 · 24h', detail: '3 IP bannies', tone: 'bg-rose-50 text-rose-900' },
  { type: 'Alertes vulnérabilité', value: '0 critique', detail: '2 à patcher', tone: 'bg-saubio-sun/40 text-saubio-forest' },
  { type: 'Certificat SSL', value: 'Valide', detail: 'Expire dans 63 jours', tone: 'bg-emerald-50 text-emerald-900' },
];

const EVENTS = [
  { time: '15 janv. 09:20', type: 'IP bannie', detail: '104.21.5.42 après 5 login fail', status: 'Bloqué' },
  { time: '15 janv. 08:55', type: 'Alert SOC', detail: 'Webhook signature invalide', status: 'Investiguer' },
  { time: '14 janv. 22:15', type: 'Scan vulnérabilité', detail: '2 dépendances à mettre à jour', status: 'En cours' },
];

export default function AdminSystemSecurityPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Monitoring sécurité</h1>
        <p className="text-sm text-saubio-slate/70">Tentatives d’intrusion, IP bannies, vulnérabilités, certificats.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {ALERTS.map((alert) => (
          <SurfaceCard key={alert.type} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{alert.type}</p>
            <p className="text-2xl font-semibold text-saubio-forest">{alert.value}</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${alert.tone}`}>{alert.detail}</span>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Événements récents</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Exporter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Détail</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((event) => (
                <tr key={event.time} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-mono text-xs">{event.time}</td>
                  <td className="px-3 py-2">{event.type}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{event.detail}</td>
                  <td className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-saubio-forest">{event.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
