'use client';

import { SurfaceCard } from '@saubio/ui';

const WORKERS = [
  { name: 'Matching worker', cpu: '42 %', ram: '58 %', queue: '220 jobs', status: 'Dégradé' },
  { name: 'Webhook runner', cpu: '25 %', ram: '37 %', queue: '18 jobs', status: 'OK' },
  { name: 'Payout scheduler', cpu: '12 %', ram: '18 %', queue: '0 job', status: 'OK' },
];

const METRICS = [
  { label: 'Taux retry webhooks', value: '2,4 %' },
  { label: 'Backlog queue matching', value: '220' },
  { label: 'Temps moyen matching', value: '2m 45' },
  { label: 'Temps moyen paiement', value: '4m 10' },
];

export default function AdminSystemStatusPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Statut serveurs & processus</h1>
        <p className="text-sm text-saubio-slate/70">Surveillez CPU/RAM, états workers, queues et métriques techniques.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {METRICS.map((metric) => (
          <SurfaceCard key={metric.label} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 text-center shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{metric.label}</p>
            <p className="text-2xl font-semibold text-saubio-forest">{metric.value}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Workers & cron</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Rafraîchir</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Process</th>
                <th className="px-3 py-2 text-left font-semibold">CPU</th>
                <th className="px-3 py-2 text-left font-semibold">RAM</th>
                <th className="px-3 py-2 text-left font-semibold">Queue</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {WORKERS.map((worker) => (
                <tr key={worker.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{worker.name}</td>
                  <td className="px-3 py-2">{worker.cpu}</td>
                  <td className="px-3 py-2">{worker.ram}</td>
                  <td className="px-3 py-2">{worker.queue}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${worker.status === 'OK' ? 'text-emerald-900' : 'text-rose-900'}`}>{worker.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
