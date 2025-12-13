'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  providerDirectoryQueryOptions,
  providerDirectoryDetailsQueryOptions,
  formatEuro,
  formatDateTime,
} from '@saubio/utils';
import type {
  ProviderDirectoryDetails,
  ProviderDirectoryFilters,
  ProviderDirectoryItem,
  ProviderReviewSummary,
} from '@saubio/models';
import {
  SectionTitle,
  SectionDescription,
  SurfaceCard,
  Skeleton,
  Pill,
} from '@saubio/ui';
import { MapPin, Star, CheckCircle2, ShieldCheck, X } from 'lucide-react';

const ratingOptions = [0, 3, 4, 4.5];
const missionOptions = [10, 25, 50];

const parseFloatInput = (value: string) => {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
};

function SelectProviderPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const baseQuery = useMemo(() => {
    const params = searchParams ?? new URLSearchParams();
    const service = params.get('service') ?? 'residential';
    const postalCode = params.get('postalCode') ?? '';
    const startAt = params.get('startAt') ?? '';
    const hours = parseFloat(params.get('hours') ?? '2') || 2;
    return {
      service,
      postalCode,
      startAt,
      hours: Math.max(1, Math.min(12, hours)),
      frequency: params.get('frequency') ?? 'once',
    };
  }, [searchParams]);

  const [filters, setFilters] = useState({
    minRate: '',
    maxRate: '',
    minRating: '',
    minMissions: '',
    acceptsAnimals: false,
    sort: 'rating' as ProviderDirectoryFilters['sort'],
  });

  const directoryFilters = useMemo<ProviderDirectoryFilters>(() => {
    const minRateValue = parseFloatInput(filters.minRate);
    const maxRateValue = parseFloatInput(filters.maxRate);
    return {
      service: baseQuery.service as ProviderDirectoryFilters['service'],
      city: searchParams?.get('city') ?? undefined,
      postalCode: baseQuery.postalCode || undefined,
      availableOn: baseQuery.startAt || undefined,
      durationHours: baseQuery.hours,
      minRateCents: minRateValue ? Math.round(minRateValue * 100) : undefined,
      maxRateCents: maxRateValue ? Math.round(maxRateValue * 100) : undefined,
      minRating: parseFloatInput(filters.minRating),
      minCompletedMissions: parseFloat(filters.minMissions) || undefined,
      acceptsAnimals: filters.acceptsAnimals || undefined,
      sort: filters.sort,
      limit: 48,
    };
  }, [baseQuery, filters, searchParams]);

  const providerQuery = useQuery({
    ...providerDirectoryQueryOptions(directoryFilters),
  });

  const providers = providerQuery.data ?? [];

  const openDetails = (provider: ProviderDirectoryItem) => {
    setDetailsProvider(provider);
  };

  const closeDetails = () => {
    setDetailsProvider(null);
  };
  const [detailsProvider, setDetailsProvider] = useState<ProviderDirectoryItem | null>(null);
  const detailsQuery = useQuery({
    ...providerDirectoryDetailsQueryOptions(detailsProvider?.id ?? null),
  });

  const handleSelect = (provider: ProviderDirectoryItem) => {
    setDetailsProvider(null);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('providerIds', provider.id);
    params.set('providerName', provider.displayName ?? provider.id);
    params.set('mode', 'manual');
    router.push(`/bookings/account?${params.toString()}`);
  };

  const renderFilters = () => (
    <SurfaceCard className="space-y-4" padding="lg">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('selectProvider.filters.title', 'Affinez votre recherche')}
        </h2>
        <p className="mt-1 text-xs text-saubio-slate/70">
          {t('selectProvider.filters.contextSummary', 'Créneau {{date}} · {{hours}} h · CP {{postal}}', {
            date: baseQuery.startAt ? formatDateTime(new Date(baseQuery.startAt)) : '—',
            hours: baseQuery.hours.toFixed(1),
            postal: baseQuery.postalCode || '—',
          })}
        </p>
      </div>
      <label className="space-y-2 text-sm text-saubio-slate/80">
        <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
          {t('selectProvider.filters.minRate', 'Tarif min. (€/h)')}
        </span>
        <input
          type="number"
          min={0}
          step={1}
          value={filters.minRate}
          onChange={(event) => setFilters((state) => ({ ...state, minRate: event.target.value }))}
          className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-2 text-sm outline-none focus:border-saubio-forest"
        />
      </label>
      <label className="space-y-2 text-sm text-saubio-slate/80">
        <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
          {t('selectProvider.filters.maxRate', 'Tarif max. (€/h)')}
        </span>
        <input
          type="number"
          min={0}
          step={1}
          value={filters.maxRate}
          onChange={(event) => setFilters((state) => ({ ...state, maxRate: event.target.value }))}
          className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-2 text-sm outline-none focus:border-saubio-forest"
        />
      </label>
      <label className="space-y-2 text-sm text-saubio-slate/80">
        <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
          {t('selectProvider.filters.minRating', 'Note minimale')}
        </span>
        <select
          value={filters.minRating}
          onChange={(event) => setFilters((state) => ({ ...state, minRating: event.target.value }))}
          className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-2 text-sm outline-none focus:border-saubio-forest"
        >
          <option value="">{t('selectProvider.filters.any', 'Peu importe')}</option>
          {ratingOptions.map((option) => (
            <option key={option} value={option}>
              {option}+
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm text-saubio-slate/80">
        <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
          {t('selectProvider.filters.minMissions', 'Missions terminées')}
        </span>
        <select
          value={filters.minMissions}
          onChange={(event) => setFilters((state) => ({ ...state, minMissions: event.target.value }))}
          className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-2 text-sm outline-none focus:border-saubio-forest"
        >
          <option value="">{t('selectProvider.filters.any', 'Peu importe')}</option>
          {missionOptions.map((option) => (
            <option key={option} value={option}>
              {option === 0 ? t('selectProvider.filters.any', 'Peu importe') : `${option}+`}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-saubio-slate/80">
        <input
          type="checkbox"
          checked={filters.acceptsAnimals}
          onChange={(event) =>
            setFilters((state) => ({ ...state, acceptsAnimals: event.target.checked }))
          }
          className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
        />
        {t('selectProvider.filters.acceptsAnimals', 'Accepte les animaux')}
      </label>
      <label className="space-y-2 text-sm text-saubio-slate/80">
        <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
          {t('selectProvider.filters.sort', 'Trier')}
        </span>
        <select
          value={filters.sort}
          onChange={(event) =>
            setFilters((state) => ({ ...state, sort: event.target.value as typeof filters.sort }))
          }
          className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-2 text-sm outline-none focus:border-saubio-forest"
        >
          <option value="rating">{t('selectProvider.filters.sortRating', 'Meilleure note')}</option>
          <option value="rate">{t('selectProvider.filters.sortRate', 'Tarif le plus bas')}</option>
        </select>
      </label>
    </SurfaceCard>
  );

  const renderProviderCard = (provider: ProviderDirectoryItem) => (
    <SurfaceCard
      key={provider.id}
      padding="md"
      className="flex h-full flex-col gap-3 border border-saubio-mist/70 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <ProviderAvatar provider={provider} />
        <div className="min-w-0 flex-1">
          <p
            className="truncate whitespace-nowrap text-sm font-semibold leading-tight text-saubio-forest sm:text-base"
            title={provider.displayName}
          >
            {provider.displayName}
          </p>
          <p className="text-xs text-saubio-slate/60">
            {provider.primaryCity ?? t('selectProvider.card.noCity', 'Zone non précisée')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openDetails(provider)}
          className="text-xs font-semibold text-saubio-forest transition hover:text-saubio-moss"
        >
          {t('selectProvider.card.viewMore', 'Voir plus')}
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-saubio-slate/70">
        <div className="flex items-center gap-1 font-semibold text-saubio-forest">
          <Star className="h-4 w-4 fill-saubio-sun text-saubio-sun" />
          <span>{provider.ratingAverage?.toFixed(1) ?? '—'}</span>
          <span className="font-normal text-saubio-slate/60">
            {t('selectProvider.card.ratingCount', '({{count}} avis)', { count: provider.ratingCount })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-saubio-forest" />
          <span>
            {t('selectProvider.card.missionsCount', '{{count}} missions', {
              count: provider.completedMissions,
            })}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-saubio-slate/70">
        <span>{t('selectProvider.card.rateLabel', 'Tarif horaire')}</span>
        <span className="text-xl font-semibold text-saubio-forest">
          {formatEuro(provider.hourlyRateCents / 100)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => handleSelect(provider)}
        className="mt-auto rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss"
      >
        {t('selectProvider.card.select', 'Choisir ce prestataire')}
      </button>
    </SurfaceCard>
  );

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('selectProvider.title', 'Choisissez votre prestataire')}
        </SectionTitle>
        <SectionDescription className="text-sm">
          {t(
            'selectProvider.subtitle',
            'Nous avons trouvé des prestataires disponibles autour de votre créneau. Filtrez selon vos critères pour finaliser votre sélection.'
          )}
        </SectionDescription>
      </header>
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {renderFilters()}
        <div className="space-y-4">
          {providerQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <SurfaceCard key={index} padding="lg">
                  <Skeleton className="h-5 w-1/3 rounded-full" />
                  <Skeleton className="mt-3 h-4 w-2/3 rounded-full" />
                  <Skeleton className="mt-6 h-10 rounded-2xl" />
                </SurfaceCard>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <SurfaceCard padding="lg" className="text-center">
              <p className="text-sm text-saubio-slate/70">
                {t(
                  'selectProvider.list.empty',
                  'Aucun prestataire ne correspond à vos filtres. Ajustez vos critères ou contactez notre équipe.'
                )}
              </p>
            </SurfaceCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {providers.map((provider) => renderProviderCard(provider))}
            </div>
          )}
        </div>
      </div>
      <ProviderDetailsModal
        baseProvider={detailsProvider}
        details={detailsQuery.data ?? undefined}
        reviews={detailsQuery.data?.reviews ?? []}
        isLoading={detailsQuery.isFetching}
        onClose={closeDetails}
        onSelect={handleSelect}
      />
    </div>
  );
}

export default function SelectProviderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-saubio-slate/60">Chargement…</div>}>
      <SelectProviderPageContent />
    </Suspense>
  );
}

