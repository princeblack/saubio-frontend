'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useProviderEarnings,
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
  const earningsQuery = useProviderEarnings();
  const documentsQuery = useProviderDocuments();

  const earnings = earningsQuery.data;
  const missions = earnings?.missions ?? [];
  const summary = earnings?.summary;
  const payoutDocuments = documentsQuery.data ?? [];
  const handleDocumentDownload = (documentId: string, url: string, name?: string) => {
    void downloadDocument(url, name ?? 'document.pdf').catch((error) => {
      console.error('Saubio::DocumentDownload', documentId, error);
    });
  };

  const monthlyTrend = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' });
    const map = new Map<string, number>();
    missions
      .filter((mission) => mission.status === 'payable' || mission.status === 'paid')
      .forEach((mission) => {
        const key = formatter.format(new Date(mission.endAt));
        map.set(key, (map.get(key) ?? 0) + mission.amountCents);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [missions]);
  const overviewCards = [
    {
      key: 'total',
      label: t('providerRevenue.summary.total'),
      value: summary?.totalEarnedCents ?? 0,
    },
    {
      key: 'awaiting',
      label: t('providerRevenue.summary.awaitingValidation'),
      value: summary?.awaitingValidationCents ?? 0,
    },
    {
      key: 'payable',
      label: t('providerRevenue.summary.payable'),
      value: summary?.payableCents ?? 0,
    },
    {
      key: 'paid',
      label: t('providerRevenue.summary.paid'),
      value: summary?.paidCents ?? 0,
    },
  ];
  const statusLabels = {
    upcoming: t('providerRevenue.statuses.upcoming'),
    awaiting_validation: t('providerRevenue.statuses.awaiting_validation'),
    payable: t('providerRevenue.statuses.payable'),
    paid: t('providerRevenue.statuses.paid'),
  };
  const statusDescriptions = {
    upcoming: t('providerRevenue.statusDescriptions.upcoming'),
    awaiting_validation: t('providerRevenue.statusDescriptions.awaiting_validation'),
    payable: t('providerRevenue.statusDescriptions.payable'),
    paid: t('providerRevenue.statusDescriptions.paid'),
  };
  const statusStyles: Record<string, string> = {
    upcoming: 'border-amber-200 bg-amber-50 text-amber-900',
    awaiting_validation: 'border-orange-200 bg-orange-50 text-orange-900',
    payable: 'border-sky-200 bg-sky-50 text-sky-900',
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
  const lastPayout = summary?.lastPayoutAt ?? null;
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    []
  );

  if (earningsQuery.isLoading) {
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

  if (earningsQuery.isError || !earnings) {
    return (
      <div className="space-y-6">
        <ErrorState
          title={t('providerDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
          description={t('providerDashboard.errorDescription', t('bookingDashboard.errorDescription'))}
          onRetry={() => {
            void earningsQuery.refetch();
          }}
        />
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('providerRevenue.overviewTitle')}
          </h2>
        </div>
        <div className="grid gap-4 text-sm text-saubio-slate/80 sm:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card) => (
            <div key={card.key} className="rounded-2xl bg-white/80 p-4 shadow-soft-sm">
              <p className="text-xs uppercase tracking-wide text-saubio-slate/50">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-saubio-forest">
                {formatCurrencyFromCents(card.value)}
              </p>
            </div>
          ))}
        </div>
        <div className="text-xs text-saubio-slate/60">
          <span>{t('providerDashboard.payments.lastPayout')} · </span>
          <span>
            {lastPayout ? formatDateTime(lastPayout) : t('providerRevenue.empty.overview')}
          </span>
        </div>
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('providerRevenue.chartTitle')}
        </h2>
        {monthlyTrend.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
            {t('providerRevenue.empty.overview')}
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
          {t('providerRevenue.historyTitle')}
        </h2>
        {missions.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
            {t('providerRevenue.empty.table')}
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-saubio-forest/10 text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-saubio-slate/50">
                  <th className="py-2 pr-4">{t('providerRevenue.columns.date')}</th>
                  <th className="py-2 pr-4">{t('providerRevenue.columns.client')}</th>
                  <th className="py-2 pr-4">{t('providerRevenue.columns.service')}</th>
                  <th className="py-2 pr-4">{t('providerRevenue.columns.gross')}</th>
                  <th className="py-2 pr-4">{t('providerRevenue.columns.commission')}</th>
                  <th className="py-2 pr-4">{t('providerRevenue.columns.net')}</th>
                  <th className="py-2">{t('providerRevenue.columns.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saubio-forest/10">
                {missions
                  .slice()
                  .sort((a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime())
                  .map((mission) => {
                    const location = mission.city
                      ? `${mission.city}${mission.postalCode ? ` (${mission.postalCode})` : ''}`
                      : '';
                    const serviceLabel = t(`services.${mission.service}`, mission.service);
                    const statusLabel =
                      statusLabels[
                        mission.status as keyof typeof statusLabels
                      ] ?? mission.status;
                    const statusDescription =
                      statusDescriptions[
                        mission.status as keyof typeof statusDescriptions
                      ] ?? '';
                    const statusColor = statusStyles[mission.status] ?? '';
                    const expectedPayout =
                      mission.status === 'payable' && mission.expectedPayoutAt
                        ? t('providerRevenue.expectedPayout', {
                            date: formatDateTime(mission.expectedPayoutAt),
                          })
                        : null;
                    return (
                      <tr key={mission.id} className="hover:bg-white/60">
                        <td className="py-3 pr-4 text-xs text-saubio-slate/60">
                          {dateFormatter.format(new Date(mission.startAt))}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-saubio-forest">
                          {mission.client ?? '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-saubio-forest">{serviceLabel}</p>
                          {location ? (
                            <p className="text-xs text-saubio-slate/60">{location}</p>
                          ) : null}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-saubio-forest">
                          {formatCurrencyFromCents(mission.grossCents)}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-saubio-forest">
                          {formatCurrencyFromCents(mission.commissionCents)}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-saubio-forest">
                          {formatCurrencyFromCents(mission.amountCents)}
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 font-semibold ${statusColor}`}
                            title={statusDescription}
                          >
                            {statusLabel}
                          </span>
                          {expectedPayout ? (
                            <p className="mt-1 text-[11px] text-saubio-slate/60">{expectedPayout}</p>
                          ) : null}
                          {mission.status === 'upcoming' && mission.estimated ? (
                            <p className="mt-1 text-[11px] text-saubio-slate/60">
                              {statusDescriptions.upcoming}
                            </p>
                          ) : null}
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
