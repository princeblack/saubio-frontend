'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { NotificationChannel, NotificationType } from '@saubio/models';
import {
  formatDateTime,
  useMarkManyNotificationsMutation,
  useMarkNotificationReadMutation,
  useNotificationPreferences,
  useNotifications,
  useNotificationStream,
  useRequireRole,
  useUpdateNotificationPreferencesMutation,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton, Pill } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

const channelOptions: NotificationChannel[] = ['in_app', 'email', 'push'];
const typeOptions: NotificationType[] = [
  'booking_status',
  'booking_assignment',
  'booking_cancellation',
  'billing',
  'support_update',
  'matching_progress',
];

const formatEnum = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function ClientNotificationsPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['client', 'company'] });

  const [filters, setFilters] = useState({
    type: '' as NotificationType | '',
    unread: '' as '' | 'true',
  });

  const notificationsQuery = useNotifications({
    limit: 20,
    type: filters.type || undefined,
    unread: filters.unread === '' ? undefined : filters.unread === 'true',
  });
  useNotificationStream({ enabled: Boolean(session.user) });
  const preferencesQuery = useNotificationPreferences();
  const updatePreferencesMutation = useUpdateNotificationPreferencesMutation();
  const markReadMutation = useMarkNotificationReadMutation();
  const markManyMutation = useMarkManyNotificationsMutation();

  const notifications = notificationsQuery.data ?? [];

  const unreadIds = useMemo(() => {
    return notifications.filter((item) => !item.readAt).map((item) => item.id);
  }, [notifications]);

  if (!session.user) {
    return null;
  }

  const handleUpdatePreferences = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updatePreferencesMutation.mutate({
      payload: {
        channels: channelOptions.filter((channel) => form.get(channel) === 'on'),
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('notifications.title')}
          </SectionTitle>
          <SectionDescription>{t('notifications.subtitle')}</SectionDescription>
        </div>
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => markManyMutation.mutate({ ids: unreadIds })}
            disabled={!unreadIds.length || markManyMutation.isPending}
            className="rounded-full border border-saubio-forest/20 px-4 py-2 font-semibold text-saubio-forest transition hover:border-saubio-forest/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {markManyMutation.isPending ? t('notifications.marking') : t('notifications.markAll')}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <SurfaceCard variant="soft" padding="md" className="min-h-[320px]">
          <header className="flex flex-wrap items-center gap-3 text-sm">
            <select
              value={filters.type}
              onChange={(event) =>
                setFilters((state) => ({ ...state, type: event.target.value as NotificationType | '' }))
              }
              className="rounded-full border border-saubio-forest/15 bg-saubio-mist/30 px-4 py-2 text-saubio-forest outline-none transition focus:border-saubio-forest"
            >
              <option value="">{t('notifications.filters.allTypes')}</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`notifications.types.${option}`, formatEnum(option))}
                </option>
              ))}
            </select>
            <select
              value={filters.unread}
              onChange={(event) =>
                setFilters((state) => ({ ...state, unread: event.target.value as '' | 'true' }))
              }
              className="rounded-full border border-saubio-forest/15 bg-saubio-mist/30 px-4 py-2 text-saubio-forest outline-none transition focus:border-saubio-forest"
            >
              <option value="">{t('notifications.filters.all')}</option>
              <option value="true">{t('notifications.filters.unread')}</option>
            </select>
          </header>

          <div className="mt-4 space-y-3">
            {notificationsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`notification-skeleton-${index}`} className="h-20 rounded-3xl" />
                ))}
              </div>
            ) : notificationsQuery.isError ? (
              <ErrorState
                title={t('notifications.errorTitle', t('bookingDashboard.errorTitle'))}
                description={t('notifications.errorDescription', t('bookingDashboard.errorDescription'))}
                onRetry={() => {
                  void notificationsQuery.refetch();
                }}
              />
            ) : notifications.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-saubio-mist/30 p-6 text-center text-sm text-saubio-slate/60">
                {t('notifications.empty')}
              </p>
            ) : (
              notifications.map((notification) => {
                const isUnread = !notification.readAt;
                return (
                  <article
                    key={notification.id}
                    className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
                      isUnread
                        ? 'border-saubio-forest/40 bg-saubio-mist/30'
                        : 'border-saubio-forest/15 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-saubio-forest">
                        {t(`notifications.types.${notification.type}`, formatEnum(notification.type))}
                      </span>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-saubio-slate/50">
                        <span>{formatDateTime(notification.createdAt)}</span>
                        <Pill tone={isUnread ? 'sun' : 'mist'}>
                          {isUnread
                            ? t('notifications.status.unread')
                            : t('notifications.status.read')}
                        </Pill>
                      </div>
                    </div>
                    <p className="text-saubio-slate/70">
                      {(notification as { title?: string }).title ??
                        (notification as { preview?: string }).preview ??
                        '—'}
                    </p>
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={() => markReadMutation.mutate({ id: notification.id })}
                        className="self-end text-xs font-semibold text-saubio-forest underline"
                      >
                        {t('notifications.markRead')}
                      </button>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard variant="soft" padding="md" className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('notifications.preferences.title')}
            </h2>
            {preferencesQuery.isLoading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={`preferences-skeleton-${index}`} className="h-10 rounded-2xl" />
                ))}
              </div>
            ) : preferencesQuery.isError ? (
              <div className="mt-4">
                <ErrorState
                  title={t('notifications.errorTitle', t('bookingDashboard.errorTitle'))}
                  description={t('notifications.errorDescription', t('bookingDashboard.errorDescription'))}
                  onRetry={() => {
                    void preferencesQuery.refetch();
                  }}
                />
              </div>
            ) : (
              <form className="mt-4 space-y-3" onSubmit={handleUpdatePreferences}>
                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                    {t('notifications.preferences.channels')}
                  </legend>
                  {channelOptions.map((channel) => (
                    <label key={channel} className="flex items-center gap-2 text-sm text-saubio-slate/80">
                      <input
                        type="checkbox"
                        name={channel}
                        defaultChecked={preferencesQuery.data?.channels?.includes(channel)}
                        className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
                      />
                      {t(`notifications.channels.${channel}`, formatEnum(channel))}
                    </label>
                  ))}
                </fieldset>
                <button
                  type="submit"
                  className="w-full rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={updatePreferencesMutation.isPending}
                >
                  {updatePreferencesMutation.isPending
                    ? t('notifications.preferences.saving')
                    : t('notifications.preferences.save')}
                </button>
              </form>
            )}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
