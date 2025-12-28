'use client';

import { SurfaceCard } from '@saubio/ui';
import { AlertCircle, Cog, Edit3, FileText } from 'lucide-react';
import { useAdminServiceLogs } from '@saubio/utils';

const iconForCategory = (category: string) => {
  switch (category) {
    case 'pricing':
      return Cog;
    case 'document':
      return FileText;
    default:
      return Edit3;
  }
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  return `${date.toLocaleDateString('fr-FR')} • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
};

export default function AdminServiceLogsPage() {
  const logsQuery = useAdminServiceLogs();
  const logs = logsQuery.data?.logs ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Services & Tarifs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Historique & logs</h1>
        <p className="text-sm text-saubio-slate/70">Chaque mise à jour tarifaire ou modification de service est tracée avec un horodatage réel.</p>
      </header>

      {logsQuery.isLoading ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/90 p-8 text-center shadow-soft-lg">
          <p className="text-sm text-saubio-slate/70">Chargement de l’historique…</p>
        </SurfaceCard>
      ) : logsQuery.isError ? (
        <SurfaceCard className="rounded-3xl border border-rose-200 bg-white/90 p-6 shadow-soft-lg">
          <div className="flex items-center gap-3 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Impossible de charger les logs</p>
              <p className="text-sm text-rose-600/80">Merci de réessayer ultérieurement.</p>
            </div>
          </div>
        </SurfaceCard>
      ) : (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          {logs.length === 0 ? (
            <p className="text-sm text-saubio-slate/60">Aucune modification récente n’a été détectée.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const Icon = iconForCategory(log.category);
                return (
                  <div key={log.id} className="rounded-2xl bg-saubio-mist/60 p-4 text-sm">
                    <div className="mb-1 flex items-center gap-3 text-saubio-slate/60">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-saubio-forest">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em]">{formatTimestamp(log.timestamp)}</p>
                        <p className="text-[13px] text-saubio-slate/70">{log.actor}</p>
                      </div>
                    </div>
                    <p className="text-base text-saubio-forest">{log.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </SurfaceCard>
      )}
    </div>
  );
}
