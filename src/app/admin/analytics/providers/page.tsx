'use client';

import { SurfaceCard } from '@saubio/ui';

const PROVIDER_STATS = [
  { label: 'Taux satisfaction moyen', value: '4,62 / 5' },
  { label: 'Temps moyen intervention', value: '2h 50' },
  { label: 'Taux réponse', value: '87 %' },
  { label: 'Taux litiges', value: '1,2 %' },
];

const TOP_PROVIDERS = [
  { name: 'Eco Berlin', missions: 320, score: '4,92', complaints: 0 },
  { name: 'GreenSpark', missions: 210, score: '4,78', complaints: 1 },
  { name: 'Sauber GmbH', missions: 400, score: '4,30', complaints: 4 },
];

const LOW_PROVIDERS = [
  { name: 'FastClean', missions: 120, score: '3,90', complaints: 8 },
  { name: 'CleanWave', missions: 98, score: '3,85', complaints: 5 },
];

export default function AdminAnalyticsProvidersPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Analytics & BI</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Analytics prestataires</h1>
        <p className="text-sm text-saubio-slate/70">Suivi satisfaction, temps d’intervention, taux de réponse et litiges.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {PROVIDER_STATS.map((stat) => (
          <SurfaceCard key={stat.label} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 text-center shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{stat.label}</p>
            <p className="text-2xl font-semibold text-saubio-forest">{stat.value}</p>
          </SurfaceCard>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Top prestataires</p>
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Missions</th>
                <th className="px-3 py-2 text-left font-semibold">Score</th>
                <th className="px-3 py-2 text-left font-semibold">Litiges</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PROVIDERS.map((provider) => (
                <tr key={provider.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{provider.name}</td>
                  <td className="px-3 py-2">{provider.missions}</td>
                  <td className="px-3 py-2">{provider.score}</td>
                  <td className="px-3 py-2">{provider.complaints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SurfaceCard>
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Prestataires à surveiller</p>
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Missions</th>
                <th className="px-3 py-2 text-left font-semibold">Score</th>
                <th className="px-3 py-2 text-left font-semibold">Réclamations</th>
              </tr>
            </thead>
            <tbody>
              {LOW_PROVIDERS.map((provider) => (
                <tr key={provider.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{provider.name}</td>
                  <td className="px-3 py-2">{provider.missions}</td>
                  <td className="px-3 py-2 text-rose-900">{provider.score}</td>
                  <td className="px-3 py-2">{provider.complaints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SurfaceCard>
      </div>
    </div>
  );
}