type AvatarSize = 'md' | 'lg';

const ProviderAvatar = ({ provider, size = 'md' }: { provider: ProviderDirectoryItem; size?: AvatarSize }) => {
  const dimension = size === 'lg' ? 72 : 48;
  if (provider.photoUrl) {
    return (
      <img
        src={provider.photoUrl}
        alt={provider.displayName}
        width={dimension}
        height={dimension}
        className="rounded-full object-cover"
        loading="lazy"
      />
    );
  }
  const initials = provider.displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
  const palette =
    provider.gender === 'female'
      ? 'bg-rose-100 text-rose-600'
      : provider.gender === 'male'
        ? 'bg-sky-100 text-sky-600'
        : 'bg-saubio-mist/60 text-saubio-slate/70';
  return (
    <div
      className={`flex items-center justify-center rounded-full text-sm font-semibold ${palette}`}
      style={{ width: dimension, height: dimension }}
    >
      {initials || 'S'}
    </div>
  );
};

type ProviderDetailsModalProps = {
  baseProvider: ProviderDirectoryItem | null;
  details: ProviderDirectoryDetails | null | undefined;
  reviews: ProviderReviewSummary[];
  isLoading: boolean;
  onClose: () => void;
  onSelect: (provider: ProviderDirectoryItem) => void;
};

