'use client';

import { useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { CalendarDays } from 'lucide-react';
import { useAdminSmartMatchingScenarios } from '@saubio/utils';

export default function AdminMatchingScenariosPage() {
  const [inputs, setInputs] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [applied, setApplied] = useState<{ from?: string; to?: string }>({});
  const scenariosQuery = useAdminSmartMatchingScenarios(applied);
  const scenarios = scenariosQuery.data?.scenarios ?? [];
  const period = scenariosQuery.data?.period;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setApplied({
      from: inputs.from || undefined,
      to: inputs.to || undefined,
    });
  };

  const handleReset = () => {
    setInputs({ from: '', to: '' });
    setApplied({});
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Smart Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Stratégies de matching</h1>
        <p className="text-sm text-saubio-slate/70">
          Analysez les scénarios réellement observés (standard, urgent, récurrent…). Indicateurs calculés à partir des bookings Smart Match.
        </p>
        {period && (
          <p className="text-xs text-saubio-slate/60">
            Période : {new Date(period.from).toLocaleDateString()} → {new Date(period.to).toLocaleDateString()}
          </p>
        )}
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
          <label className="flex flex-col text-xs text-saubio-slate/60">
            Depuis
            <input
              type="date"
              value={inputs.from}
              onChange={(event) => setInputs((prev) => ({ ...prev, from: event.target.value }))}
              className="mt-1 rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
            />
          </label>
          <label className="flex flex-col text-xs text-saubio-slate/60">
            Jusqu’au
            <input
              type="date"
              value={inputs.to}
              onChange={(event) => setInputs((prev) => ({ ...prev, to: event.target.value }))}
              className="mt-1 rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-forest"
            />
          </label>
          <div className="flex items-end gap-2 md:col-span-2">
            <button
              type="submit"
              className="flex-1 rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest"
            >
              Actualiser
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border border-saubio-forest/10 px-4 py-2 text-sm text-saubio-slate/70"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-saubio-forest">
          <CalendarDays className="h-4 w-4 text-saubio-slate/60" />
          Scénarios détectés
        </div>
        {scenariosQuery.isLoading && (
          <ul className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={`scenario-skeleton-${index}`} className="rounded-2xl border border-saubio-forest/10 p-3">
                <Skeleton className="h-5 w-1/2 rounded-2xl" />
                <Skeleton className="mt-2 h-4 w-2/3 rounded-2xl" />
                <Skeleton className="mt-4 h-8 w-full rounded-2xl" />
              </li>
            ))}
          </ul>
        )}
        {!scenariosQuery.isLoading && !scenarios.length && (
          <p className="text-sm text-saubio-slate/60">Aucun booking Smart Match durant cette période.</p>
        )}
        {!scenariosQuery.isLoading && !!scenarios.length && (
          <ul className="space-y-3 text-sm">
            {scenarios.map((scenario) => (
              <li key={scenario.id} className="rounded-2xl border border-saubio-forest/10 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-saubio-forest">{scenario.name}</p>
                    <p className="text-xs text-saubio-slate/60">{scenario.conditions}</p>
                  </div>
                  <p className="text-xs text-saubio-slate/60">
                    {scenario.stats.bookings} mission(s) • {(scenario.stats.successRate * 100).toFixed(1)} % de réussite
                  </p>
                </div>
                <div className="mt-3 grid gap-3 text-xs text-saubio-slate/70 md:grid-cols-3">
                  <div className="rounded-2xl bg-saubio-mist/70 px-3 py-2">
                    Invitations moyennes{' '}
                    <span className="font-semibold text-saubio-forest">
                      {scenario.stats.avgInvitations !== null ? scenario.stats.avgInvitations.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-saubio-mist/70 px-3 py-2">
                    Lead moyen{' '}
                    <span className="font-semibold text-saubio-forest">
                      {scenario.stats.avgLeadHours !== null ? `${scenario.stats.avgLeadHours.toFixed(1)} h` : '—'}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-saubio-mist/70 px-3 py-2">
                    Highlights : {scenario.highlights.join(' • ')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
