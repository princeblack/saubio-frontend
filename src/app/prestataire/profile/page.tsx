'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useProviderProfile,
  useUpdateProviderProfileMutation,
  useRequireRole,
  useProviderPaymentsOnboardingMutation,
  useAddressAutocomplete,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';
import type { AddressSuggestion } from '@saubio/models';

const LANGUAGE_OPTIONS = [
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Allemand' },
  { code: 'en', label: 'Anglais' },
  { code: 'tr', label: 'Turc' },
  { code: 'pl', label: 'Polonais' },
] as const;

export default function ProviderProfilePage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  if (!session.user) {
    return null;
  }

  const profileQuery = useProviderProfile();
  const updateProfileMutation = useUpdateProviderProfileMutation();
  const onboardingMutation = useProviderPaymentsOnboardingMutation();

  const [form, setForm] = useState({
    bio: '',
    languages: [] as string[],
    hourlyRate: 0,
    offersEco: false,
    acceptsAnimals: false,
    yearsExperience: 0,
  });
  const [successMessage, setSuccessMessage] = useState('');
  type ServiceZoneForm = {
    id?: string;
    name: string;
    postalCode?: string;
    city?: string;
    district?: string;
    countryCode?: string;
    latitude?: number | null;
    longitude?: number | null;
    radiusKm?: number;
  };
  const [serviceZones, setServiceZones] = useState<ServiceZoneForm[]>([]);
  const [zoneQuery, setZoneQuery] = useState('');
  const [zoneDebouncedQuery, setZoneDebouncedQuery] = useState('');
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const zoneAutocomplete = useAddressAutocomplete(zoneDebouncedQuery, zoneDebouncedQuery.length >= 2);
  const zoneSuggestions = zoneAutocomplete.data ?? [];
  const showZoneSuggestions = zoneDropdownOpen && zoneDebouncedQuery.length >= 2;
  const handleSelectZone = (suggestion: AddressSuggestion) => {
    if (!suggestion) {
      return;
    }
    const zoneName = suggestion.label || suggestion.city;
    if (!zoneName) {
      return;
    }
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

  useEffect(() => {
    if (!profileQuery.data) return;
    setForm({
      bio: profileQuery.data.bio ?? '',
      languages: profileQuery.data.languages ?? [],
      hourlyRate: Math.round((profileQuery.data.hourlyRateCents ?? 0) / 100),
      offersEco: profileQuery.data.offersEco ?? false,
      acceptsAnimals: profileQuery.data.acceptsAnimals ?? false,
      yearsExperience: profileQuery.data.yearsExperience ?? 0,
    });
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

  useEffect(() => {
    const handle = setTimeout(() => {
      setZoneDebouncedQuery(zoneQuery.trim());
    }, 200);
    return () => clearTimeout(handle);
  }, [zoneQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
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
        bio: form.bio,
        languages: form.languages,
        serviceAreas: normalizedZones.map((zone) => zone.name),
        serviceZones: normalizedZones,
        hourlyRateCents: Math.round(Math.max(form.hourlyRate, 0) * 100),
        offersEco: form.offersEco,
        acceptsAnimals: form.acceptsAnimals,
        yearsExperience: Math.max(form.yearsExperience, 0),
      },
      {
        onSuccess: () => {
          setSuccessMessage(t('providerProfilePage.actions.success'));
          void profileQuery.refetch();
        },
      }
    );
  };

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('providerProfilePage.title')}
          </SectionTitle>
          <SectionDescription>{t('providerProfilePage.subtitle')}</SectionDescription>
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

  const needsPayoutSetup =
    !profileQuery.data.payoutReady || !profileQuery.data.payoutMethod || profileQuery.data.kycStatus !== 'verified';
  const address = profileQuery.data.address;
  const identityDocuments =
    (profileQuery.data.documents ?? []).filter((doc) => doc.type === 'identity') ?? [];
  const identityStatus = (profileQuery.data.identityVerificationStatus ?? 'not_started').toLowerCase();
  const identityStatusClass =
    identityStatus === 'verified'
      ? 'bg-emerald-100 text-emerald-800'
      : identityStatus === 'rejected'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-800';

  return (
    <div className="space-y-8">
      <header className="space-y-3" id="overview">
        <SectionTitle as="h1" size="large">
          {t('providerProfilePage.title')}
        </SectionTitle>
        <SectionDescription>{t('providerProfilePage.subtitle')}</SectionDescription>
      </header>
      {successMessage ? (
        <div className="rounded-2xl border border-saubio-forest/20 bg-saubio-mist/40 px-4 py-3 text-sm font-semibold text-saubio-forest">
          {successMessage}
        </div>
      ) : null}

      {needsPayoutSetup ? (
        <SurfaceCard id="payments" variant="soft" padding="md" className="space-y-4 border border-amber-200 bg-amber-50">
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {t('providerProfilePage.payout.requiredTitle', 'Activez vos paiements')}
            </p>
            <p className="text-xs text-amber-700">
              {t(
                'providerProfilePage.payout.requiredDescription',
                'Ajoutez vos coordonnées bancaires pour recevoir vos missions. Ce processus sécurisé est géré via notre prestataire de paiements.'
              )}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
            onClick={() => {
              onboardingMutation.mutate(undefined, {
                onSuccess: (response) => {
                  window.open(response.url, '_blank', 'noopener,noreferrer');
                },
              });
            }}
            disabled={onboardingMutation.isPending}
          >
            {onboardingMutation.isPending
              ? t('providerProfilePage.payout.opening', 'Ouverture du portail…')
              : t('providerProfilePage.payout.cta', 'Compléter mes informations de paiement')}
          </button>
          {onboardingMutation.isError ? (
            <p className="text-xs text-red-700">
              {t('providerProfilePage.payout.error', 'Impossible de créer le lien d’onboarding pour le moment.')}
            </p>
          ) : null}
        </SurfaceCard>
      ) : (
        <SurfaceCard variant="soft" padding="md" className="space-y-2 border border-emerald-200 bg-emerald-50">
          <p className="text-sm font-semibold text-emerald-900">
            {t('providerProfilePage.payout.readyTitle', 'Paiements activés')}
          </p>
          <p className="text-xs text-emerald-800">
            {t(
              'providerProfilePage.payout.readyDescription',
              'Vos coordonnées sont validées. Vous recevrez automatiquement vos versements après chaque mission.'
            )}
          </p>
          <dl className="space-y-1 text-xs text-emerald-900">
            <div className="flex items-center justify-between gap-3">
              <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                {t('providerProfilePage.payout.method', 'Méthode')}
              </dt>
              <dd>{profileQuery.data.payoutMethod === 'bank_transfer' ? t('providerProfilePage.payout.bank', 'Virement bancaire') : t('providerProfilePage.payout.card', 'Carte bancaire')}</dd>
            </div>
            {profileQuery.data.payoutLast4 ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                  {t('providerProfilePage.payout.last4', 'Derniers chiffres')}
                </dt>
                <dd>•••• {profileQuery.data.payoutLast4}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                {t('providerProfilePage.payout.status', 'Portail de paiement')}
              </dt>
              <dd>{profileQuery.data.kycStatus ?? 'verified'}</dd>
            </div>
          </dl>
        </SurfaceCard>
      )}

      <SurfaceCard id="address" variant="soft" padding="md" className="space-y-4 border border-saubio-mist/60">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('providerProfilePage.sections.addressTitle', 'Adresse principale')}
          </h2>
          <SectionDescription className="text-xs">
            {t(
              'providerProfilePage.sections.addressDescription',
              'Assurez-vous que votre adresse allemande est exacte pour rester éligible aux missions.'
            )}
          </SectionDescription>
        </div>
        {address ? (
          <dl className="space-y-1 text-sm text-saubio-slate/80">
            <div className="flex items-center justify-between gap-3">
              <dt className="font-semibold text-saubio-slate/60">{t('providerProfilePage.sections.street', 'Adresse')}</dt>
              <dd className="text-right">
                {address.streetLine1}
                {address.streetLine2 ? <span>, {address.streetLine2}</span> : null}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="font-semibold text-saubio-slate/60">{t('providerProfilePage.sections.city', 'Ville')}</dt>
              <dd className="text-right">
                {address.postalCode} {address.city}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-saubio-slate/60">
            {t(
              'providerProfilePage.sections.addressEmpty',
              'Aucune adresse enregistrée. Ajoutez-la pour recevoir des propositions près de chez vous.'
            )}
          </p>
        )}
        <Link
          href="/register/provider?step=address"
          className="inline-flex items-center justify-center rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
        >
          {t('providerProfilePage.sections.addressCta', 'Modifier mon adresse')}
        </Link>
      </SurfaceCard>

      <SurfaceCard id="identity" variant="soft" padding="md" className="space-y-4 border border-saubio-mist/60">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('providerProfilePage.sections.identityTitle', 'Vérification d’identité')}
          </h2>
          <SectionDescription className="text-xs">
            {t(
              'providerProfilePage.sections.identityDescription',
              'Téléversez vos pièces officielles pour débloquer les missions.'
            )}
          </SectionDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${identityStatusClass}`}>
            {t(`providerProfilePage.identity.status.${identityStatus}`, identityStatus)}
          </span>
          <p className="text-xs text-saubio-slate/60">
            {t('providerProfilePage.identity.documentsLabel', '{{count}} document(s) envoyés', {
              count: identityDocuments.length,
            })}
          </p>
        </div>
        {identityDocuments.length ? (
          <ul className="space-y-2 text-xs text-saubio-slate/70">
            {identityDocuments.slice(0, 3).map((doc) => (
              <li key={doc.id} className="flex justify-between gap-4 rounded-2xl border border-saubio-mist/60 px-3 py-2">
                <span className="font-semibold">{doc.name ?? 'Document'}</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-saubio-slate/60">
            {t('providerProfilePage.identity.noDocuments', 'Aucun document envoyé pour le moment.')}
          </p>
        )}
        <Link
          href="/prestataire/onboarding/identity"
          className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-5 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss"
        >
          {t('providerProfilePage.identity.cta', 'Gérer mes documents')}
        </Link>
      </SurfaceCard>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" id="profile">
        <SurfaceCard variant="soft" padding="md" className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('providerProfilePage.details')}
            </h2>
            <SectionDescription className="text-xs">
              {t('providerProfilePage.sections.profileDescription', 'Personnalisez votre présentation publique.')}
            </SectionDescription>
          </div>
          <label className="space-y-2 text-sm text-saubio-slate/80" id="languages">
            <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
              {t('providerProfilePage.fields.bio')}
            </span>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((state) => ({ ...state, bio: event.target.value }))}
              rows={5}
              className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
            />
          </label>
          <label className="space-y-2 text-sm text-saubio-slate/80">
            <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
              {t('providerProfilePage.fields.languages')}
            </span>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((option) => {
                const isSelected = form.languages.includes(option.code);
                return (
                  <button
                    type="button"
                    key={option.code}
                    onClick={() =>
                      setForm((state) => ({
                        ...state,
                        languages: state.languages.includes(option.code)
                          ? state.languages.filter((code) => code !== option.code)
                          : [...state.languages, option.code],
                      }))
                    }
                    aria-pressed={isSelected}
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
            <span className="text-[11px] text-saubio-slate/50">
              {t('providerProfilePage.fields.languagesHelp', 'Sélectionnez une ou plusieurs langues.')}
            </span>
          </label>
          <div className="space-y-3 text-sm text-saubio-slate/80" id="service-areas">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('providerProfilePage.fields.serviceAreas')}
              </span>
              <div className="relative">
                <input
                  value={zoneQuery}
                  onChange={(event) => setZoneQuery(event.target.value)}
                  onFocus={() => setZoneDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setZoneDropdownOpen(false), 150)}
                  placeholder={t(
                    'providerProfilePage.sections.zonesPlaceholder',
                    'Berlin, Friedrichshain…'
                  )}
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
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-saubio-mist/60 px-4 py-3"
                  >
                    <div className="min-w-[140px] flex-1">
                      <p className="text-sm font-semibold text-saubio-forest">{zone.name}</p>
                      <p className="text-xs text-saubio-slate/60">
                        {[zone.city, zone.district].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-saubio-slate/70">
                      <span>{t('providerProfilePage.sections.zonesRadiusLabel', 'Rayon (km)')}</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={zone.radiusKm ?? 5}
                        onChange={(event) => handleZoneRadiusChange(index, Number(event.target.value))}
                        className="w-16 rounded-2xl border border-saubio-forest/15 px-2 py-1 text-right text-sm outline-none focus:border-saubio-forest"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveZone(index)}
                      className="text-xs font-semibold text-saubio-slate/60 transition hover:text-red-500"
                    >
                      {t('providerProfilePage.sections.zonesRemove', 'Retirer')}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-saubio-slate/60">
                {t(
                  'providerProfilePage.sections.zonesEmpty',
                  'Aucune zone sélectionnée pour le moment.'
                )}
              </p>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard variant="soft" padding="md" className="space-y-4" id="pricing">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('providerProfilePage.availability')}
          </h2>
          <label className="space-y-2 text-sm text-saubio-slate/80">
            <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
              {t('providerProfilePage.fields.hourlyRate')}
            </span>
            <input
              type="number"
              min={0}
              value={form.hourlyRate}
              onChange={(event) => setForm((state) => ({ ...state, hourlyRate: Number(event.target.value) }))}
              className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-saubio-slate/80">
            <input
              type="checkbox"
              checked={form.offersEco}
              onChange={(event) => setForm((state) => ({ ...state, offersEco: event.target.checked }))}
              className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
            />
            {t('providerProfilePage.fields.offersEco')}
          </label>
          <label className="flex items-center gap-2 text-sm text-saubio-slate/80">
            <input
              type="checkbox"
              checked={form.acceptsAnimals}
              onChange={(event) =>
                setForm((state) => ({ ...state, acceptsAnimals: event.target.checked }))
              }
              className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
            />
            {t('providerProfilePage.fields.acceptsAnimals', 'J’accepte les missions avec animaux')}
          </label>
          <label className="space-y-2 text-sm text-saubio-slate/80">
            <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
              {t('providerProfilePage.fields.yearsExperience')}
            </span>
            <input
              type="number"
              min={0}
              value={form.yearsExperience}
              onChange={(event) =>
                setForm((state) => ({ ...state, yearsExperience: Number(event.target.value) }))
              }
              className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:opacity-60"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending
              ? t('providerProfilePage.actions.saving')
              : t('providerProfilePage.actions.save')}
          </button>

          {successMessage ? (
            <p className="text-xs font-semibold text-emerald-600">{successMessage}</p>
          ) : null}
        </SurfaceCard>
      </form>
    </div>
  );
}
