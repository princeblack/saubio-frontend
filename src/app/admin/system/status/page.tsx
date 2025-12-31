'use client';

import { SurfaceCard } from '@saubio/ui';
import type { AdminSystemStatus } from '@saubio/models';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAdminSystemHealth } from '@saubio/utils';

const statusTone: Record<AdminSystemStatus, string> = {
  ok: 'text-emerald-900 bg-emerald-50',
  degraded: 'text-saubio-sun/80 bg-saubio-sun/10',
  down: 'text-rose-900 bg-rose-50',
};

const statusLabel: Record<AdminSystemStatus, string> = {
  ok: 'Opérationnel',
  degraded: 'Dégradé',
  down: 'En panne',
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function AdminSystemStatusPage() {
  const healthQuery = useAdminSystemHealth();
  const isRefreshing = healthQuery.isFetching;
  const checks = healthQuery.data?.checks ?? [];

  const sortedChecks = [...checks].sort((a, b) => {
    const statusOrder: Record<AdminSystemStatus, number> = { ok: 2, degraded: 1, down: 0 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-saubio-forest">État détaillé des composants</h1>
            <p className="text-sm text-saubio-slate/70">
              Latence base, queues emails, matching, paiements et état des webhooks.
            </p>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            onClick={() => healthQuery.refetch()}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Rafraîchir
          </button>
        </div>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-saubio-slate/70">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Statut global</p>
            {healthQuery.isLoading ? (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                Chargement…
              </div>
            ) : healthQuery.data ? (
              <div className="mt-1 flex items-center gap-2 text-base font-semibold text-saubio-forest">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[healthQuery.data.status]}`}
                >
                  {statusLabel[healthQuery.data.status]}
                </span>
                <span className="text-xs text-saubio-slate/60">
                  Mis à jour {formatDateTime(healthQuery.data.updatedAt)}
                </span>
              </div>
            ) : (
              <p>Données indisponibles.</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Checks suivis</p>
            <p className="text-2xl font-semibold text-saubio-forest">{checks.length || '—'}</p>
          </div>
        </div>
      </SurfaceCard>

      {healthQuery.isError ? (
        <SurfaceCard className="flex items-center gap-2 rounded-3xl border border-rose-100 bg-rose-50/60 p-4 text-sm text-rose-900">
          <AlertCircle className="h-4 w-4" />
          Impossible de récupérer l&apos;état du système. Réessayez plus tard.
        </SurfaceCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {healthQuery.isLoading && sortedChecks.length === 0 ? (
          <>
            {Array.from({ length: 4 }).map((_, idx) => (
              <SurfaceCard
                key={idx}
                className="animate-pulse rounded-3xl border border-saubio-forest/10 bg-white/50 p-5 shadow-soft-lg"
              >
                <div className="h-5 w-32 rounded-full bg-saubio-forest/10" />
                <div className="mt-3 h-3 w-full rounded-full bg-saubio-forest/10" />
                <div className="mt-2 h-3 w-2/3 rounded-full bg-saubio-forest/10" />
              </SurfaceCard>
            ))}
          </>
        ) : sortedChecks.length === 0 ? (
          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm text-saubio-slate/70 shadow-soft-lg">
            Aucun check à afficher pour le moment.
          </SurfaceCard>
        ) : (
          sortedChecks.map((check) => (
            <SurfaceCard key={check.id} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-saubio-forest">{check.label}</p>
                  {check.message ? <p className="text-xs text-saubio-slate/60">{check.message}</p> : null}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[check.status]}`}>
                  {statusLabel[check.status]}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-saubio-slate/70 sm:grid-cols-2">
                {check.latencyMs !== undefined ? (
                  <div>
                    <p className="uppercase tracking-[0.2em] text-saubio-slate/40">Latence</p>
                    <p className="font-semibold text-saubio-forest">{check.latencyMs} ms</p>
                  </div>
                ) : null}
                {check.lastCheckedAt ? (
                  <div>
                    <p className="uppercase tracking-[0.2em] text-saubio-slate/40">Dernier check</p>
                    <p className="font-semibold text-saubio-forest">{formatDateTime(check.lastCheckedAt)}</p>
                  </div>
                ) : null}
                {check.metrics
                  ? Object.entries(check.metrics)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div key={`${check.id}-${key}`}>
                          <p className="uppercase tracking-[0.2em] text-saubio-slate/40">{key}</p>
                          <p className="font-semibold text-saubio-forest">{String(value)}</p>
                        </div>
                      ))
                  : null}
              </div>
            </SurfaceCard>
          ))
        )}
      </div>
    </div>
  );
}
