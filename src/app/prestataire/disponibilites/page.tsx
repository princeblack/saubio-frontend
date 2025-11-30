'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useRequireRole,
  useProviderAvailability,
  useUpdateProviderAvailabilityMutation,
  useCreateProviderTimeOffMutation,
  useDeleteProviderTimeOffMutation,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, LoadingIndicator } from '@saubio/ui';
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';

type SlotDraft = {
  id?: string;
  tempId?: string;
  weekday: number;
  startMinutes: number;
  endMinutes: number;
  isActive: boolean;
};

const WEEKDAYS = [
  { value: 1, key: 'monday', fallback: 'Lundi' },
  { value: 2, key: 'tuesday', fallback: 'Mardi' },
  { value: 3, key: 'wednesday', fallback: 'Mercredi' },
  { value: 4, key: 'thursday', fallback: 'Jeudi' },
  { value: 5, key: 'friday', fallback: 'Vendredi' },
  { value: 6, key: 'saturday', fallback: 'Samedi' },
  { value: 0, key: 'sunday', fallback: 'Dimanche' },
] as const;

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Berlin', label: 'Europe/Berlin (Berlin)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (Paris)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (Madrid)' },
] as const;

const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
};

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(':');
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) {
    return 0;
  }
  return parsedHours * 60 + parsedMinutes;
};

const normalizeSlots = (slots: SlotDraft[]) =>
  [...slots]
    .map((slot) => ({
      id: slot.id ?? null,
      weekday: slot.weekday,
      startMinutes: slot.startMinutes,
      endMinutes: slot.endMinutes,
      isActive: slot.isActive ?? true,
    }))
    .sort((a, b) => (a.weekday === b.weekday ? a.startMinutes - b.startMinutes : a.weekday - b.weekday));

