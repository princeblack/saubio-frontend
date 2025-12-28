'use client';

import { SurfaceCard } from '@saubio/ui';

const ENVIRONMENTS = [
  {
    name: 'Production',
    backend: 'https://api.saubio.de',
    frontend: 'https://app.saubio.de',
    version: 'v2.15.3 · commit 2b7f1d',
    health: 'OK',
    lastDeploy: '15 janv. · 06:30',
  },
  {
    name: 'Staging',
    backend: 'https://api-staging.saubio.de',
    frontend: 'https://staging.saubio.de',
    version: 'v2.15.3-rc1 · commit 9afdad',
    health: 'OK',
    lastDeploy: '14 janv. · 20:10',
  },
  {
    name: 'Dev',
    backend: 'http://localhost:3001',
    frontend: 'http://localhost:3000',
    version: 'feature/notifications · commit 1d4fea',
    health: 'Dégradé',
    lastDeploy: 'n/a',
  },
];

export default function AdminSystemEnvironmentsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Gestion des environnements</h1>
        <p className="text-sm text-saubio-slate/70">URLs, versions, healthchecks, uptime et derniers déploiements.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {ENVIRONMENTS.map((env) => (
          <SurfaceCard key={env.name} className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-saubio-forest">{env.name}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${env.health === 'OK' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>{env.health}</span>
            </div>
            <div className="space-y-2 text-sm text-saubio-slate/80">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Backend</p>
                <p className="font-mono text-xs">{env.backend}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Frontend</p>
                <p className="font-mono text-xs">{env.frontend}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Version</p>
                <p>{env.version}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Dernier déploiement</p>
                <p>{env.lastDeploy}</p>
              </div>
            </div>
            <button className="text-xs font-semibold text-saubio-forest underline">Voir healthcheck</button>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
