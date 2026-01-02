'use client';

import { useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import type { AdminNotificationAutomationRule } from '@saubio/models';
import { useAdminNotificationRules } from '@saubio/utils';

const CHANNEL_LABELS: Record<string, string> = {
  in_app: 'In-app',
  email: 'Email',
  push: 'Push',
};

const AUDIENCE_LABELS: Record<string, string> = {
  client: 'Clients',
  provider: 'Prestataires',
  admin: 'Ops / Admin',
};

const describeDelay = (delaySeconds?: number | null) => {
  if (!delaySeconds) {
    return { mode: 'Instantané', window: 'Dès l’événement', badge: 'Temps réel' };
  }
  if (delaySeconds < 3600) {
    return {
      mode: 'Retardé',
      window: `+${Math.round(delaySeconds / 60)} min`,
      badge: 'Retardé',
    };
  }
  if (delaySeconds < 86400) {
    return {
      mode: 'Planifié (heure)',
      window: `+${(delaySeconds / 3600).toFixed(1)} h`,
      badge: 'Planification',
    };
  }
  return {
    mode: 'Batch',
    window: `${Math.round(delaySeconds / 86400)} j`,
    badge: 'Batch',
  };
};

const describeRule = (rule: AdminNotificationAutomationRule) => {
  const delay = describeDelay(rule.delaySeconds ?? undefined);
  const channels = rule.channels.map((channel) => CHANNEL_LABELS[channel] ?? channel).join(' · ');
  const target = AUDIENCE_LABELS[rule.audience] ?? rule.audience;
  const templateName = rule.template?.name ?? '—';

  return {
    id: rule.id,
    name: rule.name,
    description: rule.description ?? '—',
    delay,
    channels,
    target,
    templateName,
  };
};

export default function AdminAutomationSchedulingPage() {
  const rulesQuery = useAdminNotificationRules();
  const schedules = useMemo(() => (rulesQuery.data ?? []).map((rule) => describeRule(rule)), [rulesQuery.data]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Modes de diffusion & planification</h1>
        <p className="text-sm text-saubio-slate/70">
          Vue dérivée directement des règles d’automatisation (canaux, délais, audiences).
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Workflows programmés</p>
          <span className="text-xs text-saubio-slate/60">
            {rulesQuery.isFetching ? 'Actualisation…' : `${schedules.length} règle(s)`}
          </span>
        </div>
        {rulesQuery.isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-saubio-slate/60">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement des workflows…
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-saubio-forest/20 bg-saubio-mist/40 p-6 text-center text-sm text-saubio-slate/60">
            Aucune règle programmée n&apos;a encore été définie.
          </div>
        ) : (
          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <SurfaceCard key={schedule.id} className="rounded-3xl border border-saubio-forest/10 bg-white p-4 shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-saubio-forest">{schedule.name}</p>
                    <p className="text-xs text-saubio-slate/60">{schedule.description}</p>
                  </div>
                  <span className="rounded-full bg-saubio-forest/10 px-3 py-1 text-xs font-semibold text-saubio-forest">
                    {schedule.delay.badge}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-saubio-slate/80 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Canaux</p>
                    <p>{schedule.channels || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Fenêtre</p>
                    <p>
                      {schedule.delay.mode} — {schedule.delay.window}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Audience</p>
                    <p>{schedule.target}</p>
                    <p className="text-xs text-saubio-slate/60">Template : {schedule.templateName}</p>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
