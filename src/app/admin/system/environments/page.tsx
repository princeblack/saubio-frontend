'use client';

import { SurfaceCard } from '@saubio/ui';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAdminSystemInfo } from '@saubio/utils';

const formatValue = (value?: string) => value ?? '—';

export default function AdminSystemEnvironmentsPage() {
  const infoQuery = useAdminSystemInfo();
  const info = infoQuery.data;

  const featureFlags = info?.featureFlags ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">Paramètres & environnements</h1>
            <p className="text-sm text-saubio-slate/70">
              URLs publiques, versions déployées, commit courant et feature flags actifs.
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            onClick={() => infoQuery.refetch()}
            disabled={infoQuery.isFetching}
          >
            {infoQuery.isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Rafraîchir
          </button>
        </div>
      </header>

      {infoQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-saubio-slate/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des informations système…
        </div>
      ) : info ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Environnement</p>
              <p className="text-2xl font-semibold text-saubio-forest">{info.environment.nodeEnv}</p>
            </div>
            <div className="space-y-3 text-sm text-saubio-slate/80">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">API publique</p>
                <p className="font-mono text-xs">{formatValue(info.environment.apiUrl)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Application</p>
                <p className="font-mono text-xs">{formatValue(info.environment.appUrl)}</p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Versions</p>
              <p className="text-2xl font-semibold text-saubio-forest">Backend {info.versions.backend}</p>
            </div>
            <div className="space-y-2 text-sm text-saubio-slate/80">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Frontend</p>
                <p>{formatValue(info.versions.frontend)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Commit</p>
                <p className="font-mono text-xs">{formatValue(info.versions.commitSha)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Build</p>
                <p>{formatValue(info.versions.buildDate)}</p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg md:col-span-2">
            <p className="text-sm font-semibold text-saubio-forest">Feature flags</p>
            {featureFlags.length === 0 ? (
              <p className="text-xs text-saubio-slate/60">Aucun flag n&apos;est configuré côté backend.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {featureFlags.map((flag) => (
                  <div
                    key={flag.key}
                    className="flex items-center justify-between rounded-2xl border border-saubio-forest/10 bg-saubio-forest/2 px-4 py-2 text-sm text-saubio-slate/80"
                  >
                    <div>
                      <p className="font-semibold text-saubio-forest">{flag.label}</p>
                      <p className="text-xs text-saubio-slate/60">{flag.key}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        flag.enabled ? 'bg-emerald-50 text-emerald-900' : 'bg-saubio-slate/10 text-saubio-slate/80'
                      }`}
                    >
                      {flag.enabled ? 'Activé' : 'Désactivé'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>
        </div>
      ) : (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm text-saubio-slate/70 shadow-soft-lg">
          Informations système indisponibles.
        </SurfaceCard>
      )}
    </div>
  );
}
