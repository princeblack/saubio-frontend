'use client';

import type { ComponentType } from 'react';
import {
  useProviderDashboard,
  useProviderInvitations,
  useRespondProviderInvitationMutation,
  useRequireRole,
  formatDateTime,
  formatEuro,
} from '@saubio/utils';
import { useTranslation } from 'react-i18next';
import { SectionDescription, SectionTitle, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useMatchingProgressFeed } from '../../../hooks/useMatchingProgressFeed';
import { getMatchingStageLabel, resolveMatchingStatusCopy } from '../../../utils/matching-progress';
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Euro,
  Leaf,
  Inbox,
  Star,
  TrendingUp,
} from 'lucide-react';

const cardBase = 'rounded-3xl border border-saubio-forest/5 bg-white/90 p-6 backdrop-blur';

const iconBadge =
  'inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-forest/10 text-saubio-forest';

const formatCurrencyFromCents = (value: number) => formatEuro(value / 100);
type TranslateFn = ReturnType<typeof useTranslation>['t'];

export default function ProviderDashboardPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const { events: matchingFeed } = useMatchingProgressFeed({
    enabled: Boolean(session.user),
    limit: 6,
  });

  const dashboardQuery = useProviderDashboard();
  const invitationsQuery = useProviderInvitations({ status: 'pending' });
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`metric-skeleton-${index}`} className={cardBase}>
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="mt-4 h-8 w-32 rounded-2xl" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={cardBase}>
            <Skeleton className="h-5 w-40 rounded-full" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`list-skeleton-${index}`} className="h-16 rounded-3xl" />
              ))}
            </div>
          </div>
          <div className={cardBase}>
            <Skeleton className="h-5 w-36 rounded-full" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`quality-skeleton-${index}`} className="h-12 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
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
  const earningsSummary = data.earnings;
  const derivedCompleted =
    (earningsSummary?.missions.awaitingValidation ?? 0) +
    (earningsSummary?.missions.payable ?? 0) +
    (earningsSummary?.missions.paid ?? 0);
  const completedMissionsCount = earningsSummary ? derivedCompleted : data.metrics.completed;
  const statsCards = [
    {
      title: t('providerDashboard.metrics.completed'),
      value: completedMissionsCount.toString(),
      subtitle: t('providerDashboard.trend30d', 'Sur les 30 derniers jours'),
      icon: Briefcase,
      trend: data.trends.completed,
    },
    {
      title: t('providerDashboard.metrics.revenue'),
      value: formatCurrencyFromCents(earningsSummary?.thisMonthCents ?? data.metrics.revenueCents),
      subtitle: t('providerDashboard.metrics.revenueSubtitle', 'Revenus ce mois'),
      icon: Euro,
      trend: data.trends.revenue,
    },
    {
      title: t('providerDashboard.metrics.rating'),
      value: `${data.metrics.rating.toFixed(2)} / 5`,
      subtitle: t('providerDashboard.metrics.ratingHint', 'Moyenne des derniers avis'),
      icon: Star,
      trend: data.trends.rating,
    },
    {
      title: t('providerDashboard.metrics.eco'),
      value: `${data.metrics.ecoRate}%`,
      subtitle: t('providerDashboard.metrics.ecoSubtitle', 'Missions Öko Plus'),
      icon: Leaf,
      trend: data.trends.ecoRate,
    },
  ];

  const payoutSegments = [
    {
      label: t('providerDashboard.payments.validation', 'En validation'),
      value: earningsSummary?.awaitingValidationCents ?? 0,
      color: 'bg-amber-200',
    },
    {
      label: t('providerDashboard.payments.pending', 'À payer'),
      value: earningsSummary?.payableCents ?? data.payments.pendingCents,
      color: 'bg-saubio-sun/40',
    },
    {
      label: t('providerDashboard.payments.paid', 'Payé'),
      value: earningsSummary?.paidCents ?? Math.max(data.payments.totalCents - data.payments.pendingCents, 0),
      color: 'bg-emerald-200',
    },
  ];
  const totalPipeline = payoutSegments.reduce((sum, seg) => sum + seg.value, 0) || 1;

  const activityFeed = [
    ...data.alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      description: alert.message,
      createdAt: alert.createdAt,
      tone: alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'neutral',
      icon: alert.severity === 'critical' ? AlertTriangle : Bell,
    })),
    ...matchingFeed.map((event) => {
      const statusMeta = resolveMatchingStatusCopy(event.status, t);
      return {
        id: `${event.stage}-${event.createdAt}-${event.bookingId ?? 'global'}`,
        title: getMatchingStageLabel(event.stage, t),
        description: statusMeta.label,
        createdAt: event.createdAt,
        tone: statusMeta.variant,
        icon: TrendingUp,
      };
    }),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const feedback = data.feedback.slice(0, 3);
  const lastPayoutDisplay = earningsSummary?.lastPayoutAt ?? data.payments.lastPayoutAt;

  const handleInvitationAction = (invitationId: string, action: 'accept' | 'decline') => {
    respondInvitationMutation.mutate({ id: invitationId, action });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <SectionTitle as="h1" size="large">
              {t('providerDashboard.title')}
            </SectionTitle>
            <SectionDescription>{t('providerDashboard.subtitle')}</SectionDescription>
          </div>
          <div className="rounded-3xl border border-saubio-forest/10 bg-white/80 px-6 py-3 text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/40">
              {t('providerDashboard.payments.lastPayout')}
            </p>
            <p className="text-sm font-semibold text-saubio-forest">
              {lastPayoutDisplay ? formatDateTime(lastPayoutDisplay) : t('providerRevenue.empty.overview')}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className={cardBase}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                  {t('providerDashboard.paymentsTitle')}
                </p>
                <p className="mt-2 text-2xl font-semibold text-saubio-forest">
                  {formatCurrencyFromCents(earningsSummary?.totalEarnedCents ?? data.payments.totalCents)}
                </p>
                <p className="text-xs text-saubio-slate/60">
                  {t('providerDashboard.payments.totalSubtitle', 'Total gagné via Saubio')}
                </p>
              </div>
              <div className={iconBadge}>
                <Euro className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-saubio-mist/60">
                {payoutSegments.map((segment) => {
                  const percentage = Math.round((segment.value / totalPipeline) * 100);
                  return (
                    <span
                      key={segment.label}
                      className={`h-full transition-all ${segment.color}`}
                      style={{ width: `${percentage}%` }}
                      title={`${segment.label} — ${formatCurrencyFromCents(segment.value)}`}
                    />
                  );
                })}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {payoutSegments.map((segment) => (
                  <div key={segment.label} className="flex items-center justify-between rounded-2xl bg-saubio-mist/30 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-saubio-slate/70">
                      <span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} />
                      {segment.label}
                    </span>
                    <span className="text-saubio-forest">{formatCurrencyFromCents(segment.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <UpcomingMissionsCard missions={data.upcoming} t={t} />

          <ActivityCard events={activityFeed} />
        </div>

        <div className="space-y-6">
          <QualityCard quality={data.quality} />

          <InvitationsCard
            invitations={invitations}
            isLoading={invitationsQuery.isLoading}
            onAction={handleInvitationAction}
            isMutating={respondInvitationMutation.isPending}
          />

          <FeedbackCard feedback={feedback} />

          <ResourcesCard resources={data.resources} t={t} />
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  trend?: number;
};

function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  const trendValue = typeof trend === 'number' ? trend : null;
  const isPositive = (trendValue ?? 0) >= 0;
  return (
    <div className={cardBase}>
      <div className="flex items-center justify-between">
        <div className={iconBadge}>
          <Icon className="h-5 w-5" />
        </div>
        {trendValue !== null ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {isPositive ? '↑' : '↓'}
            {Math.abs(trendValue).toFixed(1)}%
          </span>
        ) : null}
      </div>
      <p className="mt-6 text-3xl font-semibold text-saubio-forest">{value}</p>
      <p className="mt-1 text-sm text-saubio-slate/60">{subtitle}</p>
    </div>
  );
}

function UpcomingMissionsCard({
  missions,
  t,
}: {
  missions: ProviderDashboardPageData['upcoming'];
  t: TranslateFn;
}) {
  if (!missions.length) {
    return (
      <section className={cardBase}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('providerDashboard.upcoming')}
            </p>
            <p className="mt-2 text-xl font-semibold text-saubio-forest">
              {t('providerDashboard.emptyUpcoming')}
            </p>
          </div>
          <div className={iconBadge}>
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cardBase}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('providerDashboard.upcoming')}
          </p>
          <p className="text-sm text-saubio-slate/60">{t('providerDashboard.nextSevenDays', 'Prochains 7 jours')}</p>
        </div>
        <div className={iconBadge}>
          <CalendarDays className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="flex flex-col gap-2 rounded-2xl border border-saubio-forest/10 bg-white/70 p-4 text-sm text-saubio-slate/80"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-saubio-forest">{mission.city ?? '—'}</p>
                <p className="text-xs text-saubio-slate/60">
                  {mission.service.toUpperCase()} ·{' '}
                  {mission.surfaces ? `${mission.surfaces} m²` : t('providerDashboard.sizeUnknown', 'Surface à préciser')}
                </p>
              </div>
              <div className="text-right text-xs text-saubio-slate/60">
                <p className="font-semibold text-saubio-forest">{formatDateTime(mission.startAt)}</p>
                <p>{t(`bookingStatus.${mission.status}`, mission.status)}</p>
              </div>
            </div>
            {mission.ecoPreference === 'bio' ? (
              <span className="inline-flex w-max items-center gap-1 rounded-full bg-saubio-forest/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-saubio-forest">
                <Leaf className="h-3 w-3" />
                Öko Plus
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityCard({
  events,
}: {
  events: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: string;
    tone: 'positive' | 'warning' | 'neutral' | 'danger';
    icon: ComponentType<{ className?: string }>;
  }>;
}) {
  const badgeClass: Record<'positive' | 'warning' | 'neutral' | 'danger', string> = {
    positive: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    neutral: 'bg-saubio-mist/60 text-saubio-slate/70',
    danger: 'bg-red-50 text-red-600',
  };

  return (
    <section className={cardBase}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            Activité & notifications
          </p>
          <p className="text-sm text-saubio-slate/60">Matching, alertes qualité, paiements</p>
        </div>
        <div className={iconBadge}>
          <Bell className="h-5 w-5" />
        </div>
      </div>
      {events.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-saubio-forest/15 bg-white/60 p-4 text-center text-xs text-saubio-slate/60">
          Aucune activité récente.
        </p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm text-saubio-slate/80">
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <li key={event.id} className="flex items-start gap-3 rounded-2xl border border-saubio-forest/10 bg-white/80 p-4">
                <span className={`${iconBadge} h-10 w-10`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-saubio-forest">{event.title}</p>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badgeClass[event.tone]}`}>
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-saubio-slate/60">{event.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function QualityCard({
  quality,
}: {
  quality: {
    rating: number;
    incidents: number;
    ecoRate: number;
    responseMinutes: number;
  };
}) {
  const items = [
    {
      label: 'Note moyenne',
      value: `${quality.rating.toFixed(2)} / 5`,
      icon: Star,
    },
    {
      label: 'Incidents 30j',
      value: quality.incidents.toString(),
      icon: AlertTriangle,
    },
    {
      label: 'Réponse moyenne',
      value: `${quality.responseMinutes} min`,
      icon: Clock3,
    },
    {
      label: 'Taux Öko',
      value: `${quality.ecoRate}%`,
      icon: Leaf,
    },
  ];
  return (
    <section className={cardBase}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          Qualité & fiabilité
        </p>
        <div className={iconBadge}>
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-saubio-forest/10 bg-saubio-mist/40 px-3 py-2 text-sm">
              <div className="flex items-center gap-3 text-saubio-slate/70">
                <span className="rounded-full bg-white/70 p-2 text-saubio-forest">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </div>
              <span className="font-semibold text-saubio-forest">{item.value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InvitationsCard({
  invitations,
  isLoading,
  onAction,
  isMutating,
}: {
  invitations: Array<{
    id: string;
    service: string;
    city?: string | null;
    startAt: string;
    durationHours: number;
    requiredProviders: number;
    shortNoticeDepositCents?: number | null;
    surfacesSquareMeters?: number | null;
  }>;
  isLoading: boolean;
  onAction: (id: string, action: 'accept' | 'decline') => void;
  isMutating: boolean;
}) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <section className={cardBase}>
        <Skeleton className="h-5 w-40 rounded-full" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={`invite-${index}`} className="h-24 rounded-3xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!invitations.length) {
    return null;
  }

  return (
    <section className={cardBase}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('providerDashboard.invitations.title', 'Offres Smart Match')}
        </p>
        <div className={iconBadge}>
          <Inbox className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-1 text-xs text-saubio-slate/60">
        {t('providerDashboard.invitations.subtitle', 'Répondez rapidement pour confirmer.')}
      </p>
      <div className="mt-4 space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="rounded-3xl border border-saubio-forest/10 bg-white/80 p-4 text-sm text-saubio-slate/80"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-saubio-forest">
                  {t(`services.${invitation.service}`, invitation.service)}
                </p>
                <p className="text-xs text-saubio-slate/60">
                  {invitation.city ?? '—'} · {invitation.surfacesSquareMeters ?? '—'} m²
                </p>
              </div>
              <div className="text-right text-xs text-saubio-slate/60">
                <p className="font-semibold text-saubio-forest">{formatDateTime(invitation.startAt)}</p>
                <p>{t('providerDashboard.invitations.duration', '{{hours}} h', { hours: invitation.durationHours.toFixed(1) })}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-saubio-slate/70">
              <span className="rounded-full bg-saubio-mist/60 px-3 py-1">
                {t('providerDashboard.invitations.required', '{{count}} intervenant(s)', {
                  count: invitation.requiredProviders,
                })}
              </span>
              {invitation.shortNoticeDepositCents ? (
                <span className="rounded-full bg-saubio-sun/20 px-3 py-1 text-saubio-forest">
                  {t('providerDashboard.invitations.deposit', 'Blocage {{amount}}', {
                    amount: formatEuro(invitation.shortNoticeDepositCents / 100),
                  })}
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onAction(invitation.id, 'accept')}
                disabled={isMutating}
                className="flex-1 rounded-full bg-saubio-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
              >
                {isMutating ? t('providerDashboard.invitations.accepting', 'Confirmation…') : t('providerDashboard.invitations.accept', 'Accepter')}
              </button>
              <button
                type="button"
                onClick={() => onAction(invitation.id, 'decline')}
                disabled={isMutating}
                className="flex-1 rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest/40 disabled:opacity-60"
              >
                {t('providerDashboard.invitations.decline', 'Refuser')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeedbackCard({
  feedback,
}: {
  feedback: ProviderDashboardPageData['feedback'];
}) {
  return (
    <section className={cardBase}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          Derniers avis clients
        </p>
        <div className={iconBadge}>
          <Star className="h-5 w-5" />
        </div>
      </div>
      {feedback.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-saubio-forest/15 bg-white/60 p-4 text-center text-xs text-saubio-slate/60">
          Aucun avis récent.
        </p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm text-saubio-slate/80">
          {feedback.map((item) => (
            <li key={item.id} className="rounded-2xl border border-saubio-forest/10 bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-saubio-forest">{item.client}</p>
                <span className="text-xs font-semibold text-saubio-forest">{item.rating.toFixed(1)} ★</span>
              </div>
              <p className="text-xs text-saubio-slate/60">{formatDateTime(item.createdAt)}</p>
              <p className="mt-2 text-sm">{item.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ResourcesCard({
  resources,
  t,
}: {
  resources: ProviderDashboardPageData['resources'];
  t: TranslateFn;
}) {
  return (
    <section className={cardBase}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('providerDashboard.knowledgeCenter', 'Centre de ressources')}
        </p>
        <div className={iconBadge}>
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      {resources.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-saubio-forest/15 bg-white/60 p-4 text-center text-xs text-saubio-slate/60">
          {t('providerDashboard.emptyResources', 'Rien à afficher pour le moment.')}
        </p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm text-saubio-slate/80">
          {resources.slice(0, 3).map((resource) => (
            <li key={resource.id} className="rounded-2xl bg-white/70 p-4">
              <p className="font-semibold text-saubio-forest">{resource.title}</p>
              <p className="text-xs text-saubio-slate/60">{resource.description}</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-saubio-slate/40">
                {t('providerResourcesPage.updated', {
                  date: new Date(resource.updatedAt).toLocaleDateString(),
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type ProviderDashboardPageData = NonNullable<ReturnType<typeof useProviderDashboard>['data']>;
