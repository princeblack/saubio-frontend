'use client';

import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { useAdminSystemInfo } from '@saubio/utils';

export default function AdminDevToolsFlagsPage() {
  const infoQuery = useAdminSystemInfo();
  const flags = infoQuery.data?.featureFlags ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Feature flags</h1>
        <p className="text-sm text-saubio-slate/70">
          Lecture en temps réel des flags exposés côté backend (configuration `AppEnvironmentConfig`).
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Flags disponibles</p>
          <a className="text-xs font-semibold text-saubio-forest underline" href="/admin/system/page">
            Voir configuration système
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Flag</th>
                <th className="px-3 py-2 text-left font-semibold">Description</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {infoQuery.isLoading ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Chargement des flags…
                  </td>
                </tr>
              ) : flags.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun flag n&apos;est exposé dans l&apos;environnement actuel.
                  </td>
                </tr>
              ) : (
                flags.map((flag) => (
                  <tr key={flag.key} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-mono text-xs text-saubio-forest">{flag.key}</td>
                    <td className="px-3 py-2">{flag.label}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          flag.enabled ? 'bg-emerald-50 text-emerald-900' : 'bg-saubio-slate/10 text-saubio-slate/70'
                        }`}
                      >
                        {flag.enabled ? 'Activé' : 'Désactivé'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
