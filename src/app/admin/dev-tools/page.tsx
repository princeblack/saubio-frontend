'use client';

import { SurfaceCard } from '@saubio/ui';

const KPI = [
  { label: 'Jobs en attente', value: '312', caption: 'Matching, emails, factures' },
  { label: 'Webhooks reçus (24h)', value: '1 124', caption: 'Mollie + Mobile push' },
  { label: 'Alertes techniques', value: '2', caption: 'Queue matching / webhook' },
  { label: 'Feature flags actifs', value: '7', caption: 'dont Matching V2' },
];

const TOOLS = [
  { name: 'Simulateur booking', description: 'Crée un booking sandbox avec matching & paiement', action: 'Lancer' },
  { name: 'Webhook tester', description: 'Envoyer un fake webhook (Mollie, Push, Matching)', action: 'Tester' },
  { name: 'Feature flags', description: 'Activer / désactiver les fonctionnalités expérimentales', action: 'Configurer' },
];

export default function AdminDevToolsOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Outils techniques & DevOps</h1>
        <p className="text-sm text-saubio-slate/70">Accessible aux admins tech / SRE uniquement. Debug, observabilité, sandbox.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((card) => (
          <SurfaceCard key={card.label} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
            <p className="text-xs text-saubio-slate/60">{card.caption}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="grid gap-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg md:grid-cols-3">
        {TOOLS.map((tool) => (
          <div key={tool.name} className="rounded-2xl bg-saubio-slate/5 p-4 text-sm text-saubio-slate/80">
            <p className="text-sm font-semibold text-saubio-forest">{tool.name}</p>
            <p className="mt-2 text-xs text-saubio-slate/60">{tool.description}</p>
            <button className="mt-3 rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest">{tool.action}</button>
          </div>
        ))}
      </SurfaceCard>
    </div>
  );
}
