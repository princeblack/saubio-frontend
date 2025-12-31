'use client';

import { useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { formatDateTime, useAdminNotificationRules } from '@saubio/utils';

export default function AdminComplianceAutomationPage() {
  const rulesQuery = useAdminNotificationRules();
  const rules = rulesQuery.data ?? [];

  const metrics = useMemo(() => {
    if (rules.length === 0) {
      return [
        { label: 'Règles actives', value: '0' },
        { label: 'Règles en pause', value: '0' },
        { label: 'Automations configurées', value: '0' },
        { label: 'Délai moyen', value: '0 min' },
      ];
    }
    const active = rules.filter((rule) => rule.isActive).length;
    const paused = rules.length - active;
    const avgDelayMinutes = Math.round(
      rules.reduce((acc, rule) => acc + (rule.delaySeconds ?? 0), 0) / rules.length / 60
    );
    return [
      { label: 'Règles actives', value: active.toString() },
      { label: 'Règles en pause', value: paused.toString() },
      { label: 'Automations configurées', value: rules.length.toString() },
      { label: 'Délai moyen', value: `${avgDelayMinutes} min` },
    ];
  }, [rules]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Automatisation & rappels</h1>
        <p className="text-sm text-saubio-slate/70">
          Suivez les workflows déclenchés Automatic pour RGPD, alertes sécurité et obligations réglementaires.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <SurfaceCard
            key={metric.label}
            className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm text-saubio-slate/70 shadow-soft-lg"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{metric.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">{metric.value}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Règles automatiques</p>
            <p className="text-xs text-saubio-slate/60">
              Basées sur les événements (export terminé, document expiré, incident sécurité, etc.).
            </p>
          </div>
          <a
            className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
            href="/admin/automation/center"
          >
            Gérer
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Déclencheur</th>
                <th className="px-3 py-2 text-left font-semibold">Audience</th>
                <th className="px-3 py-2 text-left font-semibold">Canaux</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rulesQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucune règle configurée.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      {rule.name}
                      <span className="block text-xs text-saubio-slate/50">{rule.description ?? rule.key}</span>
                    </td>
                    <td className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-saubio-slate/50">{rule.event}</td>
                    <td className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-saubio-slate/50">{rule.audience}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{rule.channels.join(', ') || '—'}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.isActive ? 'bg-emerald-50 text-emerald-900' : 'bg-saubio-slate/10 text-saubio-slate/70'}`}
                      >
                        {rule.isActive ? 'Actif' : 'Inactif'}
                      </span>
                      <span className="mt-1 block text-[11px] text-saubio-slate/50">
                        MAJ {formatDateTime(rule.updatedAt)}
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
