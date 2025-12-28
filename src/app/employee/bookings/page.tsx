'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton, Pill } from '@saubio/ui';
import { useAdminBookings, useRequireRole, formatDateTime, downloadDocument } from '@saubio/utils';
import type { BookingRequest } from '@saubio/models';
import { ErrorState } from '../../../components/feedback/ErrorState';

const DEFAULT_FILTERS = {
  status: 'pending_provider' as const,
  fallbackRequested: true,
};

const STATUS_TONE: Record<'escalated' | 'candidate' | 'pending', 'sun' | 'forest' | 'mist'> = {
  escalated: 'sun',
  candidate: 'forest',
  pending: 'mist',
};

type BookingAttachment = BookingRequest['attachments'][number];

export default function AdminBookingsPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['employee'] });
  const bookingsQuery = useAdminBookings(DEFAULT_FILTERS);
  const { data, isLoading, isError, refetch } = bookingsQuery;

  const bookings = data ?? [];

  const summary = useMemo(() => {
    const escalated = bookings.filter((booking) => Boolean(booking.fallbackEscalatedAt)).length;
    const candidate = bookings.filter((booking) => Boolean(booking.fallbackTeamCandidate)).length;
    const awaiting = bookings.length - candidate;
    return { escalated, candidate, awaiting };
  }, [bookings]);

  const shortNoticeSummary = useMemo(
    () =>
      bookings.reduce(
        (acc, booking) => {
          if (booking.shortNotice) {
            const hasInvoice = booking.attachments?.some((attachment) => attachment.type === 'invoice');
            if (hasInvoice) {
              acc.confirmed += 1;
            } else {
              acc.pending += 1;
            }
          }
          return acc;
        },
        { pending: 0, confirmed: 0 }
      ),
    [bookings]
  );

  const handleInvoiceDownload = (attachment: BookingAttachment) => {
    if (!attachment?.url) {
      return;
    }
    void downloadDocument(attachment.url, attachment.name ?? 'facture.pdf');
  };

  if (!session.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('adminBookings.title', 'Escalated bookings')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'adminBookings.subtitle',
            'Filtre appliqué : missions en attente fournisseur avec fallback déclenché.'
          )}
        </SectionDescription>
        <div className="flex flex-wrap items-center gap-3 text-xs text-saubio-slate/60">
          <span>
            {t('adminBookings.filters.status', 'Statut : {{status}}', {
              status: t('bookingStatus.pending_provider', 'En attente prestataire'),
            })}
          </span>
          <span>•</span>
          <span>
            {t('adminBookings.filters.fallback', 'Fallback demandé : {{value}}', {
              value: t('common.yes', 'Oui'),
            })}
          </span>
          <button
            type="button"
            className="rounded-full border border-saubio-forest/25 px-3 py-1 font-semibold text-saubio-forest transition hover:border-saubio-forest/50"
            onClick={() => {
              void refetch();
            }}
            disabled={isLoading}
          >
            {isLoading ? t('adminBookings.refreshing', 'Actualisation…') : t('adminBookings.refresh', 'Actualiser')}
          </button>
        </div>
      </header>

      {isError ? (
        <ErrorState
          title={t('adminBookings.errorTitle', 'Impossible de charger les réservations')}
          description={t('adminBookings.errorDescription', 'Vérifiez votre connexion ou réessayez.')}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard variant="soft" padding="md" className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
            {t('adminBookings.metric.total', 'En file Ops')}
          </p>
          <p className="text-3xl font-semibold text-saubio-forest">{bookings.length}</p>
        </SurfaceCard>
        <SurfaceCard variant="soft" padding="md" className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
            {t('adminBookings.metric.candidate', 'Équipes candidates')}
          </p>
          <p className="text-3xl font-semibold text-saubio-forest">{summary.candidate}</p>
        </SurfaceCard>
        <SurfaceCard variant="soft" padding="md" className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
            {t('adminBookings.metric.escalated', 'Escalades critiques')}
          </p>
          <p className="text-3xl font-semibold text-saubio-forest">{summary.escalated}</p>
        </SurfaceCard>
      </div>

      {shortNoticeSummary.pending > 0 ? (
        <div className="rounded-3xl border border-saubio-sun/40 bg-saubio-sun/10 p-4 text-sm text-saubio-slate/80">
          {t('adminBookings.paymentBannerPending', '{{count}} paiements short notice en attente.', {
            count: shortNoticeSummary.pending,
          })}
        </div>
      ) : shortNoticeSummary.confirmed > 0 ? (
        <div className="rounded-3xl border border-saubio-forest/30 bg-saubio-forest/5 p-4 text-sm text-saubio-forest">
          {t('adminBookings.paymentBannerCleared', '{{count}} paiements short notice confirmés.', {
            count: shortNoticeSummary.confirmed,
          })}
        </div>
      ) : null}

      <SurfaceCard variant="soft" padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('adminBookings.tableTitle', 'Réservations en escalade')}
          </h2>
          <span className="text-xs text-saubio-slate/60">
            {t('adminBookings.tableCount', '{{count}} mission(s)', { count: bookings.length })}
          </span>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`booking-skeleton-${index}`} className="h-16 rounded-3xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-saubio-forest/15 bg-white/70 p-6 text-center text-sm text-saubio-slate/60">
            {t('adminBookings.empty', 'Aucune mission en attente d’action Ops.')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">{t('bookingForm.service', 'Service')}</th>
                  <th className="px-3 py-2">{t('bookingForm.address.city', 'Ville')}</th>
                  <th className="px-3 py-2">{t('bookingForm.startAt', 'Début')}</th>
                  <th className="px-3 py-2">{t('adminBookings.providers', 'Intervenants')}</th>
                  <th className="px-3 py-2">{t('adminBookings.retries', 'Retentatives')}</th>
                  <th className="px-3 py-2">{t('adminBookings.fallbackStatus', 'Fallback')}</th>
                  <th className="px-3 py-2">{t('adminBookings.teamCandidate', 'Équipe suggérée')}</th>
                  <th className="px-3 py-2">{t('adminBookings.paymentColumn', 'Paiement')}</th>
                  <th className="px-3 py-2">{t('adminBookings.invoiceColumn', 'Facture')}</th>
                  <th className="px-3 py-2">{t('adminBookings.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const required = booking.requiredProviders ?? booking.providerIds.length ?? 0;
                  const assigned = booking.providerIds.length;
                  const fallbackStatus = booking.fallbackEscalatedAt
                    ? 'escalated'
                    : booking.fallbackTeamCandidate
                      ? 'candidate'
                      : 'pending';
                  const fallbackTone = STATUS_TONE[fallbackStatus];
                  const candidateLabel = booking.fallbackTeamCandidate
                    ? booking.fallbackTeamCandidate.name ?? booking.fallbackTeamCandidate.id
                    : '—';
                  const invoiceAttachment = booking.attachments?.find((doc) => doc.type === 'invoice');
                  const hasInvoice = Boolean(invoiceAttachment);
                  const isShortNotice = Boolean(booking.shortNotice);
                  const paymentStatus: 'pending' | 'confirmed' | 'standard' = isShortNotice
                    ? hasInvoice
                      ? 'confirmed'
                      : 'pending'
                    : 'standard';
                  const paymentTone = paymentStatus === 'confirmed' ? 'forest' : paymentStatus === 'pending' ? 'sun' : 'mist';
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-saubio-forest/10 last:border-none"
                    >
                      <td className="px-3 py-3 font-mono text-xs text-saubio-slate/70">
                        #{booking.id.slice(-8)}
                      </td>
                      <td className="px-3 py-3 font-semibold text-saubio-forest">
                        {t(`services.${booking.service}`, booking.service)}
                      </td>
                      <td className="px-3 py-3">{booking.address.city}</td>
                      <td className="px-3 py-3 text-xs">{formatDateTime(booking.startAt)}</td>
                      <td className="px-3 py-3 text-xs">
                        {assigned}/{required}
                      </td>
                      <td className="px-3 py-3 text-center text-xs">{booking.matchingRetryCount ?? 0}</td>
                      <td className="px-3 py-3">
                        <Pill tone={fallbackTone}>
                          {fallbackStatus === 'escalated'
                            ? t('adminBookings.status.escalated', 'Escalade Ops')
                            : fallbackStatus === 'candidate'
                              ? t('adminBookings.status.candidate', 'Équipe prête')
                              : t('adminBookings.status.pending', 'Recherche')}
                        </Pill>
                      </td>
                      <td className="px-3 py-3 text-xs text-saubio-slate/70">{candidateLabel}</td>
                      <td className="px-3 py-3 text-xs">
                        <Pill tone={paymentTone}>
                          {t(
                            `adminBookings.paymentStatus.${paymentStatus}`,
                            paymentStatus === 'confirmed'
                              ? 'Paiement confirmé'
                              : paymentStatus === 'pending'
                                ? 'En attente'
                                : 'Standard'
                          )}
                        </Pill>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {invoiceAttachment ? (
                          <button
                            type="button"
                            onClick={() => handleInvoiceDownload(invoiceAttachment)}
                            className="font-semibold text-saubio-forest underline"
                          >
                            {t('adminBookings.invoiceDownload', 'Télécharger')}
                          </button>
                        ) : (
                          <span className="text-saubio-slate/50">
                            {t('adminBookings.invoiceMissing', 'En attente')}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <Link
                          href={`/client/bookings/${booking.id}`}
                          className="font-semibold text-saubio-forest underline"
                        >
                          {t('adminBookings.view', 'Ouvrir')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
