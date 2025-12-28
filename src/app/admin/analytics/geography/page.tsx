'use client';

import { SurfaceCard } from '@saubio/ui';

const ZONES = [
  { zone: 'Berlin - 10115', bookings: 520, growth: '+8%', status: 'Performant' },
  { zone: 'Hambourg - 20095', bookings: 260, growth: '-4%', status: 'Sous-performant' },
  { zone: 'Munich - 80331', bookings: 310, growth: '+2%', status: 'Stable' },
  { zone: 'Cologne - 50668', bookings: 140, growth: '-12%', status: 'Non couvert' },
];

export default function AdminAnalyticsGeographyPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Analyse géographique</h1>
        <p className="text-sm text-saubio-slate/70">Carte interactive, zones fortes / faibles, focus code postal ou ville.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Zones et performances</p>
            <p className="text-xs text-saubio-slate/60">Importe tes shapefiles ou connecte un outil BI externe pour visualiser la carte.</p>
          </div>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Exporter GeoJSON</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Zone</th>
                <th className="px-3 py-2 text-left font-semibold">Réservations (30 j)</th>
                <th className="px-3 py-2 text-left font-semibold">Variation</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((zone) => (
                <tr key={zone.zone} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{zone.zone}</td>
                  <td className="px-3 py-2">{zone.bookings}</td>
                  <td className="px-3 py-2">{zone.growth}</td>
                  <td className="px-3 py-2">{zone.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
