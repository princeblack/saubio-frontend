'use client';

import { SurfaceCard } from '@saubio/ui';

const AUTOMATIONS = [
  {
    name: 'Auto-réponse retard prestataire',
    trigger: 'Ticket taggé "retard"',
    action: 'Email client + push prestataire',
    delay: 'Immédiat',
    status: 'Activé',
  },
  {
    name: 'Clôture automatique après 5 jours sans réponse',
    trigger: 'Ticket inactif',
    action: 'Clôture + message recap',
    delay: '5 jours',
    status: 'Activé',
  },
  {
    name: 'Escalade litige critique',
    trigger: 'Montant litige > 150€',
    action: 'Assignation manager + Slack #litiges',
    delay: 'Immédiat',
    status: 'Activé',
  },
  {
    name: 'Relance client NPS bas',
    trigger: 'Avis ≤ 2★',
    action: 'Ticket auto + email empathie',
    delay: '30 min',
    status: 'Brouillon',
  },
];

const TEMPLATES = [
  { name: 'Modèle - Remboursement partiel', usage: '39', tone: 'bg-saubio-sun/40 text-saubio-forest' },
  { name: 'Modèle - Annulation client', usage: '22', tone: 'bg-sky-100 text-sky-900' },
  { name: 'Modèle - Demande devis réparation', usage: '11', tone: 'bg-emerald-100 text-emerald-900' },
];

export default function AdminSupportAutomationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Automatisation du support</h1>
        <p className="text-sm text-saubio-slate/70">Créez des workflows automatiques, déclencheurs et templates de réponses.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Workflows automatiques</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Nouvelle automatisation</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Déclencheur</th>
                <th className="px-3 py-2 text-left font-semibold">Action</th>
                <th className="px-3 py-2 text-left font-semibold">Délai</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {AUTOMATIONS.map((automation) => (
                <tr key={automation.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{automation.name}</td>
                  <td className="px-3 py-2">{automation.trigger}</td>
                  <td className="px-3 py-2">{automation.action}</td>
                  <td className="px-3 py-2">{automation.delay}</td>
                  <td className="px-3 py-2">{automation.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-3">
        {TEMPLATES.map((template) => (
          <SurfaceCard key={template.name} className="flex flex-col gap-2 rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 shadow-soft-lg">
            <p className="text-sm font-semibold text-saubio-forest">{template.name}</p>
            <span className={`w-max rounded-full px-3 py-1 text-xs font-semibold ${template.tone}`}>{template.usage} utilisations</span>
            <p className="text-xs text-saubio-slate/60">Personnalisez ton & variables (client, prestataire, date...).</p>
            <button className="mt-auto text-xs font-semibold text-saubio-forest underline">Modifier le modèle</button>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
