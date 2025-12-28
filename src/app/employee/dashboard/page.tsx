'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useRequireRole,
  useAdminDashboard,
  formatDateTime,
  useAssignFallbackTeamMutation,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, Skeleton, SurfaceCard } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useMatchingProgressFeed } from '../../../hooks/useMatchingProgressFeed';
import { useRealtimeOpsFeed } from '../../../hooks/useRealtimeOpsFeed';
import {
  getMatchingStageLabel,
  resolveMatchingStatusCopy,
} from '../../../utils/matching-progress';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#1c332a', '#f5a524', '#235c43', '#d9c97c'];

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['employee'] });
  const dashboardQuery = useAdminDashboard();
  const { data, isLoading, isError } = dashboardQuery;
  const [activeOpsTab, setActiveOpsTab] = useState<'matching' | 'missions'>('matching');
  const { events: matchingFeed } = useMatchingProgressFeed({
    enabled: Boolean(session.user),
    limit: 8,
  });
  const { events: missionFeed } = useRealtimeOpsFeed({
    enabled: Boolean(session.user),
    types: ['mission_status'],
    limit: 8,
  });
  const assignFallbackMutation = useAssignFallbackTeamMutation();

  if (!session.user) {
    return null;
  }

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    []
  );

  const numberFormatter = useMemo(() => new Intl.NumberFormat(), []);

  const metricCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        id: 'active-providers',
        label: t('adminDashboard.metrics.activeProviders'),
        value: numberFormatter.format(data.metrics.activeProviders),
        helper: t('adminDashboard.metricTrend.increase', 'En hausse vs semaine dernière'),
      },
      {
        id: 'pending-bookings',
        label: t('adminDashboard.metrics.pendingBookings'),
        value: numberFormatter.format(data.metrics.pendingBookings),
        helper: t('adminDashboard.metricTrend.pipeline', 'Pipeline confirmé'),
      },
      {
        id: 'satisfaction',
        label: t('adminDashboard.metrics.nps'),
        value: `${data.metrics.satisfaction}%`,
        helper: t('adminDashboard.metricTrend.csat', 'Satisfaction clients'),
      },
      {
        id: 'revenue',
        label: t('adminDashboard.metrics.revenue'),
        value: currencyFormatter.format(data.metrics.revenue),
        helper: t('adminDashboard.metricTrend.revenue', 'Revenus nets'),
      },
    ];
  }, [data, t, numberFormatter, currencyFormatter]);

  const performanceChartData = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: t('adminDashboard.performance.matching', 'Matching'),
        value: data.performance.matching,
      },
      {
        label: t('adminDashboard.performance.onTime', 'À l’heure'),
        value: data.performance.onTime,
      },
      {
        label: t('adminDashboard.performance.supportSla', 'SLA Support'),
        value: data.performance.supportSlaHours,
      },
    ];
  }, [data, t]);

  const providerPieData = useMemo(() => {
    if (!data) return [];
    return (data.topProviders ?? []).map((provider) => ({
      name: provider.name || t('adminDashboard.providersUnknown', 'Prestataire'),
      value: provider.missions || 0,
      rating: provider.rating,
    }));
  }, [data, t]);

  const alerts = data?.alerts ?? [];
  const escalations = data?.escalations ?? [];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('adminDashboard.title', 'Tableau de bord administrateur')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'adminDashboard.subtitle',
            'Surveillez les KPIs clés, les missions en attente et les alertes critiques de la plateforme.'
          )}
        </SectionDescription>
      </header>

      {isError ? (
        <ErrorState
          title={t('adminDashboard.errorTitle', t('system.error.generic'))}
          description={t('adminDashboard.section.placeholderDescription')}
          onRetry={() => {
            void dashboardQuery.refetch();
          }}
        />
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`metric-skeleton-${index}`} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <SurfaceCard
              key={metric.id}
              variant="soft"
              padding="lg"
              className="flex flex-col gap-2 border border-white/70 bg-gradient-to-br from-white/95 to-saubio-mist/40 shadow-soft-lg"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">{metric.label}</span>
              <span className="text-2xl font-semibold text-saubio-forest">{metric.value}</span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-saubio-slate/60">
                {metric.helper}
              </span>
            </SurfaceCard>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <SurfaceCard variant="soft" padding="lg" className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
                {t('adminDashboard.performance.title')}
              </p>
              <p className="text-2xl font-semibold text-saubio-forest">
                {t('adminDashboard.performance.window', 'Semaine glissante')}
              </p>
            </div>
            <div className="rounded-full border border-saubio-forest/15 px-4 py-1 text-xs font-semibold text-saubio-forest/70">
              {t('adminDashboard.period.week', '7 jours')}
            </div>
          </div>
          <div className="mt-6 h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-3xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceChartData} barCategoryGap="25%">
                  <XAxis dataKey="label" tick={{ fill: '#69796d', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(30, 55, 44, 0.08)' }}
                    contentStyle={{
                      borderRadius: 16,
                      border: 'none',
                      boxShadow: '0 25px 60px rgba(17, 29, 22, 0.12)',
                    }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 4, 4]} fill="#1c332a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard variant="soft" padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
                {t('adminDashboard.topProviders', 'Top prestataires')}
              </p>
              <p className="text-2xl font-semibold text-saubio-forest">
                {t('adminDashboard.providersMissionCount', {
                  count: providerPieData.reduce((acc, item) => acc + item.value, 0),
                })}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-saubio-slate/60">
              {t('adminDashboard.period.week', '7 jours')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-40 flex-1">
              {providerPieData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-saubio-slate/50">
                  {t('adminDashboard.providersEmpty')}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={providerPieData}
                      dataKey="value"
                      innerRadius="60%"
                      outerRadius="90%"
                      paddingAngle={4}
                    >
                      {providerPieData.map((_, index) => (
                        <Cell key={`provider-pie-${_.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <ul className="flex-1 space-y-2 text-sm text-saubio-slate/80">
              {providerPieData.slice(0, 4).map((item, index) => (
                <li key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    {item.name}
                  </span>
                  <span className="font-semibold text-saubio-forest">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SurfaceCard variant="soft" padding="lg" className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
              {t('adminDashboard.alertSection', 'Alertes & actions prioritaires')}
            </p>
            <span className="text-[11px] font-semibold text-saubio-slate/60">
              {t('adminDashboard.alertsCount', {
                count: alerts.length,
                defaultValue: `${alerts.length} alertes`,
              })}
            </span>
          </div>
          {alerts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/70 p-6 text-center text-sm text-saubio-slate/60">
              {t('adminDashboard.alertsEmpty')}
            </p>
          ) : (
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 shadow-soft-sm"
                >
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
                      {t(`adminDashboard.alerts.${alert.id}`, alert.label)}
                    </span>
                    <p className="text-sm text-saubio-slate/80">{alert.description}</p>
                  </div>
                  <span className="text-2xl">{alert.icon ?? '⚠️'}</span>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard variant="soft" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
              {t('adminDashboard.escalations', 'Tickets à fort impact')}
            </p>
            <span className="text-[11px] font-semibold text-saubio-slate/60">
              {t('adminDashboard.ticketsCount', {
                count: escalations.length,
                defaultValue: `${escalations.length} tickets`,
              })}
            </span>
          </div>
          {escalations.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/70 p-6 text-center text-sm text-saubio-slate/60">
              {t('adminDashboard.ticketsEmpty')}
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-saubio-slate/80" aria-live="polite">
              {escalations.map((ticket) => (
                <li key={ticket.id} className="rounded-3xl bg-white p-4 shadow-soft-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-saubio-forest">{ticket.subject}</p>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-saubio-slate/50">
                      {t(`adminDashboard.priorityLabels.${ticket.priority}`, {
                        defaultValue: ticket.priority,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-saubio-slate/60">
                    {ticket.helper
                      ? `${ticket.helper} • ${t(`adminDashboard.statusLabels.${ticket.status}`, ticket.status)}`
                      : t(`adminDashboard.statusLabels.${ticket.status}`, ticket.status)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard variant="soft" padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
              {t('adminDashboard.opsCentersTitle', 'Centres Ops')}
            </p>
            <p className="text-[11px] font-semibold text-saubio-slate/60">
              {t('adminDashboard.opsCentersSubtitle', 'Matching & missions en direct')}
            </p>
          </div>
          <div className="flex gap-2 rounded-3xl border border-saubio-forest/10 bg-white/80 p-1 text-xs font-semibold">
            {(['matching', 'missions'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveOpsTab(tab)}
                className={`rounded-2xl px-3 py-1 transition ${
                  activeOpsTab === tab ? 'bg-saubio-forest text-white' : 'text-saubio-slate/70'
                }`}
              >
                {tab === 'matching'
                  ? t('adminDashboard.opsTabMatching', 'Matching auto')
                  : t('adminDashboard.opsTabMissions', 'Suivi missions')}
              </button>
            ))}
          </div>
        </div>
        {activeOpsTab === 'matching' ? (
          matchingFeed.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-saubio-forest/20 bg-white/70 p-6 text-center text-sm text-saubio-slate/60">
              {t('adminDashboard.matchingRealtimeEmpty', 'Aucune remontée en direct pour le moment.')}
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-saubio-slate/80">
              {matchingFeed.map((event) => {
                const statusMeta = resolveMatchingStatusCopy(event.status, t);
                const classes: Record<'positive' | 'warning' | 'neutral' | 'danger', string> = {
                  positive: 'bg-saubio-forest/10 text-saubio-forest',
                  warning: 'bg-saubio-sun/20 text-saubio-moss',
                  neutral: 'bg-saubio-mist/60 text-saubio-slate/70',
                  danger: 'bg-red-50 text-red-600',
                };
                const badgeClass = classes[statusMeta.variant];
                const canAssignFallback =
                  event.stage === 'team' && Boolean(event.teamCandidateId && event.bookingId);
                const isAssigning =
                  canAssignFallback &&
                  assignFallbackMutation.isPending &&
                  assignFallbackMutation.variables === event.bookingId;
                return (
                  <li key={`${event.stage}-${event.createdAt}-${event.bookingId}`} className="rounded-3xl bg-white/90 p-4 shadow-soft-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-saubio-forest">
                          {getMatchingStageLabel(event.stage, t)}
                        </p>
                        <p className="text-xs text-saubio-slate/60">
                          {event.bookingId ? `#${event.bookingId.slice(0, 8)}` : t('adminDashboard.matchingRealtimeGlobal', 'Multi-booking')}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-saubio-slate/60">
                      <span>{formatDateTime(event.createdAt)}</span>
                      {typeof event.count === 'number' ? (
                        <span>
                          {t('adminDashboard.matchingRealtimeCountLabel', '{{count}} prestataire(s)', {
                            count: event.count,
                          })}
                        </span>
                      ) : null}
                    </div>
                    {event.message ? (
                      <p className="mt-1 text-xs text-saubio-slate/70">{event.message}</p>
                    ) : null}
                    {canAssignFallback ? (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="text-saubio-slate/60">
                          {t('adminDashboard.matchingRealtimeTeamCandidate', 'Équipe suggérée : #{{id}}', {
                            id: event.teamCandidateId?.slice(0, 8) ?? '',
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => event.bookingId && assignFallbackMutation.mutate(event.bookingId)}
                          disabled={isAssigning}
                          className="rounded-full border border-saubio-forest/30 px-3 py-1 font-semibold uppercase tracking-wide text-saubio-forest transition hover:border-saubio-forest disabled:cursor-not-allowed disabled:border-saubio-slate/20 disabled:text-saubio-slate/50"
                        >
                          {isAssigning
                            ? t('adminDashboard.matchingRealtimeAssigning', 'Assignation…')
                            : t('adminDashboard.matchingRealtimeAssign', 'Assigner l’équipe')}
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )
        ) : missionFeed.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-saubio-forest/20 bg-white/70 p-6 text-center text-sm text-saubio-slate/60">
            {t('adminDashboard.missionFeedEmpty', 'Aucune mission en cours de suivi.')}
          </p>
        ) : (
          <ul className="space-y-3 text-sm text-saubio-slate/80" aria-live="polite">
            {missionFeed.map((event) => {
              const missionStatus =
                typeof event.payload?.status === 'string' ? (event.payload.status as string) : 'pending';
              const statusMeta = resolveMatchingStatusCopy(missionStatus, t);
              const classes: Record<'positive' | 'warning' | 'neutral' | 'danger', string> = {
                positive: 'bg-saubio-forest/10 text-saubio-forest',
                warning: 'bg-saubio-sun/20 text-saubio-moss',
                neutral: 'bg-saubio-mist/60 text-saubio-slate/70',
                danger: 'bg-red-50 text-red-600',
              };
              const badgeClass = classes[statusMeta.variant];
              const bookingRef =
                typeof event.payload?.bookingId === 'string'
                  ? `#${(event.payload.bookingId as string).slice(0, 8)}`
                  : t('adminDashboard.missionNoBooking', 'Booking inconnu');
              return (
                <li key={event.id} className="rounded-3xl bg-white/90 p-4 shadow-soft-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-saubio-forest">
                        {typeof event.payload?.service === 'string'
                          ? (event.payload.service as string)
                          : t('adminDashboard.missionUnknownService', 'Mission')}
                      </p>
                      <p className="text-xs text-saubio-slate/60">{bookingRef}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-saubio-slate/60">
                    <span>{formatDateTime(event.createdAt)}</span>
                    {event.payload?.city ? <span>• {event.payload.city as string}</span> : null}
                    {event.payload?.team ? <span>• {event.payload.team as string}</span> : null}
                  </div>
                  {event.payload?.note ? (
                    <p className="mt-1 text-xs text-saubio-slate/70">{event.payload.note as string}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
