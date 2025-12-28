'use client';

import { useEffect, useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import {
  useAdminSmartMatchingConfig,
  useUpdateAdminSmartMatchingConfig,
} from '@saubio/utils';

const POSITIVE_LABELS: Record<string, string> = {
  distance: 'Proximité géographique',
  rating: 'Note moyenne',
  experience: 'Expérience (missions)',
  eco: 'Eco-friendly',
  availability: 'Disponibilité',
  loyalty: 'Fidélité client',
  reliability: 'Fiabilité',
};

export default function AdminMatchingScoringPage() {
  const configQuery = useAdminSmartMatchingConfig();
  const updateMutation = useUpdateAdminSmartMatchingConfig();
  const config = configQuery.data;
  const [draft, setDraft] = useState<{ distanceMaxKm: number; weights: Record<string, number>; teamBonus: { two?: number; threePlus?: number } } | null>(null);

  useEffect(() => {
    if (config) {
      setDraft({
        distanceMaxKm: config.distanceMaxKm,
        weights: { ...config.weights },
        teamBonus: { ...config.teamBonus },
      });
    }
  }, [config]);

  const positiveWeights = useMemo(() => {
    if (!draft) return [];
    return Object.entries(POSITIVE_LABELS).map(([key, label]) => ({
      key,
      label,
      value: draft.weights[key] ?? 0,
    }));
  }, [draft]);

  const handleWeightChange = (key: string, value: number) => {
    setDraft((prev) => (prev ? { ...prev, weights: { ...prev.weights, [key]: value } } : prev));
  };

  const handleBonusChange = (key: 'two' | 'threePlus', value: number) => {
    setDraft((prev) => (prev ? { ...prev, teamBonus: { ...prev.teamBonus, [key]: value } } : prev));
  };

  const handleSubmit = () => {
    if (!draft) return;
    updateMutation.mutate(draft);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Smart Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Règles de scoring</h1>
        <p className="text-sm text-saubio-slate/70">Ajustez les poids utilisés par l’algorithme et appliquez-les instantanément.</p>
      </header>

      {!draft && <Skeleton className="h-40 w-full rounded-3xl" />}

      {draft && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Critères principaux</p>
                <button
                  onClick={handleSubmit}
                  disabled={updateMutation.isLoading}
                  className="rounded-2xl border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest disabled:opacity-50"
                >
                  {updateMutation.isLoading ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
              <div className="mt-4 space-y-4 text-sm text-saubio-slate/80">
                <label className="block text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
                  Distance max (km)
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={draft.distanceMaxKm}
                    onChange={(event) => setDraft((prev) => (prev ? { ...prev, distanceMaxKm: Number(event.target.value) } : prev))}
                    className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
                  />
                </label>
                <label className="block text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
                  Bonus équipe (2 membres)
                  <input
                    type="number"
                    step="0.01"
                    value={draft.teamBonus.two ?? 0}
                    onChange={(event) => handleBonusChange('two', Number(event.target.value))}
                    className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
                  />
                </label>
                <label className="block text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
                  Bonus équipe (3+)
                  <input
                    type="number"
                    step="0.01"
                    value={draft.teamBonus.threePlus ?? 0}
                    onChange={(event) => handleBonusChange('threePlus', Number(event.target.value))}
                    className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
                  />
                </label>
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <p className="mb-3 text-sm font-semibold text-saubio-forest">Historique config</p>
              <p className="text-xs text-saubio-slate/60">
                Les modifications sont versionnées et appliquées dans la minute sur le moteur opérationnel.
              </p>
              <p className="mt-2 text-xs text-saubio-slate/60">
                Utilisez ce panneau pour suivre les valeurs en cours avant de déclencher des simulations.
              </p>
            </SurfaceCard>
          </div>

          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="mb-3 text-sm font-semibold text-saubio-forest">Poids des critères</p>
            <ul className="space-y-3 text-sm text-saubio-slate/80">
              {positiveWeights.map((weight) => (
                <li key={weight.key} className="rounded-2xl border border-saubio-forest/10 p-3">
                  <div className="flex items-center justify-between">
                    <span>{weight.label}</span>
                    <span className="font-semibold text-saubio-forest">{weight.value.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={weight.value}
                    onChange={(event) => handleWeightChange(weight.key, Number(event.target.value))}
                    className="mt-2 w-full accent-saubio-forest"
                  />
                </li>
              ))}
            </ul>
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
