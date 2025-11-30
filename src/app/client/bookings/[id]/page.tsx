'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { BookingRequest } from '@saubio/models';
import {
  bookingDetailQueryKey,
  bookingDetailQueryOptions,
  useCancelBookingMutation,
  useRequireRole,
  formatDateTime,
  formatEuro,
  downloadDocument,
} from '@saubio/utils';
import {
  LoadingIndicator,
  Pill,
  SectionDescription,
  SectionTitle,
  SurfaceCard,
  Skeleton,
} from '@saubio/ui';
import { ErrorState } from '../../../../components/feedback/ErrorState';
import { useMatchingProgressFeed } from '../../../../hooks/useMatchingProgressFeed';
import {
  MATCHING_STAGE_DEFINITIONS,
  getMatchingStageDescription,
  getMatchingStageLabel,
  resolveMatchingStatusCopy,
} from '../../../../utils/matching-progress';

const statusTone: Record<string, { labelClass: string; pillTone: 'forest' | 'mist' | 'sun' }> = {
  cancelled: { labelClass: 'text-red-600', pillTone: 'mist' },
  completed: { labelClass: 'text-saubio-forest', pillTone: 'forest' },
  pending_provider: { labelClass: 'text-saubio-forest', pillTone: 'sun' },
  pending_client: { labelClass: 'text-saubio-forest', pillTone: 'sun' },
  in_progress: { labelClass: 'text-saubio-forest', pillTone: 'forest' },
  confirmed: { labelClass: 'text-saubio-forest', pillTone: 'forest' },
  draft: { labelClass: 'text-saubio-slate/60', pillTone: 'mist' },
  disputed: { labelClass: 'text-red-600', pillTone: 'mist' },
};

const timelineTone: Record<string, 'forest' | 'sun' | 'mist'> = {
  created: 'forest',
  updated: 'sun',
  provider_assigned: 'forest',
  provider_removed: 'mist',
  status_changed: 'sun',
  customer_notified: 'sun',
  invoice_generated: 'forest',
  payment_captured: 'forest',
};

const timelineActionKey: Record<string, string> = {
  created: 'bookingTimeline.created',
  status_changed: 'bookingTimeline.statusChanged',
  provider_assigned: 'bookingTimeline.providerAssigned',
  provider_removed: 'bookingTimeline.providerRemoved',
  customer_notified: 'bookingTimeline.customerNotified',
  invoice_generated: 'bookingTimeline.invoiceGenerated',
  payment_captured: 'bookingTimeline.paymentCaptured',
  short_notice_broadcasted: 'bookingTimeline.shortNoticeBroadcasted',
  short_notice_accepted: 'bookingTimeline.shortNoticeAccepted',
  short_notice_declined: 'bookingTimeline.shortNoticeDeclined',
  updated: 'bookingTimeline.updated',
};

const formatStatus = (value: string, t: (key: string, defaultValue?: string) => string) =>
  t(`bookingStatus.${value}`, value.replace(/_/g, ' '));

type BookingAttachment = BookingRequest['attachments'][number];

type MatchingStageSnapshot = {
  status: string;
  count?: number;
  updatedAt?: string;
  message?: string;
};

const mapBookingStatusToStage = (
  status: BookingRequest['status']
): { stage: string; status: string } | null => {
  switch (status) {
    case 'pending_provider':
      return { stage: 'matching', status: 'in_progress' };
    case 'pending_client':
      return { stage: 'matching', status: 'awaiting_client' };
    case 'confirmed':
    case 'in_progress':
      return { stage: 'matching', status: 'locked' };
    case 'completed':
      return { stage: 'matching', status: 'completed' };
    case 'cancelled':
      return { stage: 'matching', status: 'cancelled' };
    default:
      return null;
  }
};

