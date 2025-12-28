'use client';

import { SurfaceCard } from '@saubio/ui';

const LOGS = [
  { id: 'LOG-9821', time: '15 janv. 09:55', service: 'matching-worker', level: 'error', message: 'Queue backlog > 250', context: 'berlin-zone' },
  { id: 'LOG-9822', time: '15 janv. 09:50', service: 'api', level: 'warn', message: 'Rate limit client exceeded', context: 'client=1234' },
  { id: 'LOG-9823', time: '15 janv. 09:48', service: 'webhook-runner', level: 'info', message: 'Retry success (Mollie)', context: 'event=payment.paid' },
];

const levelTone: Record<string, string> = {
  error: 'text-rose-900',
  warn: 'text-saubio-sun/80',
  info: 'text-saubio-forest',
};

export default function AdminSystemLogsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Logs système</h1>
        <p className="text-sm text-saubio-slate/70">Filtrez par service, severité, date, type. Export possible.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
            <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
              <option>Service : tous</option>
              <option>API</option>
              <option>Matching</option>
              <option>Webhooks</option>
            </select>
            <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
              <option>Severité : toutes</option>
              <option>error</option>
              <option>warn</option>
              <option>info</option>
            </select>
          </div>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Exporter JSON</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
                <th className="px-3 py-2 text-left font-semibold">Service</th>
                <th className="px-3 py-2 text-left font-semibold">Niveau</th>
                <th className="px-3 py-2 text-left font-semibold">Message</th>
                <th className="px-3 py-2 text-left font-semibold">Contexte</th>
              </tr>
            </thead>
            <tbody>
              {LOGS.map((log) => (
                <tr key={log.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-mono text-xs">{log.time}</td>
                  <td className="px-3 py-2">{log.service}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${levelTone[log.level]}`}>{log.level}</td>
                  <td className="px-3 py-2">{log.message}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{log.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
