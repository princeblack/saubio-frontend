'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAdminSupportPipeline,
  useRequireRole,
  formatDateTime,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton, Pill } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

type StatusColumn = 'new' | 'assigned' | 'waiting_client' | 'resolved';
const columns: StatusColumn[] = ['new', 'assigned', 'waiting_client', 'resolved'];

export default function AdminSupportPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['admin', 'employee'] });
  const supportQuery = useAdminSupportPipeline();

  const pipeline = useMemo(() => {
    const data = supportQuery.data ?? [];
    return columns.map((status) => ({
      status,
      items: data.filter((item) => item.status === status),
    }));
  }, [supportQuery.data]);

  if (!session.user) {
    return null;
  }

  if (supportQuery.isLoading) {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('adminSupportPage.title')}
          </SectionTitle>
          <SectionDescription>{t('adminSupportPage.subtitle')}</SectionDescription>
        </header>
        <SurfaceCard variant="soft" padding="md">
          <Skeleton className="h-4 w-52 rounded-full" />
          <Skeleton className="mt-4 h-40 rounded-4xl" />
        </SurfaceCard>
      </div>
    );
  }

  if (supportQuery.isError) {
    return (
      <div className="space-y-6">
        <ErrorState
          title={t('adminDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
          description={t('adminDashboard.section.placeholderDescription')}
          onRetry={() => {
            void supportQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('adminSupportPage.title')}
        </SectionTitle>
        <SectionDescription>{t('adminSupportPage.subtitle')}</SectionDescription>
      </header>

      <div className="grid gap-4 lg:grid-cols-4">
        {pipeline.map(({ status, items }) => (
          <SurfaceCard key={status} variant="soft" padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                {t(`adminSupportPage.status.${status}`)}
              </h2>
              <Pill tone={status === 'waiting_client' ? 'sun' : status === 'resolved' ? 'forest' : 'mist'}>
                {items.length}
              </Pill>
            </div>
            {items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-4 text-center text-xs text-saubio-slate/60">
                {t('adminSupportPage.empty')}
              </p>
            ) : (
              <ul className="space-y-3 text-xs text-saubio-slate/70">
                {items.map((item) => (
                  <li key={item.id} className="space-y-2 rounded-2xl bg-white/80 p-3 shadow-soft-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-saubio-forest">{item.subject}</p>
                      <Pill tone={item.priority === 'urgent' ? 'sun' : item.priority === 'high' ? 'forest' : 'mist'}>
                        {t(`adminSupportPage.priority.${item.priority}`)}
                      </Pill>
                    </div>
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-saubio-slate/50">
                      <span>{t(`adminSupportPage.channel.${item.channel}`)}</span>
                      <span>{formatDateTime(item.updatedAt)}</span>
                    </div>
                    <div className="text-[11px] text-saubio-slate/60">
                      {item.assignee ? `${t('adminSupportPage.columns.assignee')}: ${item.assignee}` : t('adminSupportPage.columns.requester') + `: ${item.requester}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
