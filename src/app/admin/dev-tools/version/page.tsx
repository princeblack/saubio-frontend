'use client';

import { SurfaceCard } from '@saubio/ui';

const VERSIONS = [
  { component: 'Frontend web', version: 'v3.4.2', commit: 'ca82b3d', date: '15 janv. · 06:25' },
  { component: 'Backend API', version: 'v2.15.3', commit: '2b7f1d', date: '15 janv. · 06:20' },
  { component: 'Mobile', version: '1.14.0', commit: '4a92c1', date: '13 janv.' },
  { component: 'Database schema', version: '2025-01-13', commit: 'migration #158', date: '13 janv.' },
];

const BACKUPS = [
  { type: 'DB snapshot', status: 'OK', last: '15 janv. · 03:00' },
  { type: 'Files S3', status: 'OK', last: '15 janv. · 02:00' },
  { type: 'Mobile build', status: 'Pending', last: '14 janv. · 17:00' },
];

export default function AdminDevToolsVersionPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Système & versions</h1>
        <p className="text-sm text-saubio-slate/70">Versions front/back/mobile, migrations, backups, uptime.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Versions déployées</p>
        <div className="grid gap-3">
          {VERSIONS.map((entry) => (
            <div key={entry.component} className="rounded-2xl bg-saubio-slate/5 p-4 text-sm text-saubio-slate/80">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">{entry.component}</p>
                <p className="text-xs text-saubio-slate/60">{entry.date}</p>
              </div>
              <p>Version : {entry.version}</p>
              <p>Commit : {entry.commit}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Backups & monitoring</p>
        <div className="grid gap-3 md:grid-cols-3">
          {BACKUPS.map((backup) => (
            <div key={backup.type} className="rounded-2xl bg-saubio-slate/5 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{backup.type}</p>
              <p className="text-2xl font-semibold text-saubio-forest">{backup.status}</p>
              <p className="text-xs text-saubio-slate/60">{backup.last}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
