'use client';

import { SurfaceCard } from '@saubio/ui';
import { ToggleLeft } from 'lucide-react';

const RULES = [
  { label: 'Paiement client > €800', description: 'Alerte fraude + vérification KYC', enabled: true },
  { label: 'Payout échoué 2 fois', description: 'Notifier finance & suspendre versement automatique', enabled: true },
  { label: 'Taux échec paiement > 5 % / 24h', description: 'Escalade technique + monitoring Mollie', enabled: false },
];

const ALERTS = [
  { time: '15 janv. 10:20', title: 'Payout impossible', detail: 'Prestataire Sauber GmbH — Mandat invalide' },
  { time: '15 janv. 09:55', title: 'Chargeback détecté', detail: 'paiement pay_7d92 — dossier #CHB-024' },
  { time: '15 janv. 09:30', title: 'Litige client', detail: 'BK-2038 — remboursement partiel demandé' },
];

export default function AdminFinanceAlertsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Finances & Paiements</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Règles & alertes automatiques</h1>
        <p className="text-sm text-saubio-slate/70">
          Configurez les déclencheurs critiques et consultez les alertes en attente d’action (payout impossible, litige Mollie…).
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Règles automatiques</p>
          <button className="text-xs font-semibold text-saubio-forest underline">Ajouter une règle</button>
        </div>
        <ul className="space-y-3 text-sm text-saubio-slate/80">
          {RULES.map((rule) => (
            <li key={rule.label} className="rounded-2xl border border-saubio-forest/10 p-3">
              <div className="flex items-center justify-between text-saubio-forest">
                <p className="font-semibold">{rule.label}</p>
                <ToggleLeft className={`h-6 w-6 ${rule.enabled ? 'text-saubio-forest' : 'text-saubio-slate/40'}`} />
              </div>
              <p className="text-xs text-saubio-slate/60">{rule.description}</p>
            </li>
          ))}
        </ul>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Alertes récentes</p>
          <button className="text-xs font-semibold text-saubio-forest underline">Marquer comme lues</button>
        </div>
        <ul className="space-y-2 text-sm text-saubio-slate/80">
          {ALERTS.map((alert) => (
            <li key={alert.title} className="rounded-2xl bg-saubio-mist/60 p-3">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{alert.time}</p>
              <p className="text-saubio-forest">{alert.title}</p>
              <p className="text-xs text-saubio-slate/60">{alert.detail}</p>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </div>
  );
}
