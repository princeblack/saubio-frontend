'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatDateTime,
  formatEuro,
  useAdminProviderRequests,
  useRequireRole,
  useUpdateAdminProviderRequestMutation,
  useManualPayoutBatchMutation,
  usePayoutBatches,
  useAdminIdentityQueue,
  useAdminProviderIdentityReview,
  useReviewProviderIdentityDocumentMutation,
  useCompleteWelcomeSessionAdminMutation,
  downloadDocument,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton, Pill } from '@saubio/ui';
import type {
  ProviderDocumentSummary,
  ProviderIdentityDocumentSummary,
  ProviderOnboardingRequest,
} from '@saubio/models';
import { ErrorState } from '../../../components/feedback/ErrorState';

const statusOptions = ['all', 'pending', 'approved', 'rejected'] as const;
const typeOptions = ['all', 'freelancer', 'company'] as const;

type StatusFilter = (typeof statusOptions)[number];
type TypeFilter = (typeof typeOptions)[number];

export default function AdminProviderRequestsPage() {
  const session = useRequireRole({ allowedRoles: ['employee'] });
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const requestsQuery = useAdminProviderRequests();
  const updateMutation = useUpdateAdminProviderRequestMutation();
  const manualPayoutMutation = useManualPayoutBatchMutation();
  const payoutBatchesQuery = usePayoutBatches();
  const payoutBatches = payoutBatchesQuery.data ?? [];
  const [identityStatusFilter, setIdentityStatusFilter] = useState<'all' | 'submitted' | 'rejected'>('submitted');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [manualProviderId, setManualProviderId] = useState('');
  const [identityNotes, setIdentityNotes] = useState('');
  const identityQueueQuery = useAdminIdentityQueue(identityStatusFilter === 'all' ? undefined : identityStatusFilter);
  const identityReviewQuery = useAdminProviderIdentityReview(selectedProviderId ?? undefined);
  const reviewIdentityMutation = useReviewProviderIdentityDocumentMutation();
  const completeWelcomeSessionMutation = useCompleteWelcomeSessionAdminMutation();

  const languageMap = useMemo(() => {
    return (t('providerRegister.languages.options', { returnObjects: true }) as Record<string, string>) ?? {};
  }, [t, i18n.language]);

  const areaMap = useMemo(() => {
    return (t('providerRegister.serviceAreas.options', { returnObjects: true }) as Record<string, string>) ?? {};
  }, [t, i18n.language]);

  const filteredRequests = useMemo(() => {
    const items = requestsQuery.data ?? [];
    return items.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== 'all' && request.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [requestsQuery.data, statusFilter, typeFilter]);

  const identityQueue = identityQueueQuery.data ?? [];

  useEffect(() => {
    if (!selectedProviderId && identityQueue.length) {
      setSelectedProviderId(identityQueue[0]?.providerId ?? null);
    }
  }, [identityQueue, selectedProviderId]);

  useEffect(() => {
    setIdentityNotes('');
  }, [selectedProviderId]);

  if (!session.user) {
    return null;
  }

  const handleAction = (request: ProviderOnboardingRequest, status: 'approved' | 'rejected') => {
    setFeedback(null);
    updateMutation.mutate(
      {
        id: request.id,
        payload: {
          status,
          reviewer: session.user?.firstName ?? 'Admin',
        },
      },
      {
        onSuccess: () => {
          setFeedback(t(`adminProviderRequestsPage.toast.${status}`));
        },
      }
    );
  };

  const renderRequestCard = (request: ProviderOnboardingRequest) => {
    const languageBadges = request.languages.map((code) => ({
      code,
      label: languageMap[code] ?? code.toUpperCase(),
    }));
    const areaLabels = request.serviceAreas.map((code) => areaMap[code] ?? code);
    const statusTone =
      request.status === 'approved' ? 'forest' : request.status === 'rejected' ? 'mist' : 'sun';

    return (
      <div key={request.id} className="rounded-3xl border border-saubio-forest/10 bg-white/90 p-5 shadow-soft-lg/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-saubio-forest">{request.contactName}</p>
            <div className="text-sm text-saubio-slate/70">
              <a href={`mailto:${request.email}`} className="underline-offset-2 hover:underline">
                {request.email}
              </a>
              {request.phone ? <span> · {request.phone}</span> : null}
            </div>
            {request.companyName ? (
              <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                {request.companyName}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <Pill tone={statusTone}>{t(`adminProviderRequestsPage.status.${request.status}`)}</Pill>
            <span className="text-xs text-saubio-slate/60">
              {t('adminProviderRequestsPage.columns.createdAt')}: {formatDateTime(request.createdAt)}
            </span>
            {request.reviewedAt ? (
              <span className="text-xs text-saubio-slate/60">
                {t('adminProviderRequestsPage.columns.reviewedAt')}: {formatDateTime(request.reviewedAt)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="rounded-full border border-saubio-forest/15 px-3 py-1 font-semibold text-saubio-forest">
            {t(`adminProviderRequestsPage.type.${request.type}`)}
          </div>
          {languageBadges.map(({ code, label }) => (
            <span key={`${request.id}-lang-${code}`} className="rounded-full bg-saubio-mist px-3 py-1 font-semibold text-saubio-slate/80">
              {label}
            </span>
          ))}
        </div>

        <div className="mt-3 text-sm text-saubio-slate/80">
          <span className="font-semibold text-saubio-slate">{t('adminProviderRequestsPage.columns.areas')}:</span>{' '}
          {areaLabels.length ? areaLabels.join(', ') : '—'}
        </div>

        <p className="mt-3 rounded-3xl bg-saubio-mist/60 px-4 py-3 text-sm text-saubio-slate/90">
          {request.message?.trim() || t('adminProviderRequestsPage.messageFallback')}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-saubio-slate/70">
          {request.reviewer ? (
            <span>
              {t('adminProviderRequestsPage.columns.reviewedAt')}: {request.reviewer}
            </span>
          ) : (
            <span className="text-xs text-saubio-slate/60">
              {t('adminProviderRequestsPage.columns.contact')} ID: {request.id}
            </span>
          )}
          {request.status === 'pending' ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAction(request, 'approved')}
                disabled={updateMutation.isPending}
                className="rounded-full bg-saubio-forest px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
              >
                {t('adminProviderRequestsPage.actions.approve')}
              </button>
              <button
                type="button"
                onClick={() => handleAction(request, 'rejected')}
                disabled={updateMutation.isPending}
                className="rounded-full border border-saubio-forest/30 px-4 py-1.5 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest disabled:opacity-60"
              >
                {t('adminProviderRequestsPage.actions.reject')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const handleStatementDownload = (document?: ProviderDocumentSummary) => {
    if (!document) {
      return;
    }
    void downloadDocument(document.url, document.name ?? 'document.pdf').catch(() => {
      setFeedback(
        t('adminProviderRequestsPage.payoutBatch.downloadError', 'Échec du téléchargement du relevé.')
      );
    });
  };

  const handleIdentityDownload = (document: ProviderIdentityDocumentSummary) => {
    void downloadDocument(document.url, document.name ?? 'identity.pdf').catch(() => {
      setFeedback(
        t('adminProviderRequestsPage.identity.downloadError', 'Téléchargement impossible. Réessayez.')
      );
    });
  };

  const handleIdentityDecision = (documentId: string, status: 'verified' | 'rejected') => {
    if (!selectedProviderId) {
      return;
    }
    reviewIdentityMutation.mutate(
      {
        providerId: selectedProviderId,
        documentId,
        status,
        notes: identityNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setFeedback(
            status === 'verified'
              ? t('adminProviderRequestsPage.identity.reviewApproved', 'Document validé.')
              : t('adminProviderRequestsPage.identity.reviewRejected', 'Document rejeté.')
          );
          setIdentityNotes('');
        },
      }
    );
  };

  const handleManualIdentityLookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (manualProviderId.trim().length === 0) {
      return;
    }
    setSelectedProviderId(manualProviderId.trim());
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('adminProviderRequestsPage.title')}
        </SectionTitle>
        <SectionDescription>{t('adminProviderRequestsPage.subtitle')}</SectionDescription>
        <button
          type="button"
          onClick={() => {
            manualPayoutMutation.mutate({}, {
              onSuccess: (result) => {
                setFeedback(
                  result
                    ? t('adminProviderRequestsPage.payoutBatch.success', {
                        batch: result.id,
                        count: result.payouts.length,
                      })
                    : t('adminProviderRequestsPage.payoutBatch.empty', 'Aucun payout en attente')
                );
              },
            });
          }}
          className="rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
          disabled={manualPayoutMutation.isPending}
        >
          {manualPayoutMutation.isPending
            ? t('adminProviderRequestsPage.payoutBatch.processing', 'Création du lot...')
            : t('adminProviderRequestsPage.payoutBatch.cta', 'Créer un lot de versement')}
        </button>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="rounded-full border border-saubio-forest/15 bg-white px-4 py-2 outline-none transition focus:border-saubio-forest"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {t(`adminProviderRequestsPage.status.${option}`)}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
            className="rounded-full border border-saubio-forest/15 bg-white px-4 py-2 outline-none transition focus:border-saubio-forest"
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {t(`adminProviderRequestsPage.type.${option}`)}
              </option>
            ))}
          </select>
        </div>

        {feedback ? <p className="text-xs font-semibold text-emerald-600">{feedback}</p> : null}

        {requestsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`provider-request-skeleton-${index}`} className="h-32 rounded-3xl" />
            ))}
          </div>
        ) : requestsQuery.isError ? (
          <ErrorState
            title={t('adminDashboard.errorTitle', t('system.error.generic'))}
            description={t('adminDashboard.section.placeholderDescription')}
            onRetry={() => {
              void requestsQuery.refetch();
            }}
          />
        ) : filteredRequests.length ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => renderRequestCard(request))}
          </div>
        ) : (
          <p className="text-sm text-saubio-slate/70">{t('adminProviderRequestsPage.empty')}</p>
        )}
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('adminProviderRequestsPage.payoutBatch.title', 'Lots de versement')}
            </h2>
            <p className="text-xs text-saubio-slate/60">
              {t(
                'adminProviderRequestsPage.payoutBatch.subtitle',
                'Synthèse des virements groupés générés chaque vendredi.'
              )}
            </p>
          </div>
          {payoutBatchesQuery.isFetching ? (
            <span className="text-xs text-saubio-slate/60">{t('system.loading.generic', 'Chargement…')}</span>
          ) : null}
        </div>
        {payoutBatchesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={`payout-skeleton-${index}`} className="h-24 rounded-3xl" />
            ))}
          </div>
        ) : payoutBatchesQuery.isError ? (
          <ErrorState
            title={t('adminProviderRequestsPage.payoutBatch.errorTitle', 'Impossible de charger les versements')}
            description={t('adminProviderRequestsPage.payoutBatch.errorDescription', 'Réessayez dans quelques instants.')}
            onRetry={() => {
              void payoutBatchesQuery.refetch();
            }}
          />
        ) : payoutBatches.length ? (
          <div className="space-y-4">
            {payoutBatches.map((batch) => (
              <div
                key={batch.id}
                className="rounded-3xl border border-saubio-forest/10 bg-white/80 p-4 shadow-soft-sm transition hover:border-saubio-forest/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-saubio-forest">
                      {t('adminProviderRequestsPage.payoutBatch.batchLabel', { defaultValue: 'Lot #{id}', id: batch.id.slice(-6) })}
                    </p>
                    <p className="text-xs text-saubio-slate/60">
                      {t('adminProviderRequestsPage.payoutBatch.scheduledFor', 'Prévu le')} {formatDateTime(batch.scheduledFor)}
                    </p>
                    <p className="text-xs text-saubio-slate/60">
                      {t('adminProviderRequestsPage.payoutBatch.status', 'Statut')}: {batch.status}
                    </p>
                    {batch.note ? (
                      <p className="text-xs text-saubio-slate/70">{batch.note}</p>
                    ) : null}
                  </div>
                  <Pill tone="sun">
                    {t('adminProviderRequestsPage.payoutBatch.providersCount', {
                      defaultValue: '{{count}} prestataires',
                      count: batch.payouts.length,
                    })}
                  </Pill>
                </div>
                <div className="mt-4 space-y-3">
                  {batch.payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="rounded-2xl border border-saubio-forest/10 bg-saubio-mist/40 p-3 text-sm text-saubio-slate/80"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-saubio-forest">
                            {payout.providerName || t('adminProviderRequestsPage.payoutBatch.unknownProvider', 'Prestataire')}
                          </p>
                          <p className="text-xs text-saubio-slate/60">
                            {t('adminProviderRequestsPage.payoutBatch.missionsCount', {
                              defaultValue: '{{count}} missions',
                              count: payout.missions.length,
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-saubio-forest">
                            {formatEuro(payout.amountCents / 100)}
                          </p>
                          <p className="text-xs text-saubio-slate/60">
                            {t(`providerRevenue.status.${payout.status.toLowerCase()}`, payout.status)}
                          </p>
                          {payout.statementDocument ? (
                            <button
                              type="button"
                              onClick={() => handleStatementDownload(payout.statementDocument)}
                              className="text-xs font-semibold text-saubio-forest underline"
                            >
                              {t('adminProviderRequestsPage.payoutBatch.download', 'Télécharger le relevé')}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {payout.missions.length ? (
                        <ul className="mt-2 space-y-1 text-xs text-saubio-slate/60">
                          {payout.missions.slice(0, 3).map((mission) => (
                            <li key={`${payout.id}-${mission.bookingId}`}>
                              #{mission.bookingId.slice(-6)} · {mission.city ?? t('bookingDashboard.cityUnknown', 'Ville inconnue')}{' '}
                              {mission.startAt ? `· ${formatDateTime(mission.startAt)}` : null}
                            </li>
                          ))}
                          {payout.missions.length > 3 ? (
                            <li className="italic">
                              {t('adminProviderRequestsPage.payoutBatch.moreMissions', {
                                defaultValue: '…et {{count}} missions supplémentaires',
                                count: payout.missions.length - 3,
                              })}
                            </li>
                          ) : null}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-saubio-slate/60">
            {t('adminProviderRequestsPage.payoutBatch.empty', 'Aucun lot de versement à afficher.')}
          </p>
        )}
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md" className="space-y-4 border border-saubio-forest/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('adminProviderRequestsPage.identity.title', 'Vérifications d’identité')}
            </h2>
            <p className="text-xs text-saubio-slate/60">
              {t(
                'adminProviderRequestsPage.identity.subtitle',
                'Examinez les pièces envoyées par les prestataires avant d’activer leurs comptes.'
              )}
            </p>
          </div>
          <select
            value={identityStatusFilter}
            onChange={(event) => setIdentityStatusFilter(event.target.value as 'all' | 'submitted' | 'rejected')}
            className="rounded-full border border-saubio-forest/15 bg-white px-4 py-2 text-xs font-semibold text-saubio-forest outline-none transition focus:border-saubio-forest"
          >
            <option value="submitted">
              {t('adminProviderRequestsPage.identity.filters.submitted', 'En attente')}
            </option>
            <option value="rejected">
              {t('adminProviderRequestsPage.identity.filters.rejected', 'À revalider')}
            </option>
            <option value="all">{t('adminProviderRequestsPage.identity.filters.all', 'Tous')}</option>
          </select>
        </div>

        <form onSubmit={handleManualIdentityLookup} className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
          <input
            type="text"
            value={manualProviderId}
            onChange={(event) => setManualProviderId(event.target.value)}
            placeholder={t('adminProviderRequestsPage.identity.searchPlaceholder', 'ID prestataire')}
            className="flex-1 rounded-full border border-saubio-forest/10 px-4 py-2 outline-none transition focus:border-saubio-forest"
          />
          <button
            type="submit"
            className="rounded-full bg-saubio-forest px-4 py-2 font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
            disabled={!manualProviderId.trim().length}
          >
            {t('adminProviderRequestsPage.identity.searchCta', 'Charger')}
          </button>
        </form>

        {identityQueueQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`identity-queue-skeleton-${index}`} className="h-20 rounded-3xl" />
            ))}
          </div>
        ) : identityQueueQuery.isError ? (
          <ErrorState
            title={t('adminProviderRequestsPage.identity.errorTitle', 'Impossible de charger la liste.')}
            description={t('adminProviderRequestsPage.identity.errorDescription', 'Réessayez plus tard.')}
            onRetry={() => {
              void identityQueueQuery.refetch();
            }}
          />
        ) : identityQueue.length ? (
          <div className="space-y-3">
            {identityQueue.map((item) => (
              <div
                key={item.providerId}
                className={`rounded-3xl border px-5 py-4 ${selectedProviderId === item.providerId ? 'border-saubio-forest/40 bg-saubio-forest/5' : 'border-saubio-forest/10 bg-white'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-saubio-forest">{item.name}</p>
                    <p className="text-xs text-saubio-slate/60">{item.email}</p>
                    <p className="text-xs text-saubio-slate/50">
                      {t('adminProviderRequestsPage.identity.documentsCount', {
                        defaultValue: '{{count}} document(s)',
                        count: item.documents.length,
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={item.status === 'verified' ? 'forest' : item.status === 'rejected' ? 'mist' : 'sun'}>
                      {t(`adminProviderRequestsPage.identity.status.${item.status}`, item.status)}
                    </Pill>
                    <button
                      type="button"
                      onClick={() => setSelectedProviderId(item.providerId)}
                      className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
                    >
                      {selectedProviderId === item.providerId
                        ? t('adminProviderRequestsPage.identity.inspecting', 'En cours…')
                        : t('adminProviderRequestsPage.identity.inspect', 'Examiner')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-saubio-slate/70">
            {t('adminProviderRequestsPage.identity.empty', 'Aucun dossier à examiner.')}
          </p>
        )}
      </SurfaceCard>

      {selectedProviderId ? (
        <SurfaceCard variant="soft" padding="md" className="space-y-4 border border-saubio-forest/10">
          {identityReviewQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-64 rounded-full" />
              <Skeleton className="h-20 rounded-3xl" />
            </div>
          ) : identityReviewQuery.isError ? (
            <ErrorState
              title={t('adminProviderRequestsPage.identity.detailErrorTitle', 'Impossible de charger ce prestataire.')}
              description={t('adminProviderRequestsPage.identity.detailErrorDescription', 'Confirmez l’ID et réessayez.')}
              onRetry={() => {
                void identityReviewQuery.refetch();
              }}
            />
          ) : identityReviewQuery.data ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold text-saubio-forest">{identityReviewQuery.data.name}</p>
                  <p className="text-xs text-saubio-slate/60">{identityReviewQuery.data.email}</p>
                </div>
                <Pill
                  tone={
                    identityReviewQuery.data.status === 'verified'
                      ? 'forest'
                      : identityReviewQuery.data.status === 'rejected'
                        ? 'mist'
                        : 'sun'
                  }
                >
                  {t(
                    `adminProviderRequestsPage.identity.status.${identityReviewQuery.data.status}`,
                    identityReviewQuery.data.status
                  )}
                </Pill>
              </div>

              <div className="rounded-3xl border border-saubio-forest/15 bg-saubio-mist/40 p-4 text-sm text-saubio-slate/80">
                {identityReviewQuery.data.welcomeSessionCompletedAt ? (
                  <p>
                    {t('adminProviderRequestsPage.identity.welcomeDone', {
                      defaultValue: 'Session de bienvenue effectuée le {{date}}',
                      date: formatDateTime(identityReviewQuery.data.welcomeSessionCompletedAt),
                    })}
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p>
                      {t(
                        'adminProviderRequestsPage.identity.welcomePending',
                        'Session de bienvenue en attente de confirmation.'
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        selectedProviderId &&
                        completeWelcomeSessionMutation.mutate(
                          { providerId: selectedProviderId },
                          {
                            onSuccess: () => {
                              setFeedback(
                                t(
                                  'adminProviderRequestsPage.identity.welcomeMarked',
                                  'Session de bienvenue marquée comme réalisée.'
                                )
                              );
                            },
                          }
                        )
                      }
                      className="rounded-full bg-saubio-forest px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
                      disabled={completeWelcomeSessionMutation.isPending}
                    >
                      {completeWelcomeSessionMutation.isPending
                        ? t('adminProviderRequestsPage.identity.welcomeMarking', 'Validation…')
                        : t('adminProviderRequestsPage.identity.welcomeMark', 'Marquer comme faite')}
                    </button>
                  </div>
                )}
              </div>

              <label className="block text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                {t('adminProviderRequestsPage.identity.notesLabel', 'Notes envoyées au prestataire')}
                <textarea
                  value={identityNotes}
                  onChange={(event) => setIdentityNotes(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-saubio-forest/15 p-3 text-sm text-saubio-slate outline-none transition focus:border-saubio-forest"
                  placeholder={t(
                    'adminProviderRequestsPage.identity.notesPlaceholder',
                    'Rappel des éléments manquants, délai, etc.'
                  )}
                />
              </label>

              <div className="space-y-3">
                {identityReviewQuery.data.documents.length ? (
                  identityReviewQuery.data.documents.map((document) => (
                    <div
                      key={document.id}
                      className="rounded-3xl border border-saubio-forest/10 bg-white px-4 py-3 text-sm text-saubio-forest"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{document.name}</p>
                          <p className="text-xs text-saubio-slate/60">
                            {t('adminProviderRequestsPage.identity.uploadedAt', {
                              defaultValue: 'Envoyé le {{date}}',
                              date: formatDateTime(document.uploadedAt),
                            })}
                          </p>
                          {document.notes ? (
                            <p className="text-xs text-saubio-slate/80">{document.notes}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill
                            tone={
                              document.status === 'verified'
                                ? 'forest'
                                : document.status === 'rejected'
                                  ? 'mist'
                                  : 'sun'
                            }
                          >
                            {t(`adminProviderRequestsPage.identity.status.${document.status}`, document.status)}
                          </Pill>
                          <button
                            type="button"
                            onClick={() => handleIdentityDownload(document)}
                            className="rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
                          >
                            {t('adminProviderRequestsPage.identity.download', 'Télécharger')}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-full bg-saubio-forest px-3 py-1 text-xs font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
                          onClick={() => handleIdentityDecision(document.id, 'verified')}
                          disabled={reviewIdentityMutation.isPending}
                        >
                          {t('adminProviderRequestsPage.identity.actions.verify', 'Valider')}
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-400 disabled:opacity-60"
                          onClick={() => handleIdentityDecision(document.id, 'rejected')}
                          disabled={reviewIdentityMutation.isPending}
                        >
                          {t('adminProviderRequestsPage.identity.actions.reject', 'Rejeter')}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-saubio-slate/60">
                    {t('adminProviderRequestsPage.identity.noDocuments', 'Aucun document transmis pour ce prestataire.')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-saubio-slate/70">
              {t('adminProviderRequestsPage.identity.placeholder', 'Sélectionnez un prestataire pour afficher les détails.')}
            </p>
          )}
        </SurfaceCard>
      ) : null}
    </div>
  );
}
