'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useProviderProfile,
  useUpdateProviderProfileMutation,
  useRequireRole,
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

export default function ProviderProfileIdentityPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  if (!session.user) {
    return null;
  }

  const profileQuery = useProviderProfile();
  const updateProfileMutation = useUpdateProviderProfileMutation();
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
