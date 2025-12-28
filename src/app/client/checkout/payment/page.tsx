'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  bookingDetailQueryOptions,
  formatDateTime,
  formatEuro,
  useCheckoutPaymentIntent,
  useSession,
} from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';
import { LoadingIndicator, Pill, SurfaceCard } from '@saubio/ui';
import { clearBookingPlannerState } from '../../../../utils/bookingPlannerStorage';

function CheckoutPaymentPageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const router = useRouter();
  const { t } = useTranslation();
  const session = useSession();

  useEffect(() => {
    clearBookingPlannerState();
  }, []);

  const bookingQuery = useQuery({
    ...bookingDetailQueryOptions(bookingId ?? ''),
    enabled: Boolean(bookingId && session.user),
  });

  const paymentIntentQuery = useCheckoutPaymentIntent(
    bookingId && session.user ? bookingId : null
  );

  const checkoutUrl = paymentIntentQuery.data?.checkoutUrl ?? null;

  const summary = useMemo(() => {
    const booking = bookingQuery.data;
    if (!booking) {
      return null;
    }
    return {
      booking,
      depositCents: booking.shortNotice ? booking.shortNoticeDepositCents ?? 0 : 0,
      statusLabel: t(`bookingStatus.${booking.status}`, booking.status),
      address: [
        booking.address.streetLine1,
        booking.address.streetLine2,
        `${booking.address.postalCode} ${booking.address.city}`,
        booking.address.countryCode,
      ]
        .filter(Boolean)
        .join(' · '),
      durationHours: Math.max(
        0,
        (Date.parse(booking.endAt) - Date.parse(booking.startAt)) / 3600000
      ),
      amountCents: booking.pricing?.totalCents ?? 0,
    };
  }, [bookingQuery.data, t]);

  const loginUrl = useMemo(() => {
    const current = `/client/checkout/payment${searchParams.toString() ? `?${searchParams}` : ''}`;
    return `/login?redirect=${encodeURIComponent(current)}`;
  }, [searchParams]);

  const requiresPayment = useMemo(() => {
    if (typeof paymentIntentQuery.data?.required === 'boolean') {
      return paymentIntentQuery.data.required;
    }
    if (summary?.booking.shortNotice || (summary?.depositCents ?? 0) > 0) {
      return true;
    }
    return false;
  }, [paymentIntentQuery.data?.required, summary?.booking.shortNotice, summary?.depositCents]);

  const handleCheckoutRedirect = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  const renderPaymentForm = () => {
    const isLoadingPayment = paymentIntentQuery.isLoading || bookingQuery.isLoading;

    if (!requiresPayment && paymentIntentQuery.isSuccess) {
      return (
        <div className="space-y-3 rounded-3xl border border-saubio-forest/15 bg-white/70 p-5 text-sm text-saubio-slate/80">
          <p className="font-semibold text-saubio-forest">
            {t('checkoutPayment.actions.standardTitle', 'Aucun paiement anticipé')}
          </p>
          <p>
            {t(
              'checkoutPayment.actions.standardDescription',
              'Votre réservation est enregistrée. Aucun paiement anticipé n’est requis pour ce créneau.'
            )}
          </p>
          <Link
            href={`/client/bookings/${bookingId}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white"
          >
            {t('checkoutPayment.help.viewBooking', 'Voir la réservation')}
          </Link>
        </div>
      );
    }

    if (checkoutUrl) {
      return (
        <div className="space-y-4 rounded-3xl border border-saubio-forest/15 bg-white/80 p-5 text-sm text-saubio-slate/80">
          <p className="text-sm">
            {t(
              'checkoutPayment.actions.mollieDescription',
              'Cliquez sur le bouton ci-dessous pour finaliser le paiement sécurisé. Vous serez redirigé vers Mollie puis renvoyé automatiquement vers Saubio.'
            )}
          </p>
          <button
            type="button"
            onClick={handleCheckoutRedirect}
            className="inline-flex w-full items-center justify-center rounded-full bg-saubio-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss"
          >
            {t('checkoutPayment.actions.openCheckout', 'Procéder au paiement sécurisé')}
          </button>
          <p className="text-xs text-saubio-slate/60">
            {t(
              'checkoutPayment.actions.mollieHint',
              'Une fois le paiement confirmé, cette page s’actualisera automatiquement.'
            )}
          </p>
        </div>
      );
    }

    if (isLoadingPayment) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingIndicator tone="dark" />
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
        {t(
          'checkoutPayment.errors.loadFailed',
          'Impossible de préparer le paiement. Contactez notre équipe si le problème persiste.'
        )}
      </div>
    );
  };

  return (
    <main className="bg-saubio-mist/40 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
          {!bookingId ? (
            <SurfaceCard>
              <ErrorState
                title={t('checkoutPayment.errors.missingBooking', 'Réservation introuvable')}
                description={t('checkoutPayment.errors.restart', 'Veuillez relancer le parcours de réservation.')}
                onRetry={() => router.push('/bookings/new')}
              />
            </SurfaceCard>
          ) : !session.user ? (
            <SurfaceCard>
              <div className="space-y-3 text-center text-sm text-saubio-slate/70">
                <p>{t('checkoutPayment.errors.authRequired')}</p>
                <Link
                  href={loginUrl}
                  className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white"
                >
                  {t('checkoutPayment.actions.login', 'Se connecter')}
                </Link>
              </div>
            </SurfaceCard>
          ) : bookingQuery.isLoading || paymentIntentQuery.isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <LoadingIndicator tone="dark" />
            </div>
          ) : bookingQuery.isError ? (
            <SurfaceCard>
              <ErrorState
                title={t('checkoutPayment.errors.loadFailed', 'Impossible de charger la réservation.')}
                description={t('system.error.generic')}
                onRetry={() => bookingQuery.refetch()}
              />
            </SurfaceCard>
          ) : summary ? (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <SurfaceCard variant="soft" padding="lg" className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
                      {t('checkoutPayment.badge', 'Paiement sécurisé')}
                    </p>
                    <h1 className="text-3xl font-semibold text-saubio-forest">
                      {t('checkoutPayment.title', 'Règlement de votre mission')}
                    </h1>
                    <p className="text-sm text-saubio-slate/70">
                      {t(
                        'checkoutPayment.subtitle',
                        'Validez le blocage short notice ou consultez les derniers détails avant la mission.'
                      )}
                    </p>
                  </div>
                  <Pill tone="sun">{summary.statusLabel}</Pill>
                </div>
                <dl className="space-y-4 rounded-3xl bg-white/60 p-4 text-sm text-saubio-slate/80">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                      {t('checkoutPayment.summary.bookingRef')}
                    </dt>
                    <dd className="font-semibold text-saubio-forest">#{summary.booking.id.slice(-8)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                      {t('checkoutPayment.summary.schedule')}
                    </dt>
                    <dd className="font-semibold text-saubio-forest">
                      {formatDateTime(summary.booking.startAt)}
                    </dd>
                    <dd className="text-xs text-saubio-slate/60">
                      {t('checkoutPayment.summary.duration', { hours: summary.durationHours.toFixed(1) })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                      {t('bookingForm.address')}
                    </dt>
                    <dd className="font-semibold text-saubio-forest">{summary.address}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                      {t('checkoutPayment.summary.amount')}
                    </dt>
                    <dd className="text-lg font-semibold text-saubio-forest">
                      {formatEuro(summary.amountCents / 100)}
                    </dd>
                    {summary.booking.shortNotice && summary.depositCents ? (
                      <dd className="text-xs text-saubio-slate/60">
                        {t('checkoutPayment.summary.deposit', {
                          amount: formatEuro(summary.depositCents / 100),
                        })}
                      </dd>
                    ) : null}
                  </div>
                </dl>
                {renderPaymentForm()}
              </SurfaceCard>
              <SurfaceCard variant="soft" padding="lg" className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
                    {t('checkoutPayment.help.title')}
                  </p>
                  <p className="text-sm text-saubio-slate/70">
                    {t(
                      'checkoutPayment.help.description',
                      'Consultez votre réservation ou contactez le support à tout moment.'
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <Link
                    href={`/client/bookings/${bookingId}`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-saubio-forest/30 px-4 py-2 text-sm font-semibold text-saubio-forest"
                  >
                    {t('checkoutPayment.help.viewBooking')}
                  </Link>
                  <Link
                    href="/client/support"
                    className="inline-flex w-full items-center justify-center rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white"
                  >
                    {t('bookingDetail.supportCta')}
                  </Link>
                </div>
              </SurfaceCard>
            </div>
        ) : null}
      </div>
    </main>
  );
}

export default function CheckoutPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-saubio-slate/60">Chargement…</div>}>
      <CheckoutPaymentPageContent />
    </Suspense>
  );
}
