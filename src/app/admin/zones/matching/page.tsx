'use client';

import { SurfaceCard } from '@saubio/ui';
import { AlertCircle } from 'lucide-react';
import { useAdminZoneMatchingRules } from '@saubio/utils';

export default function AdminZoneMatchingPage() {
  const rulesQuery = useAdminZoneMatchingRules();
  const defaults = rulesQuery.data?.defaults;
  const overrides = rulesQuery.data?.overrides ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Zones & Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Paramètres de matching par zone</h1>
        <p className="text-sm text-saubio-slate/70">Définissez la priorité (proximité, note, prix, éco), le rayon et les overrides par zone.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        {rulesQuery.isLoading ? (
          <div className="py-8 text-center text-sm text-saubio-slate/70">Chargement de la configuration…</div>
        ) : rulesQuery.isError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" />
            Impossible de récupérer les paramètres de matching.
          </div>
        ) : !defaults ? (
          <div className="py-8 text-center text-sm text-saubio-slate/70">Aucune configuration trouvée.</div>
        ) : (
          <div className="space-y-5 text-sm text-saubio-slate/80">
            <div className="rounded-3xl border border-saubio-forest/10 bg-saubio-mist/40 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Configuration par défaut</p>
              <p className="text-lg font-semibold text-saubio-forest">Rayon max : {defaults.distanceMaxKm} km</p>
              <p className="text-xs text-saubio-slate/60">Pondérations : {Object.entries(defaults.weights).map(([key, value]) => `${key} ${(value * 100).toFixed(0)}%`).join(' · ')}</p>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-saubio-forest">Overrides spécifiques</p>
              {overrides.length === 0 ? (
                <p className="text-xs text-saubio-slate/60">Aucun override n’a été défini par zone.</p>
              ) : (
                <ul className="space-y-3">
                  {overrides.map((override) => (
                    <li key={override.postalCode} className="rounded-2xl border border-saubio-forest/10 p-3">
                      <p className="font-semibold text-saubio-forest">
                        {override.city ?? 'Zone'} ({override.postalCode})
                      </p>
                      <p className="text-xs text-saubio-slate/60">
                        Distance max personnalisée : {override.distanceMaxKm ?? defaults.distanceMaxKm} km
                      </p>
                      {override.notes ? <p className="text-xs text-saubio-slate/60">{override.notes}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
