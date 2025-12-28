'use client';

import { SurfaceCard } from '@saubio/ui';

const LOGS = [
  { service: 'matching', level: 'error', message: 'Worker timeout zone Berlin', time: '09:55' },
  { service: 'queue', level: 'warn', message: 'Backlog > 200 jobs', time: '09:52' },
  { service: 'payments', level: 'info', message: 'Webhook payment.paid processed', time: '09:50' },
];

const levelColor: Record<string, string> = {
  error: 'text-rose-900',
  warn: 'text-saubio-sun/80',
  info: 'text-saubio-forest',
};

export default function AdminDevToolsLogsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Observabilité & logs</h1>
        <p className="text-sm text-saubio-slate/70">Back-end, queues, matching, paiements. Filtrez par date, type, booking.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap gap-2 text-xs text-saubio-slate/70">
          <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
            <option>Service : tous</option>
            <option>matching</option>
            <option>queue</option>
            <option>payments</option>
          </select>
          <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
            <option>Level : all</option>
            <option>error</option>
            <option>warn</option>
            <option>info</option>
          </select>
          <input placeholder="Booking / user id" className="rounded-full border border-saubio-forest/20 px-3 py-1 outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Service</th>
                <th className="px-3 py-2 text-left font-semibold">Level</th>
                <th className="px-3 py-2 text-left font-semibold">Message</th>
                <th className="px-3 py-2 text-left font-semibold">Heure</th>
              </tr>
            </thead>
            <tbody>
              {LOGS.map((log) => (
                <tr key={log.message} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{log.service}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${levelColor[log.level]}`}>{log.level}</td>
                  <td className="px-3 py-2">{log.message}</td>
                  <td className="px-3 py-2">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
