'use client';

import { SurfaceCard } from '@saubio/ui';

const WEBHOOKS = [
  { integration: 'Mollie', endpoint: '/webhooks/mollie', last: 'payment.paid', status: '200', actions: 'Tester · Rejouer' },
  { integration: 'Push mobile', endpoint: '/webhooks/push', last: 'notification.sent', status: 'Pending', actions: 'Tester' },
  { integration: 'Smart match', endpoint: '/webhooks/matching', last: 'match.accepted', status: '500', actions: 'Rejouer' },
];

export default function AdminDevToolsWebhooksPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Tests & simulation webhooks</h1>
        <p className="text-sm text-saubio-slate/70">Envoyez des webhooks fake, rejouez le dernier événement, vérifiez le payload.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Intégrations disponibles</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Envoyer un webhook</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Intégration</th>
                <th className="px-3 py-2 text-left font-semibold">Endpoint</th>
                <th className="px-3 py-2 text-left font-semibold">Dernier événement</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {WEBHOOKS.map((hook) => (
                <tr key={hook.integration} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{hook.integration}</td>
                  <td className="px-3 py-2 font-mono text-xs">{hook.endpoint}</td>
                  <td className="px-3 py-2">{hook.last}</td>
                  <td className="px-3 py-2">{hook.status}</td>
                  <td className="px-3 py-2 text-saubio-forest underline">{hook.actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
