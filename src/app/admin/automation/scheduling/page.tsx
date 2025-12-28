'use client';

import { SurfaceCard } from '@saubio/ui';

const SCHEDULES = [
  {
    name: 'Rappel mission J-1',
    mode: 'Planifié quotidien',
    channel: 'Push + Email',
    window: '08:00 · Fuseau client',
    target: 'Clients avec mission < 24h',
  },
  {
    name: 'Relance facture impayée',
    mode: 'Batch hebdo',
    channel: 'SMS',
    window: 'Lundi 10:00',
    target: 'Factures > 7 jours',
  },
  {
    name: 'Demande avis post-service',
    mode: 'Retardé',
    channel: 'Email',
    window: '2h après mission',
    target: 'Tous les clients (opt-in)',
  },
];

export default function AdminAutomationSchedulingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Modes de diffusion & planification</h1>
        <p className="text-sm text-saubio-slate/70">Temps réel, batch, planifié, retardé… contrôlez chaque campagne.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Workflows programmés</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Ajouter un planning</button>
        </div>
        <div className="grid gap-4">
          {SCHEDULES.map((schedule) => (
            <SurfaceCard key={schedule.name} className="rounded-3xl border border-saubio-forest/10 bg-white p-4 shadow-none">
              <p className="text-lg font-semibold text-saubio-forest">{schedule.name}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{schedule.mode}</p>
              <div className="mt-3 grid gap-3 text-sm text-saubio-slate/80 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Canal</p>
                  <p>{schedule.channel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Fenêtre</p>
                  <p>{schedule.window}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Cible</p>
                  <p>{schedule.target}</p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
