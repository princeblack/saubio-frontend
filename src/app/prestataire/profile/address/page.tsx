'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProviderProfile, useUpdateProviderProfileMutation, useAddressAutocomplete, useRequireRole } from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../../components/feedback/ErrorState';
import type { AddressSuggestion } from '@saubio/models';

interface ServiceZoneForm {
  id?: string;
  name: string;
  postalCode?: string;
  city?: string;
  district?: string;
  countryCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number;
}

export default function ProviderAddressPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  if (!session.user) {
    return null;
  }

  const profileQuery = useProviderProfile();
  const updateProfileMutation = useUpdateProviderProfileMutation();
  const [serviceZones, setServiceZones] = useState<ServiceZoneForm[]>([]);
  const [zoneQuery, setZoneQuery] = useState('');
  const [zoneDebouncedQuery, setZoneDebouncedQuery] = useState('');
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const [serviceAreaMessage, setServiceAreaMessage] = useState('');
  const [serviceAreaError, setServiceAreaError] = useState('');
  const zoneAutocomplete = useAddressAutocomplete(zoneDebouncedQuery, zoneDebouncedQuery.length >= 2);
  const zoneSuggestions = zoneAutocomplete.data ?? [];
  const showZoneSuggestions = zoneDropdownOpen && zoneDebouncedQuery.length >= 2;

  useEffect(() => {
    const handle = setTimeout(() => {
      setZoneDebouncedQuery(zoneQuery.trim());
    }, 200);
    return () => clearTimeout(handle);
  }, [zoneQuery]);

  useEffect(() => {
    if (!profileQuery.data) return;
    setServiceZones(
      (profileQuery.data.serviceZones ?? []).map((zone) => ({
        id: zone.id,
        name: zone.name,
        postalCode: zone.postalCode ?? undefined,
        city: zone.city ?? undefined,
        district: zone.district ?? undefined,
        countryCode: zone.countryCode ?? undefined,
        latitude: zone.latitude ?? null,
        longitude: zone.longitude ?? null,
        radiusKm: zone.radiusKm ?? 5,
      }))
    );
  }, [profileQuery.data]);

  const handleSelectZone = (suggestion: AddressSuggestion) => {
    if (!suggestion) return;
    const zoneName = suggestion.label || suggestion.city;
    if (!zoneName) return;
    setServiceZones((previous) => {
      if (previous.some((zone) => zone.name === zoneName)) {
        return previous;
      }
      return [
        ...previous,
        {
          name: zoneName,
          postalCode: suggestion.postalCode,
          city: suggestion.city,
          district: suggestion.district ?? undefined,
          countryCode: suggestion.countryCode,
          latitude: suggestion.latitude,
          longitude: suggestion.longitude,
          radiusKm: 5,
        },
      ];
    });
    setZoneQuery('');
    setZoneDropdownOpen(false);
  };

  const handleZoneRadiusChange = (index: number, radiusKm: number) => {
    setServiceZones((previous) =>
      previous.map((zone, zoneIndex) =>
        zoneIndex === index ? { ...zone, radiusKm: Math.max(1, Math.min(50, radiusKm)) } : zone
      )
    );
  };

  const handleRemoveZone = (index: number) => {
    setServiceZones((previous) => previous.filter((_, zoneIndex) => zoneIndex !== index));
  };

  const handleServiceAreaSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServiceAreaMessage('');
    setServiceAreaError('');
    const normalizedZones = serviceZones.map((zone, index) => ({
      id: zone.id ?? `temp-${index}`,
      name: zone.name,
      postalCode: zone.postalCode,
      city: zone.city,
      district: zone.district,
      countryCode: zone.countryCode,
      latitude: zone.latitude ?? undefined,
      longitude: zone.longitude ?? undefined,
      radiusKm: zone.radiusKm ?? 5,
    }));
    updateProfileMutation.mutate(
      {
        serviceZones: normalizedZones,
        serviceAreas: normalizedZones.map((zone) => zone.name),
      },
      {
        onSuccess: () => {
          setServiceAreaMessage(t('providerProfilePage.actions.success'));
          void profileQuery.refetch();
        },
        onError: (error) => {
          setServiceAreaError(
            error instanceof Error ? error.message : t('system.error.generic', 'Une erreur est survenue.')
          );
        },
      }
    );
  };

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('providerProfilePage.fields.serviceAreas')}
          </SectionTitle>
          <SectionDescription>
            {t('providerProfilePage.sections.zonesSubtitle', 'Définissez les zones où vous pouvez intervenir.')}
          </SectionDescription>
        </header>
        <SurfaceCard variant="soft" padding="md">
          <Skeleton className="h-4 w-48 rounded-full" />
          <Skeleton className="mt-4 h-32 rounded-3xl" />
        </SurfaceCard>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="space-y-6">
        <ErrorState
          title={t('providerDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
          description={t('providerDashboard.errorDescription', t('bookingDashboard.errorDescription'))}
          onRetry={() => {
            void profileQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerProfilePage.fields.serviceAreas')}
        </SectionTitle>
        <SectionDescription>
          {t('providerProfilePage.sections.zonesSubtitle', 'Définissez les zones où vous pouvez intervenir.')}
        </SectionDescription>
      </header>

      <form onSubmit={handleServiceAreaSubmit}>
        <SurfaceCard variant="soft" padding="md" className="space-y-4 border border-saubio-mist/60">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('providerProfilePage.fields.serviceAreas')}
            </h2>
            <SectionDescription className="text-xs">
              {t('providerProfilePage.sections.zonesHelp', 'Tapez une ville ou un code postal et ajoutez vos zones.')}
            </SectionDescription>
          </div>
          <div className="space-y-1">
            <div className="relative">
              <input
                value={zoneQuery}
                onChange={(event) => setZoneQuery(event.target.value)}
                onFocus={() => setZoneDropdownOpen(true)}
                onBlur={() => setTimeout(() => setZoneDropdownOpen(false), 150)}
                placeholder={t('providerProfilePage.sections.zonesPlaceholder', 'Berlin, Friedrichshain…')}
                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
              />
              {showZoneSuggestions ? (
                <ul className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-saubio-forest/15 bg-white shadow-soft-xl">
                  {zoneSuggestions.length ? (
                    zoneSuggestions.map((suggestion) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectZone(suggestion)}
                          className="flex w-full flex-col gap-0.5 px-4 py-2 text-left transition hover:bg-saubio-mist/20"
                        >
                          <span className="text-sm font-semibold text-saubio-forest">
                            {suggestion.city || suggestion.label}
                          </span>
                          <span className="text-xs text-saubio-slate/60">
                            {[suggestion.district, suggestion.postalCode].filter(Boolean).join(' · ')}
                          </span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-xs text-saubio-slate/60">
                      {t('providerProfilePage.sections.zonesNoResults', 'Aucun résultat')}
                    </li>
                  )}
                </ul>
              ) : null}
            </div>
            <p className="text-[11px] text-saubio-slate/50">
              {t(
                'providerProfilePage.sections.zonesHelp',
                'Tapez une ville, un quartier ou un code postal puis sélectionnez-le.'
              )}
            </p>
          </div>

          {serviceZones.length ? (
            <ul className="space-y-2">
              {serviceZones.map((zone, index) => (
                <li
                  key={`${zone.name}-${index}`}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm text-saubio-slate/80"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-saubio-forest">{zone.name}</p>
                    <p className="text-xs text-saubio-slate/60">
                      {[zone.postalCode, zone.city, zone.district].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <span>{t('providerProfilePage.sections.radiusLabel', 'Rayon (km)')}</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={zone.radiusKm ?? 5}
                      onChange={(event) => handleZoneRadiusChange(index, Number(event.target.value) || 5)}
                      className="w-20 rounded-xl border border-saubio-forest/20 px-2 py-1 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveZone(index)}
                    className="text-xs font-semibold text-red-500 underline"
                  >
                    {t('system.actions.remove', 'Supprimer')}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-saubio-slate/60">
              {t('providerProfilePage.sections.zonesEmpty', 'Aucune zone sélectionnée pour le moment.')}
            </p>
          )}

          {serviceAreaError ? (
            <p className="text-xs font-semibold text-red-600">{serviceAreaError}</p>
          ) : null}
          {serviceAreaMessage ? (
            <p className="text-xs font-semibold text-emerald-600">{serviceAreaMessage}</p>
          ) : null}

          <button
            type="submit"
            className="rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending
              ? t('providerProfilePage.actions.saving')
              : t('providerProfilePage.actions.save')}
          </button>
        </SurfaceCard>
      </form>
    </div>
  );
}
