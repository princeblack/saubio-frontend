'use client';

import { AnalyticsCard, SectionContainer, SectionHeading } from '@saubio/ui';
import { useApiHealth, useBookingsSnapshot } from '../../hooks/useApiHealth';
import { useTranslation } from 'react-i18next';
import { Activity, TrendingUp } from 'lucide-react';

export function TrustBar() {
  const { t } = useTranslation();
  const logos = t('trust.clients', { returnObjects: true }) as string[];
  const health = useApiHealth();
  const bookings = useBookingsSnapshot();

  const healthDataStatus = health.data?.status;
  const apiTone =
    health.status === 'success'
      ? healthDataStatus === 'ok'
        ? 'forest'
        : healthDataStatus === 'degraded'
        ? 'sun'
        : 'mist'
      : health.status === 'error'
      ? 'mist'
      : 'sun';
  const apiLabel =
    health.status === 'success'
      ? healthDataStatus === 'ok'
        ? t('trust.status.online')
        : healthDataStatus === 'degraded'
        ? t('trust.status.degraded')
        : t('trust.status.offline')
      : health.status === 'error'
      ? t('trust.status.offline')
      : t('trust.status.checking');

  const bookingsTone =
    bookings.status === 'success' ? 'sun' : bookings.status === 'error' ? 'mist' : 'sun';
  const bookingsLabel =
    bookings.status === 'success'
      ? t('trust.bookings.value', { count: bookings.data?.length ?? 0 })
      : bookings.status === 'error'
      ? t('trust.bookings.error')
      : t('trust.bookings.loading');

  const bookingsCount = bookings.status === 'success' ? bookings.data?.length ?? 0 : null;

  return (
    <SectionContainer
      as="section"
      padding="compact"
      className="flex flex-col items-center gap-8 text-center"
    >
      <SectionHeading tone="moss" className="rounded-full bg-white px-4 py-2 shadow-soft-lg/40">
        {t('trust.badge')}
      </SectionHeading>
      <div className="flex flex-wrap items-center justify-center gap-10 text-sm font-semibold text-saubio-slate/50 sm:gap-12 lg:gap-16">
        {logos.map((logo) => (
          <span key={logo} className="tracking-[0.2em]">
            {logo}
          </span>
        ))}
      </div>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <AnalyticsCard
          label={t('trust.api.title', 'Disponibilité API')}
          value={apiLabel}
          helper={t('trust.api.helper', 'Surveillance en continu')}
          icon={<Activity className="h-4 w-4" />}
          className={
            apiTone === 'forest'
              ? 'border-emerald-100 text-saubio-forest'
              : apiTone === 'sun'
              ? 'border-amber-100 text-saubio-forest'
              : 'border-saubio-forest/20'
          }
        />
        <AnalyticsCard
          label={t('trust.bookings.title', 'Demandes actives')}
          value={
            bookingsCount !== null ? bookingsCount.toString() : t('trust.bookings.loading')
          }
          helper={bookingsLabel}
          icon={<TrendingUp className="h-4 w-4" />}
          className={
            bookingsTone === 'sun'
              ? 'border-amber-100 text-saubio-forest'
              : bookingsTone === 'mist'
              ? 'border-saubio-forest/20 text-saubio-forest'
              : undefined
          }
        />
      </div>
    </SectionContainer>
  );
}
