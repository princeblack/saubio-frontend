'use client';

import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { useAdminSystemApiKeys, useAdminSystemInfo } from '@saubio/utils';

export default function AdminDevToolsSandboxPage() {
  const infoQuery = useAdminSystemInfo();
  const apiKeysQuery = useAdminSystemApiKeys({ page: 1, pageSize: 5, status: 'active' });
  const environment = infoQuery.data?.environment;
  const versions = infoQuery.data?.versions;
  const apiKeys = apiKeysQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Module Dev</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Sandbox & environnements</h1>
        <p className="text-sm text-saubio-slate/70">
          Sources et clés réellement disponibles pour exécuter des tests end-to-end (données exposées par
          `/employee/system/info` et `/employee/system/api-keys`).
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Endpoints sandbox</p>
          {infoQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-saubio-slate/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de la configuration…
            </div>
          ) : environment ? (
            <dl className="space-y-3 text-sm text-saubio-slate/70">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em]">Node env</dt>
                <dd className="font-semibold text-saubio-forest">{environment.nodeEnv}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em]">API publique</dt>
                <dd className="font-mono text-xs text-saubio-slate/70">{environment.apiUrl || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em]">App front</dt>
                <dd className="font-mono text-xs text-saubio-slate/70">{environment.appUrl || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em]">Version backend</dt>
                <dd className="font-semibold text-saubio-forest">
                  {versions?.backend ?? '—'} {versions?.commitSha ? `(${versions.commitSha.slice(0, 7)})` : ''}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-saubio-slate/60">Aucune information environnement n&apos;est disponible.</p>
          )}
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-saubio-forest">API keys actives</p>
            <a className="text-xs font-semibold text-saubio-forest underline" href="/admin/system/api-keys">
              Gérer
            </a>
          </div>
          {apiKeysQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-saubio-slate/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Lecture des clés…
            </div>
          ) : apiKeys.length === 0 ? (
            <p className="text-sm text-saubio-slate/60">
              Aucune clé API n&apos;a été générée sur cet environnement sandbox.
            </p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="rounded-2xl bg-saubio-slate/5 p-4">
                  <p className="text-sm font-semibold text-saubio-forest">{key.name}</p>
                  <p className="font-mono text-xs text-saubio-slate/60">{key.prefix}•••</p>
                  <p className="text-xs text-saubio-slate/60">
                    Scopes : {key.scopes.join(', ') || '—'} · Dernier usage{' '}
                    {key.lastUsedAt ? new Intl.DateTimeFormat('fr-FR').format(new Date(key.lastUsedAt)) : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Checklist pour lancer une simulation</p>
        <ul className="space-y-2 text-sm text-saubio-slate/70">
          <li>
            - Vérifier que les endpoints ci-dessus répondent (200) depuis votre machine ou Postman. Les URLs sont
            directement issues de la config déployée.
          </li>
          <li>
            - Utiliser une clé API active ci-dessus pour appeler les routes sandbox (`Authorization: ApiKey {'{'}prefix{'}'}`).
          </li>
          <li>
            - Pour piloter les jobs de données, rendez-vous sur{' '}
            <a href="/admin/dev-tools/jobs" className="text-saubio-forest underline">
              Jobs queue & data
            </a>{' '}
            afin de suivre l&apos;exécution réelle.
          </li>
        </ul>
      </SurfaceCard>
    </div>
  );
}
