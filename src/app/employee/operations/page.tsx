'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAdminOperations,
  useAssignFallbackTeamMutation,
  useRequireRole,
  useBookingLocks,
  useConfirmBookingLocksMutation,
  useReleaseBookingLocksMutation,
  formatDateTime,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton, Pill, LoadingIndicator } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

export default function AdminOperationsPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['employee'] });
  const operationsQuery = useAdminOperations();
  const assignFallbackMutation = useAssignFallbackTeamMutation();
  const confirmLocksMutation = useConfirmBookingLocksMutation();
  const releaseLocksMutation = useReleaseBookingLocksMutation();
  const [locksBookingId, setLocksBookingId] = useState<string | null>(null);
  const locksQuery = useBookingLocks(locksBookingId);

  if (!session.user) {
    return null;
  }

  if (operationsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <SectionTitle as="h1" size="large">
            {t('adminOperationsPage.title')}
          </SectionTitle>
          <SectionDescription>{t('adminOperationsPage.subtitle')}</SectionDescription>
        </header>
        <SurfaceCard variant="soft" padding="md">
          <Skeleton className="h-4 w-56 rounded-full" />
          <Skeleton className="mt-4 h-32 rounded-3xl" />
        </SurfaceCard>
      </div>
    );
  }

  if (operationsQuery.isError || !operationsQuery.data) {
    return (
      <div className="space-y-6">
        <ErrorState
          title={t('adminDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
          description={t('adminDashboard.section.placeholderDescription')}
          onRetry={() => {
            void operationsQuery.refetch();
          }}
        />
      </div>
    );
  }

  const data = operationsQuery.data;
  const fallbackQueue = data?.fallbackQueue ?? [];
  const handleAssignFallback = (bookingId: string) => {
    assignFallbackMutation.mutate(bookingId);
  };
  const locksList = locksQuery.data ?? [];
  const handleViewLocks = (bookingId: string) => {
    setLocksBookingId(bookingId);
  };
  const handleConfirmLock = (lockId: string) => {
    if (!locksBookingId) return;
    confirmLocksMutation.mutate({ bookingId: locksBookingId, payload: { lockIds: [lockId] } });
  };
  const handleReleaseLock = (lockId: string) => {
    if (!locksBookingId) return;
    releaseLocksMutation.mutate({ bookingId: locksBookingId, payload: { lockIds: [lockId] } });
  };
  const handleConfirmAllLocks = () => {
    if (!locksBookingId) return;
    confirmLocksMutation.mutate({ bookingId: locksBookingId });
  };
  const handleReleaseAllLocks = () => {
    if (!locksBookingId) return;
    releaseLocksMutation.mutate({ bookingId: locksBookingId });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('adminOperationsPage.title')}
        </SectionTitle>
        <SectionDescription>{t('adminOperationsPage.subtitle')}</SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('adminOperationsPage.metricsTitle')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.metrics.map((metric) => (
            <SurfaceCard key={metric.id} variant="default" padding="sm" className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-saubio-slate/50">{metric.label}</p>
              <p className="text-2xl font-semibold text-saubio-forest">{metric.value}</p>
              <p className={`text-xs font-semibold ${metric.trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {metric.trend >= 0 ? '+' : ''}
                {metric.trend.toFixed(1)}%
              </p>
            </SurfaceCard>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('adminOperationsPage.fallback.title', 'Escalades matching')}
            </p>
            <p className="text-xs text-saubio-slate/60">
              {t('adminOperationsPage.fallback.subtitle', 'Réaffectations automatiques et files d’attente des équipes.')}
            </p>
          </div>
          <Pill tone={fallbackQueue.length ? 'sun' : 'mist'}>
            {t('adminOperationsPage.fallback.count', { defaultValue: '{{count}} mission(s)', count: fallbackQueue.length })}
          </Pill>
        </div>
        {fallbackQueue.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-saubio-forest/10 bg-white/70 p-6 text-center text-sm text-saubio-slate/60">
            {t('adminOperationsPage.fallback.empty', 'Aucune escalade en attente.')}
          </p>
        ) : (
          <ul className="space-y-3">
            {fallbackQueue.map((entry) => {
              const canAssign = Boolean(entry.teamCandidate);
              const isAssigning =
                assignFallbackMutation.isPending && assignFallbackMutation.variables === entry.bookingId;
              const statusTone = entry.fallbackEscalatedAt ? 'sun' : canAssign ? 'forest' : 'mist';
              return (
                <li
                  key={entry.bookingId}
                  className="flex flex-col gap-4 rounded-3xl border border-saubio-forest/10 bg-white/90 p-4 shadow-soft-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1 text-sm text-saubio-slate/80">
                    <p className="text-base font-semibold text-saubio-forest">
                      {t('adminOperationsPage.fallback.booking', { defaultValue: 'Mission {{id}}', id: entry.bookingId.slice(-6) })}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                      {t('adminOperationsPage.fallback.service', {
                        defaultValue: '{{service}} · {{city}}',
                        service: entry.service,
                        city: entry.city ?? t('adminOperationsPage.fallback.cityUnknown', 'Ville inconnue'),
                      })}
                    </p>
                    <p className="text-xs text-saubio-slate/60">
                      {t('adminOperationsPage.fallback.window', {
                        defaultValue: '{{start}} → {{end}}',
                        start: formatDateTime(entry.startAt),
                        end: formatDateTime(entry.endAt),
                      })}
                    </p>
                    <p className="text-xs text-saubio-slate/50">
                      {t('adminOperationsPage.fallback.retries', {
                        defaultValue: 'Retentatives: {{count}}',
                        count: entry.matchingRetryCount,
                      })}
                    </p>
                    {entry.teamCandidate ? (
                      <p className="text-xs text-saubio-forest">
                        {t('adminOperationsPage.fallback.candidate', {
                          defaultValue: 'Équipe suggérée : {{name}} ({{members}})',
                          name: entry.teamCandidate.name,
                          members: entry.teamCandidate.memberCount,
                        })}
                      </p>
                    ) : (
                      <p className="text-xs text-red-600">
                        {t('adminOperationsPage.fallback.noCandidate', 'Aucune équipe disponible pour le moment.')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    <Pill tone={statusTone as 'forest' | 'sun' | 'mist'}>
                      {entry.fallbackEscalatedAt
                        ? t('adminOperationsPage.fallback.escalated', 'Escalade Ops requise')
                        : canAssign
                        ? t('adminOperationsPage.fallback.ready', 'Prête pour assignation')
                        : t('adminOperationsPage.fallback.pending', 'Recherche en cours')}
                    </Pill>
                    <button
                      type="button"
                      onClick={() => handleAssignFallback(entry.bookingId)}
                      disabled={!canAssign || isAssigning}
                      className="rounded-full border border-saubio-forest/30 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-saubio-forest transition hover:border-saubio-forest disabled:cursor-not-allowed disabled:border-saubio-slate/20 disabled:text-saubio-slate/50"
                    >
                      {isAssigning
                        ? t('adminOperationsPage.fallback.assigning', 'Assignation…')
                        : t('adminOperationsPage.fallback.assignAction', 'Assigner l’équipe')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewLocks(entry.bookingId)}
                      className="rounded-full border border-saubio-forest/15 px-4 py-1 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
                    >
                      {t('adminOperationsPage.fallback.viewLocks', 'Voir les locks')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SurfaceCard>

      {locksBookingId ? (
        <SurfaceCard variant="soft" padding="md" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                {t('adminOperationsPage.locks.title', 'Verrouillages actifs')}
              </p>
              <p className="text-xs text-saubio-slate/60">
                {t('adminOperationsPage.locks.subtitle', { defaultValue: 'Mission {{id}}', id: locksBookingId.slice(-6) })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmAllLocks}
                disabled={confirmLocksMutation.isPending}
                className="rounded-full border border-saubio-forest/25 px-4 py-1 text-xs font-semibold text-saubio-forest disabled:opacity-40"
              >
                {confirmLocksMutation.isPending
                  ? t('adminOperationsPage.locks.bulkConfirming', 'Confirmation…')
                  : t('adminOperationsPage.locks.bulkConfirm', 'Tout confirmer')}
              </button>
              <button
                type="button"
                onClick={handleReleaseAllLocks}
                disabled={releaseLocksMutation.isPending}
                className="rounded-full border border-red-200 px-4 py-1 text-xs font-semibold text-red-600 disabled:opacity-40"
              >
                {releaseLocksMutation.isPending
                  ? t('adminOperationsPage.locks.bulkReleasing', 'Libération…')
                  : t('adminOperationsPage.locks.bulkRelease', 'Tout libérer')}
              </button>
              <button
                type="button"
                onClick={() => setLocksBookingId(null)}
                className="rounded-full border border-saubio-forest/20 px-4 py-1 text-xs font-semibold text-saubio-forest"
              >
                {t('common.close', 'Fermer')}
              </button>
            </div>
          </div>
          {locksQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-saubio-slate/70">
              <LoadingIndicator tone="dark" /> {t('common.loading', 'Chargement…')}
            </div>
          ) : locksQuery.isError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {t('adminOperationsPage.locks.error', 'Impossible de récupérer les locks.')}
            </p>
          ) : locksList.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-saubio-forest/15 bg-white/60 p-4 text-center text-sm text-saubio-slate/60">
              {t('adminOperationsPage.locks.empty', 'Aucun lock actif pour cette mission.')}
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-saubio-slate/80">
              {locksList.map((lock) => {
                const canConfirm = lock.status === 'HELD';
                const confirming =
                  confirmLocksMutation.isPending &&
                  confirmLocksMutation.variables?.bookingId === locksBookingId &&
                  confirmLocksMutation.variables?.payload?.lockIds?.includes(lock.id);
                const releasing =
                  releaseLocksMutation.isPending &&
                  releaseLocksMutation.variables?.bookingId === locksBookingId &&
                  releaseLocksMutation.variables?.payload?.lockIds?.includes(lock.id);
                return (
                  <li
                    key={lock.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-saubio-forest/10 bg-white/90 px-4 py-3"
                  >
                    <div>
                      <p className="text-base font-semibold text-saubio-forest">
                        {lock.providerTeamName ?? lock.providerDisplayName ?? t('adminOperationsPage.locks.unknown', 'Verrouillage')}
                      </p>
                      <p className="text-xs text-saubio-slate/60">
                        {t('adminOperationsPage.locks.lockedCount', {
                          defaultValue: '{{count}} poste(s)',
                          count: lock.lockedCount,
                        })}{' '}
                        ·{' '}
                        {t('adminOperationsPage.locks.status', {
                          defaultValue: 'Statut: {{status}}',
                          status: lock.status,
                        })}
                      </p>
                      <p className="text-xs text-saubio-slate/50">
                        {t('adminOperationsPage.locks.expires', {
                          defaultValue: 'Expire {{date}}',
                          date: formatDateTime(lock.expiresAt),
                        })}
                      </p>
                      {lock.slotStartAt ? (
                        <p className="text-xs text-saubio-slate/50">
                          {t('adminOperationsPage.locks.slot', {
                            defaultValue: 'Créneau {{start}} → {{end}}',
                            start: formatDateTime(lock.slotStartAt),
                            end: lock.slotEndAt ? formatDateTime(lock.slotEndAt) : '—',
                          })}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right text-xs text-saubio-slate/50">
                      <p>{t('adminOperationsPage.locks.createdAt', { defaultValue: 'Créé {{date}}', date: formatDateTime(lock.createdAt) })}</p>
                      {lock.providerDisplayName ? (
                        <p>{t('adminOperationsPage.locks.byProvider', { defaultValue: 'Prestataire: {{name}}', name: lock.providerDisplayName })}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap justify-end gap-2 text-[11px]">
                        {canConfirm ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmLock(lock.id)}
                            disabled={confirming}
                            className="rounded-full border border-saubio-forest/25 px-3 py-1 font-semibold text-saubio-forest disabled:opacity-40"
                          >
                            {confirming
                              ? t('adminOperationsPage.locks.confirming', 'Confirmation…')
                              : t('adminOperationsPage.locks.confirm', 'Confirmer')}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleReleaseLock(lock.id)}
                          disabled={releasing}
                          className="rounded-full border border-red-200 px-3 py-1 font-semibold text-red-600 disabled:opacity-40"
                        >
                          {releasing
                            ? t('adminOperationsPage.locks.releasing', 'Libération…')
                            : t('adminOperationsPage.locks.release', 'Libérer')}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SurfaceCard>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard variant="soft" padding="md" className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('adminOperationsPage.servicesTitle')}
          </h2>
          {data.services.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
              {t('adminOperationsPage.noServices')}
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-saubio-slate/80">
              {data.services.map((service) => (
                <li key={service.id} className="flex items-center justify-between rounded-2xl bg-white/80 p-4 shadow-soft-sm">
                  <div>
                    <p className="font-semibold text-saubio-forest">{service.name}</p>
                    <p className="text-xs text-saubio-slate/60">
                      p95: {service.latencyMs} ms
                    </p>
                    {service.lastIncidentAt ? (
                      <p className="text-[11px] text-saubio-slate/50">
                        {service.lastIncidentAt ? new Date(service.lastIncidentAt).toLocaleString() : ''}
                      </p>
                    ) : null}
                  </div>
                  <Pill tone={service.status === 'operational' ? 'forest' : service.status === 'degraded' ? 'sun' : 'mist'}>
                    {t(`adminOperationsPage.status.${service.status}`)}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard variant="soft" padding="md" className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('adminOperationsPage.incidentsTitle')}
          </h2>
          {data.incidents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
              {t('adminOperationsPage.noIncidents')}
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-saubio-slate/80">
              {data.incidents.map((incident) => (
                <li key={incident.id} className="space-y-2 rounded-2xl bg-white/80 p-4 shadow-soft-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-saubio-forest">{incident.title}</p>
                    <Pill tone={incident.severity === 'critical' ? 'sun' : incident.severity === 'major' ? 'forest' : 'mist'}>
                      {t(`adminOperationsPage.severity.${incident.severity}`)}
                    </Pill>
                  </div>
                  <div className="flex items-center justify-between text-xs text-saubio-slate/60">
                    <span>{incident.owner}</span>
                    <span>{new Date(incident.detectedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] uppercase tracking-widest text-saubio-slate/50">
                    {t(`adminOperationsPage.status.${incident.status}`, incident.status)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard variant="soft" padding="md" className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('adminOperationsPage.analyticsTitle')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.analytics.map((item) => (
            <SurfaceCard key={item.id} variant="default" padding="sm" className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-saubio-slate/50">{item.label}</p>
              <p className="text-2xl font-semibold text-saubio-forest">
                {item.value}
                {item.unit ? ` ${item.unit}` : ''}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
