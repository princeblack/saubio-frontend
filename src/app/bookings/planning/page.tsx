'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { priceEstimateQueryOptions, formatEuro, formatDateTime } from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard } from '@saubio/ui';

const SERVICE_OPTIONS = [
  { id: 'residential', label: 'Nettoyage résidentiel' },
  { id: 'office', label: 'Bureaux & espaces pros' },
  { id: 'industrial', label: 'Sites industriels' },
  { id: 'windows', label: 'Vitrines & vitres' },
  { id: 'disinfection', label: 'Désinfection' },
  { id: 'eco_plus', label: 'Éco +' },
] as const;

const FREQUENCY_OPTIONS = [
  { id: 'once', label: 'Une seule fois', perk: 'Flexibilité complète' },
  { id: 'weekly', label: 'Chaque semaine', perk: 'Jusqu’à -12% & créneau dédié' },
  { id: 'biweekly', label: 'Toutes les 2 semaines', perk: 'Jusqu’à -8%' },
  { id: 'monthly', label: 'Tous les mois', perk: 'Idéal pour les suivis' },
  { id: 'contract', label: 'Contrat sur mesure', perk: 'Pour les entreprises' },
] as const;

const ECO_OPTIONS = [
  { id: 'standard', label: 'Standard' },
  { id: 'bio', label: 'BIO / produits verts' },
] as const;

const PLATFORM_FEE_CENTS = 300;

const toInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const getDefaultStartAt = () => {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(9, 0, 0, 0);
  return toInputValue(now);
};

const clampToWindow = (value: string) => {
  if (!value) return value;
  const current = new Date(value);
  if (Number.isNaN(current.getTime())) {
    return value;
  }
  const opening = new Date(current);
  opening.setHours(7, 0, 0, 0);
  const closing = new Date(current);
  closing.setHours(19, 30, 0, 0);
  if (current < opening) {
    return toInputValue(opening);
  }
  if (current > closing) {
    return toInputValue(closing);
  }
  return value;
};

const computeEndDate = (startValue: string, hours: number) => {
  if (!startValue) return null;
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) {
    return null;
  }
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  const end = new Date(start);
  end.setHours(end.getHours() + wholeHours);
  end.setMinutes(end.getMinutes() + minutes);
  return end;
};

function BookingPlanningPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPostal = searchParams?.get('postalCode') ?? '';

  const [postalCode, setPostalCode] = useState(initialPostal);
  const [service, setService] = useState<(typeof SERVICE_OPTIONS)[number]['id']>('residential');
  const [frequency, setFrequency] = useState<(typeof FREQUENCY_OPTIONS)[number]['id']>('once');
  const [hours, setHours] = useState(2);
  const [surface, setSurface] = useState('');
  const [startAt, setStartAt] = useState(getDefaultStartAt());
  const [ecoPreference, setEcoPreference] = useState<(typeof ECO_OPTIONS)[number]['id']>('standard');
  const [couponCode, setCouponCode] = useState('');

  const sanitizedPostal = postalCode.trim();
  const estimateQuery = useQuery({
    ...priceEstimateQueryOptions({
      postalCode: sanitizedPostal,
      hours,
      service,
    }),
    enabled: sanitizedPostal.length >= 4,
  });

  const estimate = estimateQuery.data;
  const minTotalWithFee =
    typeof estimate?.minTotalCents === 'number'
      ? (estimate.minTotalCents + PLATFORM_FEE_CENTS) / 100
      : null;
  const maxTotalWithFee =
    typeof estimate?.maxTotalCents === 'number'
      ? (estimate.maxTotalCents + PLATFORM_FEE_CENTS) / 100
      : null;
  const minStartAt = useMemo(() => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    minDate.setHours(7, 0, 0, 0);
    return toInputValue(minDate);
  }, []);

  const leadTimeDays = useMemo(() => {
    if (!startAt) return 0;
    const start = new Date(startAt);
    if (Number.isNaN(start.getTime())) {
      return 0;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = start.getTime() - today.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [startAt]);

  const isShortNotice = leadTimeDays <= 1;

  const averageHourlyCents = useMemo(() => {
    if (
      typeof estimate?.minHourlyRateCents === 'number' &&
      typeof estimate?.maxHourlyRateCents === 'number'
    ) {
      return Math.round((estimate.minHourlyRateCents + estimate.maxHourlyRateCents) / 2);
    }
    return estimate?.minHourlyRateCents ?? estimate?.maxHourlyRateCents ?? null;
  }, [estimate]);

  const depositHoldCents =
    isShortNotice && averageHourlyCents
      ? Math.round(averageHourlyCents * hours + PLATFORM_FEE_CENTS)
      : null;

  const endAt = useMemo(() => computeEndDate(startAt, hours), [startAt, hours]);

const continueDisabled = sanitizedPostal.length < 4 || !startAt;

  const handleStartAtChange = (value: string) => {
    const clamped = clampToWindow(value);
    const min = new Date(minStartAt);
    const nextValue = new Date(clamped);
    if (Number.isNaN(nextValue.getTime()) || nextValue < min) {
      setStartAt(minStartAt);
      return;
    }
    setStartAt(clamped);
  };

  const [shortNoticeDialogOpen, setShortNoticeDialogOpen] = useState(false);
  const pendingShortNoticeParams = useRef<string | null>(null);

  const buildSearchParams = () => {
    const params = new URLSearchParams({
      postalCode: sanitizedPostal,
      service,
      frequency,
      hours: String(hours),
      ecoPreference,
      startAt,
      leadTimeDays: String(leadTimeDays),
      shortNotice: isShortNotice ? '1' : '0',
    });
    if (endAt) {
      params.set('endAt', endAt.toISOString());
    }
    if (surface) {
      params.set('surfacesSquareMeters', surface);
    }
    if (couponCode.trim()) {
      params.set('coupon', couponCode.trim());
    }
    if (depositHoldCents) {
      params.set('estimatedDepositCents', String(Math.round(depositHoldCents)));
    }
    return params;
  };

  const handleContinue = () => {
    if (continueDisabled) {
      return;
    }
    const params = buildSearchParams();
    const targetQuery = params.toString();
    if (isShortNotice) {
      pendingShortNoticeParams.current = targetQuery;
      setShortNoticeDialogOpen(true);
      return;
    }
    router.push(`/bookings/select-provider?${targetQuery}`);
  };

  const confirmShortNoticeFlow = () => {
    const next = pendingShortNoticeParams.current;
    setShortNoticeDialogOpen(false);
    if (!next) {
      return;
    }
    router.push(`/bookings/account?${next}`);
  };

  const cancelShortNoticeFlow = () => {
    pendingShortNoticeParams.current = null;
    setShortNoticeDialogOpen(false);
  };

  const summaryRange =
    minTotalWithFee && maxTotalWithFee
      ? `${formatEuro(minTotalWithFee)} - ${formatEuro(maxTotalWithFee)}`
      : t('bookingPlanner.summary.waiting', 'Estimation en cours…');

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <header className="space-y-4 text-center">
        <SectionTitle as="h1" size="large">
          {t('bookingPlanner.title', 'Planifiez votre prochain nettoyage')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'bookingPlanner.subtitle',
            'Renseignez le lieu, la fréquence et la durée. Nous estimons instantanément le tarif selon les prestataires disponibles dans votre zone.'
          )}
        </SectionDescription>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SurfaceCard className="space-y-6" padding="lg">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
                {t('bookingPlanner.sections.area', 'Zone & service')}
              </p>
              <SectionDescription className="mt-1 text-sm">
                {t(
                  'bookingPlanner.sections.areaHint',
                  'Nous cherchons des prestataires actifs autour de votre code postal.'
                )}
              </SectionDescription>
            </div>
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.postal', 'Code postal')}
              </span>
              <input
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                placeholder="10117"
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
              />
            </label>
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.service', 'Type de service')}
              </span>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((option) => {
                  const isSelected = service === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setService(option.id)}
                      className={`rounded-2xl border px-4 py-2 text-sm transition ${
                        isSelected
                          ? 'border-saubio-forest bg-saubio-forest/10 text-saubio-forest'
                          : 'border-saubio-forest/15 text-saubio-slate/80 hover:border-saubio-forest/40'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.frequency', 'Fréquence')}
              </span>
              <div className="space-y-2">
                {FREQUENCY_OPTIONS.map((option) => {
                  const isSelected = option.id === frequency;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFrequency(option.id)}
                      className={`flex w-full flex-col rounded-2xl border px-4 py-3 text-left transition ${
                        isSelected
                          ? 'border-saubio-forest bg-saubio-forest/5 text-saubio-forest'
                          : 'border-saubio-forest/10 text-saubio-slate/80 hover:border-saubio-forest/40'
                      }`}
                    >
                      <span className="text-sm font-semibold">{option.label}</span>
                      <span className="text-xs text-saubio-slate/60">{option.perk}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.surface', 'Surface estimée (optionnel)')}
              </span>
              <input
                type="number"
                min={0}
                value={surface}
                onChange={(event) => setSurface(event.target.value)}
                placeholder={t('bookingPlanner.fields.surfacePlaceholder', 'Ex: 85 m²')}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
              />
            </label>
          </SurfaceCard>

          <SurfaceCard className="space-y-6" padding="lg">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
                {t('bookingPlanner.sections.schedule', 'Durée & horaire')}
              </p>
              <SectionDescription className="mt-1 text-sm">
                {t(
                  'bookingPlanner.sections.scheduleHint',
                  'Les prestations peuvent démarrer entre 7h00 et 19h30.'
                )}
              </SectionDescription>
            </div>
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.hours', 'Durée souhaitée')}
              </span>
              <input
                type="number"
                min={1}
                max={12}
                step={0.5}
                value={hours}
                onChange={(event) => setHours(Number(event.target.value) || 1)}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
              />
              <span className="text-xs text-saubio-slate/60">
                {t('bookingPlanner.fields.hoursHelp', 'Fixé directement avec votre prestataire.')}
              </span>
            </label>
            <div className="flex items-center justify-between rounded-2xl border border-saubio-forest/10 px-4 py-3 text-sm">
              <span className="text-saubio-slate/80">
                {t('bookingPlanner.fields.sameDay', 'Besoin le jour-même ?')}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t(
                  'bookingPlanner.fields.sameDayDisabled',
                  'Les demandes débutent au minimum le lendemain.'
                )}
              </span>
            </div>
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.startAt', 'Date et heure')}
              </span>
              <input
                type="datetime-local"
                value={startAt}
                min={minStartAt}
                onChange={(event) => handleStartAtChange(event.target.value)}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
              />
            </label>
          </SurfaceCard>

          <SurfaceCard className="space-y-6" padding="lg">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
                {t('bookingPlanner.sections.preferences', 'Préférences & avantages')}
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.eco', 'Préférence éco')}
              </span>
              <div className="flex flex-wrap gap-2">
                {ECO_OPTIONS.map((option) => {
                  const isSelected = option.id === ecoPreference;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setEcoPreference(option.id)}
                      className={`rounded-2xl border px-4 py-2 text-sm transition ${
                        isSelected
                          ? 'border-saubio-forest bg-saubio-forest/10 text-saubio-forest'
                          : 'border-saubio-forest/15 text-saubio-slate/80 hover:border-saubio-forest/40'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.coupon', 'Code promo (optionnel)')}
              </span>
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="WELCOME10"
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 uppercase tracking-wider outline-none focus:border-saubio-forest"
              />
              <span className="text-xs text-saubio-slate/60">
                {t('bookingPlanner.fields.couponHelp', 'Il sera appliqué avant le paiement.')}
              </span>
            </label>
          </SurfaceCard>
        </div>
        <aside className="space-y-4">
          <SurfaceCard padding="lg" className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
              {t('bookingPlanner.summary.title', 'Votre estimation')}
            </p>
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                isShortNotice
                  ? 'border-amber-200 bg-amber-50 text-saubio-slate/80'
                  : 'border-saubio-forest/20 bg-saubio-forest/5 text-saubio-forest'
              }`}
            >
              {isShortNotice
                ? t(
                    'bookingPlanner.summary.shortNotice',
                    'Préavis court ({{days}} jour(s)) : nous notifierons automatiquement les prestataires couvrant votre zone. Le premier qui accepte confirme la mission.',
                    { days: leadTimeDays }
                  )
                : t(
                    'bookingPlanner.summary.standardLeadTime',
                    'Préavis confortable : vous pourrez choisir votre prestataire favori à l’étape suivante.'
                  )}
            </div>
            <div className="space-y-3 text-sm text-saubio-slate/80">
              <div className="flex items-center justify-between">
                <span>{t('bookingPlanner.summary.zone', 'Zone')}</span>
                <span className="font-semibold text-saubio-forest">
                  {sanitizedPostal || t('bookingPlanner.summary.pending', 'À renseigner')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('bookingPlanner.summary.service', 'Service')}</span>
                <span className="font-semibold text-saubio-forest">
                  {SERVICE_OPTIONS.find((option) => option.id === service)?.label ?? ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('bookingPlanner.summary.frequency', 'Fréquence')}</span>
                <span className="font-semibold text-saubio-forest">
                  {FREQUENCY_OPTIONS.find((option) => option.id === frequency)?.label ?? ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('bookingPlanner.summary.duration', 'Durée')}</span>
                <span className="font-semibold text-saubio-forest">{hours}h</span>
              </div>
              <div className="flex flex-col">
                <span>{t('bookingPlanner.summary.slot', 'Créneau demandé')}</span>
                <span className="font-semibold text-saubio-forest">
                  {startAt
                    ? `${formatDateTime(new Date(startAt))}${
                        endAt ? ` → ${formatDateTime(endAt)}` : ''
                      }`
                    : t('bookingPlanner.summary.pending', 'À renseigner')}
                </span>
              </div>
            <div className="rounded-2xl border border-saubio-forest/15 bg-saubio-mist/40 px-4 py-3">
              <p className="text-xs text-saubio-slate/60">
                {estimateQuery.isFetching
                  ? t('bookingPlanner.summary.loading', 'Calcul en cours…')
                  : t('bookingPlanner.summary.rangeLabel', 'Fourchette estimée (prestataire + frais)')}
              </p>
              <p className="text-xl font-semibold text-saubio-forest">{summaryRange}</p>
              <p className="text-xs text-saubio-slate/60">
                {t('bookingPlanner.summary.fee', 'Inclut 3€ de frais plateforme.')}
              </p>
              {isShortNotice ? (
                <p className="mt-2 text-xs text-saubio-slate/70">
                  {depositHoldCents
                    ? t(
                        'bookingPlanner.summary.deposit',
                        'Un blocage temporaire d’environ {{amount}} sera effectué lors de la confirmation.',
                        { amount: formatEuro(depositHoldCents / 100) }
                      )
                    : t(
                        'bookingPlanner.summary.depositFallback',
                        'Un blocage temporaire sera effectué lors de la confirmation.'
                      )}
                </p>
              ) : null}
              {estimate?.providersConsidered ? (
                <p className="text-xs text-saubio-slate/50">
                  {t('bookingPlanner.summary.providers', {
                    defaultValue: '{{count}} prestataire(s) actifs dans la zone.',
                    count: estimate.providersConsidered,
                    })}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={continueDisabled}
              className="w-full rounded-full bg-saubio-forest px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-saubio-forest/40"
            >
              {t('bookingPlanner.summary.cta', 'Continuer vers la réservation')}
            </button>
            <p className="text-center text-xs text-saubio-slate/50">
              {t(
                'bookingPlanner.summary.loginHint',
                'Vous pourrez créer un compte ou vous connecter à l’étape suivante.'
              )}
            </p>
          </SurfaceCard>
        </aside>
      </div>
      {shortNoticeDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-saubio-slate/70 px-4 py-6 backdrop-blur-sm">
          <SurfaceCard padding="lg" className="max-w-lg space-y-4 text-sm text-saubio-slate/80">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/60">
                {t('bookingPlanner.shortNotice.title', 'Préavis court détecté')}
              </p>
              <p className="text-saubio-slate/80">
                {t(
                  'bookingPlanner.shortNotice.message',
                  'Les demandes à moins de 24h sont envoyées automatiquement à tous les prestataires disponibles afin de trouver rapidement un intervenant. Vous serez averti dès qu’un professionnel accepte votre mission et le montant dû sera calculé à ce moment-là.'
                )}
              </p>
              <p className="text-xs text-saubio-slate/60">
                {t(
                  'bookingPlanner.shortNotice.hint',
                  'Confirmez pour poursuivre la réservation et enregistrer vos informations.'
                )}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={cancelShortNoticeFlow}
                className="w-full rounded-full border border-saubio-forest/20 px-5 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/50 sm:w-auto"
              >
                {t('bookingPlanner.shortNotice.cancel', 'Modifier ma demande')}
              </button>
              <button
                type="button"
                onClick={confirmShortNoticeFlow}
                className="w-full rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss sm:w-auto"
              >
                {t('bookingPlanner.shortNotice.confirm', 'Continuer')}
              </button>
            </div>
          </SurfaceCard>
        </div>
      ) : null}
    </div>
  );
}

export default function BookingPlanningPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-saubio-slate/60">Chargement…</div>}>
      <BookingPlanningPageContent />
    </Suspense>
  );
}
