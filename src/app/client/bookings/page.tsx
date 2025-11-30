'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { BookingRequest } from '@saubio/models';
import {
  bookingsQueryKey,
  bookingsQueryOptions,
  useCancelBookingMutation,
  useRequireRole,
  formatDateTime,
  formatEuro,
  bookingDetailQueryKey,
  filterBookings,
  type BookingStatusFilter,
  useAccessToken,
} from '@saubio/utils';
import {
  LoadingIndicator,
  Pill,
  SectionDescription,
  SectionTitle,
  Skeleton,
} from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

const statusPillTone: Record<BookingRequest['status'], 'forest' | 'mist' | 'sun'> = {
  draft: 'mist',
  pending_provider: 'sun',
  pending_client: 'sun',
  confirmed: 'forest',
  in_progress: 'forest',
  completed: 'forest',
  cancelled: 'mist',
  disputed: 'mist',
};

const timelineActionKey: Record<BookingRequest['auditLog'][number]['action'], string> = {
  created: 'bookingTimeline.created',
  updated: 'bookingTimeline.updated',
  provider_assigned: 'bookingTimeline.providerAssigned',
  provider_removed: 'bookingTimeline.providerRemoved',
  status_changed: 'bookingTimeline.statusChanged',
  note_updated: 'bookingTimeline.noteUpdated',
  reminder_scheduled: 'bookingTimeline.reminderScheduled',
  attachment_uploaded: 'bookingTimeline.attachmentUploaded',
  customer_notified: 'bookingTimeline.customerNotified',
  invoice_generated: 'bookingTimeline.invoiceGenerated',
  payment_captured: 'bookingTimeline.paymentCaptured',
};

const timelineAccentClass: Record<BookingRequest['auditLog'][number]['action'], string> = {
  created: 'bg-saubio-forest/10 text-saubio-forest',
  updated: 'bg-saubio-slate/10 text-saubio-slate',
  provider_assigned: 'bg-saubio-forest/10 text-saubio-forest',
  provider_removed: 'bg-red-50 text-red-600',
  status_changed: 'bg-saubio-moss/10 text-saubio-forest',
  note_updated: 'bg-saubio-slate/10 text-saubio-slate',
  reminder_scheduled: 'bg-saubio-moss/10 text-saubio-forest',
  attachment_uploaded: 'bg-saubio-slate/10 text-saubio-slate',
  customer_notified: 'bg-saubio-slate/10 text-saubio-slate',
  invoice_generated: 'bg-saubio-moss/10 text-saubio-forest',
  payment_captured: 'bg-saubio-moss/10 text-saubio-forest',
};

