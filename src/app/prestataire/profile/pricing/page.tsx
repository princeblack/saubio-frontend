'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../../components/feedback/ErrorState';
import {
  useProviderProfile,
  useUpdateProviderProfileMutation,
  useRequireRole,
} from '@saubio/utils';

export default function ProviderPricingPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  if (!session.user) {
    return null;
  }

  const profileQuery = useProviderProfile();
  const updateProfileMutation = useUpdateProviderProfileMutation();
  const [form, setForm] = useState({
    hourlyRate: 0,
    offersEco: false,
    acceptsAnimals: false,
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!profileQuery.data) return;
    setForm({
      hourlyRate: Math.round((profileQuery.data.hourlyRateCents ?? 0) / 100),
      offersEco: profileQuery.data.offersEco ?? false,
      acceptsAnimals: profileQuery.data.acceptsAnimals ?? false,
    });
  }, [profileQuery.data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    updateProfileMutation.mutate(
      {
        hourlyRateCents: Math.round(Math.max(form.hourlyRate, 0) * 100),
        offersEco: form.offersEco,
        acceptsAnimals: form.acceptsAnimals,
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
            {t('sidebar.provider.earningsPricing', 'Tarifs')}
          </SectionTitle>
          <SectionDescription>
            {t('providerProfilePage.pricing.subtitle', 'Définissez vos tarifs et options additionnelles.')}
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
          {t('sidebar.provider.earningsPricing', 'Tarifs')}
        </SectionTitle>
        <SectionDescription>
          {t('providerProfilePage.pricing.subtitle', 'Définissez vos tarifs et options additionnelles.')}
        </SectionDescription>
      </header>

      {successMessage ? (
        <div className="rounded-2xl border border-saubio-forest/20 bg-saubio-mist/40 px-4 py-3 text-sm font-semibold text-saubio-forest">
          {successMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <SurfaceCard variant="soft" padding="md" className="space-y-4 border border-saubio-mist/60">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('providerProfilePage.availability')}
            </h2>
            <SectionDescription className="text-xs">
              {t('providerProfilePage.fields.hourlyRateHelp', 'Ajustez vos tarifs pour refléter votre expertise.')}
            </SectionDescription>
          </div>

          <label className="space-y-2 text-sm text-saubio-slate/80">
            <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
              {t('providerProfilePage.fields.hourlyRate')}
            </span>
            <input
              type="number"
              min={0}
              value={form.hourlyRate}
              onChange={(event) =>
                setForm((state) => ({ ...state, hourlyRate: Number(event.target.value) || 0 }))
              }
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
