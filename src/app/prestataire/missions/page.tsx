'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useProviderMissions,
  useUpdateProviderMissionStatusMutation,
  useRequireRole,
  formatDateTime,
  formatEuro,
} from '@saubio/utils';
import {
  SectionDescription,
  SectionTitle,
  SurfaceCard,
  Skeleton,
  Pill,
} from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';
import type { BookingRequest } from '@saubio/models';
import { SuccessToast } from '../../../components/system/SuccessToast';
import { ErrorToast } from '../../../components/system/ErrorToast';

const statusOptions: Array<BookingRequest['status'] | 'all'> = [
  'all',
  'pending_provider',
  'pending_client',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

export default function ProviderMissionsPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });

  if (!session.user) {
    return null;
  }

  const [statusFilter, setStatusFilter] = useState<BookingRequest['status'] | 'all'>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [ecoFilter, setEcoFilter] = useState<'all' | 'bio'>('all');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const lastActionRef = useRef<{ id: string; status: BookingRequest['status'] } | null>(null);

  const filters = useMemo(
    () => ({
      status: statusFilter,
      city: cityFilter || undefined,
      eco: ecoFilter,
    }),
    [statusFilter, cityFilter, ecoFilter]
  );

  const missionsQuery = useProviderMissions(filters);
  const updateStatusMutation = useUpdateProviderMissionStatusMutation();

  const missions = missionsQuery.data ?? [];

  useEffect(() => {
    if (missions.length === 0) {
      setSelectedMissionId(null);
      return;
    }
    if (!selectedMissionId || !missions.some((mission) => mission.id === selectedMissionId)) {
      setSelectedMissionId(missions[0].id);
    }
  }, [missions, selectedMissionId]);

  const selectedMission = missions.find((mission) => mission.id === selectedMissionId) ?? null;

  const handleStatusChange = (mission: BookingRequest, status: BookingRequest['status']) => {
    lastActionRef.current = { id: mission.id, status };
    updateStatusMutation.mutate(
      { id: mission.id, status },
      {
        onSuccess: () => {
          setStatusToast({
            type: 'success',
            message: t('providerMissions.statusUpdateSuccess', 'Mission mise à jour.'),
          });
        },
        onError: () => {
          setStatusToast({
            type: 'error',
            message: t('providerMissions.statusUpdateError', 'Impossible de mettre à jour la mission.'),
          });
        },
      }
    );
  };

  const retryLastAction = () => {
    if (!lastActionRef.current) {
      return;
    }
    const { id, status } = lastActionRef.current;
    const mission = missions.find((item) => item.id === id);
    if (mission) {
      handleStatusChange(mission, status);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerMissions.title')}
        </SectionTitle>
        <SectionDescription>{t('providerMissions.subtitle')}</SectionDescription>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <SurfaceCard variant="soft" padding="md" className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('providerDashboard.upcoming')}
          </h2>
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
              {t('providerMissions.filters.status')}
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as BookingRequest['status'] | 'all')}
                className="mt-1 w-full rounded-full border border-saubio-forest/15 bg-white px-4 py-2 text-sm outline-none transition focus:border-saubio-forest"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all'
                      ? t('bookingDashboard.filterAllStatuses')
                      : t(`bookingStatus.${status}`, status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
              {t('providerMissions.filters.city')}
              <input
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                className="mt-1 w-full rounded-full border border-saubio-forest/15 bg-white px-4 py-2 text-sm outline-none transition focus:border-saubio-forest"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
              {t('providerMissions.filters.eco')}
              <select
                value={ecoFilter}
                onChange={(event) => setEcoFilter(event.target.value as 'all' | 'bio')}
                className="mt-1 w-full rounded-full border border-saubio-forest/15 bg-white px-4 py-2 text-sm outline-none transition focus:border-saubio-forest"
              >
                <option value="all">{t('providerMissions.eco.all')}</option>
                <option value="bio">{t('providerMissions.eco.bio')}</option>
              </select>
            </label>
          </div>

          <div className="mt-4 space-y-3">
            {missionsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={`mission-skeleton-${index}`} className="h-16 rounded-3xl" />
                ))}
              </div>
            ) : missionsQuery.isError ? (
              <ErrorState
                title={t('providerDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
                description={t('providerDashboard.errorDescription', t('bookingDashboard.errorDescription'))}
                onRetry={() => {
                  void missionsQuery.refetch();
                }}
              />
            ) : missions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
                {t('providerMissions.list.empty')}
              </div>
            ) : (
              missions.map((mission) => {
                const isSelected = mission.id === selectedMissionId;
                return (
                  <button
                    key={mission.id}
                    type="button"
                    onClick={() => setSelectedMissionId(mission.id)}
                    className={`w-full rounded-3xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? 'border-saubio-forest bg-saubio-forest/5 text-saubio-forest shadow-soft-sm'
                        : 'border-saubio-forest/15 bg-white text-saubio-slate/80 hover:border-saubio-forest/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                      <span>{formatDateTime(mission.startAt)}</span>
                      <Pill tone={mission.status === 'completed' ? 'forest' : 'sun'}>
                        {t(`bookingStatus.${mission.status}`, mission.status)}
                      </Pill>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-saubio-forest">
                      {mission.address.city} · {mission.service.toUpperCase()}
                    </div>
                    <p className="text-xs text-saubio-slate/60">
                      {mission.surfacesSquareMeters} m² · {mission.ecoPreference === 'bio' ? t('bookingForm.ecoPreference') : t('providerMissions.eco.standard')}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard variant="soft" padding="md" className="space-y-4">
          {!selectedMission ? (
            <div className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-8 text-center text-sm text-saubio-slate/60">
              {t('bookingDashboard.noSelection')}
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-saubio-forest">
                    {selectedMission.address.city} · {selectedMission.service.toUpperCase()}
                  </h2>
                  <p className="text-sm text-saubio-slate/70">
                    {t('providerMissions.detail.schedule')}: {formatDateTime(selectedMission.startAt)} → {formatDateTime(selectedMission.endAt)}
                  </p>
                  <p className="text-xs text-saubio-slate/60">
                    {selectedMission.address.streetLine1}
                  </p>
                </div>
                <Pill tone={selectedMission.status === 'completed' ? 'forest' : 'sun'}>
                  {t(`bookingStatus.${selectedMission.status}`, selectedMission.status)}
                </Pill>
              </div>

              <div className="grid gap-3 text-sm text-saubio-slate/80 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/80 p-4 shadow-soft-sm">
                  <p className="text-xs uppercase tracking-wide text-saubio-slate/50">
                    {t('providerMissions.detail.client')}
                  </p>
                  <p className="mt-1 font-semibold text-saubio-forest">{selectedMission.clientId}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-soft-sm">
                  <p className="text-xs uppercase tracking-wide text-saubio-slate/50">
                    {t('providerMissions.detail.surface')}
                  </p>
                  <p className="mt-1 font-semibold text-saubio-forest">{selectedMission.surfacesSquareMeters} m²</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-soft-sm">
                  <p className="text-xs uppercase tracking-wide text-saubio-slate/50">
                    {t('providerMissions.detail.eco')}
                  </p>
                  <p className="mt-1 font-semibold text-saubio-forest">
                    {selectedMission.ecoPreference === 'bio'
                      ? t('bookingForm.ecoPreference')
                      : t('providerMissions.eco.standard')}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-soft-sm">
                  <p className="text-xs uppercase tracking-wide text-saubio-slate/50">
                    {t('providerMissions.detail.pricing')}
                  </p>
                  <p className="mt-1 font-semibold text-saubio-forest">
                    {formatEuro((selectedMission.pricing?.totalCents ?? 0) / 100)}
                  </p>
                </div>
              </div>

              {selectedMission.notes ? (
                <div className="rounded-2xl bg-saubio-mist/40 p-4 text-sm text-saubio-slate/80">
                  <p className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                    {t('providerMissions.detail.notes')}
                  </p>
                  <p className="mt-1">{selectedMission.notes}</p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                {selectedMission.status !== 'in_progress' && selectedMission.status !== 'completed' ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedMission, 'in_progress')}
                    className="rounded-full bg-saubio-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss"
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending
                      ? t('providerMissions.actions.start')
                      : t('providerMissions.actions.start')}
                  </button>
                ) : null}
                {selectedMission.status !== 'completed' ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedMission, 'completed')}
                    className="rounded-full border border-saubio-forest/40 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
                    disabled={updateStatusMutation.isPending}
                  >
                    {t('providerMissions.actions.complete')}
                  </button>
                ) : null}
              </div>

              <SurfaceCard variant="soft" padding="md" elevated={false}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/50">
                  {t('bookingDashboard.timelineTitle')}
                </h3>
                {selectedMission.auditLog.length === 0 ? (
                  <p className="mt-2 text-xs text-saubio-slate/60">{t('bookingDashboard.timelineEmpty')}</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-xs text-saubio-slate/70">
                    {selectedMission.auditLog
                      .slice()
                      .sort(
                        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                      )
                      .map((entry, index) => (
                        <li key={`${entry.timestamp}-${index}`} className="rounded-2xl bg-white/80 p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-saubio-forest">
                              {t(`bookingTimeline.${entry.action}`)}
                            </span>
                            <span className="text-[11px] uppercase tracking-widest text-saubio-slate/50">
                              {formatDateTime(entry.timestamp)}
                            </span>
                          </div>
                          {entry.metadata ? (
                            <p className="mt-1">
                              <code className="rounded bg-saubio-mist/30 px-1 py-0.5 text-[11px] text-saubio-forest/80">
                                {JSON.stringify(entry.metadata)}
                              </code>
                            </p>
                          ) : null}
                        </li>
                      ))}
                  </ul>
                )}
              </SurfaceCard>
            </>
          )}
        </SurfaceCard>
      </div>
      <SuccessToast
        open={statusToast?.type === 'success'}
        message={statusToast?.message}
        onDismiss={() => setStatusToast(null)}
      />
      <ErrorToast
        open={statusToast?.type === 'error'}
        message={statusToast?.message}
        onDismiss={() => setStatusToast(null)}
        onRetry={lastActionRef.current ? retryLastAction : undefined}
      />
    </div>
  );
}
