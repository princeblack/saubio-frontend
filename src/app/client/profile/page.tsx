'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { localeNames, locales } from '@saubio/config';
import {
  useProfile,
  formatDateTime,
  useRequireRole,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
} from '@saubio/utils';
import type { ProfileResponse } from '@saubio/models';
import { SectionDescription, SectionTitle, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

const digestOptions: Array<'NEVER' | 'DAILY' | 'WEEKLY'> = ['NEVER', 'DAILY', 'WEEKLY'];

const ProfileSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
    <section className="space-y-6 rounded-4xl border border-saubio-forest/10 bg-white p-6 shadow-soft-lg">
      <Skeleton className="h-4 w-48 rounded-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`profile-form-${index}`} className="h-14 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`profile-preference-${index}`} className="h-12 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-44 rounded-full" />
    </section>
    <section className="space-y-4 rounded-4xl border border-saubio-forest/10 bg-white p-6 shadow-soft-lg">
      <Skeleton className="h-4 w-32 rounded-full" />
      <Skeleton className="h-14 rounded-2xl" />
      <Skeleton className="h-14 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
    </section>
  </div>
);

export default function ClientProfilePage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['client', 'company'] });

  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfileMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    preferredLocale: (locales[0] ?? 'de') as string,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [preferenceForm, setPreferenceForm] = useState({
    marketingEmails: false,
    productUpdates: true,
    enableDarkMode: false,
    digestFrequency: 'WEEKLY' as 'NEVER' | 'DAILY' | 'WEEKLY',
  });

  useEffect(() => {
    if (profileQuery.data) {
      setProfileForm({
        firstName: profileQuery.data.firstName ?? '',
        lastName: profileQuery.data.lastName ?? '',
        phone: profileQuery.data.phone ?? '',
        preferredLocale: profileQuery.data.preferredLocale ?? (locales[0] ?? 'de'),
      });
      setPreferenceForm({
        marketingEmails: profileQuery.data.preferences?.marketingEmails ?? false,
        productUpdates: profileQuery.data.preferences?.productUpdates ?? true,
        enableDarkMode: profileQuery.data.preferences?.enableDarkMode ?? false,
        digestFrequency: profileQuery.data.preferences?.digestFrequency ?? 'WEEKLY',
      });
    }
  }, [profileQuery.data]);

  const profile: ProfileResponse | undefined = useMemo(() => profileQuery.data, [profileQuery.data]);

  if (!session.user) {
    return null;
  }

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfileMutation.mutate({
      firstName: profileForm.firstName || undefined,
      lastName: profileForm.lastName || undefined,
      phone: profileForm.phone || undefined,
      preferredLocale: profileForm.preferredLocale,
      preferences: preferenceForm,
    });
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      return;
    }

    updatePasswordMutation.mutate(
      {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordForm({ currentPassword: '', newPassword: '' });
        },
      }
    );
  };

  const renderContent = () => {
    if (profileQuery.isLoading) {
      return <ProfileSkeleton />;
    }

    if (profileQuery.isError) {
      return (
        <div className="rounded-4xl border border-saubio-forest/10 bg-white p-6 shadow-soft-lg">
          <ErrorState
            title={t('profile.errorTitle', t('bookingDashboard.errorTitle'))}
            description={t('profile.errorDescription', t('bookingDashboard.errorDescription'))}
            onRetry={() => {
              void profileQuery.refetch();
            }}
          />
        </div>
      );
    }

    if (!profile) {
      return null;
    }

    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6 rounded-4xl border border-saubio-forest/10 bg-white p-6 shadow-soft-lg">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('profile.sections.details')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50" htmlFor="firstName">
                  {t('profile.fields.firstName')}
                </label>
                <input
                  id="firstName"
                  value={profileForm.firstName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/20 px-4 py-3 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50" htmlFor="lastName">
                  {t('profile.fields.lastName')}
                </label>
                <input
                  id="lastName"
                  value={profileForm.lastName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/20 px-4 py-3 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50" htmlFor="phone">
                  {t('profile.fields.phone')}
                </label>
                <input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/20 px-4 py-3 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50" htmlFor="preferredLocale">
                  {t('profile.fields.locale')}
                </label>
                <select
                  id="preferredLocale"
                  value={profileForm.preferredLocale}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, preferredLocale: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/20 px-4 py-3 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                >
                  {locales.map((code) => (
                    <option key={code} value={code}>
                      {localeNames[code] ?? code.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('profile.sections.preferences')}
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-saubio-slate/70">
                  <input
                    type="checkbox"
                    checked={preferenceForm.marketingEmails}
                    onChange={(event) =>
                      setPreferenceForm((current) => ({ ...current, marketingEmails: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
                  />
                  {t('profile.preferences.marketing')}
                </label>
                <label className="flex items-center gap-2 text-sm text-saubio-slate/70">
                  <input
                    type="checkbox"
                    checked={preferenceForm.productUpdates}
                    onChange={(event) =>
                      setPreferenceForm((current) => ({ ...current, productUpdates: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
                  />
                  {t('profile.preferences.productUpdates')}
                </label>
                <label className="flex items-center gap-2 text-sm text-saubio-slate/70">
                  <input
                    type="checkbox"
                    checked={preferenceForm.enableDarkMode}
                    onChange={(event) =>
                      setPreferenceForm((current) => ({ ...current, enableDarkMode: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
                  />
                  {t('profile.preferences.darkMode')}
                </label>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                    {t('profile.preferences.digest')}
                  </label>
                  <select
                    value={preferenceForm.digestFrequency}
                    onChange={(event) =>
                      setPreferenceForm((current) => ({
                        ...current,
                        digestFrequency: event.target.value as typeof preferenceForm.digestFrequency,
                      }))
                    }
                    className="w-full rounded-2xl border border-saubio-forest/20 px-4 py-3 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                  >
                    {digestOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:opacity-60"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending
                  ? t('profile.actions.saving')
                  : t('profile.actions.save')}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4 rounded-4xl border border-saubio-forest/10 bg-white p-6 shadow-soft-lg">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('profile.sections.security')}
          </h2>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50"
                htmlFor="currentPassword"
              >
                {t('profile.fields.currentPassword')}
              </label>
              <input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                }
                className="w-full rounded-2xl border border-saubio-forest/20 px-4 py-3 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50"
                htmlFor="newPassword"
              >
                {t('profile.fields.newPassword')}
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                }
                className="w-full rounded-2xl border border-saubio-forest/20 px-4 py-3 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:opacity-60"
              disabled={updatePasswordMutation.isPending}
            >
              {updatePasswordMutation.isPending
                ? t('profile.actions.updatingPassword')
                : t('profile.actions.updatePassword')}
            </button>
          </form>

          <div className="rounded-2xl border border-saubio-forest/15 bg-saubio-mist/30 p-4 text-xs text-saubio-slate/70">
            <p>
              {t('profile.meta.createdAt')} {formatDateTime(profile.createdAt)}
            </p>
            <p>
              {t('profile.meta.updatedAt')}{' '}
              {formatDateTime(profile.updatedAt ?? profile.createdAt)}
            </p>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('profile.title')}
        </SectionTitle>
        <SectionDescription>{t('profile.description')}</SectionDescription>
      </header>

      {renderContent()}
    </div>
  );
}
