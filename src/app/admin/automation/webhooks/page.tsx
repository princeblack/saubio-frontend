'use client';

import { SurfaceCard } from '@saubio/ui';

const WEBHOOKS = [
  {
    id: 'WH-301',
    integration: 'Mollie',
    endpoint: 'https://api.saubio.de/webhooks/mollie',
    status: 'Success',
    lastEvent: 'payment.paid',
    retries: 0,
    timestamp: '15 janv. · 09:45',
  },
  {
    id: 'WH-302',
    integration: 'Saubio Mobile Push',
    endpoint: 'https://api.saubio.de/webhooks/push',
    status: 'Pending',
    lastEvent: 'notification.sent',
    retries: 1,
    timestamp: '15 janv. · 09:42',
  },
  {
    id: 'WH-303',
    integration: 'CRM Hubspot',
    endpoint: 'https://crm.saubio.de/webhooks',
    status: 'Fail',
    lastEvent: 'customer.updated',
    retries: 3,
    timestamp: '15 janv. · 09:35',
  },
];

export default function AdminAutomationWebhooksPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Webhooks & intégrations</h1>
        <p className="text-sm text-saubio-slate/70">Surveillez les payloads, statuts et retries des webhooks externes.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Logs récents</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouvelle intégration</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Webhook</th>
                <th className="px-3 py-2 text-left font-semibold">Intégration</th>
                <th className="px-3 py-2 text-left font-semibold">Endpoint</th>
                <th className="px-3 py-2 text-left font-semibold">Dernier événement</th>
                <th className="px-3 py-2 text-left font-semibold">Retentatives</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Horodatage</th>
              </tr>
            </thead>
            <tbody>
              {WEBHOOKS.map((hook) => (
                <tr key={hook.id} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{hook.id}</td>
                  <td className="px-3 py-2">{hook.integration}</td>
                  <td className="px-3 py-2 font-mono text-xs">{hook.endpoint}</td>
                  <td className="px-3 py-2">{hook.lastEvent}</td>
                  <td className="px-3 py-2">{hook.retries}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${hook.status === 'Fail' ? 'text-rose-900' : hook.status === 'Pending' ? 'text-saubio-forest' : 'text-emerald-900'}`}>{hook.status}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{hook.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