const humanizeReason = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function ClientBookingsPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['client', 'company'] });
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const cancelMutation = useCancelBookingMutation();
  const accessToken = useAccessToken();
  const bookingsQuery = useQuery({
    ...bookingsQueryOptions(),
    enabled: Boolean(accessToken),
  });

  const elevatedCancel =
    session.user?.roles?.some((role) => role === 'admin' || role === 'employee') ?? false;

  const sortedBookings = useMemo(() => {
    const data = bookingsQuery.data ?? [];
    return [...data].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  }, [bookingsQuery.data]);

  const filteredBookings = useMemo(
    () =>
      filterBookings(sortedBookings, {
        status: statusFilter,
        city: cityFilter,
      }),
    [sortedBookings, statusFilter, cityFilter]
  );

  useEffect(() => {
    if (filteredBookings.length === 0) {
      setSelectedBookingId(null);
      return;
    }
    setSelectedBookingId((current) => {
      if (current && filteredBookings.some((booking) => booking.id === current)) {
        return current;
      }
      return filteredBookings[0]?.id ?? null;
    });
  }, [filteredBookings]);

  const selectedBooking = filteredBookings.find((booking) => booking.id === selectedBookingId);

  const timeline = useMemo(() => {
    if (!selectedBooking) return [];
    return [...(selectedBooking.auditLog ?? [])].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [selectedBooking]);

  if (!session.user) {
    return null;
  }

  const statusOptions: BookingStatusFilter[] = [
    'all',
    'pending_provider',
    'pending_client',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'disputed',
  ];

  const formatStatusLabel = (value: BookingStatusFilter) =>
    value === 'all'
      ? t('bookingDashboard.filterAllStatuses')
      : value
          .split('_')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

  const handleCancelBooking = (booking: BookingRequest) => {
    if (!session.user?.id) {
      return;
    }
    cancelMutation.mutate(
      { id: booking.id },
      {
        onSuccess: (mutated) => {
          queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
          queryClient.invalidateQueries({ queryKey: bookingDetailQueryKey(booking.id) });
          if (selectedBookingId === booking.id) {
            setSelectedBookingId(mutated.id);
          }
        },
      }
    );
  };

  const renderContent = () => {
    if (bookingsQuery.isLoading) {
      return (
        <div className="grid gap-6 rounded-3xl border border-saubio-forest/10 bg-white/60 p-4 shadow-soft-lg/40 backdrop-blur lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`booking-skeleton-${index}`} className="h-28 rounded-3xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-20 rounded-3xl" />
          </div>
        </div>
      );
    }

    if (bookingsQuery.isError) {
      return (
        <div className="rounded-4xl border border-saubio-forest/10 bg-white/70 p-6 shadow-soft-lg">
          <ErrorState
            title={t('bookingDashboard.errorTitle')}
            description={t('bookingDashboard.errorDescription')}
            onRetry={() => {
              void bookingsQuery.refetch();
            }}
          />
        </div>
      );
    }

    if (!filteredBookings.length) {
      return (
        <div className="grid gap-6 rounded-4xl border border-dashed border-saubio-forest/20 bg-white/70 p-12 text-center text-sm text-saubio-slate/70">
          <p className="text-base font-semibold text-saubio-forest">
            {t('bookingDashboard.emptyTitle')}
          </p>
          <p>{t('bookingDashboard.emptyDescription')}</p>
          <div className="flex justify-center gap-3 text-sm">
            <Link
              href="/bookings/new"
              className="rounded-full bg-saubio-forest px-5 py-2 font-semibold text-white transition hover:bg-saubio-moss"
            >
              {t('bookingDashboard.ctaCreate')}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-6 rounded-3xl border border-saubio-forest/10 bg-white/60 p-4 shadow-soft-lg/40 backdrop-blur lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isSelected = booking.id === selectedBookingId;
            const totalCents = booking.pricing?.totalCents ?? 0;
            const period = `${formatDateTime(booking.startAt)} → ${formatDateTime(booking.endAt)}`;
            return (
              <div
                key={booking.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedBookingId(booking.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSelectedBookingId(booking.id);
                  }
                }}
                className={`flex flex-col gap-3 rounded-3xl border px-5 py-4 transition shadow-soft-sm ${
                  isSelected
                    ? 'border-saubio-forest bg-saubio-forest/5 text-saubio-forest'
                    : 'border-saubio-forest/10 bg-white text-saubio-slate/80 hover:border-saubio-forest/30 hover:bg-saubio-mist/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-saubio-forest">
                      {booking.address.city}
                    </h3>
                    <p className="text-xs text-saubio-slate/60">{period}</p>
                  </div>
                  <Pill tone={statusPillTone[booking.status]}>
                    {t(`bookingStatus.${booking.status}`, formatStatusLabel(booking.status))}
                  </Pill>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-saubio-forest">
                    {booking.service} · {booking.surfacesSquareMeters} m²
                  </span>
                  <span className="text-saubio-slate/70">{formatEuro(totalCents / 100)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-saubio-slate/60">
                  {booking.providerIds.length ? (
                    <span>
                      {t('bookingDashboard.assignedProviders', {
                        count: booking.providerIds.length,
                      })}
                    </span>
                  ) : (
                    <span>{t('bookingDashboard.noProviders')}</span>
                  )}
                  {booking.notes ? <span>· {booking.notes}</span> : null}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3 text-xs">
                  <Link
                    href={`/client/bookings/${booking.id}`}
                    className="rounded-full border border-saubio-forest/40 px-4 py-1 font-semibold text-saubio-forest transition hover:border-saubio-forest"
                  >
                    {t('bookingDashboard.viewDetails')}
                  </Link>
                  {booking.status !== 'cancelled' && booking.status !== 'completed' ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCancelBooking(booking);
                      }}
                      className="rounded-full border border-red-300 px-4 py-1 font-semibold text-red-600 transition hover:border-red-500 hover:text-red-700"
                      disabled={cancelMutation.isPending}
                    >
                      {t('bookingDashboard.cancel')}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/70 p-4 shadow-soft-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('bookingDashboard.timelineTitle')}
            </h3>
            {selectedBooking ? (
              <Pill tone={statusPillTone[selectedBooking.status]}>
                {t(`bookingStatus.${selectedBooking.status}`, formatStatusLabel(selectedBooking.status))}
              </Pill>
            ) : null}
          </div>
          {selectedBooking ? (
            <div className="space-y-3">
              <div className="rounded-3xl bg-saubio-mist/40 p-4 text-sm text-saubio-slate/70">
                <p className="font-semibold text-saubio-forest">
                  {selectedBooking.address.streetLine1}, {selectedBooking.address.city}
                </p>
                <p>{formatDateTime(selectedBooking.startAt)}</p>
                <p>{formatDateTime(selectedBooking.endAt)}</p>
              </div>
              <ul className="space-y-2 text-xs text-saubio-slate/70">
                {timeline.length === 0 ? (
                  <li className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-4 text-center text-saubio-slate/50">
                    {t('bookingDashboard.timelineEmpty')}
                  </li>
                ) : (
                  timeline.map((entry) => (
                    <li key={`${entry.timestamp}-${entry.action}`} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${timelineAccentClass[entry.action]}`}
                      >
                        {t(timelineActionKey[entry.action])}
                      </span>
                      <div className="space-y-1">
                        <p className="font-semibold text-saubio-forest/80">
                          {formatDateTime(entry.timestamp)}
                        </p>
                        {entry.metadata ? (
                          <p>
                            <code className="rounded bg-saubio-mist/40 px-1 py-0.5 text-[11px] text-saubio-forest/80">
                              {JSON.stringify(entry.metadata)}
                            </code>
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))
                )}
              </ul>
              {selectedBooking.status === 'cancelled' && selectedBooking.notes ? (
                <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-xs text-red-600">
                  <p className="font-semibold">{t('bookingDashboard.cancellationReason')}</p>
                  <p>{humanizeReason(selectedBooking.notes)}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/50">
              {t('bookingDashboard.noSelection')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('bookingDashboard.title')}
        </SectionTitle>
        <SectionDescription>{t('bookingDashboard.subtitle')}</SectionDescription>
      </header>

      <div className="flex flex-wrap gap-3 text-sm">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as BookingStatusFilter)}
          className="min-w-[180px] rounded-full border border-saubio-forest/15 bg-white px-4 py-2 font-semibold text-saubio-forest outline-none transition hover:border-saubio-forest/40 focus:ring-1 focus:ring-saubio-forest/30"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {formatStatusLabel(status)}
            </option>
          ))}
        </select>
        <input
          value={cityFilter}
          onChange={(event) => setCityFilter(event.target.value)}
          placeholder={t('bookingDashboard.cityPlaceholder') ?? ''}
          className="rounded-full border border-saubio-forest/15 bg-white px-4 py-2 text-sm text-saubio-forest outline-none transition hover:border-saubio-forest/40 focus:ring-1 focus:ring-saubio-forest/30"
        />
        <Link
          href="/bookings/new"
          className="ml-auto rounded-full bg-saubio-forest px-5 py-2 font-semibold text-white transition hover:bg-saubio-moss"
        >
          {t('bookingDashboard.ctaCreate')}
        </Link>
      </div>

      {renderContent()}

      {elevatedCancel ? (
        <p className="text-xs text-saubio-slate/60">{t('bookingDashboard.adminHint')}</p>
      ) : null}
    </div>
  );
}
