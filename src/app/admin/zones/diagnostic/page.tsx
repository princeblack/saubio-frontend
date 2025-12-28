'use client';

import { SurfaceCard } from '@saubio/ui';
import { useState } from 'react';
import { useAdminMatchingTestMutation } from '@saubio/utils';
import { AlertCircle } from 'lucide-react';
import { SERVICE_CATEGORY_IDS } from '@saubio/models';

export default function AdminZoneDiagnosticPage() {
  const [postalCode, setPostalCode] = useState('');
  const [service, setService] = useState(SERVICE_CATEGORY_IDS[0]);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const matchingMutation = useAdminMatchingTestMutation();
  const result = matchingMutation.data;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Zones & Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Diagnostic matching</h1>
        <p className="text-sm text-saubio-slate/70">
          Outil interne destiné au support pour comprendre pourquoi un booking n’a pas trouvé de prestataire et quelles règles se sont appliquées.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!postalCode || !startAt || !endAt) return;
            matchingMutation.mutate({
              postalCode,
              service,
              startAt,
              endAt,
            });
          }}
        >
          <input
            type="text"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            className="h-11 rounded-2xl border border-saubio-forest/10 px-3 text-sm text-saubio-forest outline-none"
            placeholder="Code postal"
          />
          <select
            value={service}
            onChange={(event) => setService(event.target.value as typeof service)}
            className="h-11 rounded-2xl border border-saubio-forest/10 px-3 text-sm text-saubio-forest outline-none"
          >
            {SERVICE_CATEGORY_IDS.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            className="h-11 rounded-2xl border border-saubio-forest/10 px-3 text-sm text-saubio-forest outline-none"
          />
          <input
            type="datetime-local"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            className="h-11 rounded-2xl border border-saubio-forest/10 px-3 text-sm text-saubio-forest outline-none"
          />
          <button
            type="submit"
            className="sm:col-span-2 rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest"
            disabled={matchingMutation.isLoading}
          >
            {matchingMutation.isLoading ? 'Analyse en cours…' : 'Tester le matching'}
          </button>
        </form>
      </SurfaceCard>

      {matchingMutation.isError ? (
        <SurfaceCard className="rounded-3xl border border-rose-200 bg-white/95 p-4 text-sm text-rose-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4" />
            Impossible d’exécuter le diagnostic. Vérifiez les paramètres.
          </div>
        </SurfaceCard>
      ) : result ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Paramètres utilisés</p>
              <p className="text-lg font-semibold text-saubio-forest">
                {result.query.postalCode} • {result.query.service}
              </p>
              <p className="text-sm text-saubio-slate/70">
                {new Date(result.query.startAt).toLocaleString('fr-FR')} –{' '}
                {new Date(result.query.endAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Candidats trouvés</p>
              <p className="text-lg font-semibold text-saubio-forest">{result.summary.totalCandidates}</p>
              <p className="text-xs text-saubio-slate/60">Rayon max configuré : {result.summary.distanceMaxKm} km</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {result.candidates.length === 0 ? (
              <p className="text-sm text-saubio-slate/70">Aucun prestataire éligible trouvé.</p>
            ) : (
              result.candidates.map((candidate) => (
                <div key={candidate.providerId} className="rounded-2xl border border-saubio-forest/10 p-3 text-sm">
                  <p className="font-semibold text-saubio-forest">
                    #{candidate.rank} · {candidate.providerName}
                  </p>
                  <p className="text-xs text-saubio-slate/60">
                    Score {(candidate.score * 100).toFixed(0)} — Distance {candidate.metadata.distanceKm.toFixed(1)} km —{' '}
                    {candidate.serviceZones.slice(0, 2).map((zone) => zone.postalCode).join(', ')}
                  </p>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  );
}
