'use client';

import { ChangeEvent, FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { CleaningFrequency, CreateBookingPayload, EcoPreference, ServiceCategory } from '@saubio/models';
import {
  ApiError,
  formatDateTime,
  formatEuro,
  useClaimBookingMutation,
  useCreateBookingMutation,
  useLoginMutation,
  useRegisterMutation,
  useSession,
} from '@saubio/utils';
import { LoadingIndicator, Pill, SurfaceCard } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { clearBookingPlannerState } from '../../../utils/bookingPlannerStorage';

type CheckoutSummary = {
  bookingId?: string;
  service?: string;
  frequency?: string;
  mode?: string;
  surfacesSquareMeters?: number;
  ecoPreference?: EcoPreference;
  leadTimeDays?: number;
  streetLine1?: string;
  streetLine2?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  startAt?: string;
  endAt?: string;
  durationHours?: number;
  shortNotice: boolean;
  requiredProviders?: number;
  providerName?: string;
  providerIds?: string[];
  currency: string;
  subtotalCents?: number;
  ecoCents?: number;
  extrasCents?: number;
  taxCents?: number;
  totalCents?: number;
  depositCents?: number;
};

const parseSummary = (params: ReturnType<typeof useSearchParams>): CheckoutSummary => {
  const parseMoney = (key: string) => {
    const raw = params.get(key);
    if (!raw) return undefined;
    const cents = parseInt(raw, 10);
    return Number.isFinite(cents) ? cents : undefined;
  };

  const parseNumber = (key: string) => {
    const raw = params.get(key);
    if (!raw) return undefined;
    const value = parseFloat(raw);
    return Number.isFinite(value) ? value : undefined;
  };

  const shortFlag = params.get('shortNotice');

  return {
    bookingId: params.get('bookingId') ?? undefined,
    service: params.get('service') ?? undefined,
    frequency: params.get('frequency') ?? undefined,
    mode: params.get('mode') ?? undefined,
    ecoPreference: (params.get('ecoPreference') as EcoPreference) ?? 'standard',
    surfacesSquareMeters: parseNumber('surfacesSquareMeters'),
    leadTimeDays: parseNumber('leadTimeDays'),
    streetLine1: params.get('streetLine1') ?? undefined,
    streetLine2: params.get('streetLine2') ?? undefined,
    postalCode: params.get('postalCode') ?? undefined,
    city: params.get('city') ?? undefined,
    countryCode: params.get('countryCode') ?? undefined,
    startAt: params.get('startAt') ?? undefined,
    endAt: params.get('endAt') ?? undefined,
    durationHours: parseNumber('hours'),
    shortNotice: shortFlag === '1' || shortFlag?.toLowerCase() === 'true',
    requiredProviders: parseNumber('requiredProviders'),
    providerName: params.get('providerName') ?? undefined,
    providerIds: params.getAll('providerIds').filter(Boolean) ?? undefined,
    currency: params.get('currency') ?? 'EUR',
    subtotalCents: parseMoney('subtotalCents'),
    ecoCents: parseMoney('ecoCents'),
    extrasCents: parseMoney('extrasCents'),
    taxCents: parseMoney('taxCents'),
    totalCents: parseMoney('totalCents'),
    depositCents: parseMoney('shortNoticeDepositCents') ?? parseMoney('depositCents') ?? undefined,
  };
};

function BookingAccountPageContent() {
  const searchParams = useSearchParams();
  const summary = useMemo(() => parseSummary(searchParams), [searchParams]);
  const bookingId = summary.bookingId;
  const guestToken = searchParams.get('guestToken') ?? undefined;
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const session = useSession();
  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();
  const claimMutation = useClaimBookingMutation();
  const createBookingMutation = useCreateBookingMutation();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [claimCompleted, setClaimCompleted] = useState(!guestToken);

  const paymentUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (bookingId) params.set('bookingId', bookingId);
    if (guestToken) params.set('guestToken', guestToken);
    const query = params.toString();
    return `/client/checkout/payment${query ? `?${query}` : ''}`;
  }, [bookingId, guestToken]);

  useEffect(() => {
    if (summary.bookingId) {
      clearBookingPlannerState();
    }
  }, [summary.bookingId]);

  useEffect(() => {
    if (!session.user || !bookingId) {
      return;
    }
    if (!guestToken || claimCompleted || claimMutation.isPending) {
      if (!guestToken) {
        setClaimCompleted(true);
      }
      return;
    }
    claimMutation.mutate(
      { id: bookingId, guestToken },
      {
        onSuccess: () => setClaimCompleted(true),
        onError: (error) => {
          if (error instanceof ApiError) {
            const message = (error.body as { message?: string })?.message ?? error.message ?? null;
            if (message === 'BOOKING_ALREADY_ASSIGNED') {
              setClaimCompleted(true);
              return;
            }
            setFormError(message ?? t('system.error.generic'));
          } else {
            setFormError(t('system.error.generic'));
          }
        },
      }
    );
  }, [session.user, bookingId, guestToken, claimCompleted, claimMutation, t]);

  useEffect(() => {
    if (session.user && bookingId && claimCompleted) {
      router.replace(paymentUrl);
    }
  }, [session.user, bookingId, claimCompleted, paymentUrl, router]);

  const handleRegisterChange =
    (key: keyof typeof registerForm) => (event: ChangeEvent<HTMLInputElement>) => {
      setRegisterForm((state) => ({ ...state, [key]: event.target.value }));
    };

  const handleLoginChange =
    (key: keyof typeof loginForm) => (event: ChangeEvent<HTMLInputElement>) => {
      setLoginForm((state) => ({ ...state, [key]: event.target.value }));
    };

  const payloadFromPlanner = useMemo<CreateBookingPayload | null>(() => {
    if (bookingId) {
      return null;
    }
    if (!summary.startAt || !summary.service) {
      return null;
    }
    const start = new Date(summary.startAt);
    const end = summary.endAt ? new Date(summary.endAt) : new Date(start.getTime() + ((summary.durationHours ?? 2) * 60 * 60 * 1000));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }
    const service = (summary.service as ServiceCategory) ?? 'residential';
    const frequency = (summary.frequency as CleaningFrequency) ?? 'once';
    const eco = summary.ecoPreference === 'bio' ? 'bio' : ('standard' as EcoPreference);
    const requiredProviders = summary.requiredProviders ?? (summary.shortNotice ? 1 : 2);
    const addressLine = summary.streetLine1?.trim().length ? summary.streetLine1 : 'Adresse à confirmer';

    return {
      address: {
        streetLine1: addressLine,
        streetLine2: summary.streetLine2 ?? undefined,
        postalCode: summary.postalCode ?? '00000',
        city: summary.city ?? 'Berlin',
        countryCode: summary.countryCode ?? 'DE',
      },
      service,
      surfacesSquareMeters: summary.surfacesSquareMeters ?? 80,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      frequency,
      mode: summary.shortNotice ? 'smart_match' : summary.mode === 'manual' ? 'manual' : 'smart_match',
      ecoPreference: eco,
      requiredProviders,
      providerIds: summary.providerIds,
      leadTimeDays: summary.leadTimeDays ?? undefined,
      shortNotice: summary.shortNotice,
      estimatedDepositCents: summary.depositCents ?? undefined,
    };
  }, [bookingId, summary]);

  const createBookingFromPlanner = useCallback(() => {
    if (bookingId) {
      router.push(paymentUrl);
      return;
    }
    if (!payloadFromPlanner) {
      setFormError(t('checkoutAccount.errors.restart'));
      return;
    }
    createBookingMutation.mutate(payloadFromPlanner, {
      onSuccess: (data) => {
        clearBookingPlannerState();
        router.push(`/client/checkout/payment?bookingId=${data.id}`);
      },
      onError: (error) => {
        const message = (error as { message?: string })?.message ?? t('system.error.generic');
        setFormError(message);
      },
    });
  }, [bookingId, payloadFromPlanner, router, paymentUrl, createBookingMutation, t]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (mode === 'register') {
      const preferredLocale = (['de', 'en', 'fr'].includes(i18n.language)
        ? i18n.language
        : i18n.language.split('-')[0]) as 'de' | 'en' | 'fr';
      registerMutation.mutate(
        {
          email: registerForm.email,
          password: registerForm.password,
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          phone: registerForm.phone || undefined,
          roles: ['client'],
          preferredLocale,
        },
        {
          onSuccess: () => createBookingFromPlanner(),
          onError: (error) => {
            const message = (error as { message?: string })?.message ?? t('system.error.generic');
            setFormError(message);
          },
        }
      );
      return;
    }

    loginMutation.mutate(
      { email: loginForm.email, password: loginForm.password },
      {
        onSuccess: () => createBookingFromPlanner(),
        onError: (error) => {
          const message = (error as { message?: string })?.message ?? t('system.error.generic');
          setFormError(message);
        },
      }
    );
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setFormError(t('checkoutAccount.oauth.comingSoon', {
      provider: provider === 'google' ? 'Google' : 'Apple',
    }));
  };

  const isSubmitting = mode === 'register' ? registerMutation.isPending : loginMutation.isPending;
  const showMissingBooking = !bookingId && !payloadFromPlanner;

  return (
    <div className="space-y-6">
      {showMissingBooking ? (
        <SurfaceCard>
          <ErrorState
            title={t('checkoutAccount.errors.missingBooking')}
            description={t('checkoutAccount.errors.restart')}
            onRetry={() => router.push('/bookings/new')}
          />
        </SurfaceCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <SurfaceCard variant="soft" padding="lg" className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
                {t('checkoutAccount.badge')}
              </p>
              <h1 className="text-3xl font-semibold text-saubio-forest">
                {t('checkoutAccount.title')}
              </h1>
              <p className="text-sm text-saubio-slate/70">{t('checkoutAccount.subtitle')}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-saubio-slate/80">
                <span>
                  {mode === 'register'
                    ? t('checkoutAccount.existingAccount')
                    : t('checkoutAccount.newHere')}
                </span>
                <button
                  type="button"
                  className="font-semibold text-saubio-forest underline"
                  onClick={() => {
                    setFormError(null);
                    setMode((state) => (state === 'register' ? 'login' : 'register'));
                  }}
                >
                  {mode === 'register'
                    ? t('checkoutAccount.switchToLogin')
                    : t('checkoutAccount.switchToRegister')}
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-saubio-slate">
                    <span className="font-semibold">{t('auth.register.firstName')}</span>
                    <input
                      required
                      value={registerForm.firstName}
                      onChange={handleRegisterChange('firstName')}
                      className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm text-saubio-forest outline-none focus:border-saubio-forest"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-saubio-slate">
                    <span className="font-semibold">{t('auth.register.lastName')}</span>
                    <input
                      required
                      value={registerForm.lastName}
                      onChange={handleRegisterChange('lastName')}
                      className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm text-saubio-forest outline-none focus:border-saubio-forest"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-saubio-slate sm:col-span-2">
                    <span className="font-semibold">{t('auth.register.phone')}</span>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={handleRegisterChange('phone')}
                      className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm text-saubio-forest outline-none focus:border-saubio-forest"
                    />
                  </label>
                </div>
              ) : null}
              <label className="space-y-2 text-sm text-saubio-slate">
                <span className="font-semibold">{t('auth.login.email')}</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={mode === 'register' ? registerForm.email : loginForm.email}
                  onChange={
                    mode === 'register'
                      ? handleRegisterChange('email')
                      : handleLoginChange('email')
                  }
                  className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm text-saubio-forest outline-none focus:border-saubio-forest"
                />
              </label>
              <label className="space-y-2 text-sm text-saubio-slate">
                <span className="font-semibold">{t('auth.login.password')}</span>
                <input
                  type="password"
                  required
                  value={mode === 'register' ? registerForm.password : loginForm.password}
                  onChange={
                    mode === 'register'
                      ? handleRegisterChange('password')
                      : handleLoginChange('password')
                  }
                  className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-sm text-saubio-forest outline-none focus:border-saubio-forest"
                />
              </label>
              {formError ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-saubio-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:bg-saubio-forest/50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingIndicator tone="light" size="xs" />
                    {mode === 'register'
                      ? t('checkoutAccount.actions.register')
                      : t('checkoutAccount.actions.login')}
                  </span>
                ) : mode === 'register' ? (
                  t('checkoutAccount.actions.register')
                ) : (
                  t('checkoutAccount.actions.login')
                )}
              </button>
              <div className="space-y-2">
                <p className="text-center text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                  {t('checkoutAccount.oauth.title', 'Ou continuer avec')}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/40"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('apple')}
                    className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/40"
                  >
                    Apple
                  </button>
                </div>
              </div>
            </form>
          </SurfaceCard>
          <SurfaceCard padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
                  {t('checkoutAccount.summary.title')}
                </p>
                <p className="text-sm text-saubio-slate/70">
                  {t('checkoutAccount.summary.subtitle', 'Vérifiez votre récapitulatif avant de payer')}
                </p>
              </div>
              {summary.shortNotice ? <Pill tone="sun">{t('checkoutAccount.summary.shortNotice')}</Pill> : null}
            </div>
            <div className="space-y-4 text-sm text-saubio-slate/80">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                  {t('checkoutAccount.summary.schedule')}
                </p>
                <p className="font-semibold text-saubio-forest">
                  {summary.startAt
                    ? formatDateTime(new Date(summary.startAt))
                    : t('checkoutAccount.summary.pending')}
                </p>
                {summary.durationHours ? (
                  <p className="text-xs text-saubio-slate/60">
                    {t('checkoutAccount.summary.duration', {
                      hours: summary.durationHours.toFixed(1),
                    })}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                  {t('checkoutAccount.summary.address')}
                </p>
                <p className="font-semibold text-saubio-forest">
                  {[summary.streetLine1, summary.streetLine2].filter(Boolean).join(' ')}
                </p>
                <p className="text-xs text-saubio-slate/60">
                  {[summary.postalCode, summary.city, summary.countryCode]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('checkoutAccount.summary.service')}</span>
                <span className="font-semibold text-saubio-forest">
                  {summary.service ?? '—'} · {summary.frequency ?? '—'}
                </span>
              </div>
              {summary.providerName ? (
                <div className="flex items-center justify-between">
                  <span>{t('checkoutAccount.summary.provider')}</span>
                  <span className="font-semibold text-saubio-forest">{summary.providerName}</span>
                </div>
              ) : null}
              <div className="space-y-2 rounded-3xl bg-saubio-mist/30 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                  <span>{t('checkoutAccount.summary.breakdown')}</span>
                  <span>{summary.currency}</span>
                </div>
                <div className="space-y-2 text-sm">
                  {summary.subtotalCents ? (
                    <div className="flex items-center justify-between">
                      <span>{t('checkoutAccount.summary.subtotal')}</span>
                      <span>{formatEuro(summary.subtotalCents / 100)}</span>
                    </div>
                  ) : null}
                  {summary.ecoCents ? (
                    <div className="flex items-center justify-between">
                      <span>{t('checkoutAccount.summary.eco')}</span>
                      <span>{formatEuro(summary.ecoCents / 100)}</span>
                    </div>
                  ) : null}
                  {summary.extrasCents ? (
                    <div className="flex items-center justify-between">
                      <span>{t('checkoutAccount.summary.extras')}</span>
                      <span>{formatEuro(summary.extrasCents / 100)}</span>
                    </div>
                  ) : null}
                  {summary.taxCents ? (
                    <div className="flex items-center justify-between">
                      <span>{t('checkoutAccount.summary.tax')}</span>
                      <span>{formatEuro(summary.taxCents / 100)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between text-base font-semibold text-saubio-forest">
                    <span>{t('checkoutAccount.summary.total')}</span>
                    <span>{summary.totalCents ? formatEuro(summary.totalCents / 100) : '—'}</span>
                  </div>
                </div>
              </div>
              {summary.depositCents ? (
                <div className="rounded-2xl bg-saubio-forest/5 p-3 text-xs text-saubio-forest">
                  {t('checkoutAccount.summary.deposit', {
                    amount: formatEuro(summary.depositCents / 100),
                  })}
                </div>
              ) : null}
              <p className="text-xs text-saubio-slate/60">
                {summary.shortNotice
                  ? t(
                      'checkoutAccount.summary.shortNoticeInfo',
                      'Cette demande sera envoyée immédiatement à nos prestataires disponibles. Vous serez notifié dès qu’un profil l’accepte.'
                    )
                  : t(
                      'checkoutAccount.summary.longNoticeInfo',
                      'Vous confirmerez manuellement votre prestataire avant le paiement.'
                    )}
              </p>
            </div>
          </SurfaceCard>
        </div>
      )}
    </div>
  );
}

export default function BookingAccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-saubio-slate/60">Chargement…</div>}>
      <BookingAccountPageContent />
    </Suspense>
  );
}
