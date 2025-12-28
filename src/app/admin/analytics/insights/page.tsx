'use client';

import { SurfaceCard } from '@saubio/ui';

const INSIGHTS = [
  { title: 'Baisse de conversion', detail: '-12 % cette semaine vs S-1. Concerne Berlin centre.', severity: 'Alerte' },
  { title: 'Zone 75015', detail: 'Déficit de 4 prestataires disponibles le matin.', severity: 'Action' },
  { title: 'Smart match +40 %', detail: 'Augmentation due aux campagnes onboarding à Hambourg.', severity: 'Info' },
  { title: 'Satisfaction vitres -8 %', detail: 'Avis 4★ → 3.7★. Vérifier prestataires spécialisés.', severity: 'Alerte' },
];

export default function AdminAnalyticsInsightsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Alertes & insights automatiques</h1>
        <p className="text-sm text-saubio-slate/70">Surveillez les ruptures de tendance et recommandations générées automatiquement.</p>
      </header>

      <div className="space-y-3">
        {INSIGHTS.map((insight) => (
          <SurfaceCard key={insight.title} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 shadow-soft-lg">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-saubio-forest">{insight.title}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${insight.severity === 'Alerte' ? 'bg-rose-50 text-rose-900' : insight.severity === 'Action' ? 'bg-saubio-sun/40 text-saubio-forest' : 'bg-emerald-50 text-emerald-900'}`}>
                {insight.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-saubio-slate/80">{insight.detail}</p>
            <div className="mt-3 flex gap-2 text-xs text-saubio-forest">
              <button className="rounded-full border border-saubio-forest/20 px-3 py-1">Créer action</button>
              <button className="rounded-full border border-saubio-forest/20 px-3 py-1">Ignorer</button>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
