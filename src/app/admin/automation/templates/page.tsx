'use client';

import { SurfaceCard } from '@saubio/ui';

const TEMPLATES = [
  {
    name: 'Email confirmation booking',
    type: 'Email · Transactionnel',
    variables: ['{{client.firstname}}', '{{booking.date}}', '{{booking.address}}'],
    lastUpdate: '15 janv. · 07:30',
    status: 'Publié',
  },
  {
    name: 'Push prestataire – nouvelle mission',
    type: 'Push · Prestataire',
    variables: ['{{provider.name}}', '{{booking.start_time}}', '{{booking.city}}'],
    lastUpdate: '14 janv. · 22:10',
    status: 'Publié',
  },
  {
    name: 'SMS rappel facture impayée',
    type: 'SMS · Client',
    variables: ['{{invoice.number}}', '{{invoice.amount}}'],
    lastUpdate: '14 janv. · 19:05',
    status: 'Brouillon',
  },
];

export default function AdminAutomationTemplatesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Templates de notification</h1>
        <p className="text-sm text-saubio-slate/70">Créez des modèles email, SMS, push avec placeholders dynamiques.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Bibliothèque</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouveau template</button>
        </div>
        <div className="grid gap-4">
          {TEMPLATES.map((template) => (
            <SurfaceCard key={template.name} className="rounded-3xl border border-saubio-forest/10 bg-white p-4 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-saubio-forest">{template.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{template.type}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${template.status === 'Publié' ? 'bg-emerald-50 text-emerald-900' : 'bg-saubio-sun/40 text-saubio-forest'}`}>{template.status}</span>
              </div>
              <div className="mt-3 text-xs text-saubio-slate/70">
                <p className="font-semibold uppercase tracking-[0.2em]">Variables disponibles</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <span key={variable} className="rounded-full bg-saubio-slate/10 px-3 py-1 font-mono text-[11px] text-saubio-slate">
                      {variable}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-saubio-slate/50">Dernière mise à jour — {template.lastUpdate}</p>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