const buildInitialMatchingStages = (
  booking: BookingRequest | null
): Record<string, MatchingStageSnapshot> => {
  if (!booking) {
    return {};
  }
  const base: Record<string, MatchingStageSnapshot> = {};
  const stageFromStatus = mapBookingStatusToStage(booking.status);
  if (stageFromStatus) {
    base[stageFromStatus.stage] = {
      status: stageFromStatus.status,
      updatedAt: booking.updatedAt,
    };
  }
  base.assignment = {
    status: booking.providerIds.length > 0 ? 'completed' : 'pending',
    count: booking.providerIds.length,
    updatedAt: booking.updatedAt,
  };
  base.team = { status: 'pending' };
  if (booking.fallbackEscalatedAt) {
    base.team = {
      status: 'failed',
      updatedAt: booking.fallbackEscalatedAt,
      message: 'Escalade Ops – aucun prestataire disponible.',
    };
  } else if (booking.fallbackRequestedAt) {
    base.team = {
      status: booking.fallbackTeamCandidate ? 'in_progress' : 'pending',
      updatedAt: booking.fallbackRequestedAt,
      message: booking.fallbackTeamCandidate
        ? `Équipe suggérée : ${booking.fallbackTeamCandidate.name ?? booking.fallbackTeamCandidate.id}`
        : undefined,
    };
  }
  return base;
};

const isImageAttachment = (attachment: { url: string; type?: string }) => {
  const normalizedUrl = (attachment.url ?? '').split('?')[0];
  if (!normalizedUrl) {
    return false;
  }

  if (attachment.type?.toLowerCase().startsWith('photo')) {
    return true;
  }

  return (
    normalizedUrl.startsWith('data:image') ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(normalizedUrl)
  );
};

const dataUrlToBlobUrl = (inlineData: string): string | null => {
  const [metadata, content] = inlineData.split(',');

  if (!metadata || !content) {
    return null;
  }

  try {
    const mimeMatch = metadata.match(/^data:(.*?);base64$/i);
    const mimeType = mimeMatch?.[1] ?? 'application/octet-stream';
    const binary = atob(content);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};

const renderSkeleton = () => (
  <div className="space-y-10">
    <div className="flex items-center justify-between gap-4">
      <Skeleton className="h-4 w-32 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2 rounded-3xl" />
          <Skeleton className="h-4 w-2/3 rounded-3xl" />
          <Skeleton className="h-4 w-1/3 rounded-3xl" />
        </div>
        <Skeleton className="h-48 rounded-4xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-40 rounded-3xl" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`timeline-skeleton-${index}`} className="h-16 rounded-3xl" />
        ))}
      </div>
    </div>
  </div>
);

