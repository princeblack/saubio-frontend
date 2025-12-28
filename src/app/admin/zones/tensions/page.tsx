'use client';

import { SurfaceCard } from '@saubio/ui';
import { AlertCircle } from 'lucide-react';
import { useAdminZoneCoverage } from '@saubio/utils';

const statusTone: Record<string, string> = {
  deficit: 'border-rose-300 bg-rose-50 text-rose-700',
  surplus: 'border-sky-300 bg-sky-50 text-sky-700',
};

export default function AdminZoneTensionsPage() {
  const coverageQuery = useAdminZoneCoverage();
  const zones = coverageQuery.data?.items ?? [];
  const deficitZones = zones.filter((zone) => zone.status === 'low' || zone.status === 'none');
  const surplusZones = zones.filter((zone) => zone.status === 'surplus');

  const rows = [
    ...deficitZones.slice(0, 5).map((zone) => ({ type: 'deficit' as const, zone })),
    ...surplusZones.slice(0, 5).map((zone) => ({ type: 'surplus' as const, zone })),
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Zones & Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Zones en tension</h1>
        <p className="text-sm text-saubio-slate/70">Repérez les zones déficitaires en prestataires ou au contraire sur-capacitaires.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        {coverageQuery.isLoading ? (
          <div className="py-8 text-center text-sm text-saubio-slate/70">Analyse des tendances…</div>
        ) : coverageQuery.isError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" />
            Impossible de récupérer les zones en tension.
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-saubio-slate/70">Aucune zone critique détectée ces 30 derniers jours.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Zone</th>
                  <th className="px-3 py-2 text-left font-semibold">Prestataires</th>
                  <th className="px-3 py-2 text-left font-semibold">Missions (30 j)</th>
                  <th className="px-3 py-2 text-left font-semibold">Ratio</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={`${entry.type}-${entry.zone.postalCode}`} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      {entry.zone.city} ({entry.zone.postalCode})
                    </td>
                    <td className="px-3 py-2">{entry.zone.providerCount}</td>
                    <td className="px-3 py-2">{entry.zone.bookingsLast30Days}</td>
                    <td className="px-3 py-2">{entry.zone.ratio.toFixed(1)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusTone[entry.type]
                        }`}
                      >
                        {entry.type === 'deficit' ? 'Sous-couverte' : 'Sur-capacité'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
