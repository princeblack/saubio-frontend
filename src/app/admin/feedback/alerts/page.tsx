'use client';

import { SurfaceCard } from '@saubio/ui';
import { useAdminQualityAlerts } from '@saubio/utils';
import { AlertOctagon, BellRing, ShieldAlert } from 'lucide-react';

const ICONS = {
  provider_low_score: AlertOctagon,
  critical_review: ShieldAlert,
  client_risk: BellRing,
};

export default function AdminFeedbackAlertsPage() {
  const { data, isLoading } = useAdminQualityAlerts();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Feedback & qualité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Alertes automatiques</h1>
        <p className="text-sm text-saubio-slate/70">
          Les seuils qualité détectent automatiquement les prestataires et clients à risque.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="text-sm font-semibold text-saubio-forest">Seuils actifs</p>
        <dl className="mt-3 grid gap-4 text-sm text-saubio-slate/70 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Score prestataire</dt>
            <dd>Note &lt; {data?.thresholds.providerLowScore ?? 3.5} (≥ {data?.thresholds.providerMinReviews ?? 3} avis)</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Avis critiques</dt>
            <dd>Note ≤ {data?.thresholds.criticalReviewScore ?? 2}/5 (30 jours)</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Clients</dt>
            <dd>{data?.thresholds.clientDisputeThreshold ?? 3}+ litiges sur 90 jours</dd>
          </div>
        </dl>
      </SurfaceCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading && !data
          ? Array.from({ length: 4 }).map((_, index) => (
              <SurfaceCard
                key={index}
                className="animate-pulse rounded-3xl border border-saubio-forest/10 bg-white/70 p-5 shadow-soft-lg"
              >
                <div className="h-4 w-1/2 rounded-full bg-saubio-mist" />
                <div className="mt-2 h-3 w-3/4 rounded-full bg-saubio-mist" />
              </SurfaceCard>
            ))
          : (data?.alerts ?? []).map((alert) => {
              const Icon = ICONS[alert.type] ?? AlertOctagon;
              return (
                <SurfaceCard
                  key={alert.id}
                  className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-saubio-mist text-saubio-forest">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-saubio-forest">{alert.title}</p>
                      <p className="text-xs text-saubio-slate/60">{alert.description}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-saubio-slate/50">
                        {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </SurfaceCard>
              );
            })}
        {!isLoading && !data?.alerts.length && (
          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-8 text-center text-sm text-saubio-slate/60 shadow-soft-lg">
            Aucune alerte active pour le moment 🎉
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
