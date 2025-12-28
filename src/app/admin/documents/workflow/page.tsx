'use client';

import { SurfaceCard } from '@saubio/ui';

const STEPS = [
  { step: 'Upload prestataire', detail: 'Pièce d’identité ou KBIS + IBAN + assurance', sla: 'Instantané' },
  { step: 'Contrôle automatique', detail: 'Format, taille, expiration, double upload', sla: '< 2 min' },
  { step: 'Revue compliance', detail: 'Agent vérifie lisibilité et cohérence', sla: '24h' },
  { step: 'Décision', detail: 'Validation / Refus (motif) / Re-upload demandé', sla: '24h' },
  { step: 'Notification + Onboarding', detail: 'Prestataire notifié et statut onboarding mis à jour', sla: 'Automatique' },
];

export default function AdminDocumentsWorkflowPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Workflow de validation</h1>
        <p className="text-sm text-saubio-slate/70">Visualisez les étapes, SLA, notifications et dépendances d’onboarding.</p>
      </header>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        {STEPS.map((step, index) => (
          <div key={step.step} className="flex flex-col gap-1 border-b border-saubio-forest/10 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-saubio-forest">
                {index + 1}. {step.step}
              </p>
              <span className="rounded-full bg-saubio-slate/10 px-3 py-1 text-xs text-saubio-slate/70">{step.sla}</span>
            </div>
            <p className="text-sm text-saubio-slate/70">{step.detail}</p>
          </div>
        ))}
      </SurfaceCard>
    </div>
  );
}
