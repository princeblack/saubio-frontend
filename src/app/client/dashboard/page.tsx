'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  SectionDescription,
  SectionTitle,
  SurfaceCard,
  Skeleton,
  Pill,
} from '@saubio/ui';
import {
  bookingsQueryOptions,
  formatDateTime,
  useNotifications,
  useProfile,
  useAccessToken,
} from '@saubio/utils';
import type { BookingRequest } from '@saubio/models';
import { ErrorState } from '../../../components/feedback/ErrorState';

const isUpcoming = (booking: BookingRequest) =>
  new Date(booking.startAt).getTime() >= Date.now();

export default function ClientDashboardPage() {
  const { t } = useTranslation();
  const accessToken = useAccessToken();
  const bookingsQuery = useQuery({
    ...bookingsQueryOptions(),
    enabled: Boolean(accessToken),
  });
  const profileQuery = useProfile();
  const notificationsQuery = useNotifications({ limit: 4 });

  const upcomingMissions = useMemo(() => {
    const bookings = bookingsQuery.data ?? [];
    return bookings
      .filter(isUpcoming)
      .sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      )
      .slice(0, 3);
  }, [bookingsQuery.data]);

  const nextMission = upcomingMissions[0];
  const ecoEnabled = upcomingMissions.some((item) => item.ecoPreference === 'bio');

  const notifications = (notificationsQuery.data ?? []).slice(0, 4);

  const renderSummary = () => {
    if (bookingsQuery.isLoading || profileQuery.isLoading) {
      return (
        <SurfaceCard variant="soft" padding="md">
          <div className="space-y-3">
            <Skeleton className="h-4 w-36 rounded-full" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`summary-skeleton-${index}`} className="h-14 rounded-2xl" />
            ))}
          </div>
        </SurfaceCard>
      );
    }

    if (bookingsQuery.isError || profileQuery.isError) {
      return (
        <SurfaceCard variant="soft" padding="md">
          <ErrorState
            title={t('clientDashboard.summaryErrorTitle', t('bookingDashboard.errorTitle'))}
            description={t(
              'clientDashboard.summaryErrorDescription',
              t('bookingDashboard.errorDescription')
            )}
            onRetry={() => {
              void bookingsQuery.refetch();
              void profileQuery.refetch();
            }}
          />
        </SurfaceCard>
      );
    }

    return (
      <SurfaceCard variant="soft" padding="md">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('clientDashboard.summary')}
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-saubio-slate/80">
          <li className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 shadow-soft-sm">
            <span>{t('clientDashboard.summaryItems.upcoming')}</span>
            <span className="font-semibold text-saubio-forest">
              {nextMission ? formatDateTime(nextMission.startAt) : t('clientDashboard.noMission')}
            </span>
          </li>
          <li className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 shadow-soft-sm">
            <span>{t('clientDashboard.summaryItems.eco')}</span>
            <span className="font-semibold text-saubio-forest">
              {ecoEnabled ? t('common.enabled') : t('common.disabled')}
            </span>
          </li>
          <li className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 shadow-soft-sm">
            <span>{t('clientDashboard.summaryItems.favorite')}</span>
            <span className="font-semibold text-saubio-forest">
              {nextMission?.providerIds?.[0] ?? t('clientDashboard.noProvider')}
            </span>
          </li>
        </ul>
      </SurfaceCard>
    );
  };

  const renderUpcoming = () => {
    if (bookingsQuery.isLoading) {
      return (
        <SurfaceCard variant="soft" padding="md">
          <div className="space-y-3">
            <Skeleton className="h-4 w-40 rounded-full" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`upcoming-skeleton-${index}`} className="h-16 rounded-3xl" />
            ))}
          </div>
        </SurfaceCard>
      );
    }

    if (bookingsQuery.isError) {
      return (
        <SurfaceCard variant="soft" padding="md">
          <ErrorState
            title={t('clientDashboard.upcomingErrorTitle', t('bookingDashboard.errorTitle'))}
            description={t('clientDashboard.upcomingErrorDescription', t('bookingDashboard.errorDescription'))}
            onRetry={() => {
              void bookingsQuery.refetch();
            }}
          />
        </SurfaceCard>
      );
    }

    if (!upcomingMissions.length) {
      return (
        <SurfaceCard variant="soft" padding="md">
          <div className="space-y-3 text-sm text-saubio-slate/70">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('clientDashboard.upcomingTitle')}
            </h2>
            <p>{t('clientDashboard.noMission')}</p>
            <Link
              className="inline-flex rounded-full bg-saubio-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss"
              href="/bookings/new"
            >
              {t('clientDashboard.quick.newBooking')}
            </Link>
          </div>
        </SurfaceCard>
      );
    }

    return (
      <SurfaceCard variant="soft" padding="md">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('clientDashboard.upcomingTitle')}
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-saubio-slate/80">
          {upcomingMissions.map((mission) => (
            <li
              key={mission.id}
              className="rounded-3xl border border-saubio-forest/10 bg-white/80 px-4 py-3 shadow-soft-sm transition hover:border-saubio-forest/40 hover:bg-saubio-mist/40"
            >
              <Link href={`/client/bookings/${mission.id}`} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-saubio-slate/50">
                  <span>{mission.address.city}</span>
                  <span>{formatDateTime(mission.startAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-saubio-forest">
                    {mission.service} · {mission.surfacesSquareMeters} m²
                  </span>
                  <Pill tone="forest">
                    {t(`bookingStatus.${mission.status}`, mission.status)}
                  </Pill>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    );
  };

  const renderNotifications = () => {
    if (notificationsQuery.isLoading) {
      return (
        <SurfaceCard variant="soft" padding="md">
          <div className="space-y-3">
            <Skeleton className="h-4 w-48 rounded-full" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`notif-skeleton-${index}`} className="h-14 rounded-2xl" />
            ))}
          </div>
        </SurfaceCard>
      );
    }

    if (notificationsQuery.isError) {
      return (
        <SurfaceCard variant="soft" padding="md">
          <ErrorState
            title={t('notifications.errorTitle')}
            description={t('notifications.errorDescription')}
            onRetry={() => {
              void notificationsQuery.refetch();
            }}
          />
        </SurfaceCard>
      );
    }

    if (!notifications.length) {
      return (
        <SurfaceCard variant="soft" padding="md">
          <div className="space-y-3 text-sm text-saubio-slate/70">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('clientDashboard.notificationsTitle')}
            </h2>
            <p>{t('notifications.empty')}</p>
            <Link
              href="/client/notifications"
              className="inline-flex rounded-full border border-saubio-forest/30 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest/60"
            >
              {t('clientDashboard.viewNotifications')}
            </Link>
          </div>
        </SurfaceCard>
      );
    }

    return (
      <SurfaceCard variant="soft" padding="md">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('clientDashboard.notificationsTitle')}
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-saubio-slate/80">
          {notifications.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-saubio-forest/10 bg-white/80 px-4 py-3 shadow-soft-sm"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-saubio-slate/50">
                <span>{formatDateTime(item.createdAt)}</span>
                <span>{t(`notifications.types.${item.type}`, item.type)}</span>
              </div>
                <p className="mt-1 font-semibold text-saubio-forest">
                  {(item as { title?: string }).title ?? '—'}
                </p>
                <p className="text-xs text-saubio-slate/60">
                  {(item as { preview?: string }).preview ?? '—'}
                </p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end">
          <Link
            href="/client/notifications"
            className="text-xs font-semibold text-saubio-forest underline"
          >
            {t('clientDashboard.viewNotifications')}
          </Link>
        </div>
      </SurfaceCard>
    );
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('clientDashboard.title')}
        </SectionTitle>
        <SectionDescription>{t('clientDashboard.subtitle')}</SectionDescription>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1.2fr]">
        <div className="space-y-6">
          <SurfaceCard variant="soft" padding="md">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('clientDashboard.actions')}
            </h2>
            <div className="mt-4 grid gap-3 text-sm">
              <Link
                href="/bookings/new"
                className="rounded-2xl border border-saubio-forest/20 px-4 py-3 font-semibold text-saubio-forest transition hover:border-saubio-forest/50 hover:bg-saubio-forest/5"
              >
                {t('clientDashboard.quick.newBooking')}
              </Link>
              <Link
                href="/client/bookings"
                className="rounded-2xl border border-saubio-forest/20 px-4 py-3 font-semibold text-saubio-forest transition hover:border-saubio-forest/50 hover:bg-saubio-forest/5"
              >
                {t('clientDashboard.quick.manage')}
              </Link>
              <Link
                href="/client/support"
                className="rounded-2xl border border-saubio-forest/20 px-4 py-3 font-semibold text-saubio-forest transition hover:border-saubio-forest/50 hover:bg-saubio-forest/5"
              >
                {t('clientDashboard.quick.support')}
              </Link>
            </div>
          </SurfaceCard>

          {renderUpcoming()}
        </div>

        <div className="space-y-6">
          {renderSummary()}
          {renderNotifications()}
        </div>
      </div>
    </div>
  );
}
