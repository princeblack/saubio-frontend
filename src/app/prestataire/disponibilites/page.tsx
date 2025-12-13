'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
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

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Berlin', label: 'Europe/Berlin (Berlin)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (Paris)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (Madrid)' },
] as const;

const ORDERED_WEEKDAYS = [
  { value: 1, key: 'monday', fallback: 'Lundi' },
  { value: 2, key: 'tuesday', fallback: 'Mardi' },
  { value: 3, key: 'wednesday', fallback: 'Mercredi' },
  { value: 4, key: 'thursday', fallback: 'Jeudi' },
  { value: 5, key: 'friday', fallback: 'Vendredi' },
  { value: 6, key: 'saturday', fallback: 'Samedi' },
  { value: 0, key: 'sunday', fallback: 'Dimanche' },
] as const;

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const PIXELS_PER_MINUTE = 0.6;

type SlotComposerState = {
  startMinutes: number;
  endMinutes: number;
  weekdays: number[];
  sourceSlotId?: string;
};

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

const clampMinutes = (value: number) => Math.min(Math.max(value, 0), 24 * 60);
const minutesToPosition = (minutes: number) => minutes * PIXELS_PER_MINUTE;
const CALENDAR_HEIGHT = minutesToPosition(24 * 60);

const orderWeekdays = (weekdays: number[]) => {
  const lookup = new Set(weekdays);
  return ORDERED_WEEKDAYS.map((day) => day.value).filter((value) => lookup.has(value));
};

