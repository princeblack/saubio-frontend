'use client';

import Link from 'next/link';
import { useMemo, useState, type ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { ProviderDirectoryFilters, ServiceCategory } from '@saubio/models';
import { SERVICE_CATALOG } from '@saubio/models';
import {
  providerDirectoryQueryOptions,
  useRequireRole,
  formatEuro,
} from '@saubio/utils';
import {
  SectionTitle,
  SectionDescription,
  SurfaceCard,
  FormField,
  Skeleton,
  Pill,
} from '@saubio/ui';
import { MapPin, Star, Briefcase, Users } from 'lucide-react';
import { ErrorState } from '../../../components/feedback/ErrorState';

const serviceFilterOptions: Array<{ value: ServiceCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Tous' },
  ...SERVICE_CATALOG.map((service) => ({
    value: service.id,
    label: service.title,
  })),
];

export default function ClientProvidersPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['client', 'company'] });
  const [cityFilter, setCityFilter] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [serviceFilter, setServiceFilter] = useState<ServiceCategory | 'all'>('all');
  const [sort, setSort] = useState<'rating' | 'rate'>('rating');
  const [rateErrors, setRateErrors] = useState<{ min?: string; max?: string }>({});
  const digitsOnlyRegex = /^\d+$/;

  const handleRateChange =
    (key: 'min' | 'max', setter: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      if (rawValue === '' || digitsOnlyRegex.test(rawValue)) {
        setter(rawValue);
        setRateErrors((prev) => ({ ...prev, [key]: undefined }));
      } else {
        setRateErrors((prev) => ({
          ...prev,
          [key]: t('forms.errors.numericOnly', 'Veuillez saisir uniquement des chiffres.'),
        }));
      }
    };

  const filters = useMemo<ProviderDirectoryFilters>(() => {
    const next: ProviderDirectoryFilters = { sort };
    if (cityFilter.trim()) {
      next.city = cityFilter.trim();
    }
    if (serviceFilter !== 'all') {
      next.service = serviceFilter;
    }
    if (minRate) {
      const parsed = Number(minRate);
      if (!Number.isNaN(parsed)) {
        next.minRateCents = Math.max(0, Math.round(parsed * 100));
      }
    }
    if (maxRate) {
      const parsed = Number(maxRate);
      if (!Number.isNaN(parsed)) {
        next.maxRateCents = Math.max(0, Math.round(parsed * 100));
      }
    }
    return next;
  }, [cityFilter, minRate, maxRate, serviceFilter, sort]);

  const providersQuery = useQuery(providerDirectoryQueryOptions(filters));

  if (!session.user) {
    return null;
  }

  const providers = providersQuery.data ?? [];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <SectionTitle as="h1" size="large">
          {t('providerDirectory.title', 'Trouver un prestataire')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'providerDirectory.subtitle',
            'Parcourez nos partenaires certifiés et choisissez celui qui correspond à vos critères.'
          )}
        </SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormField label={t('providerDirectory.filters.city', 'Ville')}>
            <input
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-base leading-tight text-saubio-forest placeholder:text-saubio-slate/50 focus:border-saubio-forest focus:outline-none"
              placeholder={t('providerDirectory.filters.cityPlaceholder', 'ex: Berlin') ?? ''}
            />
          </FormField>
          <FormField label={t('providerDirectory.filters.service', 'Type de service')}>
            <select
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value as ServiceCategory | 'all')}
              className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-base leading-tight text-saubio-forest focus:border-saubio-forest focus:outline-none"
            >
              {serviceFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value === 'all'
                    ? t('providerDirectory.filters.serviceOptions.all', option.label)
                    : t(`bookingPlanner.services.${option.value}.label`, option.label)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t('providerDirectory.filters.minRate', 'Tarif min. (€ / h)')}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minRate}
              onChange={handleRateChange('min', setMinRate)}
              className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-base leading-tight text-saubio-forest focus:border-saubio-forest focus:outline-none"
            />
            {rateErrors.min ? (
              <p className="mt-1 text-xs text-red-600">{rateErrors.min}</p>
            ) : null}
          </FormField>
          <FormField label={t('providerDirectory.filters.maxRate', 'Tarif max. (€ / h)')}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={maxRate}
              onChange={handleRateChange('max', setMaxRate)}
              className="w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-base leading-tight text-saubio-forest focus:border-saubio-forest focus:outline-none"
            />
            {rateErrors.max ? (
              <p className="mt-1 text-xs text-red-600">{rateErrors.max}</p>
            ) : null}
          </FormField>
          <FormField label={t('providerDirectory.filters.sort', 'Trier par')}>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as 'rating' | 'rate')}
              className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-base leading-tight text-saubio-forest focus:border-saubio-forest focus:outline-none"
            >
              <option value="rating">
                {t('providerDirectory.filters.sort.rating', 'Avis')}
              </option>
              <option value="rate">
                {t('providerDirectory.filters.sort.rate', 'Tarif')}
              </option>
            </select>
          </FormField>
        </div>
      </SurfaceCard>

      {providersQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`provider-card-skeleton-${index}`} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : providersQuery.isError ? (
        <SurfaceCard variant="soft" padding="lg">
          <ErrorState
            title={t('providerDirectory.errorTitle', 'Impossible de charger les prestataires')}
            description={t(
              'providerDirectory.errorDescription',
              'Veuillez réessayer dans quelques instants.'
            )}
            onRetry={() => {
              void providersQuery.refetch();
            }}
          />
        </SurfaceCard>
      ) : providers.length === 0 ? (
        <SurfaceCard variant="soft" padding="lg" className="text-center text-saubio-slate/60">
          <Users className="mx-auto mb-3 h-8 w-8 text-saubio-slate/40" />
          <p className="font-semibold">
            {t('providerDirectory.emptyTitle', 'Aucun prestataire ne correspond à ces filtres')}
          </p>
          <p className="text-sm">
            {t(
              'providerDirectory.emptyDescription',
              'Essayez une autre ville ou élargissez la fourchette de tarif.'
            )}
          </p>
        </SurfaceCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <SurfaceCard key={provider.id} variant="soft" padding="md" className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-saubio-mist/40">
                  {provider.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote assets from API
                    <img
                      src={provider.photoUrl}
                      alt={provider.displayName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-saubio-slate/50">
                      {provider.displayName
                        .split(' ')
                        .map((part) => part.charAt(0))
                        .join('')
                        .slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-saubio-forest">{provider.displayName}</p>
                    {provider.offersEco ? (
                      <Pill tone="sun">
                        {t('providerDirectory.ecoBadge', 'Bio')}
                      </Pill>
                    ) : null}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-saubio-slate/60">
                    <MapPin className="h-3.5 w-3.5" />
                    {provider.primaryCity ?? provider.serviceAreas[0] ?? t('providerDirectory.noCity', 'Ville non renseignée')}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-saubio-slate/60">
                    <Star className="h-3.5 w-3.5" />
                    {provider.ratingAverage
                      ? `${provider.ratingAverage.toFixed(1)} · ${provider.ratingCount} ${t(
                          'providerDirectory.reviews',
                          'avis'
                        )}`
                      : t('providerDirectory.noReviews', 'Aucun avis pour le moment')}
                  </p>
                </div>
              </div>
              {provider.bio ? (
                <p className="text-sm text-saubio-slate/80 max-h-20 overflow-hidden">{provider.bio}</p>
              ) : null}
              <div className="flex items-center justify-between text-sm text-saubio-slate/70">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {t('providerDirectory.completedMissions', {
                    count: provider.completedMissions,
                    defaultValue: `${provider.completedMissions} missions`,
                  })}
                </span>
                <span className="font-semibold text-saubio-forest">
                  {formatEuro(provider.hourlyRateCents / 100)}/h
                </span>
              </div>
              <div className="flex flex-wrap gap-1 text-xs text-saubio-slate/60">
                {provider.languages.map((language) => (
                  <span
                    key={`${provider.id}-${language}`}
                    className="rounded-full border border-saubio-forest/15 px-2 py-1"
                  >
                    {language}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Link
                  href="/bookings/new"
                  className="flex-1 rounded-full bg-saubio-forest px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-saubio-moss"
                >
                  {t('providerDirectory.actions.book', 'Réserver')}
                </Link>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </div>
  );
}
