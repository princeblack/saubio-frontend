'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useProviderProfile,
  useUpdateProviderProfileMutation,
  useRequireRole,
  useProviderPaymentsOnboardingMutation,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../../components/feedback/ErrorState';

const LANGUAGE_OPTIONS = [
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Allemand' },
  { code: 'en', label: 'Anglais' },
  { code: 'tr', label: 'Turc' },
  { code: 'pl', label: 'Polonais' },
] as const;

const normalizePayoutStatus = (
  status?: string | null
): 'pending' | 'in_review' | 'verified' | 'rejected' => {
  const normalized = (status ?? 'pending').toLowerCase();
  if (normalized === 'verified' || normalized === 'in_review' || normalized === 'rejected') {
    return normalized;
  }
  return 'pending';
};

export default function ProviderProfileIdentityPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  if (!session.user) {
    return null;
  }

  const profileQuery = useProviderProfile();
  const updateProfileMutation = useUpdateProviderProfileMutation();
  const onboardingMutation = useProviderPaymentsOnboardingMutation();
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    bio: '',
    languages: [] as string[],
    yearsExperience: 0,
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    setForm({
      bio: profileQuery.data.bio ?? '',
      languages: profileQuery.data.languages ?? [],
      yearsExperience: profileQuery.data.yearsExperience ?? 0,
    });
  }, [profileQuery.data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    updateProfileMutation.mutate(
      {
        bio: form.bio,
        languages: form.languages,
        yearsExperience: Math.max(0, form.yearsExperience),
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

  const identityDocuments =
    (profileQuery.data.documents ?? []).filter((doc) => doc.type === 'identity') ?? [];
  const identityStatus = (profileQuery.data.identityVerificationStatus ?? 'not_started').toLowerCase();
  const identityStatusClass =
    identityStatus === 'verified'
      ? 'bg-emerald-100 text-emerald-800'
      : identityStatus === 'rejected'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-800';
  const payoutStatus = normalizePayoutStatus(profileQuery.data.kycStatus);
  const payoutReady = Boolean(profileQuery.data.payoutReady && payoutStatus === 'verified');
  const payoutStatusFallback = payoutStatus
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
  const payoutStatusLabel = t(
    `providerProfilePage.payout.statusLabel.${payoutStatus}`,
    payoutStatusFallback
  );
  const payoutStatusTone =
    payoutStatus === 'verified'
      ? 'border border-emerald-200 bg-emerald-100 text-emerald-900'
      : payoutStatus === 'rejected'
        ? 'border border-red-200 bg-red-100 text-red-700'
        : 'border border-amber-200 bg-amber-100 text-amber-800';
  const payoutCardTone =
    payoutStatus === 'rejected'
      ? 'border border-red-200 bg-red-50'
      : payoutStatus === 'in_review'
        ? 'border border-amber-200 bg-amber-50'
        : 'border border-amber-200 bg-amber-50';
  const payoutTitleKey =
    payoutStatus === 'rejected'
      ? 'providerProfilePage.payout.rejectedTitle'
      : payoutStatus === 'in_review'
        ? 'providerProfilePage.payout.reviewTitle'
        : 'providerProfilePage.payout.requiredTitle';
  const payoutDescriptionKey =
    payoutStatus === 'rejected'
      ? 'providerProfilePage.payout.rejectedDescription'
      : payoutStatus === 'in_review'
        ? 'providerProfilePage.payout.reviewDescription'
        : 'providerProfilePage.payout.requiredDescription';
  const payoutStatusHint = t(
    `providerProfilePage.payout.statusHint.${payoutStatus}`,
    t('providerProfilePage.payout.statusHint.pending', 'Vérification en cours.')
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerProfilePage.title')}
        </SectionTitle>
        <SectionDescription>
          {t('providerProfilePage.subtitle')}
        </SectionDescription>
      </header>

      {successMessage ? (
        <div className="rounded-2xl border border-saubio-forest/20 bg-saubio-mist/40 px-4 py-3 text-sm font-semibold text-saubio-forest">
          {successMessage}
        </div>
      ) : null}

      {!payoutReady ? (
        <SurfaceCard variant="soft" padding="md" className={`space-y-4 ${payoutCardTone}`}>
          <div>
            <p className="text-sm font-semibold">
              {t(payoutTitleKey, 'Activez vos paiements')}
            </p>
            <p className="text-xs text-saubio-slate/70">
              {t(
                payoutDescriptionKey,
                'Ajoutez vos coordonnées bancaires pour recevoir vos missions. Le portail Mollie vous guide étape par étape.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${payoutStatusTone}`}>
              {payoutStatusLabel}
            </span>
            <span className="text-saubio-slate/60">{payoutStatusHint}</span>
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
              <dd>
                {profileQuery.data.payoutMethod === 'bank_transfer'
                  ? t('providerProfilePage.payout.bank', 'Virement bancaire')
                  : t('providerProfilePage.payout.card', 'Carte bancaire')}
              </dd>
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
                {t('providerProfilePage.payout.status', 'Statut')}
              </dt>
              <dd>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${payoutStatusTone}`}>
                  {payoutStatusLabel}
                </span>
              </dd>
            </div>
          </dl>
        </SurfaceCard>
      )}

      <SurfaceCard variant="soft" padding="md" className="space-y-4 border border-saubio-mist/60">
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

      <form onSubmit={handleSubmit}>
        <SurfaceCard variant="soft" padding="md" className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('providerProfilePage.details')}
            </h2>
            <SectionDescription className="text-xs">
              {t('providerProfilePage.sections.profileDescription', 'Personnalisez votre présentation publique.')}
            </SectionDescription>
          </div>

          <label className="space-y-2 text-sm text-saubio-slate/80">
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

          <div className="space-y-2 text-sm text-saubio-slate/80">
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
          </div>

          <label className="space-y-2 text-sm text-saubio-slate/80">
            <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
              {t('providerProfilePage.fields.yearsExperience')}
            </span>
            <input
              type="number"
              min={0}
              value={form.yearsExperience}
              onChange={(event) =>
                setForm((state) => ({ ...state, yearsExperience: Number(event.target.value) || 0 }))
              }
              className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-saubio-forest"
            />
          </label>

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