const ProviderDetailsModal = ({
  baseProvider,
  details,
  reviews,
  isLoading,
  onClose,
  onSelect,
}: ProviderDetailsModalProps) => {
  const { t } = useTranslation();
  if (!baseProvider) {
    return null;
  }
  const mergedDetails: ProviderDirectoryDetails = details ?? { ...baseProvider, reviews: reviews ?? [] };
  const reviewList = details?.reviews ?? reviews ?? [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-saubio-slate/70 px-4 py-6 backdrop-blur-sm">
      <SurfaceCard padding="lg" className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-saubio-mist/80 p-1 text-saubio-slate/60 transition hover:border-saubio-forest hover:text-saubio-forest"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ProviderAvatar provider={mergedDetails} size="lg" />
          <div className="flex-1 space-y-1">
            <p className="text-lg font-semibold text-saubio-forest">{mergedDetails.displayName}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-saubio-slate/70">
              <span className="flex items-center gap-1 font-semibold text-saubio-forest">
                <Star className="h-4 w-4 fill-saubio-sun text-saubio-sun" />
                {mergedDetails.ratingAverage?.toFixed(1) ?? '—'}{' '}
                <span className="font-normal text-saubio-slate/60">
                  {t('selectProvider.card.ratingCount', '({{count}} avis)', {
                    count: mergedDetails.ratingCount,
                  })}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-saubio-forest" />
                {t('selectProvider.card.missionsCount', '{{count}} missions', {
                  count: mergedDetails.completedMissions,
                })}
              </span>
              {mergedDetails.verified ? (
                <span className="flex items-center gap-1 font-semibold text-saubio-forest">
                  <ShieldCheck className="h-4 w-4" />
                  {t('selectProvider.details.verified', 'Identité vérifiée')}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-saubio-slate/80">
              <span>
                {t('selectProvider.card.rateLabel', 'Tarif horaire')} ·{' '}
                <strong className="text-saubio-forest">{formatEuro(mergedDetails.hourlyRateCents / 100)}</strong>
              </span>
              <span className="flex items-center gap-1 text-xs text-saubio-slate/60">
                <MapPin className="h-4 w-4" />
                {mergedDetails.primaryCity ?? t('selectProvider.card.noCity', 'Zone non précisée')}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
            {t('selectProvider.details.about', 'À propos')}
          </p>
          <p className="text-sm text-saubio-slate/80">
            {mergedDetails.bio ??
              t('selectProvider.card.defaultBio', 'Prestataire expérimenté·e, disponible sur plusieurs quartiers.')}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/60">
            {mergedDetails.languages.map((language) => (
              <Pill key={`details-language-${language}`} tone="mist">
                {language.toUpperCase()}
              </Pill>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
            {t('selectProvider.details.reviews', 'Avis clients')}
          </p>
          {isLoading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : reviewList.length ? (
            <div className="space-y-3">
              {reviewList.map((review) => (
                <div key={review.id} className="rounded-2xl border border-saubio-mist/60 px-4 py-3 text-sm text-saubio-slate/80">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-saubio-slate/60">
                    <span className="font-semibold text-saubio-forest">{review.authorFirstName}</span>
                    <span>{formatDateTime(new Date(review.createdAt))}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-saubio-forest">
                    <Star className="h-4 w-4 fill-saubio-sun text-saubio-sun" />
                    {review.score.toFixed(1)}
                  </div>
                  <p className="mt-1 text-sm">
                    {review.comment ||
                      t('selectProvider.details.noReviewText', 'Pas de commentaire fourni.')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-saubio-slate/60">
              {t('selectProvider.details.noReviews', 'Aucun avis disponible pour le moment.')}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onSelect(mergedDetails)}
            className="w-full rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss sm:w-auto"
          >
            {t('selectProvider.details.choose', 'Choisir ce prestataire')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-saubio-forest/20 px-5 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/60 sm:w-auto"
          >
            {t('selectProvider.details.close', 'Fermer')}
          </button>
        </div>
      </SurfaceCard>
    </div>
  );
};
