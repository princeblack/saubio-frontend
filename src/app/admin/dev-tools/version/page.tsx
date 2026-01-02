'use client';

import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { useAdminSystemHealth, useAdminSystemInfo } from '@saubio/utils';

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function AdminDevToolsVersionPage() {
  const infoQuery = useAdminSystemInfo();
  const healthQuery = useAdminSystemHealth();
  const versions = infoQuery.data?.versions;
  const environment = infoQuery.data?.environment;
  const backupChecks = (healthQuery.data?.checks ?? []).filter((check) =>
    ['database', 'storage', 'queues'].includes(check.id)
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Système & versions</h1>
        <p className="text-sm text-saubio-slate/70">
          Informations issues de `/employee/system/info` + état des sauvegardes depuis `/employee/system/health`.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Versions déployées</p>
        {infoQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-saubio-slate/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Lecture des métadonnées…
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <VersionCard
              title="Backend API"
              version={versions?.backend ?? '—'}
              commit={versions?.commitSha}
              date={versions?.buildDate}
              helper={`Node env : ${environment?.nodeEnv ?? '—'}`}
            />
            <VersionCard
              title="Frontend"
              version={versions?.frontend ?? '—'}
              commit={versions?.commitSha}
              date={versions?.buildDate}
              helper={`App URL : ${environment?.appUrl ?? '—'}`}
            />
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Sauvegardes & monitoring</p>
        {healthQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-saubio-slate/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyse des checks…
          </div>
        ) : backupChecks.length === 0 ? (
          <p className="text-sm text-saubio-slate/60">Aucun check dédié aux sauvegardes n&apos;est configuré.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {backupChecks.map((check) => {
              const tone =
                check.status === 'ok'
                  ? 'text-emerald-900'
                  : check.status === 'degraded'
                  ? 'text-saubio-sun/80'
                  : 'text-rose-900';
              return (
                <div key={check.id} className="rounded-2xl bg-saubio-slate/5 p-4 text-sm text-saubio-slate/80">
                  <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">{check.label}</p>
                  <p className={`mt-2 text-2xl font-semibold ${tone}`}>
                    {check.status === 'ok' ? 'OK' : check.status === 'degraded' ? 'Dégradé' : 'Incident'}
                  </p>
                  <p className="text-xs text-saubio-slate/60">{check.message ?? 'Rien à signaler'}</p>
                  <p className="text-[11px] text-saubio-slate/50">Dernier check {formatDateTime(check.lastCheckedAt)}</p>
                </div>
              );
            })}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

const VersionCard = ({
  title,
  version,
  commit,
  date,
  helper,
}: {
  title: string;
  version: string;
  commit?: string;
  date?: string;
  helper?: string;
}) => (
  <div className="rounded-2xl bg-saubio-slate/5 p-4 text-sm text-saubio-slate/80">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-saubio-forest">{title}</p>
      <p className="text-xs text-saubio-slate/60">{date ? formatDateTime(date) : '—'}</p>
    </div>
    <p className="text-2xl font-semibold text-saubio-forest">{version}</p>
    <p className="font-mono text-xs text-saubio-slate/60">{commit ? commit.slice(0, 7) : '—'}</p>
    {helper ? <p className="text-[11px] text-saubio-slate/60">{helper}</p> : null}
  </div>
);
