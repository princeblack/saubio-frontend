'use client';

import { SurfaceCard, Skeleton, Badge } from '@saubio/ui';
import {
  useAdminNotificationTemplates,
  useUpdateAdminNotificationTemplate,
} from '@saubio/utils';
import type { AdminNotificationTemplate } from '@saubio/models';

const CHANNEL_LABELS: Record<'in_app' | 'email' | 'push', string> = {
  in_app: 'In-app',
  email: 'Email',
  push: 'Push',
};

const CHANNELS: Array<keyof typeof CHANNEL_LABELS> = ['in_app', 'email', 'push'];

const STATUS_BADGES: Record<AdminNotificationTemplate['status'], string> = {
  active: 'bg-emerald-100 text-emerald-900',
  disabled: 'bg-saubio-sun/40 text-saubio-forest',
  archived: 'bg-saubio-slate/20 text-saubio-slate',
};

const STATUS_LABELS: Record<AdminNotificationTemplate['status'], string> = {
  active: 'Actif',
  disabled: 'Désactivé',
  archived: 'Archivé',
};

export default function AdminAutomationTemplatesPage() {
  const templatesQuery = useAdminNotificationTemplates();
  const updateTemplate = useUpdateAdminNotificationTemplate();

  const handleStatusChange = (template: AdminNotificationTemplate, status: AdminNotificationTemplate['status']) => {
    if (status === template.status) return;
    updateTemplate.mutate({ key: template.key, payload: { status } });
  };

  const handleChannelToggle = (template: AdminNotificationTemplate, channel: keyof typeof CHANNEL_LABELS) => {
    if (!template.supportedChannels.includes(channel)) {
      return;
    }
    const current = new Set(template.activeChannels);
    if (current.has(channel)) {
      current.delete(channel);
    } else {
      current.add(channel);
    }
    updateTemplate.mutate({
      key: template.key,
      payload: { activeChannels: Array.from(current) as AdminNotificationTemplate['activeChannels'] },
    });
  };

  const isLoading = templatesQuery.isLoading;
  const templates = templatesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Notifications & automatisation</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Templates de notification</h1>
        <p className="text-sm text-saubio-slate/70">
          Gérez les canaux actifs pour chaque événement et vérifiez les langues disponibles.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Bibliothèque</p>
          <span className="text-xs text-saubio-slate/60">
            {templatesQuery.isFetching ? 'Actualisation…' : `${templates.length} template(s)`}
          </span>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <SurfaceCard key={index} className="rounded-3xl border border-saubio-forest/10 bg-white p-4 shadow-none">
                <Skeleton className="h-5 w-2/5 rounded-full bg-saubio-mist/80" />
                <Skeleton className="mt-2 h-10 w-full rounded-2xl bg-saubio-mist/70" />
              </SurfaceCard>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-saubio-forest/20 bg-saubio-mist/40 p-6 text-center text-sm text-saubio-slate/60">
            Aucun template configuré pour le moment.
          </div>
        ) : (
          <div className="grid gap-4">
            {templates.map((template) => {
              const isMutating = updateTemplate.isPending && updateTemplate.variables?.key === template.key;
              return (
                <SurfaceCard
                  key={template.id}
                  className="rounded-3xl border border-saubio-forest/10 bg-white p-4 shadow-none transition hover:border-saubio-forest/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-saubio-forest">{template.name}</p>
                      <p className="text-xs text-saubio-slate/60">{template.key}</p>
                    </div>
                    <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGES[template.status]}`}>
                      {STATUS_LABELS[template.status]}
                    </Badge>
                  </div>
                  {template.description ? (
                    <p className="mt-2 text-sm text-saubio-slate/70">{template.description}</p>
                  ) : null}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Canaux actifs</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {CHANNELS.map((channel) => {
                          const supported = template.supportedChannels.includes(channel);
                          const active = template.activeChannels.includes(channel);
                          return (
                            <button
                              key={channel}
                              type="button"
                              disabled={!supported || isMutating}
                              onClick={() => handleChannelToggle(template, channel)}
                              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                active
                                  ? 'border-saubio-forest bg-saubio-forest text-white'
                                  : 'border-saubio-forest/20 text-saubio-forest'
                              } ${supported ? '' : 'opacity-40'}`}
                            >
                              {CHANNEL_LABELS[channel]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Statut & langues</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-saubio-slate/80">
                        <select
                          value={template.status}
                          disabled={isMutating}
                          onChange={(event) =>
                            handleStatusChange(template, event.target.value as AdminNotificationTemplate['status'])
                          }
                          className="rounded-2xl border border-saubio-forest/20 bg-white px-3 py-1 font-semibold text-saubio-forest"
                        >
                          {Object.keys(STATUS_LABELS).map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status as AdminNotificationTemplate['status']]}
                            </option>
                          ))}
                        </select>
                        <div className="inline-flex flex-wrap gap-1 text-xs text-saubio-slate/60">
                          {template.locales.length ? (
                            template.locales.map((locale) => (
                              <span key={locale} className="rounded-full bg-saubio-slate/10 px-2 py-0.5 font-mono">
                                {locale}
                              </span>
                            ))
                          ) : (
                            <span>Aucune locale spécifique</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {template.metadata ? (
                    <div className="mt-4 rounded-2xl border border-saubio-forest/10 bg-saubio-mist/30 p-3 text-xs text-saubio-slate/70">
                      <p className="mb-1 text-[11px] uppercase tracking-[0.3em] text-saubio-slate/50">Métadonnées</p>
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(template.metadata, null, 2)}</pre>
                    </div>
                  ) : null}
                </SurfaceCard>
              );
            })}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
