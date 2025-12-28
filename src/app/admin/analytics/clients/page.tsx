'use client';

import { SurfaceCard } from '@saubio/ui';

const CLIENT_STATS = [
  { label: 'Taux rétention 90 j', value: '63 %' },
  { label: 'Satisfaction clients', value: '4,58 / 5' },
  { label: 'Fréquence commandes', value: '1,7 / mois' },
  { label: 'Tickets support / client', value: '0,08' },
];

const SEGMENTS = [
  { segment: 'Particuliers', share: '68%', avg: '€75', retention: '61%' },
  { segment: 'Entreprises', share: '32%', avg: '€110', retention: '72%' },
];

export default function AdminAnalyticsClientsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Analytics clients</h1>
        <p className="text-sm text-saubio-slate/70">Rétention, satisfaction, fréquence commandes, segmentation pro vs particulier.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {CLIENT_STATS.map((stat) => (
          <SurfaceCard key={stat.label} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 text-center shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{stat.label}</p>
            <p className="text-2xl font-semibold text-saubio-forest">{stat.value}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-4 text-sm font-semibold text-saubio-forest">Segmentation & paniers</p>
        <div className="grid gap-4 md:grid-cols-2">
          {SEGMENTS.map((segment) => (
            <div key={segment.segment} className="rounded-2xl bg-saubio-slate/5 p-4 text-sm text-saubio-slate/80">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{segment.segment}</p>
              <p className="text-3xl font-semibold text-saubio-forest">{segment.share}</p>
              <p>Panier moyen : {segment.avg}</p>
              <p>Rétention : {segment.retention}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