const WORKDAY_VALUES = ORDERED_WEEKDAYS.filter((day) => day.value >= 1 && day.value <= 5).map((day) => day.value);
const WEEKEND_VALUES = ORDERED_WEEKDAYS.filter((day) => day.value === 6 || day.value === 0).map((day) => day.value);

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

  const matchSlotId = useCallback((slot: SlotDraft, targetId: string) => slot.id === targetId || slot.tempId === targetId, []);

  const [slotComposer, setSlotComposer] = useState<SlotComposerState | null>(null);
  const removeSlotById = useCallback(
    (slotId: string) => {
      setSlots((current) => current.filter((slot) => !matchSlotId(slot, slotId)));
    },
    [matchSlotId]
  );

  const getDefaultComposerEnd = useCallback((value: number) => {
    const defaultEnd = value + 120;
    return clampMinutes(defaultEnd);
  }, []);

  const openComposerForNewRange = useCallback(
    (weekday: number, startMinutes: number) => {
      setFormError(null);
      setSlotComposer({
        startMinutes: clampMinutes(startMinutes),
        endMinutes: getDefaultComposerEnd(startMinutes),
        weekdays: [weekday],
      });
    },
    [getDefaultComposerEnd]
  );

  const openComposerForSlot = useCallback(
    (slotId: string) => {
      const target = slots.find((slot) => matchSlotId(slot, slotId));
      if (!target) return;
      setFormError(null);
      setSlotComposer({
        startMinutes: target.startMinutes,
        endMinutes: target.endMinutes,
        weekdays: [target.weekday],
        sourceSlotId: target.id ?? target.tempId,
      });
    },
    [slots, matchSlotId]
  );

  const handleGridClick = useCallback(
    (weekday: number) => (event: MouseEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const offsetY = event.clientY - bounds.top;
      const minutes = clampMinutes(Math.round((offsetY / PIXELS_PER_MINUTE) / 15) * 15);
      openComposerForNewRange(weekday, minutes);
    },
    [openComposerForNewRange]
  );

  const hasOverlap = useCallback(
    (weekday: number, start: number, end: number, excludeId?: string) => {
      return slots.some((slot) => {
        if (slot.weekday !== weekday || slot.isActive === false) {
          return false;
        }
        if (excludeId && matchSlotId(slot, excludeId)) {
          return false;
        }
        return Math.max(slot.startMinutes, start) < Math.min(slot.endMinutes, end);
      });
    },
    [slots, matchSlotId]
  );

  const handleComposerWeekdayToggle = useCallback((weekday: number) => {
    setSlotComposer((current) =>
      current
        ? current.sourceSlotId
          ? { ...current, weekdays: [weekday] }
          : {
              ...current,
              weekdays: orderWeekdays(
                current.weekdays.includes(weekday)
                  ? current.weekdays.filter((value) => value !== weekday)
                  : [...current.weekdays, weekday]
              ),
            }
        : current
    );
  }, []);

  const handleComposerSelectAll = useCallback((days: number[]) => {
    setSlotComposer((current) =>
      current
        ? current.sourceSlotId
          ? current
          : {
              ...current,
              weekdays: orderWeekdays([...current.weekdays, ...days]),
            }
        : current
    );
  }, []);

  const handleComposerTimeChange = useCallback((field: 'startMinutes' | 'endMinutes', value: string) => {
    const parsed = clampMinutes(timeToMinutes(value));
    setSlotComposer((current) => (current ? { ...current, [field]: parsed } : current));
  }, []);

  const handleComposerReset = useCallback(() => {
    setSlotComposer(null);
    setFormError(null);
  }, []);

  const handleComposerSubmit = () => {
    setFormError(null);
    if (!slotComposer) return;
    if (slotComposer.endMinutes <= slotComposer.startMinutes) {
      setFormError(t('providerAvailabilityPage.validation.invalidRange', 'La fin doit être postérieure au début.'));
      return;
    }
    if (!slotComposer.weekdays.length) {
      setFormError(t('providerAvailabilityPage.validation.weekdayRequired', 'Sélectionnez au moins un jour.'));
      return;
    }
    if (slotComposer.sourceSlotId) {
      const targetWeekday = slotComposer.weekdays[0];
      if (hasOverlap(targetWeekday, slotComposer.startMinutes, slotComposer.endMinutes, slotComposer.sourceSlotId)) {
        setFormError(t('providerAvailabilityPage.validation.conflict', 'Cette plage chevauche une autre disponibilité.'));
        return;
      }
      setSlots((current) =>
        current.map((slot) =>
          matchSlotId(slot, slotComposer.sourceSlotId!)
            ? {
                ...slot,
                weekday: targetWeekday,
                startMinutes: slotComposer.startMinutes,
                endMinutes: slotComposer.endMinutes,
              }
            : slot
        )
      );
      setSlotComposer(null);
      return;
    }
    const conflictDay = slotComposer.weekdays.find((weekday) =>
      hasOverlap(weekday, slotComposer.startMinutes, slotComposer.endMinutes)
    );
    if (conflictDay !== undefined) {
      setFormError(t('providerAvailabilityPage.validation.conflict', 'Cette plage chevauche une autre disponibilité.'));
      return;
    }
    const newSlots = slotComposer.weekdays.map((weekday) => ({
      ...defaultSlotForDay(weekday),
      startMinutes: slotComposer.startMinutes,
      endMinutes: slotComposer.endMinutes,
    }));
    setSlots((current) => [...current, ...newSlots]);
    setSlotComposer(null);
  };

  const handleComposerDelete = () => {
    if (!slotComposer?.sourceSlotId) return;
    setFormError(null);
    removeSlotById(slotComposer.sourceSlotId);
    setSlotComposer(null);
  };

  const handleCreateDefaultComposer = useCallback(() => {
    openComposerForNewRange(ORDERED_WEEKDAYS[0].value, 9 * 60);
  }, [openComposerForNewRange]);

  const handleToggleSlotActive = useCallback(
    (slotId: string) => {
      setSlots((current) =>
        current.map((slot) =>
          matchSlotId(slot, slotId)
            ? {
                ...slot,
                isActive: !(slot.isActive ?? true),
              }
            : slot
        )
      );
    },
    [matchSlotId]
  );

  const handleQuickDeleteSlot = useCallback(
    (slotId: string) => {
      setFormError(null);
      removeSlotById(slotId);
      setSlotComposer((current) => (current?.sourceSlotId === slotId ? null : current));
    },
    [removeSlotById]
  );

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

          <div className="space-y-6">
            <div className="rounded-3xl border border-saubio-mist/80 p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="hidden flex-col pr-4 text-[0.6rem] text-saubio-slate/70 sm:flex">
                  {HOURS.map((hour) => (
                    <div
                      key={`hour-${hour}`}
                      className="flex items-start border-b border-dashed border-saubio-mist/60"
                      style={{ height: minutesToPosition(60) }}
                    >
                      <span className="-translate-y-2 font-semibold">{hour.toString().padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-1 gap-3 overflow-x-auto">
                  {ORDERED_WEEKDAYS.map((day) => {
                    const daySlots = slots
                      .filter((slot) => slot.weekday === day.value)
                      .sort((a, b) => a.startMinutes - b.startMinutes);
                    const isComposerDay = slotComposer?.weekdays?.includes(day.value);
                    return (
                      <div key={day.value} className="min-w-[120px] flex-1">
                        <p className="text-center text-xs font-semibold text-saubio-forest">
                          {t(`providerAvailabilityPage.weekdays.${day.key}`, day.fallback)}
                        </p>
                        <div
                          className={`relative mt-2 cursor-crosshair overflow-hidden rounded-2xl border ${
                            isComposerDay ? 'border-saubio-forest shadow-inner shadow-saubio-forest/10' : 'border-saubio-mist'
                          } bg-white`}
                          style={{ height: CALENDAR_HEIGHT }}
                          onClick={handleGridClick(day.value)}
                        >
                          <div className="absolute inset-0">
                            {HOURS.map((hour) => (
                              <div
                                key={`line-${day.value}-${hour}`}
                                className="border-b border-dashed border-saubio-mist/40"
                                style={{ height: minutesToPosition(60) }}
                              />
                            ))}
                          </div>
                          {daySlots.length === 0 ? (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[0.65rem] text-saubio-slate/50">
                              {t('providerAvailabilityPage.schedule.noSlot', 'Aucun créneau défini pour cette journée.')}
                            </div>
                          ) : null}
                          {daySlots.map((slot) => {
                            const localId = slot.id ?? slot.tempId ?? `${slot.weekday}-${slot.startMinutes}`;
                            const top = minutesToPosition(slot.startMinutes);
                            const height = minutesToPosition(slot.endMinutes - slot.startMinutes);
                            const isInactive = slot.isActive === false;
                            return (
                              <div
                                key={localId}
                                className={`absolute inset-x-1 rounded-2xl border px-2 py-1.5 text-[0.65rem] font-semibold shadow ${
                                  isInactive
                                    ? 'border-dashed border-saubio-slate/40 bg-saubio-slate/10 text-saubio-slate'
                                    : 'border-saubio-forest/50 bg-saubio-forest/90 text-white'
                                }`}
                                style={{ top, height }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openComposerForSlot(localId);
                                }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[0.65rem]">
                                    {minutesToTime(slot.startMinutes)} → {minutesToTime(slot.endMinutes)}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      className="rounded-full bg-white/20 p-1 text-xs text-white hover:bg-white/40"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleToggleSlotActive(localId);
                                      }}
                                    >
                                      {isInactive
                                        ? t('providerAvailabilityPage.schedule.activate', 'Activer')
                                        : t('providerAvailabilityPage.schedule.pause', 'Pause')}
                                    </button>
                                    <button
                                      type="button"
                                      className="rounded-full bg-white/10 p-1 text-xs hover:bg-white/30"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleQuickDeleteSlot(localId);
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.35fr,1fr]">
              <div className="rounded-3xl border border-saubio-mist/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-saubio-forest">
                      {slotComposer?.sourceSlotId
                        ? t('providerAvailabilityPage.composer.editTitle', 'Modifier un créneau')
                        : t('providerAvailabilityPage.composer.newTitle', 'Nouveau créneau')}
                    </p>
                    <p className="text-xs text-saubio-slate/70">
                      {t(
                        'providerAvailabilityPage.composer.description',
                        'Sélectionnez directement une plage dans le calendrier ou ajustez les horaires ici.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateDefaultComposer}
                    className="inline-flex items-center gap-1 rounded-full border border-saubio-forest/30 px-3 py-1 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
                  >
                    <Plus className="h-4 w-4" />
                    {t('providerAvailabilityPage.composer.quickCreate', 'Créneau standard')}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                      {t('providerAvailabilityPage.schedule.start', 'Début')}
                    </label>
                    <input
                      type="time"
                      value={minutesToTime(slotComposer?.startMinutes ?? 9 * 60)}
                      onChange={(event) => handleComposerTimeChange('startMinutes', event.target.value)}
                      disabled={!slotComposer}
                      className="w-full rounded-xl border border-saubio-mist px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                      {t('providerAvailabilityPage.schedule.end', 'Fin')}
                    </label>
                    <input
                      type="time"
                      value={minutesToTime(slotComposer?.endMinutes ?? 10 * 60)}
                      onChange={(event) => handleComposerTimeChange('endMinutes', event.target.value)}
                      disabled={!slotComposer}
                      className="w-full rounded-xl border border-saubio-mist px-3 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-saubio-slate/70">
                    {t('providerAvailabilityPage.composer.days', 'Jours concernés')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ORDERED_WEEKDAYS.map((day) => {
                      const isSelected = slotComposer?.weekdays?.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleComposerWeekdayToggle(day.value)}
                          disabled={!slotComposer}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            isSelected
                              ? 'bg-saubio-forest text-white shadow'
                              : 'border border-saubio-mist text-saubio-slate/80 hover:border-saubio-forest'
                          } disabled:opacity-50`}
                        >
                          {t(`providerAvailabilityPage.weekdays.short.${day.key}`, day.fallback.slice(0, 2))}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      disabled={!slotComposer}
                      onClick={() => handleComposerSelectAll(WORKDAY_VALUES)}
                      className="rounded-full border border-saubio-mist px-3 py-1 text-saubio-slate/80 transition hover:border-saubio-forest disabled:opacity-50"
                    >
                      {t('providerAvailabilityPage.composer.workdays', 'Jours ouvrés')}
                    </button>
                    <button
                      type="button"
                      disabled={!slotComposer}
                      onClick={() => handleComposerSelectAll(WEEKEND_VALUES)}
                      className="rounded-full border border-saubio-mist px-3 py-1 text-saubio-slate/80 transition hover:border-saubio-forest disabled:opacity-50"
                    >
                      {t('providerAvailabilityPage.composer.weekend', 'Week-end')}
                    </button>
                    <button
                      type="button"
                      disabled={!slotComposer}
                      onClick={() => handleComposerSelectAll(ORDERED_WEEKDAYS.map((day) => day.value))}
                      className="rounded-full border border-saubio-mist px-3 py-1 text-saubio-slate/80 transition hover:border-saubio-forest disabled:opacity-50"
                    >
                      {t('providerAvailabilityPage.composer.allDays', 'Tous les jours')}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-saubio-slate/70">
                  {slotComposer ? (
                    <>
                      <span className="rounded-full bg-saubio-forest/10 px-3 py-1 text-saubio-forest">
                        {slotComposer.weekdays.length}{' '}
                        {t('providerAvailabilityPage.composer.selectedDays', 'jour(s) sélectionné(s)')}
                      </span>
                      {slotComposer.sourceSlotId ? (
                        <span>
                          {t('providerAvailabilityPage.composer.editingExisting', 'Créneau existant sélectionné.')}
                        </span>
                      ) : (
                        <span>
                          {t('providerAvailabilityPage.composer.newInfo', 'Nouveau créneau récurrent en préparation.')}
                        </span>
                      )}
                    </>
                  ) : (
                    <span>
                      {t('providerAvailabilityPage.composer.emptyState', 'Cliquez sur le calendrier pour commencer.')}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleComposerSubmit}
                    disabled={!slotComposer}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-50"
                  >
                    {slotComposer?.sourceSlotId
                      ? t('providerAvailabilityPage.composer.update', 'Mettre à jour')
                      : t('providerAvailabilityPage.composer.save', 'Ajouter au planning')}
                  </button>
                  <button
                    type="button"
                    onClick={handleComposerReset}
                    className="rounded-full border border-saubio-mist px-4 py-2 text-sm font-semibold text-saubio-slate/80 transition hover:border-saubio-forest hover:text-saubio-forest"
                  >
                    {t('common.cancel', 'Annuler')}
                  </button>
                  {slotComposer?.sourceSlotId ? (
                    <button
                      type="button"
                      onClick={handleComposerDelete}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:border-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('common.delete', 'Supprimer')}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-saubio-mist/80 p-5 text-sm text-saubio-slate/70">
                <p className="text-sm font-semibold text-saubio-forest">
                  {t('providerAvailabilityPage.composer.tipsTitle', 'Astuces pour gagner du temps')}
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-xs">
                  <li>
                    {t(
                      'providerAvailabilityPage.composer.tip.grid',
                      'Cliquez-glissez sur le calendrier pour créer plusieurs créneaux rapidement.'
                    )}
                  </li>
                  <li>
                    {t(
                      'providerAvailabilityPage.composer.tip.apply',
                      'Utilisez les boutons « Jours ouvrés » ou « Tous les jours » pour appliquer un créneau à plusieurs jours.'
                    )}
                  </li>
                  <li>
                    {t(
                      'providerAvailabilityPage.composer.tip.exceptions',
                      'Ajoutez des absences ponctuelles dans la section ci-dessous pour bloquer des dates spécifiques.'
                    )}
                  </li>
                </ul>
                <div className="mt-4 rounded-2xl border border-dashed border-saubio-mist/80 bg-white/50 p-4 text-xs">
                  <p className="font-semibold text-saubio-forest">
                    {t('providerAvailabilityPage.composer.legendTitle', 'Légende')}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-6 rounded-full bg-saubio-forest/80" />
                      <span>{t('providerAvailabilityPage.composer.legend.active', 'Créneau actif')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-6 rounded-full border border-dashed border-saubio-slate/50 bg-saubio-slate/10" />
                      <span>{t('providerAvailabilityPage.composer.legend.paused', 'Créneau suspendu')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
