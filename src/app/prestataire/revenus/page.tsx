'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useProviderPayments,
  useProviderDocuments,
  useRequireRole,
  formatEuro,
  formatDateTime,
  downloadDocument,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

const formatCurrencyFromCents = (value: number) => formatEuro(value / 100);

export default function ProviderRevenuePage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  if (!session.user) {
    return null;
  }
  const paymentsQuery = useProviderPayments();
  const documentsQuery = useProviderDocuments();

  const payments = paymentsQuery.data ?? [];
  const payoutDocuments = documentsQuery.data ?? [];
  const handleDocumentDownload = (documentId: string, url: string, name?: string) => {
    void downloadDocument(url, name ?? 'document.pdf').catch((error) => {
      console.error('Saubio::DocumentDownload', documentId, error);
    });
  };

  const monthlyTrend = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' });
    const map = new Map<string, number>();
    payments.forEach((payment) => {
      const key = formatter.format(new Date(payment.occurredAt));
      const value = payment.providerDistributions.reduce(
        (sum, dist) => sum + dist.amountCents,
        0
      );
      map.set(key, (map.get(key) ?? 0) + value);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [payments]);

  if (paymentsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('providerRevenue.title')}
          </SectionTitle>
          <SectionDescription>{t('providerRevenue.subtitle')}</SectionDescription>
        </header>
        <SurfaceCard variant="soft" padding="md">
          <Skeleton className="h-4 w-48 rounded-full" />
          <Skeleton className="mt-4 h-20 rounded-3xl" />
        </SurfaceCard>
      </div>
    );
  }

  if (paymentsQuery.isError) {
    return (
      <div className="space-y-6">
        <ErrorState
          title={t('providerDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
          description={t('providerDashboard.errorDescription', t('bookingDashboard.errorDescription'))}
          onRetry={() => {
            void paymentsQuery.refetch();
          }}
        />
      </div>
    );
  }

  const totalCents = payments.reduce((sum, payment) => {
    const distribution = payment.providerDistributions.reduce((acc, dist) => acc + dist.amountCents, 0);
    return sum + distribution;
  }, 0);

  const pendingCents = payments
    .filter((payment) => payment.providerDistributions.some((dist) => dist.payoutStatus !== 'paid'))
    .reduce((sum, payment) => {
      const distribution = payment.providerDistributions.reduce((acc, dist) => acc + dist.amountCents, 0);
      return sum + distribution;
    }, 0);

  const maxBar = Math.max(...monthlyTrend.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerRevenue.title')}
        </SectionTitle>
        <SectionDescription>{t('providerRevenue.subtitle')}</SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('providerRevenue.summaryTitle')}
        </h2>
        <div className="grid gap-4 text-sm text-saubio-slate/80 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/80 p-4 shadow-soft-sm">
            <p className="text-xs uppercase tracking-wide text-saubio-slate/50">
              {t('providerDashboard.payments.total')}
            </p>
            <p className="mt-2 text-2xl font-semibold text-saubio-forest">
              {formatCurrencyFromCents(totalCents)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-soft-sm">
            <p className="text-xs uppercase tracking-wide text-saubio-slate/50">
              {t('providerDashboard.payments.pending')}
            </p>
            <p className="mt-2 text-2xl font-semibold text-saubio-forest">
              {formatCurrencyFromCents(pendingCents)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-soft-sm">
            <p className="text-xs uppercase tracking-wide text-saubio-slate/50">
              {t('providerDashboard.payments.lastPayout')}
            </p>
            <p className="mt-2 text-sm font-semibold text-saubio-forest">
              {payments.length > 0
                ? formatDateTime(
                    payments
                      .map((payment) => payment.occurredAt)
                      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
                  )
                : t('providerRevenue.status.pending')}
            </p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('providerRevenue.chartTitle')}
        </h2>
        {monthlyTrend.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
            {t('providerRevenue.status.pending')}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {monthlyTrend.map((entry) => (
              <div key={entry.label} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {entry.label}
                </p>
                <div className="flex h-24 items-end rounded-2xl bg-white/80 p-3 shadow-soft-sm">
                  <div
                    className="w-full rounded-full bg-saubio-forest"
                    style={{
                      height: `${Math.max((entry.value / maxBar) * 100, 6)}%`,
                    }}
                  />
                </div>
                <p className="text-sm font-semibold text-saubio-forest">
                  {formatCurrencyFromCents(entry.value)}
                </p>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('providerRevenue.tableTitle')}
        </h2>
        {payments.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
            {t('providerRevenue.status.pending')}
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-saubio-forest/10 text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-saubio-slate/50">
                  <th className="py-2 pr-4">{t('providerRevenue.columns.date')}</th>
                  <th className="py-2 pr-4">{t('providerRevenue.columns.booking')}</th>
                  <th className="py-2 pr-4">{t('providerRevenue.columns.amount')}</th>
                  <th className="py-2">{t('providerRevenue.columns.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saubio-forest/10">
                {payments
                  .slice()
                  .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
                  .map((payment) => {
                    const amount = payment.providerDistributions.reduce(
                      (sum, dist) => sum + dist.amountCents,
                      0
                    );
                    const payoutStatus = payment.providerDistributions[0]?.payoutStatus ?? 'pending';
                    return (
                      <tr key={payment.id} className="hover:bg-white/60">
                        <td className="py-3 pr-4 text-xs text-saubio-slate/60">
                          {formatDateTime(payment.occurredAt)}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-saubio-forest">
                          {payment.bookingId}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-saubio-forest">
                          {formatCurrencyFromCents(amount)}
                        </td>
                        <td className="py-3 text-xs uppercase tracking-wide text-saubio-slate/60">
                          {t(`providerRevenue.status.${payoutStatus}`, payoutStatus)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('providerRevenue.documentsTitle', 'Relevés & factures')}
        </h2>
        {documentsQuery.isLoading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`doc-skeleton-${index}`} className="h-12 rounded-2xl" />
            ))}
          </div>
        ) : documentsQuery.isError ? (
          <ErrorState
            title={t('providerRevenue.documentsErrorTitle', 'Impossible de charger vos relevés')}
            description={t('providerRevenue.documentsErrorDescription', 'Réessayez dans quelques instants.')}
            onRetry={() => {
              void documentsQuery.refetch();
            }}
          />
        ) : payoutDocuments.length ? (
          <ul className="mt-4 space-y-3 text-sm text-saubio-slate/80">
            {payoutDocuments.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-saubio-forest/10 bg-white/80 px-4 py-3 shadow-soft-sm"
              >
                <div>
                  <p className="font-semibold text-saubio-forest">{doc.name}</p>
                  <p className="text-xs text-saubio-slate/60">{formatDateTime(doc.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDocumentDownload(doc.id, doc.url, doc.name)}
                  className="text-xs font-semibold text-saubio-forest underline"
                >
                  {t('providerRevenue.documentsDownload', 'Télécharger')}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-saubio-slate/60">
            {t('providerRevenue.documentsEmpty', 'Vos relevés seront disponibles après votre premier paiement.')}
          </p>
        )}
      </SurfaceCard>
    </div>
  );
}
