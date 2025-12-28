'use client';

import { SurfaceCard } from '@saubio/ui';

const WORKFLOWS = [
  {
    name: 'Booking urgence',
    trigger: 'booking.created AND booking.short_notice = true',
    actions: ['Envoyer push providers zone', 'Slack #ops', 'Créer ticket support'],
    status: 'Activé',
  },
  {
    name: 'Paiement confirmé',
    trigger: 'payment.success',
    actions: ['Email facture au client', 'Push confirmation au prestataire'],
    status: 'Activé',
  },
  {
    name: 'Document prestataire expiré',
    trigger: 'provider.document.expired',
    actions: ['Email + push prestataire', 'Notifier admin compliance'],
    status: 'Activé',
  },
  {
    name: 'Avis négatif <3★',
    trigger: 'review.created AND rating < 3',
    actions: ['Envoyer email empathie client', 'Créer ticket qualité'],
    status: 'Brouillon',
  },
];

export default function AdminAutomationWorkflowsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Automatisations & workflows</h1>
        <p className="text-sm text-saubio-slate/70">Configurez les déclencheurs, conditions et actions multi-canaux.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Workflows actifs</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouveau workflow</button>
        </div>
        <div className="space-y-4">
          {WORKFLOWS.map((flow) => (
            <SurfaceCard key={flow.name} className="rounded-3xl border border-saubio-forest/10 bg-white p-4 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-saubio-forest">{flow.name}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/60">Trigger</p>
                  <p className="text-sm text-saubio-slate/80 font-mono">{flow.trigger}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${flow.status === 'Activé' ? 'bg-emerald-50 text-emerald-900' : 'bg-saubio-sun/40 text-saubio-forest'}`}>{flow.status}</span>
              </div>
              <div className="mt-3">
                <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/60">Actions</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-saubio-slate/80">
                  {flow.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
