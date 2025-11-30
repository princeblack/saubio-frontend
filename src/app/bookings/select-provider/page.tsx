'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { providerDirectoryQueryOptions, formatEuro, formatDateTime } from '@saubio/utils';
import type { ProviderDirectoryFilters, ProviderDirectoryItem } from '@saubio/models';
import {
  SectionTitle,
  SectionDescription,
  SurfaceCard,
  Skeleton,
  Pill,
} from '@saubio/ui';

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

  const handleSelect = (provider: ProviderDirectoryItem) => {
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
      padding="lg"
      className="flex flex-col justify-between gap-4 border border-saubio-forest/10"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-saubio-forest">{provider.displayName}</p>
            <p className="text-xs uppercase tracking-wide text-saubio-slate/50">
              {provider.primaryCity ?? t('selectProvider.card.noCity', 'Zone non précisée')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-saubio-slate/60">{t('selectProvider.card.rate', 'Tarif')}</p>
            <p className="text-xl font-semibold text-saubio-forest">
              {formatEuro(provider.hourlyRateCents / 100)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/60">
          <Pill tone="forest">
            {t('selectProvider.card.rating', '{{rating}} ★', {
              rating: provider.ratingAverage?.toFixed(1) ?? '—',
            })}
          </Pill>
          <Pill tone="mist">
            {t('selectProvider.card.missions', '{{count}} missions', {
              count: provider.completedMissions,
            })}
          </Pill>
          {provider.offersEco ? (
            <Pill tone="sun">{t('selectProvider.card.eco', 'Éco')}</Pill>
          ) : null}
          {provider.acceptsAnimals ? (
            <Pill tone="forest">{t('selectProvider.card.animals', 'OK animaux')}</Pill>
          ) : null}
        </div>
        <p className="text-sm text-saubio-slate/80">
          {provider.bio ??
            t(
              'selectProvider.card.defaultBio',
              'Prestataire expérimenté·e, disponible sur plusieurs quartiers.'
            )}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/60">
          {provider.languages.slice(0, 4).map((language) => (
            <Pill key={`${provider.id}-${language}`} tone="mist">
              {language.toUpperCase()}
            </Pill>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => handleSelect(provider)}
        className="rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss"
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
                  'selectProvider.empty',
                  'Aucun prestataire ne correspond à vos filtres. Ajustez vos critères ou contactez notre équipe.'
                )}
              </p>
            </SurfaceCard>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {providers.map((provider) => renderProviderCard(provider))}
            </div>
          )}
        </div>
      </div>
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