export default function ClientBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params?.id;
  const router = useRouter();
  const session = useRequireRole({ allowedRoles: ['client', 'company'] });
  const cancelMutation = useCancelBookingMutation();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery(bookingDetailQueryOptions(bookingId ?? ''));

  const { latestByStage } = useMatchingProgressFeed({
    enabled: Boolean(session.user && data?.id && !isLoading && !isError),
    filterBookingId: data?.id,
  });

  const safeBooking = data ?? null;

  const baseMatchingStages = useMemo(
    () => buildInitialMatchingStages(safeBooking),
    [safeBooking]
  );

  const matchingStageState = useMemo(() => {
    const merged = { ...baseMatchingStages };
    Object.entries(latestByStage).forEach(([stage, snapshot]) => {
      merged[stage] = {
        status: snapshot.status,
        count: snapshot.count,
        updatedAt: snapshot.createdAt,
        message: snapshot.message,
      };
    });
    MATCHING_STAGE_DEFINITIONS.forEach((definition) => {
      if (!merged[definition.id]) {
        merged[definition.id] = { status: 'pending' };
      }
    });
    return merged;
  }, [baseMatchingStages, latestByStage]);

  if (!session.user) {
    return null;
  }

  if (!bookingId) {
    return (
      <div className="rounded-4xl border border-saubio-forest/10 bg-white/70 p-6 shadow-soft-lg">
        <ErrorState
          title={t('bookingDashboard.errorTitle')}
          description={t('bookingDashboard.errorDescription')}
        />
      </div>
    );
  }

  if (isLoading) {
    return renderSkeleton();
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <div className="rounded-4xl border border-saubio-forest/10 bg-white/70 p-6 shadow-soft-lg">
          <ErrorState
            title={t('bookingDashboard.errorTitle')}
            description={t('bookingDashboard.errorDescription')}
            onRetry={() => {
              void refetch();
            }}
          />
        </div>
        <Link
          href="/client/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-saubio-forest underline"
        >
          {t('bookingDashboard.viewDetails')}
        </Link>
      </div>
    );
  }

  const timeline = [...(data.auditLog ?? [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const providerAssigned = data.providerIds.length > 0;
  const canCancel =
    data.status !== 'cancelled' && session.user.id === data.clientId && !providerAssigned;
  const cancellationRequiresAdmin =
    providerAssigned && session.user.id === data.clientId && data.status !== 'cancelled';

  const tone =
    statusTone[data.status] ?? ({ labelClass: 'text-saubio-forest', pillTone: 'forest' } as const);
  const attachments = (data.attachments ?? []).filter((attachment) => attachment.type !== 'invoice');
  const invoices = (data.attachments ?? []).filter((attachment) => attachment.type === 'invoice');

  const handleCancel = () => {
    cancelMutation.mutate(
      { id: data.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: bookingDetailQueryKey(data.id) });
        },
      }
    );
  };

  const openAttachment = (attachment: BookingAttachment) => {
    if (typeof window === 'undefined' || !attachment.url) {
      return;
    }

    let targetUrl = attachment.url;
    let revokeUrl: string | null = null;

    if (attachment.url.startsWith('data:')) {
      const blobUrl = dataUrlToBlobUrl(attachment.url);
      if (!blobUrl) {
        return;
      }
      targetUrl = blobUrl;
      revokeUrl = blobUrl;
    }

    const link = document.createElement('a');
    link.href = targetUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();

    if (revokeUrl) {
      window.setTimeout(() => {
        URL.revokeObjectURL(revokeUrl!);
      }, 60_000);
    }
  };

  const downloadInvoiceDocument = (attachment: BookingAttachment) => {
    if (!attachment.url) {
      return;
    }
    void downloadDocument(attachment.url, attachment.name ?? 'facture.pdf').catch(() => {
      openAttachment(attachment);
    });
  };

  const renderTimelineMetadata = (entry: BookingRequest['auditLog'][number]) => {
    if (!entry.metadata) {
      return null;
    }

    if (entry.action === 'payment_captured') {
      const metadata = entry.metadata as Record<string, unknown>;
      const amountCents = typeof metadata.amountCents === 'number' ? metadata.amountCents : null;
      const method = typeof metadata.method === 'string' ? metadata.method : null;
      const shortNotice = metadata.shortNotice === true;
      const methodLabel = method ? method.replace(/_/g, ' ').toUpperCase() : null;

      return (
        <div className="rounded-2xl border border-saubio-forest/10 bg-saubio-forest/5 p-4 text-xs text-saubio-forest">
          <p className="text-sm font-semibold text-saubio-forest">
            {t('bookingDetail.timeline.paymentCapturedTitle', 'Paiement confirmé')}
          </p>
          <p className="text-saubio-slate/70">
            {t(
              'bookingDetail.timeline.paymentCapturedDescription',
              'Le blocage du paiement est confirmé pour cette mission.'
            )}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-saubio-slate/60">
            {amountCents !== null ? (
              <span className="font-semibold text-saubio-forest">
                {t('bookingDetail.timeline.paymentCapturedAmount', {
                  amount: formatEuro(amountCents / 100),
                })}
              </span>
            ) : null}
            {methodLabel ? <span>{methodLabel}</span> : null}
            {shortNotice ? (
              <span className="rounded-full bg-saubio-sun/20 px-2 py-0.5 text-[10px] font-semibold text-saubio-sun/80">
                {t('bookingDetail.timeline.paymentCapturedShortNotice', 'Short notice')}
              </span>
            ) : null}
          </div>
        </div>
      );
    }

    if (entry.action === 'invoice_generated') {
      const metadata = entry.metadata as Record<string, unknown>;
      const documentId = typeof metadata.documentId === 'string' ? metadata.documentId : null;
      const invoiceDocument = documentId
        ? invoices.find((doc) => doc.id === documentId)
        : invoices[0];
      const invoiceNumber =
        (typeof metadata.invoiceNumber === 'string' && metadata.invoiceNumber.length > 0
          ? metadata.invoiceNumber
          : null) ??
        invoiceDocument?.name;

      return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-saubio-forest/5 p-3 text-xs">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-saubio-forest">
              {t('bookingDetail.timeline.invoiceReadyTitle', 'Facture disponible')}
            </p>
            <p className="text-saubio-slate/70">
              {t(
                'bookingDetail.timeline.invoiceReadyDescription',
                'Votre facture est prête à être téléchargée.'
              )}
            </p>
            {invoiceNumber ? (
              <p className="font-mono text-[11px] uppercase tracking-wide text-saubio-slate/50">
                {invoiceNumber}
              </p>
            ) : null}
          </div>
          {invoiceDocument ? (
            <button
              type="button"
              onClick={() => downloadInvoiceDocument(invoiceDocument)}
              className="rounded-full bg-saubio-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss"
            >
              {t('bookingDetail.timeline.downloadInvoice', 'Télécharger')}
            </button>
          ) : null}
        </div>
      );
    }

    return (
      <div className="rounded-2xl bg-saubio-mist/40 p-3 text-xs text-saubio-slate/70">
        {Object.entries(entry.metadata).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}</span>
            <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold text-saubio-forest underline"
        >
          ← {t('bookingDetail.back')}
        </button>
        <Pill tone={tone.pillTone}>
          {formatStatus(data.status, (key, defaultValue) =>
            t(key, defaultValue ? { defaultValue } : undefined)
          )}
        </Pill>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SurfaceCard variant="soft" padding="md" className="space-y-3">
            <SectionTitle size="large">{data.service}</SectionTitle>
            <SectionDescription>
              {data.address.streetLine1}, {data.address.city} ({data.address.postalCode})
            </SectionDescription>
            <p className="text-sm text-saubio-slate/70">
              {formatDateTime(data.startAt)} → {formatDateTime(data.endAt)}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/60">
              <span>
                {t('bookingForm.mode')}:{' '}
                {t(`bookingForm.modeOptions.${data.mode}`, data.mode)}
              </span>
              <span>•</span>
              <span>
                {t('bookingForm.providers')}:{' '}
                {data.providerIds.length
                  ? data.providerIds.join(', ')
                  : t('bookingDashboard.noProviders')}
              </span>
            </div>
          </SurfaceCard>
          {attachments.length ? (
            <SurfaceCard variant="soft" padding="md" className="space-y-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                  {t('bookingForm.attachments.title', 'Photos & documents')}
                </h2>
                <p className="text-xs text-saubio-slate/70">
                  {t(
                    'bookingForm.attachments.description',
                    'Ajoutez des photos du site ou des consignes spécifiques.'
                  )}
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {attachments.map((attachment) => {
                  const previewIsImage = isImageAttachment(attachment);
                  return (
                    <li
                      key={attachment.id}
                      className="space-y-2 rounded-3xl border border-saubio-forest/10 bg-white/80 p-3 text-sm text-saubio-slate/70"
                    >
                      <div className="overflow-hidden rounded-2xl border border-saubio-forest/5 bg-saubio-mist/30">
                        {previewIsImage ? (
                          // eslint-disable-next-line @next/next/no-img-element -- inline data URLs are not supported by next/image
                          <img
                            src={attachment.url}
                            alt={attachment.name ?? t('bookingDetail.attachments.imageAlt', 'Photo du chantier')}
                            className="h-36 w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-36 items-center justify-center px-3 text-center text-xs font-semibold text-saubio-slate/60">
                            {t('bookingDetail.attachments.noPreview', 'Aperçu non disponible')}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="text-sm font-semibold text-saubio-forest">
                          {attachment.name ?? t('bookingDetail.attachments.unnamed', 'Fichier joint')}
                        </p>
                        {attachment.uploadedAt ? (
                          <p>{formatDateTime(attachment.uploadedAt)}</p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => openAttachment(attachment)}
                          className="inline-flex items-center text-xs font-semibold text-saubio-forest underline"
                        >
                          {t('bookingDetail.attachments.openLink', 'Ouvrir')}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </SurfaceCard>
          ) : null}
          {invoices.length ? (
            <SurfaceCard variant="soft" padding="md" className="space-y-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                  {t('bookingDetail.invoices.title', 'Factures & reçus')}
                </h2>
                <p className="text-xs text-saubio-slate/70">
                  {t('bookingDetail.invoices.description', 'Téléchargez vos documents générés automatiquement.')}
                </p>
              </div>
              <ul className="space-y-3 text-sm text-saubio-slate/80">
                {invoices.map((invoice) => (
                  <li
                    key={`invoice-${invoice.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-saubio-forest/10 bg-white/80 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-saubio-forest">
                        {invoice.name ?? t('bookingDetail.invoices.defaultName', 'Facture Saubio')}
                      </p>
                      {invoice.uploadedAt ? (
                        <p className="text-xs text-saubio-slate/60">{formatDateTime(invoice.uploadedAt)}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadInvoiceDocument(invoice)}
                      className="text-xs font-semibold text-saubio-forest underline"
                    >
                      {t('bookingDetail.invoices.download', 'Télécharger')}
                    </button>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          ) : null}
          <SurfaceCard variant="soft" padding="md">
            <div className="flex justify-between text-sm">
              <span>{t('bookingForm.surface')}</span>
              <span>{data.surfacesSquareMeters} m²</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('bookingForm.frequency')}</span>
              <span>{data.frequency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('bookingForm.ecoPreference')}</span>
              <span>{data.ecoPreference}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>{t('bookingForm.submit')}</span>
              <span>{formatEuro((data.pricing?.totalCents ?? 0) / 100)}</span>
            </div>
            {data.shortNotice ? (
              <div className="mt-3 space-y-1 rounded-2xl border border-saubio-sun/30 bg-saubio-sun/10 p-3 text-xs text-saubio-slate/80">
                <p className="text-sm font-semibold text-saubio-forest">
                  {t('bookingDetail.shortNotice.bannerTitle', 'Demande urgente')}
                </p>
                <p>
                  {t(
                    'bookingDetail.shortNotice.bannerDescription',
                    'Nous avons alerté instantanément les prestataires disponibles sur votre zone.'
                  )}
                </p>
                {typeof data.shortNoticeDepositCents === 'number' ? (
                  <p>
                    {t('bookingDetail.shortNotice.deposit', 'Blocage estimé : {{amount}}', {
                      amount: formatEuro(data.shortNoticeDepositCents / 100),
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}
            {canCancel ? (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingIndicator tone="light" size="xs" />
                    {t('bookingList.cancel')}
                  </span>
                ) : (
                  t('bookingList.cancel')
                )}
              </button>
            ) : null}
            {!canCancel && cancellationRequiresAdmin ? (
              <p className="mt-2 text-xs text-saubio-slate/70">
                {t(
                  'bookingDetail.cancellationLocked',
                  'Cette réservation a déjà été acceptée par un prestataire. Veuillez contacter le support pour l’annuler.'
                )}{' '}
                <Link href="/client/support" className="font-semibold text-saubio-forest underline">
                  {t('bookingDetail.supportCta')}
                </Link>
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/client/support"
                className="inline-flex items-center rounded-full border border-saubio-forest/30 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest/60"
              >
                {t('bookingDetail.supportCta')}
              </Link>
              <Link
                href="/bookings/new"
                className="inline-flex items-center rounded-full bg-saubio-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss"
              >
                {t('bookingDetail.rebookCta')}
              </Link>
            </div>
          </SurfaceCard>
        </div>
        <MatchingProgressCard stageState={matchingStageState} bookingMode={data.mode} />
        <FallbackStatusCard booking={data} snapshot={matchingStageState.team} />
        <SurfaceCard variant="soft" padding="md" className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('bookingDashboard.timelineTitle')}
          </h2>
          {timeline.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-4 text-center text-xs text-saubio-slate/60">
              {t('bookingDashboard.timelineEmpty')}
            </p>
          ) : (
            <ol className="relative space-y-4 border-l border-saubio-forest/15 pl-4 text-sm">
              {timeline.map((entry) => (
                <li key={`${entry.timestamp}-${entry.action}`} className="space-y-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                    {formatDateTime(entry.timestamp)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Pill tone={timelineTone[entry.action] ?? 'sun'}>
                      {t(timelineActionKey[entry.action] ?? 'bookingTimeline.updated', entry.action)}
                    </Pill>
                    {entry.metadata && 'status' in entry.metadata ? (
                      <span className={`text-xs font-semibold ${tone.labelClass}`}>
                        {t(`bookingStatus.${(entry.metadata as Record<string, string>).status}`, (entry.metadata as Record<string, string>).status)}
                      </span>
                    ) : null}
                  </div>
                  {entry.metadata ? renderTimelineMetadata(entry) : null}
                </li>
              ))}
            </ol>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}

type MatchingProgressCardProps = {
  stageState: Record<string, MatchingStageSnapshot>;
  bookingMode: BookingRequest['mode'];
};

function MatchingProgressCard({ stageState, bookingMode }: MatchingProgressCardProps) {
  const { t } = useTranslation();
  const badgeTone = bookingMode === 'smart_match' ? 'forest' : 'sun';
  const badgeLabel =
    bookingMode === 'smart_match'
      ? t('matchingProgress.mode.smart', 'Mode Smart Match')
      : t('matchingProgress.mode.manual', 'Sélection manuelle');

  const toneClasses: Record<'positive' | 'warning' | 'neutral' | 'danger', string> = {
    positive: 'bg-saubio-forest/10 text-saubio-forest',
    warning: 'bg-saubio-sun/20 text-saubio-moss',
    neutral: 'bg-saubio-mist/60 text-saubio-slate/70',
    danger: 'bg-red-50 text-red-600',
  };

  return (
    <SurfaceCard variant="soft" padding="md" className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('matchingProgress.title', 'Suivi matching')}
        </h2>
        <Pill tone={badgeTone}>{badgeLabel}</Pill>
      </div>
      <ol className="space-y-3 text-sm">
        {MATCHING_STAGE_DEFINITIONS.map((stage) => {
          const snapshot = stageState[stage.id] ?? { status: 'pending' };
          const statusMeta = resolveMatchingStatusCopy(snapshot.status, t);
          const statusClasses = toneClasses[statusMeta.variant];
          const countText =
            typeof snapshot.count === 'number'
              ? t('matchingProgress.count', '{{count}} intervenant(s)', {
                  count: snapshot.count,
                })
              : null;
          const lastUpdate = snapshot.updatedAt ? formatDateTime(snapshot.updatedAt) : null;
          const description =
            snapshot.message ?? getMatchingStageDescription(stage.id, t);
          return (
            <li
              key={stage.id}
              className="rounded-3xl border border-saubio-forest/10 bg-white/80 px-4 py-3 shadow-soft-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-saubio-forest">
                    {getMatchingStageLabel(stage.id, t)}
                  </p>
                  <p className="text-xs text-saubio-slate/60">{description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                  {statusMeta.label}
                </span>
              </div>
              {countText ? (
                <p className="mt-2 text-xs font-semibold text-saubio-slate/70">{countText}</p>
              ) : null}
              {lastUpdate ? (
                <p className="text-[11px] uppercase tracking-[0.25em] text-saubio-slate/50">
                  {t('matchingProgress.updatedAt', 'Maj {{date}}', { date: lastUpdate })}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </SurfaceCard>
  );
}

type FallbackStatusCardProps = {
  booking: BookingRequest;
  snapshot?: MatchingStageSnapshot;
};

function FallbackStatusCard({ booking, snapshot }: FallbackStatusCardProps) {
  const { t } = useTranslation();
  const hasRawEscalation =
    Boolean(booking.fallbackRequestedAt) ||
    Boolean(booking.fallbackEscalatedAt) ||
    Boolean(booking.fallbackTeamCandidate);
  const hasRealtime = Boolean(snapshot && snapshot.status !== 'pending');

  if (!hasRawEscalation && !hasRealtime) {
    return null;
  }

  const toneClasses: Record<'positive' | 'warning' | 'neutral' | 'danger', string> = {
    positive: 'bg-saubio-forest/10 text-saubio-forest',
    warning: 'bg-saubio-sun/20 text-saubio-moss',
    neutral: 'bg-saubio-mist/60 text-saubio-slate/70',
    danger: 'bg-red-50 text-red-600',
  };

  const status =
    snapshot?.status ?? (booking.fallbackRequestedAt ? 'in_progress' : 'pending');
  const statusMeta = resolveMatchingStatusCopy(status, t);
  const statusClasses = toneClasses[statusMeta.variant];
  const infoRows: Array<{ label: string; value: string }> = [];

  if (booking.fallbackRequestedAt) {
    infoRows.push({
      label: t('bookingDetail.fallback.requestedAt', 'Demandé le'),
      value: formatDateTime(booking.fallbackRequestedAt),
    });
  }

  if (booking.fallbackTeamCandidate) {
    infoRows.push({
      label: t('bookingDetail.fallback.candidate', 'Équipe suggérée'),
      value: `${booking.fallbackTeamCandidate.name ?? booking.fallbackTeamCandidate.id} · ${t(
        'bookingDetail.fallback.members',
        '{{count}} membre(s)',
        { count: booking.fallbackTeamCandidate.memberCount }
      )}`,
    });
  }

  if (booking.fallbackEscalatedAt) {
    infoRows.push({
      label: t('bookingDetail.fallback.escalatedAt', 'Escalade Ops'),
      value: formatDateTime(booking.fallbackEscalatedAt),
    });
  }

  if (snapshot?.message) {
    infoRows.push({
      label: t('bookingDetail.fallback.message', 'Note Ops'),
      value: snapshot.message,
    });
  }

  if (!infoRows.length && snapshot?.updatedAt) {
    infoRows.push({
      label: t('bookingDetail.fallback.updatedAt', 'Dernière mise à jour'),
      value: formatDateTime(snapshot.updatedAt),
    });
  }

  return (
    <SurfaceCard variant="soft" padding="md" className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('bookingDetail.fallback.title', 'Escalade matching')}
        </h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
          {statusMeta.label}
        </span>
      </div>
      {infoRows.length ? (
        <dl className="space-y-2 text-sm text-saubio-slate/80">
          {infoRows.map((row) => (
            <div key={`${row.label}-${row.value}`} className="flex items-center justify-between gap-4">
              <dt className="font-semibold text-saubio-forest">{row.label}</dt>
              <dd className="text-right text-saubio-slate/70">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs text-saubio-slate/60">
          {t(
            'bookingDetail.fallback.placeholder',
            'Surveillez cette section pour suivre les escalades et réaffectations en temps réel.'
          )}
        </p>
      )}
    </SurfaceCard>
  );
}
