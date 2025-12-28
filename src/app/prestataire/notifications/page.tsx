'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Notification, ProviderBookingInvitation } from '@saubio/models';
import {
  formatDateTime,
  formatEuro,
  useMarkManyNotificationsMutation,
  useMarkNotificationReadMutation,
  useMarkProviderInvitationViewedMutation,
  useNotificationStream,
  useNotifications,
  useProviderInvitations,
  useRequireRole,
  useRespondProviderInvitationMutation,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Pill, LoadingIndicator } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { SuccessToast } from '../../../components/system/SuccessToast';
import { ErrorToast } from '../../../components/system/ErrorToast';
import { MapPin, Clock4, Phone, CheckCircle2, XCircle, NotebookText } from 'lucide-react';

type InvitationAction = 'accept' | 'decline';
type TranslateFn = ReturnType<typeof useTranslation>['t'];

const statusToneMap: Record<string, { tone: 'sun' | 'forest' | 'mist' }> = {
  new: { tone: 'sun' },
  viewed: { tone: 'mist' },
  accepted: { tone: 'forest' },
  declined: { tone: 'mist' },
  expired: { tone: 'mist' },
};

export default function ProviderNotificationsPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const [activeTab, setActiveTab] = useState<'offers' | 'notifications'>('offers');
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<{ id: string; action: InvitationAction } | null>(null);

  const invitationsQuery = useProviderInvitations({ status: 'pending' });
  const notificationsQuery = useNotifications({ limit: 20 });
  useNotificationStream({ enabled: activeTab === 'notifications' && Boolean(session.user) });
  const respondMutation = useRespondProviderInvitationMutation();
  const markViewedMutation = useMarkProviderInvitationViewedMutation();
  const markNotificationReadMutation = useMarkNotificationReadMutation();
  const markManyMutation = useMarkManyNotificationsMutation();

  const invitations = invitationsQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];
  const selectedInvitation =
    invitations.find((invitation) => invitation.id === selectedInvitationId) ?? null;
  const unreadNotificationIds = notifications.filter((item) => !item.readAt).map((item) => item.id);

  const handleOpenInvitation = (invitation: ProviderBookingInvitation) => {
    setSelectedInvitationId(invitation.id);
    if (!invitation.viewedAt) {
      markViewedMutation.mutate(invitation.id);
    }
  };

  const closeDetails = () => setSelectedInvitationId(null);

  const handleRespond = (invitation: ProviderBookingInvitation, action: InvitationAction) => {
    if (pendingAction) {
      return;
    }
    setPendingAction({ id: invitation.id, action });
    respondMutation.mutate(
      { id: invitation.id, action },
      {
        onSuccess: () => {
          setToast({
            type: 'success',
            message:
              action === 'accept'
                ? t('providerOffers.toasts.accepted')
                : t('providerOffers.toasts.declined'),
          });
          setSelectedInvitationId(null);
        },
        onError: () => {
          setToast({
            type: 'error',
            message: t('providerOffers.toasts.error'),
          });
        },
        onSettled: () => setPendingAction(null),
      }
    );
  };

  const handleNotificationRead = (notificationId: string) => {
    markNotificationReadMutation.mutate({ id: notificationId });
  };

  const renderOffers = () => {
    if (invitationsQuery.isLoading) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingIndicator />
        </div>
      );
    }
    if (invitationsQuery.isError) {
      return (
        <ErrorState
          title={t('providerOffers.errorTitle')}
          description={t('providerOffers.errorDescription')}
          onRetry={() => {
            void invitationsQuery.refetch();
          }}
        />
      );
    }
    if (invitations.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-saubio-forest/20 bg-saubio-mist/30 p-8 text-center text-sm text-saubio-slate/70">
          {t('providerOffers.empty')}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <OfferCard
            key={invitation.id}
            invitation={invitation}
            onOpen={() => handleOpenInvitation(invitation)}
            onRespond={handleRespond}
            isProcessing={pendingAction?.id === invitation.id && respondMutation.isPending}
          />
        ))}
      </div>
    );
  };

  const handleMarkAllRead = () => {
    if (!unreadNotificationIds.length || markManyMutation.isPending) {
      return;
    }
    markManyMutation.mutate(
      { ids: unreadNotificationIds },
      {
        onSuccess: () => {
          setToast({
            type: 'success',
            message: t('providerOffers.notifications.markAllSuccess'),
          });
        },
        onError: () => {
          setToast({
            type: 'error',
            message: t('providerOffers.notifications.errorTitle'),
          });
        },
      }
    );
  };

  const renderNotifications = () => {
    if (notificationsQuery.isLoading) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingIndicator />
        </div>
      );
    }
    if (notificationsQuery.isError) {
      return (
        <ErrorState
          title={t('providerOffers.notifications.errorTitle')}
          description={t('providerOffers.notifications.errorDescription')}
          onRetry={() => {
            void notificationsQuery.refetch();
          }}
        />
      );
    }
    if (notifications.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-saubio-forest/20 bg-saubio-mist/30 p-8 text-center text-sm text-saubio-slate/70">
          {t('providerOffers.notifications.empty')}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-2 border-b border-saubio-forest/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-saubio-forest">
            {t('providerOffers.notifications.title', 'Notifications')}
          </p>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={!unreadNotificationIds.length || markManyMutation.isPending}
            className="inline-flex items-center justify-center rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest/40 disabled:cursor-not-allowed disabled:border-saubio-forest/10 disabled:text-saubio-slate/40"
          >
            {markManyMutation.isPending
              ? t('providerOffers.notifications.marking')
              : t('providerOffers.notifications.markAll')}
          </button>
        </div>
        {notifications.map((notification) => {
          const isUnread = !notification.readAt;
          const payload = (notification.payload ?? {}) as {
            title?: string;
            message?: string;
            preview?: string;
          };
          const preview =
            payload.title ??
            payload.message ??
            payload.preview ??
            t('providerOffers.notifications.generic');
          return (
            <article
              key={notification.id}
              className={`rounded-3xl border px-4 py-3 text-sm transition ${
                isUnread
                  ? 'border-saubio-forest/30 bg-saubio-mist/40'
                  : 'border-saubio-forest/15 bg-white'
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                    {t(`notifications.types.${notification.type}`, formatEnum(notification.type))}
                  </p>
                  <p className="text-saubio-forest">{preview}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-saubio-slate/50">
                  <span>{formatDateTime(notification.createdAt)}</span>
                  <Pill tone={isUnread ? 'sun' : 'mist'}>
                    {isUnread
                      ? t('notifications.status.unread')
                      : t('notifications.status.read')}
                  </Pill>
                </div>
              </div>
              {isUnread ? (
                <button
                  type="button"
                  onClick={() => handleNotificationRead(notification.id)}
                  className="mt-3 text-xs font-semibold text-saubio-forest underline"
                >
                  {t('notifications.markRead')}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    );
  };

  if (!session.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerOffers.title')}
        </SectionTitle>
        <SectionDescription>{t('providerOffers.subtitle')}</SectionDescription>
      </header>

      <div className="flex flex-wrap gap-3">
        <TabButton
          active={activeTab === 'offers'}
          onClick={() => setActiveTab('offers')}
        >
          {t('providerOffers.tabs.offers')}
        </TabButton>
        <TabButton
          active={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
        >
          {t('providerOffers.tabs.notifications')}
        </TabButton>
      </div>

      <SurfaceCard padding="lg">
        {activeTab === 'offers' ? renderOffers() : renderNotifications()}
      </SurfaceCard>

      {selectedInvitation ? (
        <OfferDetailsDialog
          invitation={selectedInvitation}
          onClose={closeDetails}
          onRespond={handleRespond}
          isProcessing={pendingAction?.id === selectedInvitation.id && respondMutation.isPending}
        />
      ) : null}

      {toast?.type === 'success' ? (
        <SuccessToast message={toast.message} onClose={() => setToast(null)} />
      ) : toast?.type === 'error' ? (
        <ErrorToast message={toast.message} onClose={() => setToast(null)} />
      ) : null}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

function TabButton({ active, children, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-saubio-forest text-white shadow-soft-sm'
          : 'border border-saubio-forest/15 bg-white text-saubio-slate/80 hover:border-saubio-forest/40'
      }`}
    >
      {children}
    </button>
  );
}

interface OfferCardProps {
  invitation: ProviderBookingInvitation;
  onOpen: () => void;
  onRespond: (invitation: ProviderBookingInvitation, action: InvitationAction) => void;
  isProcessing: boolean;
}

function OfferCard({ invitation, onOpen, onRespond, isProcessing }: OfferCardProps) {
  const { t } = useTranslation();
  const startAt = formatDateTime(invitation.startAt);
  const status = resolveStatus(invitation, t);
  const showActions = invitation.status === 'pending';
  const instructions =
    invitation.instructions ?? invitation.servicePreferences?.additionalInstructions ?? null;
  const ecoLabel =
    invitation.ecoPreference === 'bio'
      ? t('providerOffers.eco.bio')
      : t('providerOffers.eco.standard');
  const addressLine = invitation.address.streetLine1;
  const cityLine = `${invitation.address.postalCode} ${invitation.address.city}`;

  return (
    <article className="rounded-3xl border border-saubio-forest/20 bg-white/80 p-5 shadow-soft-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
            {startAt}
          </p>
          <h3 className="text-lg font-semibold text-saubio-forest">
            {t(`services.${invitation.service}`, invitation.service.toUpperCase())}
          </h3>
          <p className="text-sm text-saubio-slate/70">
            {t('providerOffers.card.duration', '{{hours}} h · {{providers}} prestataire(s)', {
              hours: invitation.durationHours,
              providers: invitation.requiredProviders,
            })}
          </p>
        </div>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 text-sm text-saubio-slate/80">
          <MapPin className="mt-1 h-5 w-5 text-saubio-forest" />
          <div>
            <p className="font-semibold text-saubio-forest">{addressLine}</p>
            <p>{cityLine}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm text-saubio-slate/80">
          <Clock4 className="mt-1 h-5 w-5 text-saubio-forest" />
          <div>
            <p>{t('providerOffers.card.eco', { eco: ecoLabel })}</p>
            {typeof invitation.surfacesSquareMeters === 'number' ? (
              <p>
                {t('providerOffers.card.surface', '{{count}} m²', {
                  count: invitation.surfacesSquareMeters,
                })}
              </p>
            ) : null}
            {invitation.shortNoticeDepositCents ? (
              <p className="text-xs text-saubio-slate/60">
                {t('providerOffers.card.deposit', {
                  amount: formatEuro(invitation.shortNoticeDepositCents / 100),
                })}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {instructions ? (
        <p className="mt-4 rounded-2xl bg-saubio-mist/50 px-4 py-3 text-sm text-saubio-slate/80">
          {instructions}
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full border border-saubio-forest/20 px-5 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/50"
        >
          {t('providerOffers.actions.view')}
        </button>
        {showActions ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onRespond(invitation, 'decline')}
              className="rounded-full border border-saubio-forest/20 px-5 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('providerOffers.actions.decline')}
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onRespond(invitation, 'accept')}
              className="rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:bg-saubio-forest/60"
            >
              {t('providerOffers.actions.accept')}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

interface OfferDetailsDialogProps {
  invitation: ProviderBookingInvitation;
  onClose: () => void;
  onRespond: (invitation: ProviderBookingInvitation, action: InvitationAction) => void;
  isProcessing: boolean;
}

function OfferDetailsDialog({ invitation, onClose, onRespond, isProcessing }: OfferDetailsDialogProps) {
  const { t } = useTranslation();
  const contact = invitation.contact;
  const instructions =
    invitation.instructions ?? invitation.servicePreferences?.additionalInstructions ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-saubio-slate/70 px-4 py-6 backdrop-blur-sm">
      <SurfaceCard padding="lg" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto space-y-5">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/60">
              {formatDateTime(invitation.startAt)}
            </p>
            <h2 className="text-2xl font-semibold text-saubio-forest">
              {t(`services.${invitation.service}`, invitation.service.toUpperCase())}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest/50"
          >
            {t('providerOffers.actions.close')}
          </button>
        </header>

        <div className="grid gap-4 text-sm text-saubio-slate/80 sm:grid-cols-2">
          <DetailRow
            icon={<MapPin className="h-5 w-5 text-saubio-forest" />}
            title={t('providerOffers.details.address')}
            lines={[
              invitation.address.streetLine1,
              invitation.address.streetLine2,
              `${invitation.address.postalCode} ${invitation.address.city}`,
            ]}
          />
          <DetailRow
            icon={<Clock4 className="h-5 w-5 text-saubio-forest" />}
            title={t('providerOffers.details.timing')}
            lines={[
              formatDateTime(invitation.startAt),
              t('providerOffers.card.duration', '{{hours}} h', {
                hours: invitation.durationHours,
              }),
            ]}
          />
          {contact ? (
            <DetailRow
              icon={<Phone className="h-5 w-5 text-saubio-forest" />}
              title={t('providerOffers.details.contact')}
              lines={[
                [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
                  t('providerOffers.details.unknownContact'),
                contact.company,
                contact.phone,
              ]}
            />
          ) : null}
          <DetailRow
            icon={<NotebookText className="h-5 w-5 text-saubio-forest" />}
            title={t('providerOffers.details.summary')}
            lines={[
              t('providerOffers.details.eco', {
                eco:
                  invitation.ecoPreference === 'bio'
                    ? t('providerOffers.eco.bio')
                    : t('providerOffers.eco.standard'),
              }),
              typeof invitation.surfacesSquareMeters === 'number'
                ? t('providerOffers.details.surface', {
                    value: invitation.surfacesSquareMeters,
                  })
                : null,
              invitation.shortNoticeDepositCents
                ? t('providerOffers.card.deposit', {
                    amount: formatEuro(invitation.shortNoticeDepositCents / 100),
                  })
                : null,
            ]}
          />
        </div>

        {instructions ? (
          <div className="rounded-3xl bg-saubio-mist/40 px-4 py-3 text-sm text-saubio-slate/80">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
              {t('providerOffers.details.instructions')}
            </p>
            <p className="mt-2">{instructions}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onRespond(invitation, 'decline')}
            className="rounded-full border border-saubio-forest/20 px-5 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {t('providerOffers.actions.decline')}
            </span>
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onRespond(invitation, 'accept')}
            className="rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:bg-saubio-forest/60"
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {t('providerOffers.actions.accept')}
            </span>
          </button>
        </div>
      </SurfaceCard>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  title: string;
  lines: Array<string | null | undefined>;
}

function DetailRow({ icon, title, lines }: DetailRowProps) {
  const filtered = lines.filter((line): line is string => Boolean(line));
  if (filtered.length === 0) {
    return null;
  }
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">{title}</p>
        {filtered.map((line) => (
          <p key={`${title}-${line}`} className="text-saubio-slate/80">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function resolveStatus(invitation: ProviderBookingInvitation, t: TranslateFn) {
  if (invitation.status === 'pending' && !invitation.viewedAt) {
    return { label: t('providerOffers.status.pending'), tone: statusToneMap.new.tone };
  }
  if (invitation.status === 'pending' && invitation.viewedAt) {
    return { label: t('providerOffers.status.viewed'), tone: statusToneMap.viewed.tone };
  }
  if (invitation.status === 'accepted') {
    return { label: t('providerOffers.status.accepted'), tone: statusToneMap.accepted.tone };
  }
  if (invitation.status === 'declined') {
    return { label: t('providerOffers.status.declined'), tone: statusToneMap.declined.tone };
  }
  return { label: t('providerOffers.status.expired'), tone: statusToneMap.expired.tone };
}

const formatEnum = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