const formatDateTime = (iso: string, locale: string) => {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const defaultSlotForDay = (weekday: number): SlotDraft => ({
  tempId: `tmp-${weekday}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  weekday,
  startMinutes: 9 * 60,
  endMinutes: 17 * 60,
  isActive: true,
});

const initialTimeOffForm = {
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  reason: '',
};

export default function ProviderAvailabilityPage() {
  const { t, i18n } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const availabilityQuery = useProviderAvailability();
  const updateAvailabilityMutation = useUpdateProviderAvailabilityMutation();
  const createTimeOffMutation = useCreateProviderTimeOffMutation();
  const deleteTimeOffMutation = useDeleteProviderTimeOffMutation();

  const [timezone, setTimezone] = useState<string>('Europe/Berlin');
  const [slots, setSlots] = useState<SlotDraft[]>([]);
  const [timeOffForm, setTimeOffForm] = useState(initialTimeOffForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (availabilityQuery.data) {
      setSlots(
        availabilityQuery.data.slots.map((slot) => ({
          ...slot,
          isActive: slot.isActive ?? true,
        }))
      );
      setTimezone(availabilityQuery.data.timezone ?? 'Europe/Berlin');
    }
  }, [availabilityQuery.data]);

  if (!session.user) {
    return null;
  }

  const draftWeeklyHours = useMemo(() => {
    return slots
      .filter((slot) => slot.isActive)
      .reduce((sum, slot) => sum + (slot.endMinutes - slot.startMinutes) / 60, 0);
  }, [slots]);

  const hasChanges = useMemo(() => {
    if (!availabilityQuery.data) {
      return false;
    }
    const normalizedDraft = normalizeSlots(slots);
    const normalizedServer = normalizeSlots(
      availabilityQuery.data.slots.map((slot) => ({
        ...slot,
        isActive: slot.isActive ?? true,
      }))
    );
    const slotsChanged = JSON.stringify(normalizedDraft) !== JSON.stringify(normalizedServer);
    const timezoneChanged = (availabilityQuery.data.timezone ?? 'Europe/Berlin') !== timezone;
    return slotsChanged || timezoneChanged;
  }, [slots, availabilityQuery.data, timezone]);

  const handleSlotChange = (targetId: string, changes: Partial<SlotDraft>) => {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === targetId || slot.tempId === targetId
          ? {
              ...slot,
              ...changes,
            }
          : slot
      )
    );
  };

  const handleSlotTimeChange = (targetId: string, key: 'startMinutes' | 'endMinutes', value: string) => {
    handleSlotChange(targetId, { [key]: timeToMinutes(value) });
  };

  const handleAddSlot = (weekday: number) => {
    setSlots((current) => [...current, defaultSlotForDay(weekday)]);
  };

  const handleRemoveSlot = (targetId: string) => {
    setSlots((current) => current.filter((slot) => slot.id !== targetId && slot.tempId !== targetId));
  };

  const handleSaveAvailability = () => {
    setFormError(null);
    updateAvailabilityMutation.mutate(
      {
        timezone,
        slots: slots.map((slot) => ({
          id: slot.id,
          weekday: slot.weekday,
          startMinutes: slot.startMinutes,
          endMinutes: slot.endMinutes,
          isActive: slot.isActive ?? true,
        })),
      },
      {
        onError: (error) => {
          setFormError(error instanceof Error ? error.message : t('system.error.generic', 'Une erreur est survenue.'));
        },
      }
    );
  };

  const handleTimeOffSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!timeOffForm.startDate || !timeOffForm.endDate) {
      setFormError(t('providerAvailabilityPage.timeOffForm.missingDates', 'Sélectionnez des dates de début et de fin.'));
      return;
    }
    const startIso = new Date(`${timeOffForm.startDate}T${timeOffForm.startTime || '00:00'}:00`);
    const endIso = new Date(`${timeOffForm.endDate}T${timeOffForm.endTime || '23:59'}:00`);
    createTimeOffMutation.mutate(
      {
        startAt: startIso.toISOString(),
        endAt: endIso.toISOString(),
        reason: timeOffForm.reason?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setTimeOffForm(initialTimeOffForm);
        },
        onError: (error) => {
          setFormError(error instanceof Error ? error.message : t('system.error.generic', 'Une erreur est survenue.'));
        },
      }
    );
  };

  const handleDeleteTimeOff = (id: string) => {
    deleteTimeOffMutation.mutate(id, {
      onError: (error) => {
        setFormError(error instanceof Error ? error.message : t('system.error.generic', 'Une erreur est survenue.'));
      },
    });
  };

  if (availabilityQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingIndicator tone="dark" size="md" />
      </div>
    );
  }

  if (availabilityQuery.isError || !availabilityQuery.data) {
    return (
      <SurfaceCard variant="soft" padding="lg">
        <p className="text-sm font-semibold text-red-600">
          {t('system.error.generic', 'Une erreur est survenue. Veuillez réessayer plus tard.')}
        </p>
        <button
          type="button"
          onClick={() => availabilityQuery.refetch()}
          className="mt-4 rounded-full border border-saubio-forest/30 px-4 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest"
        >
          {t('system.actions.retry', 'Réessayer')}
        </button>
      </SurfaceCard>
    );
  }

  const locale = i18n.language || 'fr';
  const timeOffEntries = availabilityQuery.data.timeOff;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerAvailabilityPage.title', 'Disponibilités et calendrier')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'providerAvailabilityPage.subtitle',
            'Définissez vos créneaux disponibles et signalez vos absences pour ne recevoir que les missions pertinentes.'
          )}
        </SectionDescription>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <SurfaceCard variant="soft" padding="lg" className="space-y-6 border border-saubio-mist/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-saubio-forest">
                {t('providerAvailabilityPage.schedule.title', 'Planning hebdomadaire')}
              </p>
              <p className="text-xs text-saubio-slate/70">
                {t(
                  'providerAvailabilityPage.schedule.subtitle',
                  'Ajoutez vos créneaux récurrents par jour. Les créneaux inactifs ne seront pas proposés aux clients.'
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-saubio-slate/60">
              <Clock className="h-4 w-4" />
              {t('providerAvailabilityPage.weeklyHours', '{{hours}} h / semaine', {
                hours: Math.round(draftWeeklyHours * 10) / 10,
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
              {t('providerAvailabilityPage.timezone.label', 'Fuseau horaire')}
            </label>
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="w-full rounded-2xl border border-saubio-mist bg-white px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
            >
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-5">
            {WEEKDAYS.map((day) => {
              const daySlots = slots
                .filter((slot) => slot.weekday === day.value)
                .sort((a, b) => a.startMinutes - b.startMinutes);
              return (
                <div key={day.value} className="rounded-3xl border border-saubio-mist/60 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-saubio-forest">
                      {t(`providerAvailabilityPage.weekdays.${day.key}`, day.fallback)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddSlot(day.value)}
                      className="inline-flex items-center gap-1 rounded-full border border-saubio-forest/30 px-3 py-1 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
                    >
                      <Plus className="h-4 w-4" />
                      {t('providerAvailabilityPage.schedule.addSlot', 'Ajouter un créneau')}
                    </button>
                  </div>
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-saubio-slate/60">
                      {t('providerAvailabilityPage.schedule.noSlot', 'Aucun créneau défini pour cette journée.')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {daySlots.map((slot) => {
                        const localId = slot.id ?? slot.tempId ?? `${slot.weekday}-${slot.startMinutes}`;
                        return (
                          <div
                            key={localId}
                            className="rounded-2xl border border-saubio-forest/10 bg-white/40 p-4 shadow-sm"
                          >
                            <div className="grid gap-3 sm:grid-cols-4">
                              <div className="space-y-1">
                                <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                                  {t('providerAvailabilityPage.schedule.start', 'Début')}
                                </label>
                                <input
                                  type="time"
                                  value={minutesToTime(slot.startMinutes)}
                                  onChange={(event) => handleSlotTimeChange(localId, 'startMinutes', event.target.value)}
                                  className="w-full rounded-xl border border-saubio-mist px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                                  {t('providerAvailabilityPage.schedule.end', 'Fin')}
                                </label>
                                <input
                                  type="time"
                                  value={minutesToTime(slot.endMinutes)}
                                  onChange={(event) => handleSlotTimeChange(localId, 'endMinutes', event.target.value)}
                                  className="w-full rounded-xl border border-saubio-mist px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                                  {t('providerAvailabilityPage.schedule.status', 'Statut')}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleSlotChange(localId, { isActive: !slot.isActive })}
                                  className={`w-full rounded-full px-3 py-2 text-sm font-semibold transition ${
                                    slot.isActive
                                      ? 'bg-saubio-forest text-white hover:bg-saubio-moss'
                                      : 'border border-dashed border-saubio-slate/30 text-saubio-slate/70 hover:border-saubio-forest/40'
                                  }`}
                                >
                                  {slot.isActive
                                    ? t('providerAvailabilityPage.schedule.active', 'Actif')
                                    : t('providerAvailabilityPage.schedule.paused', 'Suspendu')}
                                </button>
                              </div>
                              <div className="flex items-end justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlot(localId)}
                                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:border-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {t('common.delete', 'Supprimer')}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-saubio-slate/60">
              {updateAvailabilityMutation.isSuccess ? (
                <div className="inline-flex items-center gap-1 rounded-full bg-saubio-forest/10 px-3 py-1 text-saubio-forest">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('providerAvailabilityPage.schedule.saved', 'Disponibilités mises à jour.')}
                </div>
              ) : (
                <span>
                  {t(
                    'providerAvailabilityPage.schedule.saveHint',
                    'N’oubliez pas de sauvegarder après vos modifications.'
                  )}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSaveAvailability}
              disabled={!hasChanges || updateAvailabilityMutation.isPending}
              className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-6 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-50"
            >
              {updateAvailabilityMutation.isPending
                ? t('providerAvailabilityPage.schedule.saving', 'Enregistrement…')
                : t('providerAvailabilityPage.schedule.save', 'Enregistrer mes créneaux')}
            </button>
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard variant="soft" padding="lg" className="space-y-4 border border-saubio-mist/80">
            <div className="flex items-start gap-3">
              <CalendarClock className="h-6 w-6 text-saubio-forest" />
              <div>
                <p className="text-sm font-semibold text-saubio-forest">
                  {t('providerAvailabilityPage.summary.next', 'Prochaines dates importantes')}
                </p>
                <p className="text-xs text-saubio-slate/70">
                  {availabilityQuery.data.nextTimeOff
                    ? t('providerAvailabilityPage.summary.nextTimeOff', 'Prochaine absence : {{date}}', {
                        date: formatDateTime(availabilityQuery.data.nextTimeOff, locale),
                      })
                    : t('providerAvailabilityPage.summary.noTimeOff', 'Aucune absence programmée.')}
                </p>
              </div>
            </div>
            <div className="text-xs text-saubio-slate/60">
              {t('providerAvailabilityPage.summary.description', 'Vous pouvez mettre à jour ces informations à tout moment.')}
            </div>
            <Link
              href="/prestataire/ressources"
              className="inline-flex items-center justify-center rounded-full border border-saubio-forest/30 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
            >
              {t('providerAvailabilityPage.cta.resources', 'Ouvrir le centre d’aide')}
            </Link>
          </SurfaceCard>

          <SurfaceCard
            id="time-off"
            variant="soft"
            padding="lg"
            className="space-y-4 border border-saubio-mist/80"
          >
            <div>
              <p className="text-sm font-semibold text-saubio-forest">
                {t('providerAvailabilityPage.timeOffTitle', 'Déclarer une absence')}
              </p>
              <p className="text-xs text-saubio-slate/70">
                {t(
                  'providerAvailabilityPage.timeOffDescription',
                  'Indiquez vos périodes d’absence afin que nous puissions suspendre les missions correspondantes.'
                )}
              </p>
            </div>
            <form onSubmit={handleTimeOffSubmit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                    {t('providerAvailabilityPage.timeOffForm.startDate', 'Date de début')}
                  </label>
                  <input
                    type="date"
                    value={timeOffForm.startDate}
                    onChange={(event) => setTimeOffForm((prev) => ({ ...prev, startDate: event.target.value }))}
                    className="w-full rounded-xl border border-saubio-mist px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                    {t('providerAvailabilityPage.timeOffForm.startTime', 'Heure (optionnelle)')}
                  </label>
                  <input
                    type="time"
                    value={timeOffForm.startTime}
                    onChange={(event) => setTimeOffForm((prev) => ({ ...prev, startTime: event.target.value }))}
                    className="w-full rounded-xl border border-saubio-mist px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                    {t('providerAvailabilityPage.timeOffForm.endDate', 'Date de fin')}
                  </label>
                  <input
                    type="date"
                    value={timeOffForm.endDate}
                    onChange={(event) => setTimeOffForm((prev) => ({ ...prev, endDate: event.target.value }))}
                    className="w-full rounded-xl border border-saubio-mist px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                    {t('providerAvailabilityPage.timeOffForm.endTime', 'Heure (optionnelle)')}
                  </label>
                  <input
                    type="time"
                    value={timeOffForm.endTime}
                    onChange={(event) => setTimeOffForm((prev) => ({ ...prev, endTime: event.target.value }))}
                    className="w-full rounded-xl border border-saubio-mist px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                  {t('providerAvailabilityPage.timeOffForm.reason', 'Commentaire (optionnel)')}
                </label>
                <textarea
                  rows={2}
                  value={timeOffForm.reason}
                  onChange={(event) => setTimeOffForm((prev) => ({ ...prev, reason: event.target.value }))}
                  className="w-full rounded-xl border border-saubio-mist px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none"
                  placeholder={t('providerAvailabilityPage.timeOffForm.placeholder', 'Congés, déplacement, intervention...')}
                />
              </div>
              <button
                type="submit"
                disabled={createTimeOffMutation.isPending}
                className="w-full rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-50"
              >
                {createTimeOffMutation.isPending
                  ? t('providerAvailabilityPage.timeOffForm.saving', 'Enregistrement…')
                  : t('providerAvailabilityPage.timeOffForm.submit', 'Programmer cette absence')}
              </button>
            </form>
          </SurfaceCard>
        </div>
      </div>

      <SurfaceCard variant="soft" padding="lg" className="space-y-4 border border-saubio-mist/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-saubio-forest">
            {t('providerAvailabilityPage.timeOffList.title', 'Absences programmées')}
          </p>
          <span className="text-xs text-saubio-slate/60">
            {t('providerAvailabilityPage.timeOffList.count', '{{count}} période(s)', {
              count: timeOffEntries.length,
            })}
          </span>
        </div>

        {timeOffEntries.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-saubio-mist/70 px-4 py-6 text-sm text-saubio-slate/70">
            <AlertTriangle className="h-5 w-5 text-saubio-slate/40" />
            {t('providerAvailabilityPage.timeOffList.empty', 'Vous n’avez pas encore déclaré d’absence.')}
          </div>
        ) : (
          <div className="space-y-3">
            {timeOffEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-saubio-forest/10 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-saubio-forest">
                    {formatDateTime(entry.startAt, locale)} → {formatDateTime(entry.endAt, locale)}
                  </p>
                  <p className="text-xs text-saubio-slate/60">
                    {entry.reason
                      ? entry.reason
                      : t('providerAvailabilityPage.timeOffList.duration', '{{hours}} h', {
                          hours: entry.durationHours,
                        })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
                      entry.status === 'active'
                        ? 'bg-saubio-forest/10 text-saubio-forest'
                        : entry.status === 'upcoming'
                          ? 'bg-saubio-moss/10 text-saubio-moss'
                          : 'bg-saubio-slate/10 text-saubio-slate/70'
                    }`}
                  >
                    {entry.status === 'active'
                      ? t('providerAvailabilityPage.timeOffList.status.active', 'En cours')
                      : entry.status === 'upcoming'
                        ? t('providerAvailabilityPage.timeOffList.status.upcoming', 'À venir')
                        : t('providerAvailabilityPage.timeOffList.status.past', 'Terminée')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTimeOff(entry.id)}
                    disabled={deleteTimeOffMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:border-red-400 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('common.delete', 'Supprimer')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      {formError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {formError}
        </div>
      ) : null}
    </div>
  );
}
