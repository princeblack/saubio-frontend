'use client';

import { SurfaceCard } from '@saubio/ui';

const AUTOMATIONS = [
  { name: 'OCR / Onfido', status: 'Roadmap', detail: 'Transfert auto documents vers Onfido + retour statut', link: '#' },
  { name: 'Vérification IBAN via Mollie', status: 'Actif', detail: 'Mandat SEPA contrôlé automatiquement', link: '#' },
  { name: 'OCR interne', status: 'Pilot', detail: 'Extraction données CNI pour pré-remplir formulaires', link: '#' },
];

export default function AdminDocumentsIntegrationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Automatisations & intégrations</h1>
        <p className="text-sm text-saubio-slate/70">OCR, Onfido, Mollie… pilotez les connecteurs et leur statut.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {AUTOMATIONS.map((auto) => (
          <SurfaceCard key={auto.name} className="space-y-2 rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 shadow-soft-lg">
            <p className="text-sm font-semibold text-saubio-forest">{auto.name}</p>
            <span className="rounded-full bg-saubio-slate/10 px-3 py-1 text-xs text-saubio-slate/70">{auto.status}</span>
            <p className="text-sm text-saubio-slate/70">{auto.detail}</p>
            <button className="text-xs font-semibold text-saubio-forest underline">Configurer</button>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
