'use client';

import { SurfaceCard } from '@saubio/ui';

const JOBS = [
  { name: 'matching:queue', status: 'En attente', payload: 'zone=Berlin', retry: 0, created: '09:40' },
  { name: 'notifications:email', status: 'En cours', payload: 'batch=reminder', retry: 1, created: '09:38' },
  { name: 'finance:payout', status: 'Échoué', payload: 'payout=cmj...', retry: 3, created: '09:35' },
];

export default function AdminDevToolsJobsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Jobs queue & cron</h1>
        <p className="text-sm text-saubio-slate/70">Inspectez les jobs en attente, échoués, redémarrez ou mettez en pause.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-saubio-slate/70">
          <button className="rounded-full border border-saubio-forest/20 px-3 py-1">Pause queue</button>
          <button className="rounded-full border border-saubio-forest/20 px-3 py-1">Redémarrer worker</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Job</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Payload</th>
                <th className="px-3 py-2 text-left font-semibold">Retry</th>
                <th className="px-3 py-2 text-left font-semibold">Créé</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {JOBS.map((job) => (
                <tr key={job.name + job.created} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{job.name}</td>
                  <td className="px-3 py-2">{job.status}</td>
                  <td className="px-3 py-2 font-mono text-xs">{job.payload}</td>
                  <td className="px-3 py-2">{job.retry}</td>
                  <td className="px-3 py-2">{job.created}</td>
                  <td className="px-3 py-2 text-saubio-forest underline">Inspecter</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
