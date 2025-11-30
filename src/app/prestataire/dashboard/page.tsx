'use client';

import { useTranslation } from 'react-i18next';
import {
  useProviderDashboard,
  useProviderInvitations,
  useRespondProviderInvitationMutation,
  useRequireRole,
  formatDateTime,
  formatEuro,
} from '@saubio/utils';
import {
  SectionTitle,
  SectionDescription,
  SimpleGrid,
  SurfaceCard,
  Skeleton,
  Pill,
} from '@saubio/ui';
import { MetricCard } from '../../../components/dashboard/MetricCard';
import { ActivityList, type ActivityItem } from '../../../components/dashboard/ActivityList';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useMatchingProgressFeed } from '../../../hooks/useMatchingProgressFeed';
import {
  getMatchingStageLabel,
  resolveMatchingStatusCopy,
} from '../../../utils/matching-progress';

const formatCurrencyFromCents = (value: number) => formatEuro(value / 100);

export default function ProviderDashboardPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const { events: matchingFeed } = useMatchingProgressFeed({
    enabled: Boolean(session.user),
    limit: 6,
  });

  const dashboardQuery = useProviderDashboard();
  const invitationsQuery = useProviderInvitations();
  const respondInvitationMutation = useRespondProviderInvitationMutation();

  if (!session.user) {
    return null;
  }

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-8">
        <header className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('providerDashboard.title')}
          </SectionTitle>
          <SectionDescription>{t('providerDashboard.subtitle')}</SectionDescription>
        </header>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
          {Array.from({ length: 4 }).map((_, index) => (
            <SurfaceCard key={`metric-skeleton-${index}`} variant="soft" padding="md">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="mt-4 h-10 w-32 rounded-2xl" />
            </SurfaceCard>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="md">
          <SurfaceCard variant="soft" padding="md">
            <Skeleton className="h-4 w-48 rounded-full" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`upcoming-skeleton-${index}`} className="h-16 rounded-3xl" />
              ))}
            </div>
          </SurfaceCard>
          <SurfaceCard variant="soft" padding="md">
            <Skeleton className="h-4 w-40 rounded-full" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`quality-skeleton-${index}`} className="h-12 rounded-2xl" />
              ))}
            </div>
          </SurfaceCard>
        </SimpleGrid>
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="space-y-6">
        <ErrorState
          title={t('providerDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
          description={t('providerDashboard.errorDescription', t('bookingDashboard.errorDescription'))}
          onRetry={() => {
            void dashboardQuery.refetch();
          }}
        />
      </div>
    );
  }

  const data = dashboardQuery.data;
  const invitations = invitationsQuery.data ?? [];

  const handleInvitationAction = (invitationId: string, action: 'accept' | 'decline') => {
    respondInvitationMutation.mutate({ id: invitationId, action });
  };

  const metrics = data
    ? [
        {
          label: t('providerDashboard.metrics.completed'),
          value: String(data.metrics.completed),
          icon: '✓',
          tone: 'forest' as const,
          trend: { value: data.trends.completed, label: t('providerDashboard.trend30d') },
        },
        {
          label: t('providerDashboard.metrics.revenue'),
          value: formatCurrencyFromCents(data.metrics.revenueCents),
          icon: '€',
          tone: 'sun' as const,
          trend: { value: data.trends.revenue, label: t('providerDashboard.trend30d') },
        },
        {
          label: t('providerDashboard.metrics.rating'),
          value: `${data.metrics.rating.toFixed(2)} / 5`,
          icon: '★',
          tone: 'mist' as const,
          trend: { value: data.trends.rating, label: t('providerDashboard.trendClients') },
        },
        {
          label: t('providerDashboard.metrics.eco'),
          value: `${data.metrics.ecoRate}%`,
          icon: '🌿',
          tone: 'forest' as const,
          trend: { value: data.trends.ecoRate, label: t('providerDashboard.trendBio') },
        },
      ]
    : [];

  const upcomingItems: ActivityItem[] = data.upcoming.map((mission) => ({
    id: mission.id,
    title: mission.city,
    description: `${mission.service.toUpperCase()} · ${mission.surfaces} m²`,
    meta: formatDateTime(mission.startAt),
    icon: '🗓',
    tone: mission.ecoPreference === 'bio' ? 'positive' : 'accent',
  }));

  const alertsItems: ActivityItem[] = data.alerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    description: alert.message,
    meta: formatDateTime(alert.createdAt),
    icon: alert.severity === 'critical' ? '⚠️' : '⚡️',
    tone: alert.severity === 'critical' ? 'accent' : 'neutral',
  }));

  const feedbackItems: ActivityItem[] = data.feedback.map((item) => ({
    id: item.id,
    title: `${item.client} · ${item.rating.toFixed(1)}★`,
    description: item.message,
    meta: formatDateTime(item.createdAt),
    icon: item.sentiment === 'positive' ? '💚' : item.sentiment === 'negative' ? '⚠️' : '💬',
    tone: item.sentiment === 'positive' ? 'positive' : 'neutral',
  }));

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerDashboard.title')}
        </SectionTitle>
        <SectionDescription>{t('providerDashboard.subtitle')}</SectionDescription>
      </header>

      {invitationsQuery.isLoading ? (
        <SurfaceCard variant="soft" padding="md">
          <Skeleton className="h-4 w-48 rounded-full" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={`invitation-skeleton-${index}`} className="h-20 rounded-3xl" />
            ))}
          </div>
        </SurfaceCard>
      ) : invitations.length ? (
        <SurfaceCard variant="soft" padding="md" className="space-y-4 border border-amber-200 bg-amber-50/30">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-saubio-sun/70">
              {t('providerDashboard.invitations.title', 'Demandes urgentes')}
            </span>
            <p className="text-sm text-saubio-slate/70">
              {t(
                'providerDashboard.invitations.subtitle',
                'Répondez rapidement pour confirmer les missions à court préavis.'
              )}
            </p>
          </div>
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-3 rounded-3xl border border-saubio-forest/10 bg-white/70 p-4 shadow-soft-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-saubio-forest">
                      {t(`services.${invitation.service}`, invitation.service)}
                    </p>
                    <p className="text-xs text-saubio-slate/60">
                      {invitation.city} · {invitation.surfacesSquareMeters} m²
                    </p>
                  </div>
                  <div className="text-right text-xs text-saubio-slate/60">
                    <p className="font-semibold text-saubio-forest">
                      {formatDateTime(invitation.startAt)}
                    </p>
                    <p>
                      {t('providerDashboard.invitations.duration', '{{hours}} h', {
                        hours: invitation.durationHours.toFixed(1),
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
                  <Pill tone="forest">
                    {t('providerDashboard.invitations.required', '{{count}} intervenant(s)', {
                      count: invitation.requiredProviders,
                    })}
                  </Pill>
                  {invitation.shortNoticeDepositCents ? (
                    <Pill tone="sun">
                      {t('providerDashboard.invitations.deposit', 'Blocage {{amount}}', {
                        amount: formatEuro(invitation.shortNoticeDepositCents / 100),
                      })}
                    </Pill>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleInvitationAction(invitation.id, 'accept')}
                    disabled={respondInvitationMutation.isPending}
                    className="flex-1 rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:bg-saubio-forest/40"
                  >
                    {respondInvitationMutation.isPending
                      ? t('providerDashboard.invitations.accepting', 'Confirmation…')
                      : t('providerDashboard.invitations.accept', 'Accepter')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInvitationAction(invitation.id, 'decline')}
                    disabled={respondInvitationMutation.isPending}
                    className="flex-1 rounded-full border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-slate/70 transition hover:border-saubio-forest/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('providerDashboard.invitations.decline', 'Décliner')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      ) : null}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="md">
        <ActivityList
          title={t('providerDashboard.upcoming')}
          items={upcomingItems}
          emptyState={t('providerDashboard.emptyUpcoming')}
        />
        <SurfaceCard variant="soft" padding="md">
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('providerDashboard.qualityTitle')}
          </h3>
          <div className="mt-4 grid gap-4 text-sm text-saubio-slate/80">
            <div className="flex items-center justify-between">
              <span>{t('providerDashboard.quality.rating')}</span>
              <span className="font-semibold text-saubio-forest">{data.quality.rating.toFixed(2)} / 5</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('providerDashboard.quality.ecoRate')}</span>
              <span className="font-semibold text-saubio-forest">{data.quality.ecoRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('providerDashboard.quality.incidents')}</span>
              <span className="font-semibold text-saubio-forest">{data.quality.incidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('providerDashboard.quality.response')}</span>
              <span className="font-semibold text-saubio-forest">{data.quality.responseMinutes} min</span>
            </div>
          </div>
        </SurfaceCard>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="md">
        <SurfaceCard variant="soft" padding="md">
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('providerDashboard.scheduleTitle')}
          </h3>
          {data.schedule.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
              {t('providerDashboard.scheduleEmpty')}
            </div>
          ) : (
            <ul className="mt-4 space-y-4 text-sm text-saubio-slate/80">
              {data.schedule.map((day) => (
                <li key={day.date} className="space-y-2 rounded-2xl bg-white/80 p-4 shadow-soft-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-saubio-forest">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-saubio-slate/60">
                      {day.missions.length} × {t('providerMissions.title')}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {day.missions.map((mission) => (
                      <li key={mission.id} className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-saubio-forest">
                          {formatDateTime(mission.startAt)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Pill tone="mist">{mission.service}</Pill>
                          <Pill tone={mission.status === 'completed' ? 'forest' : 'sun'}>
                            {t(`bookingStatus.${mission.status}`, mission.status)}
                          </Pill>
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard variant="soft" padding="md">
          <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('providerDashboard.paymentsTitle')}
          </h3>
          <div className="mt-4 space-y-3 text-sm text-saubio-slate/80">
            <div className="flex items-center justify-between">
              <span>{t('providerDashboard.payments.total')}</span>
              <span className="font-semibold text-saubio-forest">
                {formatCurrencyFromCents(data.payments.totalCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('providerDashboard.payments.pending')}</span>
              <span className="font-semibold text-saubio-forest">
                {formatCurrencyFromCents(data.payments.pendingCents)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-saubio-slate/60">
              <span>{t('providerDashboard.payments.lastPayout')}</span>
              <span>
                {data.payments.lastPayoutAt
                  ? formatDateTime(data.payments.lastPayoutAt)
                  : t('providerRevenue.status.pending')}
              </span>
            </div>
          </div>
        </SurfaceCard>
      </SimpleGrid>

      <SurfaceCard variant="soft" padding="md" className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('providerDashboard.matchingRealtime', 'Matching en temps réel')}
        </h3>
        {matchingFeed.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-4 text-center text-xs text-saubio-slate/60">
            {t('providerDashboard.matchingRealtimeEmpty', 'Aucun mouvement récent sur vos missions.')}
          </p>
          ) : (
            <ul className="space-y-3 text-sm text-saubio-slate/80" aria-live="polite">
            {matchingFeed.map((event) => {
              const statusMeta = resolveMatchingStatusCopy(event.status, t);
              const bookingLabel = event.bookingId
                ? `#${event.bookingId.slice(0, 6)}`
                : t('providerDashboard.matchingRealtimeGlobal', 'Pipeline');
              const classes: Record<'positive' | 'warning' | 'neutral' | 'danger', string> = {
                positive: 'bg-saubio-forest/10 text-saubio-forest',
                warning: 'bg-saubio-sun/20 text-saubio-moss',
                neutral: 'bg-saubio-mist/60 text-saubio-slate/70',
                danger: 'bg-red-50 text-red-600',
              };
              const badgeClass = classes[statusMeta.variant];
              return (
                <li key={`${event.stage}-${event.createdAt}-${event.bookingId}`} className="rounded-3xl bg-white/85 p-4 shadow-soft-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-saubio-forest">
                        {getMatchingStageLabel(event.stage, t)}
                      </p>
                      <p className="text-xs text-saubio-slate/60">
                        {formatDateTime(event.createdAt)}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-saubio-slate/70">
                    <span>{bookingLabel}</span>
                    {typeof event.count === 'number' ? (
                      <>
                        <span>•</span>
                        <span>
                          {t('providerDashboard.matchingRealtimeCount', '{{count}} intervenant(s)', {
                            count: event.count,
                          })}
                        </span>
                      </>
                    ) : null}
                    {event.message ? (
                      <>
                        <span>•</span>
                        <span>{event.message}</span>
                      </>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SurfaceCard>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="md">
        <ActivityList
          title={t('providerDashboard.alertsTitle')}
          items={alertsItems}
          emptyState={t('providerDashboard.alertsEmpty')}
        />
        <ActivityList
          title={t('providerDashboard.feedbackTitle')}
          items={feedbackItems}
          emptyState={t('providerDashboard.feedbackEmpty')}
        />
      </SimpleGrid>

      <SurfaceCard variant="soft" padding="md">
        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('providerDashboard.knowledgeCenter')}
        </h3>
        {data.resources.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
            {t('providerDashboard.emptyResources')}
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 text-sm text-saubio-slate/80 lg:grid-cols-3">
            {data.resources.map((resource) => (
              <li key={resource.id} className="space-y-2 rounded-2xl bg-white/80 p-4 shadow-soft-sm">
                <p className="font-semibold text-saubio-forest">{resource.title}</p>
                <p className="text-xs text-saubio-slate/60">{resource.description}</p>
                <p className="text-[11px] uppercase tracking-widest text-saubio-slate/50">
                  {t('providerResourcesPage.updated', {
                    date: new Date(resource.updatedAt).toLocaleDateString(),
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
