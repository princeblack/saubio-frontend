'use client';

import { useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { SERVICE_CATALOG } from '@saubio/models';
import { useAdminSmartMatchingSimulation } from '@saubio/utils';

const formatScore = (value: number) => value.toFixed(2);

export default function AdminMatchingSimulationPage() {
  const [inputs, setInputs] = useState({
    postalCode: '10115',
    city: 'Berlin',
    service: SERVICE_CATALOG[0]?.id ?? 'residential',
    startAt: new Date().toISOString().slice(0, 16),
    durationHours: 3,
    ecoPreference: 'standard',
    requiredProviders: 1,
  });
  const simulationMutation = useAdminSmartMatchingSimulation();
  const simulation = simulationMutation.data;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    simulationMutation.mutate({
      service: inputs.service as any,
      postalCode: inputs.postalCode,
      city: inputs.city,
      startAt: new Date(inputs.startAt).toISOString(),
      durationMinutes: inputs.durationHours * 60,
      ecoPreference: inputs.ecoPreference as any,
      requiredProviders: inputs.requiredProviders,
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Smart Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Sandbox & simulation</h1>
        <p className="text-sm text-saubio-slate/70">
          Prévisualisez la liste de prestataires que le moteur contacterait pour un scénario donné (sans envoyer d’invitation).
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
            Code postal
            <input
              value={inputs.postalCode}
              onChange={(event) => setInputs((prev) => ({ ...prev, postalCode: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest outline-none"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
            Ville
            <input
              value={inputs.city}
              onChange={(event) => setInputs((prev) => ({ ...prev, city: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest outline-none"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
            Service
            <select
              value={inputs.service}
              onChange={(event) => setInputs((prev) => ({ ...prev, service: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
            >
              {SERVICE_CATALOG.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
            Date & heure
            <input
              type="datetime-local"
              value={inputs.startAt}
              onChange={(event) => setInputs((prev) => ({ ...prev, startAt: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
            Durée (heures)
            <input
              type="number"
              min={1}
              max={12}
              value={inputs.durationHours}
              onChange={(event) => setInputs((prev) => ({ ...prev, durationHours: Number(event.target.value) }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
            Preference Eco
            <select
              value={inputs.ecoPreference}
              onChange={(event) => setInputs((prev) => ({ ...prev, ecoPreference: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
            >
              <option value="standard">Standard</option>
              <option value="bio">Öko Plus</option>
            </select>
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
            Prestataires requis
            <input
              type="number"
              min={1}
              max={5}
              value={inputs.requiredProviders}
              onChange={(event) => setInputs((prev) => ({ ...prev, requiredProviders: Number(event.target.value) }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest disabled:opacity-50"
              disabled={simulationMutation.isLoading}
            >
              {simulationMutation.isLoading ? 'Simulation…' : 'Simuler'}
            </button>
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Résultat simulé</p>
        {simulationMutation.isLoading && <Skeleton className="h-40 w-full rounded-2xl" />}
        {!simulationMutation.isLoading && !simulation && (
          <p className="text-xs text-saubio-slate/60">Définissez un scénario puis lancez la simulation.</p>
        )}
        {simulation && (
          <>
            <p className="text-xs text-saubio-slate/60">
              {simulation.summary.totalCandidates} prestataires identifiés • fenêtre {new Date(simulation.query.startAt).toLocaleString('fr-FR')}
            </p>
            <ul className="mt-3 space-y-3 text-sm text-saubio-slate/80">
              {simulation.candidates.map((candidate) => (
                <li key={candidate.providerId} className="rounded-2xl border border-saubio-forest/10 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-saubio-forest">{candidate.providerName}</p>
                      <p className="text-xs text-saubio-slate/60">{candidate.providerEmail}</p>
                    </div>
                    <p className="text-saubio-forest">{formatScore(candidate.score)}</p>
                  </div>
                  <p className="text-xs text-saubio-slate/60">
                    Distance {candidate.metadata.distanceKm.toFixed(1)} km • Tarif {candidate.metadata.hourlyRateCents / 100} € / h • Éco{' '}
                    {candidate.metadata.providerType === 'COMPANY' ? 'équipe' : 'solo'}
                  </p>
                </li>
              ))}
              {!simulation.candidates.length && (
                <li className="text-xs text-saubio-slate/60">Aucun prestataire éligible trouvé pour ces critères.</li>
              )}
            </ul>
            <p className="mt-3 text-xs text-saubio-slate/60">Simulation uniquement — aucune notification envoyée.</p>
          </>
        )}
      </SurfaceCard>
    </div>
  );
}
