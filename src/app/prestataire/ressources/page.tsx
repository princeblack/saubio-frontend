'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProviderResources, useRequireRole } from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

type ResourceType = 'all' | 'checklist' | 'document' | 'training';

export default function ProviderResourcesPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  if (!session.user) {
    return null;
  }
  const resourcesQuery = useProviderResources();
  const [typeFilter, setTypeFilter] = useState<ResourceType>('all');

  const resources = resourcesQuery.data ?? [];

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return resources;
    return resources.filter((resource) => resource.type === typeFilter);
  }, [resources, typeFilter]);

  if (resourcesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('providerResourcesPage.title')}
          </SectionTitle>
          <SectionDescription>{t('providerResourcesPage.subtitle')}</SectionDescription>
        </header>
        <SurfaceCard variant="soft" padding="md">
          <Skeleton className="h-4 w-48 rounded-full" />
          <Skeleton className="mt-4 h-24 rounded-3xl" />
        </SurfaceCard>
      </div>
    );
  }

  if (resourcesQuery.isError) {
    return (
      <div className="space-y-6">
        <ErrorState
          title={t('providerDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
          description={t('providerDashboard.errorDescription', t('bookingDashboard.errorDescription'))}
          onRetry={() => {
            void resourcesQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerResourcesPage.title')}
        </SectionTitle>
        <SectionDescription>{t('providerResourcesPage.subtitle')}</SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <div className="flex flex-wrap gap-3 text-xs">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as ResourceType)}
            className="rounded-full border border-saubio-forest/15 bg-white px-4 py-2 text-sm outline-none transition focus:border-saubio-forest"
          >
            <option value="all">{t('providerResourcesPage.filters.all')}</option>
            <option value="checklist">{t('providerResourcesPage.filters.checklist')}</option>
            <option value="document">{t('providerResourcesPage.filters.document')}</option>
            <option value="training">{t('providerResourcesPage.filters.training')}</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
            {t('providerResourcesPage.empty')}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {filtered.map((resource) => (
              <SurfaceCard key={resource.id} variant="default" padding="sm" className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-saubio-slate/50">
                    {t(`providerResourcesPage.filters.${resource.type}`)}
                  </p>
                  <h3 className="text-base font-semibold text-saubio-forest">{resource.title}</h3>
                  <p className="text-sm text-saubio-slate/70">{resource.description}</p>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-saubio-slate/50">
                  {t('providerResourcesPage.updated', {
                    date: new Date(resource.updatedAt).toLocaleDateString(),
                  })}
                </p>
                <a
                  href={resource.url}
                  className="inline-flex items-center gap-2 rounded-full border border-saubio-forest/30 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('providerResourcesPage.open')}
                </a>
              </SurfaceCard>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
