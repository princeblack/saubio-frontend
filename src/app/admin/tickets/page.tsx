'use client';

import { useTranslation } from 'react-i18next';
import {
  useAdminTickets,
  useRequireRole,
  formatDateTime,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton, Pill } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

export default function AdminTicketsPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['admin', 'employee'] });
  const ticketsQuery = useAdminTickets();

  if (!session.user) {
    return null;
  }

  if (ticketsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('adminTicketsPage.title')}
          </SectionTitle>
          <SectionDescription>{t('adminTicketsPage.subtitle')}</SectionDescription>
        </header>
        <SurfaceCard variant="soft" padding="md">
          <Skeleton className="h-4 w-56 rounded-full" />
          <Skeleton className="mt-4 h-32 rounded-3xl" />
        </SurfaceCard>
      </div>
    );
  }

  if (ticketsQuery.isError) {
    return (
      <div className="space-y-6">
        <ErrorState
          title={t('adminDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
          description={t('adminDashboard.section.placeholderDescription')}
          onRetry={() => {
            void ticketsQuery.refetch();
          }}
        />
      </div>
    );
  }

  const tickets = (ticketsQuery.data ?? []).slice().sort((a, b) => {
    const impactOrder = { critical: 3, high: 2, medium: 1, low: 0 } as Record<string, number>;
    return (impactOrder[b.impact] ?? 0) - (impactOrder[a.impact] ?? 0);
  });

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('adminTicketsPage.title')}
        </SectionTitle>
        <SectionDescription>{t('adminTicketsPage.subtitle')}</SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md">
        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
            {t('adminTicketsPage.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-saubio-forest/10 text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-saubio-slate/50">
                  <th className="py-2 pr-4">{t('adminTicketsPage.columns.title')}</th>
                  <th className="py-2 pr-4">{t('adminTicketsPage.columns.impact')}</th>
                  <th className="py-2 pr-4">{t('adminTicketsPage.columns.status')}</th>
                  <th className="py-2 pr-4">{t('adminTicketsPage.columns.owner')}</th>
                  <th className="py-2 pr-4">{t('adminTicketsPage.columns.tags')}</th>
                  <th className="py-2">{t('adminTicketsPage.columns.updatedAt')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saubio-forest/10">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/60">
                    <td className="py-3 pr-4 font-semibold text-saubio-forest">{ticket.title}</td>
                    <td className="py-3 pr-4">
                      <Pill tone={ticket.impact === 'high' ? 'sun' : ticket.impact === 'medium' ? 'forest' : 'mist'}>
                        {t(`adminTicketsPage.impact.${ticket.impact}`)}
                      </Pill>
                    </td>
                    <td className="py-3 pr-4 text-xs uppercase tracking-widest text-saubio-slate/60">
                      {t(`adminTicketsPage.status.${ticket.status}`)}
                    </td>
                    <td className="py-3 pr-4 text-xs text-saubio-slate/60">{ticket.owner}</td>
                    <td className="py-3 pr-4 text-xs text-saubio-slate/60">
                      {ticket.tags.join(', ')}
                    </td>
                    <td className="py-3 text-xs text-saubio-slate/60">
                      {formatDateTime(ticket.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
