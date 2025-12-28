'use client';

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type {
  AddressSuggestion,
  BookingCreationResponse,
  CreateBookingPayload,
  ProviderSearchParams,
  ProviderSuggestion,
  ProviderTeam,
  ProviderTeamSchedule,
  NotificationRealtimeEvent,
} from '@saubio/models';
import {
  bookingsQueryOptions,
  useCreateBookingDraftMutation,
  useCreateBookingMutation,
  useSession,
  formatDateTime,
  formatEuro,
  filterBookings,
  type BookingStatusFilter,
  useAddressAutocomplete,
  providerSuggestionsQueryOptions,
  createApiClient,
  providerTeamScheduleQueryOptions,
  useNotificationStream,
  useAccessToken,
} from '@saubio/utils';
import {
  LoadingIndicator,
  SectionDescription,
  SectionTitle,
  SurfaceCard,
  Skeleton,
  Pill,
  FormField,
  FeatureGrid,
  FeatureTile,
} from '@saubio/ui';
import { UploadCloud, X, Sparkles, Brush, Droplets, Check, AlertTriangle } from 'lucide-react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { SuccessToast } from '../../../components/system/SuccessToast';
import { MatchingTimelineCard } from './MatchingTimelineCard';

const serviceOptions = [
  'residential',
  'office',
  'industrial',
  'windows',
  'disinfection',
  'eco_plus',
] as const;

const frequencyOptions = ['once', 'weekly', 'biweekly', 'monthly', 'contract'] as const;
const modeOptions = ['manual', 'smart_match'] as const;
const ecoOptions = ['standard', 'bio'] as const;

const formatDateInput = (date: Date) => date.toISOString().slice(0, 16);

const computeEndInputValue = (startValue: string, hours: number) => {
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) {
    return null;
  }
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  const end = new Date(start);
  end.setHours(end.getHours() + wholeHours);
  end.setMinutes(end.getMinutes() + minutes);
  return formatDateInput(end);
};

type PlannerFormState = {
  streetLine1: string;
  streetLine2: string;
  postalCode: string;
  city: string;
  countryCode: string;
  service: (typeof serviceOptions)[number];
  surfacesSquareMeters: string;
  startAt: string;
  endAt: string;
  frequency: (typeof frequencyOptions)[number];
  mode: (typeof modeOptions)[number];
  ecoPreference: (typeof ecoOptions)[number];
  requiredProviders: string;
  preferredTeamId: string;
  notes: string;
};

const createDefaultFormState = (): PlannerFormState => {
  const startAt = formatDateInput(new Date());
  const endAt = formatDateInput(new Date(Date.now() + 2 * 60 * 60 * 1000));
  return {
    streetLine1: '',
    streetLine2: '',
    postalCode: '',
    city: '',
    countryCode: 'DE',
    service: serviceOptions[0],
    surfacesSquareMeters: '',
    startAt,
    endAt,
    frequency: frequencyOptions[0],
    mode: modeOptions[1],
    ecoPreference: ecoOptions[0],
    requiredProviders: '',
    preferredTeamId: '',
    notes: '',
  };
};

const parsePlannerPrefill = (params: ReturnType<typeof useSearchParams>) => {
  const base = createDefaultFormState();
  if (!params) {
    return {
      form: base,
      shortNotice: false,
      leadTimeDays: 0,
      estimatedDepositCents: undefined,
      selectedProviderIds: [],
      selectedProviderKey: '',
    };
  }

  const overrides: Partial<PlannerFormState> = {};
  const postalCode = params.get('postalCode');
  if (postalCode) {
    overrides.postalCode = postalCode;
  }

  const serviceParam = params.get('service');
  if (serviceParam && serviceOptions.includes(serviceParam as (typeof serviceOptions)[number])) {
    overrides.service = serviceParam as (typeof serviceOptions)[number];
  }

  const frequencyParam = params.get('frequency');
  if (
    frequencyParam &&
    frequencyOptions.includes(frequencyParam as (typeof frequencyOptions)[number])
  ) {
    overrides.frequency = frequencyParam as (typeof frequencyOptions)[number];
  }

  const ecoParam = params.get('ecoPreference');
  if (ecoParam && ecoOptions.includes(ecoParam as (typeof ecoOptions)[number])) {
    overrides.ecoPreference = ecoParam as (typeof ecoOptions)[number];
  }

  const surfacesParam = parseInt(params.get('surfacesSquareMeters') ?? '', 10);
  if (Number.isFinite(surfacesParam) && surfacesParam > 0) {
    overrides.surfacesSquareMeters = surfacesParam;
  }

  const hoursParam = parseFloat(params.get('hours') ?? '');
  const normalizedHours = Number.isFinite(hoursParam)
    ? Math.max(1, Math.min(12, hoursParam))
    : null;

  const startAtParam = params.get('startAt');
  if (startAtParam) {
    overrides.startAt = startAtParam;
    if (normalizedHours) {
      const computedEnd = computeEndInputValue(startAtParam, normalizedHours);
      if (computedEnd) {
        overrides.endAt = computedEnd;
      }
    }
  }

  const leadTimeParam = parseInt(params.get('leadTimeDays') ?? '', 10);
  const leadTimeDays = Number.isFinite(leadTimeParam) ? Math.max(0, leadTimeParam) : 0;
  const shortNoticeParam = params.get('shortNotice');
  const shortNotice =
    shortNoticeParam === '1' ||
    shortNoticeParam?.toLowerCase() === 'true' ||
    shortNoticeParam === 'yes';

  if (shortNotice) {
    overrides.mode = 'smart_match';
  } else if (leadTimeDays >= 2) {
    overrides.mode = 'manual';
  }

  const estimatedDepositRaw = parseInt(params.get('estimatedDepositCents') ?? '', 10);
  const estimatedDepositCents = Number.isFinite(estimatedDepositRaw)
    ? Math.max(0, estimatedDepositRaw)
    : undefined;

  let selectedProviderIds = params.getAll('providerIds').filter(Boolean);
  if (!selectedProviderIds.length) {
    const single = params.get('providerId');
    if (single) {
      selectedProviderIds = [single];
    }
  }

  return {
    form: { ...base, ...overrides },
    shortNotice,
    leadTimeDays,
    estimatedDepositCents,
    selectedProviderIds,
    selectedProviderKey: selectedProviderIds.join('|'),
  };
};

type CheckoutBreakdown = {
  base: number;
  eco: number;
  addOns: number;
  tax: number;
  loyalty: number;
  total: number;
};

const rateByService: Record<typeof serviceOptions[number], number> = {
  residential: 2.4,
  office: 2.9,
  industrial: 3.4,
  windows: 2.1,
  disinfection: 3.8,
  eco_plus: 3.1,
};

const frequencyMultiplier: Record<typeof frequencyOptions[number], number> = {
  once: 1,
  weekly: 0.88,
  biweekly: 0.92,
  monthly: 0.95,
  contract: 0.85,
};

const availabilityTone: Record<'available' | 'conflict' | 'past' | 'invalid', 'forest' | 'sun' | 'mist'> = {
  available: 'forest',
  conflict: 'mist',
  past: 'sun',
  invalid: 'mist',
};

const buildMatchingContextKey = (params: ProviderSearchParams | null) => {
  if (!params) {
    return null;
  }
  return [
    params.service,
    (params.city ?? '').trim().toLowerCase(),
    (params.postalCode ?? '').trim().toLowerCase(),
    params.startAt,
    params.endAt,
    params.ecoPreference ?? 'standard',
  ].join('|');
};

const formatStatusLabel = (value: BookingStatusFilter) =>
  value === 'all'
    ? 'all'
    : value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const parseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

type AttachmentItem = {
  id: string;
  name: string;
  size: number;
  data: string;
};

const MAX_ATTACHMENTS = 5;

const generateGuestToken = () => {
  if (typeof globalThis.crypto !== 'undefined') {
    if (typeof globalThis.crypto.randomUUID === 'function') {
      try {
        return globalThis.crypto.randomUUID();
      } catch {
        // swallow
      }
    }
    if (typeof globalThis.crypto.getRandomValues === 'function') {
      const bytes = new Uint32Array(4);
      globalThis.crypto.getRandomValues(bytes);
      return Array.from(bytes, (value) => value.toString(16).padStart(8, '0')).join('');
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function CreateBookingPageContent() {
  const { t } = useTranslation();
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plannerPrefill = useMemo(() => parsePlannerPrefill(searchParams), [searchParams]);
  const authenticatedCreateMutation = useCreateBookingMutation();
  const guestCreateMutation = useCreateBookingDraftMutation();
  const accessToken = useAccessToken();
  const bookingsQuery = useQuery({
    ...bookingsQueryOptions(),
    enabled: Boolean(accessToken),
  });
  const providerTeamsQuery = useQuery({
    queryKey: ['api', 'admin', 'teams', 'booking'],
    queryFn: async (): Promise<ProviderTeam[]> => {
      const client = createApiClient({ includeCredentials: true });
      try {
        return await client.listProviderTeams();
      } catch {
        return [];
      }
    },
  });
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>(
    () => plannerPrefill.selectedProviderIds
  );
  const [providerDetails, setProviderDetails] = useState<Record<string, ProviderSuggestion>>({});
  const [focusedProviderId, setFocusedProviderId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const canAddMoreAttachments = attachments.length < MAX_ATTACHMENTS;
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState<string | undefined>(undefined);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addressDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedAddressQuery, setDebouncedAddressQuery] = useState('');
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);

  const [form, setForm] = useState(() => plannerPrefill.form);
  const plannerLeadTimeDays = plannerPrefill.leadTimeDays;
  const plannerShortNotice = plannerPrefill.shortNotice;
  const plannerDepositEstimate = plannerPrefill.estimatedDepositCents;

  const inputClasses =
    'w-full rounded-2xl border border-saubio-forest/15 px-4 py-3 text-base leading-tight text-saubio-forest placeholder:text-saubio-slate/50 focus:border-saubio-forest focus:outline-none min-h-[3.25rem]';
  const selectClasses = `${inputClasses} bg-white pr-10`; 
  const textAreaClasses = `${inputClasses} min-h-[7rem] resize-y`;
  const noteCharacterLimit = 800;
  const noteCharactersUsed = form.notes.length;
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedAddressQuery(form.streetLine1.trim());
    }, 250);
    return () => clearTimeout(handle);
  }, [form.streetLine1]);

  const addressAutocomplete = useAddressAutocomplete(
    debouncedAddressQuery,
    debouncedAddressQuery.length >= 3
  );
  const addressSuggestions = addressAutocomplete.data ?? [];
  const showAddressSuggestions = addressDropdownOpen && debouncedAddressQuery.length >= 3;

  const addOnOptions = useMemo(
    () => [
      {
        id: 'deep_clean',
        title: t('bookingForm.addOns.deepClean.title', 'Nettoyage approfondi'),
        description: t(
          'bookingForm.addOns.deepClean.description',
          'Désinfection cuisine & sanitaires, surfaces verticales.'
        ),
        percentage: 0.2,
        icon: <Brush className="h-5 w-5" />,
      },
      {
        id: 'eco_supplies',
        title: t('bookingForm.addOns.ecoSupplies.title', 'Kit produits bio'),
        description: t(
          'bookingForm.addOns.ecoSupplies.description',
          'Produits certifiés EcoLabel fournis par Saubio.'
        ),
        percentage: 0.08,
        icon: <Sparkles className="h-5 w-5" />,
      },
      {
        id: 'laundry',
        title: t('bookingForm.addOns.laundry.title', 'Option linge & pressing'),
        description: t(
          'bookingForm.addOns.laundry.description',
          'Entretien linge de maison + repassage vapeur.'
        ),
        percentage: 0.12,
        icon: <Droplets className="h-5 w-5" />,
      },
    ],
    [t]
  );

  const providerSearchParams = useMemo<ProviderSearchParams | null>(() => {
    if (!form.city || !form.startAt || !form.endAt) {
      return null;
    }
    return {
      city: form.city.trim(),
      postalCode: form.postalCode.trim() || undefined,
      service: form.service,
      ecoPreference: form.ecoPreference,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      limit: 6,
    };
  }, [form.city, form.postalCode, form.service, form.ecoPreference, form.startAt, form.endAt]);

  const providerSuggestionsQuery = useQuery(
    providerSuggestionsQueryOptions(providerSearchParams)
  );
  const providerSuggestions = (providerSuggestionsQuery.data ?? []) as ProviderSuggestion[];
  const providerTeams = providerTeamsQuery.data ?? [];
  const normalizedPreferredTeamId = form.preferredTeamId.trim();
  const selectedTeam = providerTeams.find((team) => team.id === normalizedPreferredTeamId);
  const userRoles = session.user?.roles ?? [];
  const canViewTeamSchedule = userRoles.some((role) => role === 'admin' || role === 'employee');
  const teamScheduleQuery = useQuery({
    ...providerTeamScheduleQueryOptions(normalizedPreferredTeamId || null),
    enabled: canViewTeamSchedule && Boolean(normalizedPreferredTeamId),
  });
  const matchingContextKey = useMemo(
    () => buildMatchingContextKey(providerSearchParams),
    [providerSearchParams]
  );
  const [matchingStageEvents, setMatchingStageEvents] = useState<Record<
    string,
    { status: string; count?: number }
  >>({});
  useEffect(() => {
    setMatchingStageEvents({});
  }, [matchingContextKey]);
  const handleMatchingProgressEvent = useCallback(
    (event: NotificationRealtimeEvent) => {
      if (event.type !== 'matching_progress') {
        return;
      }
      const contextKey =
        typeof event.payload?.contextKey === 'string' ? event.payload.contextKey : null;
      if (!contextKey || !matchingContextKey || contextKey !== matchingContextKey) {
        return;
      }
      const stage = typeof event.payload?.stage === 'string' ? event.payload.stage : null;
      const status = typeof event.payload?.status === 'string' ? event.payload.status : null;
      if (!stage || !status) {
        return;
      }
      setMatchingStageEvents((current) => ({
        ...current,
        [stage]: {
          status,
          count:
            typeof event.payload?.count === 'number'
              ? event.payload.count
              : current[stage]?.count,
        },
      }));
    },
    [matchingContextKey]
  );
  const isAuthenticated = Boolean(session.user);
  const isSubmitting = isAuthenticated
    ? authenticatedCreateMutation.isPending
    : guestCreateMutation.isPending;

  useNotificationStream({
    enabled: isAuthenticated,
    onEvent: handleMatchingProgressEvent,
  });

  useEffect(() => {
    if (!providerSuggestions.length) {
      return;
    }
    setProviderDetails((prev) => {
      const next = { ...prev };
      providerSuggestions.forEach((provider) => {
        next[provider.id] = provider;
      });
      return next;
    });
  }, [providerSuggestions]);

  useEffect(() => {
    if (!plannerPrefill.selectedProviderKey) {
      return;
    }
    if (plannerPrefill.selectedProviderKey === selectedProviderIds.join('|')) {
      return;
    }
    setSelectedProviderIds(plannerPrefill.selectedProviderIds);
  }, [plannerPrefill.selectedProviderKey, plannerPrefill.selectedProviderIds, selectedProviderIds]);

  const toggleProviderSelection = (providerId: string) => {
    setSelectedProviderIds((current) =>
      current.includes(providerId)
        ? current.filter((id) => id !== providerId)
        : [...current, providerId]
    );
  };

  const selectedProviders = selectedProviderIds
    .map((id) => providerDetails[id])
    .filter((provider): provider is ProviderSuggestion => Boolean(provider));
  const focusedProvider = focusedProviderId ? providerDetails[focusedProviderId] : undefined;

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (errors.providerSelection && (form.mode !== 'manual' || safeRequiredProviders <= selectedProviderIds.length)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.providerSelection;
        return next;
      });
    }
  }, [errors.providerSelection, form.mode, safeRequiredProviders, selectedProviderIds.length]);

  const bookings = bookingsQuery.data ?? [];

  const parseIntegerField = (value: string) => {
    if (!value?.trim()) {
      return NaN;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const surfacesValue = parseIntegerField(form.surfacesSquareMeters);
  const safeSurfaceValue = Number.isFinite(surfacesValue) ? surfacesValue : 0;
  const requiredProvidersValue = parseIntegerField(form.requiredProviders);
  const safeRequiredProviders = Number.isFinite(requiredProvidersValue) ? requiredProvidersValue : 0;
  const manualSelectionPending =
    form.mode === 'manual' && safeRequiredProviders > selectedProviderIds.length;

  const numericFieldKeys: (keyof PlannerFormState)[] = ['surfacesSquareMeters', 'requiredProviders'];
  const digitsOnlyRegex = /^\d+$/;

  const handleChange = (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const rawValue = event.target.value;
      if (numericFieldKeys.includes(key)) {
        if (rawValue === '' || digitsOnlyRegex.test(rawValue)) {
          setForm((state) => ({ ...state, [key]: rawValue }));
          setErrors((prev) => {
            if (!prev[key]) {
              return prev;
            }
            const next = { ...prev };
            delete next[key];
            return next;
          });
        } else {
          setErrors((prev) => ({
            ...prev,
            [key]: t('forms.errors.numericOnly', 'Veuillez saisir uniquement des chiffres.'),
          }));
        }
        return;
      }
      setForm((state) => ({ ...state, [key]: rawValue }));
      setErrors((prev) => {
        if (!prev[key] && key !== 'startAt' && key !== 'endAt') {
          return prev;
        }
        const next = { ...prev };
        delete next[key];
        if (key === 'startAt' || key === 'endAt') {
          delete next.schedule;
        }
        return next;
      });
    };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((state) =>
      state.includes(id) ? state.filter((item) => item !== id) : [...state, id]
    );
  };

  const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length || attachments.length >= MAX_ATTACHMENTS) {
      return;
    }
    const allowed = files.slice(0, MAX_ATTACHMENTS - attachments.length);
    const processed = await Promise.all(
      allowed.map(async (file) => ({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
        data: await readFileAsDataUrl(file),
      }))
    );
    setAttachments((prev) => [...prev, ...processed]);
    event.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredBookings = useMemo(() => {
    return filterBookings(bookings, { status: statusFilter, city: cityFilter });
  }, [bookings, statusFilter, cityFilter]);

  const startDate = useMemo(() => parseDate(form.startAt), [form.startAt]);
  const endDate = useMemo(() => parseDate(form.endAt), [form.endAt]);

  const conflict = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }
    return bookings.find((booking) => {
      if (booking.status === 'cancelled') {
        return false;
      }
      const bookingStart = new Date(booking.startAt).getTime();
      const bookingEnd = new Date(booking.endAt).getTime();
      return startDate.getTime() < bookingEnd && endDate.getTime() > bookingStart;
    }) ?? null;
  }, [bookings, startDate, endDate]);

  const availability = useMemo(() => {
    if (!startDate || !endDate) {
      return { status: 'invalid' as const };
    }
    if (startDate.getTime() >= endDate.getTime()) {
      return { status: 'invalid' as const };
    }
    if (startDate.getTime() < Date.now()) {
      return { status: 'past' as const };
    }
    if (conflict) {
      return { status: 'conflict' as const, booking: conflict };
    }
    return { status: 'available' as const };
  }, [startDate, endDate, conflict]);

  const estimate = useMemo(() => {
    const surface = safeSurfaceValue;
    const rate = rateByService[form.service] ?? 2.5;
    const base = surface * rate * (frequencyMultiplier[form.frequency] ?? 1);
    const ecoSurcharge = form.ecoPreference === 'bio' ? base * 0.12 : 0;
    const addOnTotal = selectedAddOns.reduce((sum, addOnId) => {
      const option = addOnOptions.find((candidate) => candidate.id === addOnId);
      if (!option) return sum;
      return sum + base * (option.percentage ?? 0);
    }, 0);
    const subtotal = base + ecoSurcharge + addOnTotal;
    const tax = subtotal * 0.19;
    const total = subtotal + tax;
    return {
      base,
      ecoSurcharge,
      addOnTotal,
      tax,
      total,
    };
  }, [form.service, safeSurfaceValue, form.frequency, form.ecoPreference, selectedAddOns, addOnOptions]);

  const loyaltyCreditsEstimate = useMemo(() => Math.max(0, estimate.total * 0.02), [estimate.total]);

  const checkoutBreakdown = useMemo<CheckoutBreakdown>(
    () => ({
      base: estimate.base,
      eco: estimate.ecoSurcharge,
      addOns: estimate.addOnTotal,
      tax: estimate.tax,
      loyalty: loyaltyCreditsEstimate,
      total: estimate.total,
    }),
    [estimate.base, estimate.ecoSurcharge, estimate.addOnTotal, estimate.tax, estimate.total, loyaltyCreditsEstimate]
  );

  const applyAddressSuggestion = (suggestion: AddressSuggestion) => {
    setForm((previous) => ({
      ...previous,
      streetLine1: suggestion.street,
      postalCode: suggestion.postalCode || previous.postalCode,
      city: suggestion.city || previous.city,
      countryCode: suggestion.countryCode || previous.countryCode,
    }));
    if (addressDropdownTimeoutRef.current) {
      clearTimeout(addressDropdownTimeoutRef.current);
      addressDropdownTimeoutRef.current = null;
    }
    setAddressDropdownOpen(false);
  };


  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.streetLine1.trim()) {
      nextErrors.streetLine1 = t('bookingForm.validation.streetLine1');
    }
    if (!form.postalCode.trim()) {
      nextErrors.postalCode = t('bookingForm.validation.postalCode');
    }
    if (!form.city.trim()) {
      nextErrors.city = t('bookingForm.validation.city');
    }
    if (!Number.isFinite(surfacesValue) || surfacesValue <= 0) {
      nextErrors.surfacesSquareMeters = t('bookingForm.validation.surface');
    }
    if (!startDate || !endDate) {
      nextErrors.schedule = t('bookingForm.validation.schedule');
    } else if (startDate.getTime() >= endDate.getTime()) {
      nextErrors.schedule = t('bookingForm.validation.startBeforeEnd');
    } else if (startDate.getTime() < Date.now()) {
      nextErrors.schedule = t('bookingForm.validation.startInPast');
    } else if (conflict) {
      nextErrors.schedule = t('bookingForm.validation.conflict');
    }
    if (
      !Number.isInteger(requiredProvidersValue) ||
      requiredProvidersValue < 1 ||
      requiredProvidersValue > 20
    ) {
      nextErrors.requiredProviders = t(
        'bookingForm.validation.requiredProviders',
        'Sélectionnez entre 1 et 20 intervenants.'
      );
    }
    if (form.mode === 'manual' && safeRequiredProviders > selectedProviderIds.length) {
      nextErrors.providerSelection = t(
        'bookingForm.validation.providerSelection',
        'Ajoutez suffisamment de prestataires pour couvrir cette mission.'
      );
    }
    return nextErrors;
  };

  const triggerSuccessFlow = (message?: string) => {
    setSuccessToastMessage(message);
    setShowSuccessToast(true);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setShowSuccessToast(false);
      setSuccessToastMessage(undefined);
      router.push('/client/bookings');
    }, 1400);
  };

  const redirectToCheckoutAccount = useCallback(
    (booking: BookingCreationResponse, guestToken: string) => {
      const params = new URLSearchParams();
      const setParam = (key: string, value?: string | number | null) => {
        if (value === undefined || value === null) {
          return;
        }
        params.set(key, String(value));
      };

      setParam('bookingId', booking.id);
      setParam('service', booking.service);
      setParam('frequency', booking.frequency);
      setParam('ecoPreference', booking.ecoPreference);
      setParam('surfacesSquareMeters', booking.surfacesSquareMeters);

      const address = booking.address;
      if (address) {
        setParam('streetLine1', address.streetLine1);
        setParam('streetLine2', address.streetLine2);
        setParam('postalCode', address.postalCode);
        setParam('city', address.city);
        setParam('countryCode', address.countryCode);
      }

      setParam('startAt', booking.startAt);
      setParam('endAt', booking.endAt);
      const start = Date.parse(booking.startAt);
      const end = Date.parse(booking.endAt);
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
        const hours = (end - start) / (1000 * 60 * 60);
        setParam('hours', Math.round(hours * 100) / 100);
      }

      setParam('requiredProviders', booking.requiredProviders);
      const firstProviderId = booking.providerIds?.[0];
      if (firstProviderId) {
        const providerName = providerDetails[firstProviderId]?.displayName ?? firstProviderId;
        setParam('providerName', providerName);
      }

      setParam('shortNotice', booking.shortNotice ? '1' : '0');
      setParam('shortNoticeDepositCents', booking.shortNoticeDepositCents);
      setParam('leadTimeDays', booking.leadTimeDays);

      if (booking.pricing) {
        setParam('currency', booking.pricing.currency ?? 'EUR');
        setParam('subtotalCents', booking.pricing.subtotalCents);
        setParam('ecoCents', booking.pricing.ecoSurchargeCents);
        setParam('extrasCents', booking.pricing.extrasCents);
        setParam('taxCents', booking.pricing.taxCents);
        setParam('totalCents', booking.pricing.totalCents);
      }

      params.set('guestToken', guestToken);

      router.push(`/bookings/account?${params.toString()}`);
    },
    [providerDetails, router]
  );

  const handleBookingCreationSuccess = (booking: BookingCreationResponse) => {
    if (booking.checkoutUrl) {
      if (typeof window !== 'undefined') {
        window.location.href = booking.checkoutUrl;
      }
      return;
    }
    triggerSuccessFlow();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});

    const payload: CreateBookingPayload = {
      companyId: undefined,
      address: {
        streetLine1: form.streetLine1,
        streetLine2: form.streetLine2 || undefined,
        postalCode: form.postalCode,
        city: form.city,
        countryCode: form.countryCode,
      },
      service: form.service,
      surfacesSquareMeters: safeSurfaceValue,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      frequency: form.frequency,
      mode: form.mode,
      ecoPreference: form.ecoPreference,
      requiredProviders: safeRequiredProviders,
      preferredTeamId: form.preferredTeamId.trim() ? form.preferredTeamId.trim() : undefined,
      providerIds: selectedProviderIds.length ? selectedProviderIds : undefined,
      notes: form.notes || undefined,
      attachments: attachments.length ? attachments.map((item) => item.data) : undefined,
      leadTimeDays: typeof plannerLeadTimeDays === 'number' ? plannerLeadTimeDays : undefined,
      shortNotice: plannerShortNotice ?? undefined,
      estimatedDepositCents: plannerDepositEstimate ?? undefined,
    } as const;

    if (isAuthenticated) {
      authenticatedCreateMutation.mutate(payload, {
        onSuccess: (data) => {
          handleBookingCreationSuccess(data);
        },
      });
      return;
    }

    const guestToken = generateGuestToken();
    guestCreateMutation.mutate(
      { ...payload, guestToken },
      {
        onSuccess: (data) => {
          redirectToCheckoutAccount(data, guestToken);
        },
      }
    );
  };

  const statusOptions: BookingStatusFilter[] = [
    'all',
    'pending_provider',
    'pending_client',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('bookingForm.title')}
        </SectionTitle>
        <SectionDescription>{t('bookingForm.subtitle')}</SectionDescription>
        {plannerShortNotice ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-saubio-slate/80">
            {t(
              'bookingForm.shortNoticeInfo',
              'Préavis court détecté : nous notifierons automatiquement tous les prestataires disponibles dans votre zone.'
            )}
          </div>
        ) : plannerLeadTimeDays >= 2 ? (
          <div className="rounded-3xl border border-saubio-forest/15 bg-saubio-forest/10 px-4 py-3 text-sm text-saubio-forest">
            {t(
              'bookingForm.standardNoticeInfo',
              'Préavis confortable : sélectionnez vos prestataires favoris avant la confirmation.'
            )}
          </div>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.9fr)_0.55fr] xl:grid-cols-[minmax(0,2.1fr)_0.5fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-4xl bg-white p-8 shadow-soft-lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={t('bookingForm.address')}
              hint={t('bookingForm.addressHint', 'Rue et numéro')}
              requiredMark
              className="sm:col-span-2"
            >
              <div className="relative">
                <input
                  id="streetLine1"
                  value={form.streetLine1}
                  onChange={(event) => {
                    handleChange('streetLine1')(event);
                    if (!addressDropdownOpen) {
                      setAddressDropdownOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (addressDropdownTimeoutRef.current) {
                      clearTimeout(addressDropdownTimeoutRef.current);
                    }
                    setAddressDropdownOpen(true);
                  }}
                  onBlur={() => {
                    addressDropdownTimeoutRef.current = setTimeout(() => {
                      setAddressDropdownOpen(false);
                    }, 150);
                  }}
                  placeholder={t('bookingForm.street') ?? ''}
                  className={inputClasses}
                  autoComplete="off"
                />
                {showAddressSuggestions ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-saubio-forest/15 bg-white shadow-soft-lg">
                    {addressAutocomplete.isLoading ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-saubio-slate/70">
                        <LoadingIndicator size="sm" />
                        <span>{t('bookingForm.addressSuggestions.loading', 'Recherche des adresses…')}</span>
                      </div>
                    ) : addressAutocomplete.isError ? (
                      <div className="px-4 py-3 text-sm text-red-600">
                        {t('bookingForm.addressSuggestions.error', 'Impossible de récupérer les suggestions.')}
                      </div>
                    ) : addressSuggestions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-saubio-slate/70">
                        {t('bookingForm.addressSuggestions.empty', 'Aucune adresse trouvée. Continuez à taper.')}
                      </div>
                    ) : (
                      <ul className="divide-y divide-saubio-forest/10">
                        {addressSuggestions.map((suggestion) => (
                          <li key={suggestion.id}>
                            <button
                              type="button"
                              className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left text-sm hover:bg-saubio-mist/30"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                if (addressDropdownTimeoutRef.current) {
                                  clearTimeout(addressDropdownTimeoutRef.current);
                                  addressDropdownTimeoutRef.current = null;
                                }
                                applyAddressSuggestion(suggestion);
                              }}
                            >
                              <span className="font-semibold text-saubio-forest">{suggestion.street}</span>
                              <span className="text-xs uppercase tracking-wide text-saubio-slate/60">
                                {[suggestion.postalCode, suggestion.city].filter(Boolean).join(' · ')}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>
              {errors.streetLine1 ? (
                <p className="text-xs text-red-600">{errors.streetLine1}</p>
              ) : null}
            </FormField>
            <FormField label={t('bookingForm.street2')}>
              <input
                id="streetLine2"
                value={form.streetLine2}
                onChange={handleChange('streetLine2')}
                className={inputClasses}
              />
            </FormField>
            <FormField label={t('bookingForm.postalCode')} requiredMark>
              <input
                id="postalCode"
                value={form.postalCode}
                onChange={handleChange('postalCode')}
                className={inputClasses}
              />
              {errors.postalCode ? (
                <p className="text-xs text-red-600">{errors.postalCode}</p>
              ) : null}
            </FormField>
            <FormField label={t('bookingForm.city')} requiredMark>
              <input
                id="city"
                value={form.city}
                onChange={handleChange('city')}
                className={inputClasses}
              />
              {errors.city ? <p className="text-xs text-red-600">{errors.city}</p> : null}
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t('bookingForm.service')}>
              <select
                id="service"
                value={form.service}
                onChange={handleChange('service')}
                className={selectClasses}
              >
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {t(`bookingForm.serviceOptions.${option}`, option)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('bookingForm.surface')} requiredMark>
              <input
                id="surfacesSquareMeters"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.surfacesSquareMeters}
                onChange={handleChange('surfacesSquareMeters')}
                className={inputClasses}
                placeholder={t('bookingForm.surfacePlaceholder', 'ex : 120')}
                aria-describedby="surface-helper"
              />
              <p id="surface-helper" className="sr-only">
                {t('forms.accessibility.numbersOnly', 'Saisissez uniquement des chiffres.')}
              </p>
              {errors.surfacesSquareMeters ? (
                <p className="text-xs text-red-600">{errors.surfacesSquareMeters}</p>
              ) : null}
            </FormField>
            <FormField label={t('bookingForm.startAt')} requiredMark>
              <input
                id="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={handleChange('startAt')}
                className={inputClasses}
              />
            </FormField>
            <FormField label={t('bookingForm.endAt')} requiredMark>
              <input
                id="endAt"
                type="datetime-local"
                value={form.endAt}
                onChange={handleChange('endAt')}
                className={inputClasses}
              />
            </FormField>
          </div>
          {errors.schedule ? <p className="text-xs text-red-600">{errors.schedule}</p> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t('bookingForm.frequency')}>
              <select
                id="frequency"
                value={form.frequency}
                onChange={handleChange('frequency')}
                className={selectClasses}
              >
                {frequencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {t(`bookingForm.frequencyOptions.${option}`, option)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('bookingForm.mode')}>
              <select
                id="mode"
                value={form.mode}
                onChange={handleChange('mode')}
                className={selectClasses}
              >
                {modeOptions.map((option) => (
                  <option key={option} value={option}>
                    {t(`bookingForm.modeOptions.${option}`, option)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('bookingForm.ecoPreference')}>
              <select
                id="ecoPreference"
                value={form.ecoPreference}
                onChange={handleChange('ecoPreference')}
                className={selectClasses}
              >
                {ecoOptions.map((option) => (
                  <option key={option} value={option}>
                    {t(`bookingForm.ecoOptions.${option}`, option)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label={t('bookingForm.requiredProviders', 'Nombre d’intervenants')}
              hint={t(
                'bookingForm.requiredProvidersHint',
                'Définissez la taille de l’équipe (1 à 20 personnes).'
              )}
            >
              <input
                id="requiredProviders"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.requiredProviders}
                onChange={handleChange('requiredProviders')}
                className={inputClasses}
                placeholder={t('bookingForm.requiredProvidersPlaceholder', 'ex : 2')}
              />
              {errors.requiredProviders ? (
                <p className="text-xs text-red-600">{errors.requiredProviders}</p>
              ) : null}
            </FormField>
            <FormField
              label={t('bookingForm.preferredTeam', 'Équipe préférée (optionnel)')}
              hint={t(
                'bookingForm.preferredTeamHint',
                'Sélectionnez une équipe existante ou saisissez un identifiant interne.'
              )}
            >
              {providerTeamsQuery.isLoading ? (
                <div className="mb-2 flex items-center gap-2 text-xs text-saubio-slate/70">
                  <LoadingIndicator size="sm" />
                  <span>{t('bookingForm.preferredTeamLoading', 'Chargement des équipes…')}</span>
                </div>
              ) : null}
              {providerTeams.length ? (
                <select
                  value={form.preferredTeamId}
                  onChange={handleChange('preferredTeamId')}
                  className={`${inputClasses} mb-2 bg-white`}
                >
                  <option value="">
                    {t('bookingForm.preferredTeamSelectPlaceholder', 'Choisir une équipe suggérée')}
                  </option>
                  {providerTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} · {team.members.length}{' '}
                      {t('bookingForm.preferredTeamMembers', 'membre(s)')}
                    </option>
                  ))}
                </select>
              ) : null}
              <input
                id="preferredTeamId"
                value={form.preferredTeamId}
                onChange={handleChange('preferredTeamId')}
                className={inputClasses}
                placeholder={t('bookingForm.preferredTeamPlaceholder', 'TEAM-123')}
              />
              {selectedTeam ? (
                <p className="mt-2 text-xs text-saubio-slate/70">
                  {t('bookingForm.preferredTeamSummary', 'Équipe {{name}} · {{count}} membre(s)', {
                    name: selectedTeam.name,
                    count: selectedTeam.members.length,
                  })}
                </p>
              ) : null}
              {canViewTeamSchedule && normalizedPreferredTeamId ? (
                <TeamScheduleInsight
                  schedule={teamScheduleQuery.data}
                  isLoading={teamScheduleQuery.isFetching}
                  hasError={teamScheduleQuery.isError}
                  onRetry={() => {
                    void teamScheduleQuery.refetch();
                  }}
                />
              ) : null}
            </FormField>
          </div>

          <SurfaceCard variant="soft" padding="md" className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                  {t('bookingForm.providerSelection.title', 'Prestataires disponibles')}
                </h2>
                <p className="text-xs text-saubio-slate/70">
                  {providerSearchParams
                    ? t(
                        'bookingForm.providerSelection.subtitle',
                        'Sélectionnez les experts qui correspondent le mieux à votre besoin.'
                      )
                    : t(
                        'bookingForm.providerSelection.missingFilters',
                        'Renseignez la ville, le service et vos horaires pour découvrir nos partenaires.'
                      )}
                </p>
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-saubio-slate/50">
                  {t('bookingForm.providerSelection.requirement', {
                    count: safeRequiredProviders,
                    defaultValue: safeRequiredProviders
                      ? `Min. ${safeRequiredProviders} intervenant(s)`
                      : t(
                          'bookingForm.providerSelection.requirementPending',
                          'Indiquez le nombre d’intervenants souhaité.'
                        ),
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-xs font-semibold text-saubio-slate/60">
                  {t('bookingForm.providerSelection.selectedCount', {
                    count: selectedProviderIds.length,
                    defaultValue: `${selectedProviderIds.length} sélectionné(s)`,
                  })}
                </span>
                {form.mode === 'manual' ? (
                  <span
                    className={`text-[0.65rem] font-semibold uppercase tracking-[0.28em] ${
                      manualSelectionPending ? 'text-saubio-sun' : 'text-saubio-slate/50'
                    }`}
                  >
                    {t('bookingForm.providerSelection.manualProgress', {
                      selected: selectedProviderIds.length,
                      required: safeRequiredProviders,
                      defaultValue: safeRequiredProviders
                        ? `${selectedProviderIds.length}/${safeRequiredProviders}`
                        : t(
                            'bookingForm.providerSelection.manualPending',
                            'Renseignez un nombre pour suivre votre sélection.'
                          ),
                    })}
                  </span>
                ) : null}
              </div>
            </div>
            {!providerSearchParams ? (
              <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-4 text-xs text-saubio-slate/70">
                {t(
                  'bookingForm.providerSelection.fillFilters',
                  'Complétez l’adresse et le créneau souhaité pour afficher les prestataires compatibles.'
                )}
              </p>
            ) : providerSuggestionsQuery.isLoading ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`provider-skeleton-${index}`} className="h-32 rounded-3xl" />
                ))}
              </div>
            ) : providerSuggestionsQuery.isError ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {t(
                      'bookingForm.providerSelection.error',
                      'Impossible de récupérer les prestataires pour le moment.'
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => providerSuggestionsQuery.refetch()}
                  className="text-xs font-semibold text-red-700 underline"
                >
                  {t('bookingForm.providerSelection.retry', 'Réessayer')}
                </button>
              </div>
            ) : providerSuggestions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-4 text-xs text-saubio-slate/70">
                {t(
                  'bookingForm.providerSelection.empty',
                  'Aucun partenaire n’est disponible sur ce créneau. Essayez un autre horaire ou contactez notre équipe.'
                )}
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {providerSuggestions.map((provider) => {
                  const selected = selectedProviderIds.includes(provider.id);
                  return (
                    <div
                      key={provider.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setProviderDetails((prev) => ({ ...prev, [provider.id]: provider }));
                        toggleProviderSelection(provider.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setProviderDetails((prev) => ({ ...prev, [provider.id]: provider }));
                          toggleProviderSelection(provider.id);
                        }
                      }}
                      aria-pressed={selected}
                      className={`flex gap-4 rounded-3xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-saubio-forest ${
                        selected
                          ? 'border-saubio-forest bg-saubio-forest/5 shadow-soft-lg'
                          : 'border-saubio-forest/10 bg-white hover:border-saubio-forest/40'
                      }`}
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-saubio-mist/40">
                        {provider.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- provider assets can be remote
                          <img
                            src={provider.photoUrl}
                            alt={provider.displayName}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-saubio-slate/60">
                            {provider.displayName
                              .split(' ')
                              .map((chunk) => chunk.charAt(0))
                              .join('')
                              .slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-saubio-forest">{provider.displayName}</p>
                          <Pill tone="mist">
                            {t(`bookingForm.providerSelection.type.${provider.type}`, provider.type)}
                          </Pill>
                        </div>
                        <p className="text-xs text-saubio-slate/60">
                          {provider.languages.slice(0, 2).join(' · ')}
                          {provider.languages.length > 2 ? ' +' : ''}
                        </p>
                        <p className="text-xs text-saubio-slate/60">
                          {t('bookingForm.providerSelection.experience', {
                            count: provider.yearsExperience ?? 1,
                            defaultValue: `${provider.yearsExperience ?? 1} ans d’expérience`,
                          })}
                        </p>
                        {provider.bio ? (
                          <p className="text-xs text-saubio-slate/70 max-h-[3.5rem] overflow-hidden">
                            {provider.bio}
                          </p>
                        ) : null}
                        <div className="flex items-center gap-2 text-xs text-saubio-slate/80">
                          {provider.ratingAverage ? (
                            <span>
                              ★ {provider.ratingAverage.toFixed(1)} ({provider.ratingCount})
                            </span>
                          ) : (
                            <span>{t('bookingForm.providerSelection.noReviews', 'Nouveau partenaire')}</span>
                          )}
                          <span>•</span>
                          <span>
                            {t('bookingForm.providerSelection.rate', {
                              rate: formatEuro(provider.hourlyRateCents / 100),
                              defaultValue: `${formatEuro(provider.hourlyRateCents / 100)}/h`,
                            })}
                          </span>
                        </div>
                        <div className="flex gap-3 pt-1">
                          <span
                            className={`text-xs font-semibold ${
                              selected ? 'text-saubio-forest' : 'text-saubio-slate/60'
                            }`}
                          >
                            {selected
                              ? t('bookingForm.providerSelection.selected', 'Sélectionné')
                              : t('bookingForm.providerSelection.select', 'Choisir')}
                          </span>
                          <button
                            type="button"
                            className="text-xs font-semibold text-saubio-forest underline"
                            onClick={(event) => {
                              event.stopPropagation();
                              setProviderDetails((prev) => ({ ...prev, [provider.id]: provider }));
                              setFocusedProviderId(provider.id);
                            }}
                          >
                            {t('bookingForm.providerSelection.viewDetails', 'Voir le profil')}
                          </button>
                        </div>
                      </div>
                      {selected ? <Check className="h-5 w-5 text-saubio-forest" /> : null}
                    </div>
                  );
                })}
              </div>
            )}
            {selectedProviders.length > 0 ? (
              <div className="space-y-3 rounded-2xl border border-saubio-forest/10 bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-saubio-forest">
                    {t('bookingForm.providerSelection.summaryTitle', 'Votre sélection')}
                  </p>
                  <span className="text-xs text-saubio-slate/60">
                    {t('bookingForm.providerSelection.summaryCount', {
                      count: selectedProviders.length,
                      defaultValue: `${selectedProviders.length} prestataire(s)`,
                    })}
                  </span>
                </div>
                <ul className="space-y-3">
                  {selectedProviders.map((provider) => {
                    const stillSuggested = providerSuggestions.some((item) => item.id === provider.id);
                    return (
                      <li
                        key={`selected-${provider.id}`}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-saubio-forest/10 bg-white/90 p-3"
                      >
                        <div>
                          <p className="font-semibold text-saubio-forest">{provider.displayName}</p>
                          <p className="text-xs text-saubio-slate/60">
                            {provider.serviceAreas.slice(0, 2).join(' · ')}
                            {provider.serviceAreas.length > 2 ? ' +' : ''}
                          </p>
                          <p className="text-xs text-saubio-slate/60">
                            {provider.languages.join(', ')}
                          </p>
                          {!stillSuggested ? (
                            <p className="text-xs text-amber-600">
                              {t(
                                'bookingForm.providerSelection.noLongerMatching',
                                'Non disponible sur ce créneau, mais conservé dans votre sélection.'
                              )}
                            </p>
                          ) : null}
                          <div className="mt-2 flex gap-3 text-xs">
                            <button
                              type="button"
                              className="font-semibold text-saubio-forest underline"
                              onClick={() => {
                                setFocusedProviderId(provider.id);
                              }}
                            >
                              {t('bookingForm.providerSelection.viewDetails', 'Voir le profil')}
                            </button>
                            <button
                              type="button"
                              className="text-saubio-slate/60 underline"
                              onClick={() => toggleProviderSelection(provider.id)}
                            >
                              {t('bookingForm.providerSelection.remove', 'Retirer')}
                            </button>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-saubio-forest">
                          {formatEuro(provider.hourlyRateCents / 100)}/h
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </SurfaceCard>

          <CheckoutSummaryCard
            breakdown={checkoutBreakdown}
            ecoPreference={form.ecoPreference}
          />
          {errors.providerSelection ? (
            <p className="text-xs text-red-600">{errors.providerSelection}</p>
          ) : null}

          <FormField
            label={t('bookingForm.notes')}
            hint={t('bookingForm.notesHint', 'Précisions, codes d’accès, allergies...')}
          >
            <textarea
              id="notes"
              value={form.notes}
              onChange={handleChange('notes')}
              className={textAreaClasses}
              maxLength={noteCharacterLimit}
            />
            <p className="text-right text-xs text-saubio-slate/60">
              {t('bookingForm.notesCount', {
                count: noteCharactersUsed,
                limit: noteCharacterLimit,
                defaultValue: `${noteCharactersUsed}/${noteCharacterLimit}`,
              })}
            </p>
          </FormField>

          <SurfaceCard variant="soft" padding="md" className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                {t('bookingForm.addOns.title', 'Services additionnels')}
              </h2>
              <span className="text-xs font-semibold text-saubio-slate/60">
                {selectedAddOns.length
                  ? t('bookingForm.addOns.selected', {
                      count: selectedAddOns.length,
                      defaultValue: `${selectedAddOns.length} sélectionnés`,
                    })
                  : t('bookingForm.addOns.helper', 'Boostez votre mission')}
              </span>
            </div>
            <FeatureGrid columns={2}>
              {addOnOptions.map((option) => {
                const selected = selectedAddOns.includes(option.id);
                return (
                  <FeatureTile
                    key={option.id}
                    eyebrow={t('bookingForm.addOns.badge', 'Option')}
                    title={option.title}
                    description={option.description}
                    tone={selected ? 'highlight' : 'outlined'}
                    icon={option.icon}
                    cta={
                      <button
                        type="button"
                        onClick={() => toggleAddOn(option.id)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          selected
                            ? 'bg-white/20 text-white hover:bg-white/30'
                            : 'bg-saubio-forest/10 text-saubio-forest hover:bg-saubio-forest/15'
                        }`}
                      >
                        {selected
                          ? t('bookingForm.addOns.remove', 'Retirer')
                          : t('bookingForm.addOns.add', 'Ajouter')}
                      </button>
                    }
                  />
                );
              })}
            </FeatureGrid>
          </SurfaceCard>

          <SurfaceCard variant="soft" padding="md" className="space-y-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                {t('bookingForm.attachments.title', 'Photos & documents')}
              </h2>
              <p className="text-xs text-saubio-slate/70">
                {t('bookingForm.attachments.description', 'Ajoutez des photos du site ou des consignes spécifiques.')}
              </p>
            </div>
            <FormField
              label={t('bookingForm.attachments.inputLabel', 'Ajouter des fichiers')}
              hint={t('bookingForm.attachments.limit', {
                count: MAX_ATTACHMENTS,
                defaultValue: `Jusqu’à ${MAX_ATTACHMENTS} fichiers`,
              })}
            >
              <label
                className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-saubio-forest/30 bg-white/70 px-4 py-6 text-center text-sm text-saubio-slate/70 transition hover:border-saubio-forest ${
                  !canAddMoreAttachments ? 'opacity-50' : ''
                }`}
              >
                <UploadCloud className="mb-2 h-6 w-6 text-saubio-forest" />
                <span>{t('bookingForm.attachments.cta', 'Choisir des fichiers')}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="sr-only"
                  onChange={handleAttachmentChange}
                  disabled={!canAddMoreAttachments}
                />
              </label>
            </FormField>
            {attachments.length === 0 ? (
              <p className="text-xs text-saubio-slate/60">
                {t('bookingForm.attachments.empty', 'Aucun fichier sélectionné.')}
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between rounded-2xl border border-saubio-forest/10 bg-white px-3 py-2 text-saubio-forest"
                  >
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-xs text-saubio-slate/70">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={t('bookingForm.attachments.remove')}
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="rounded-full border border-saubio-forest/15 p-2 text-saubio-slate/60 transition hover:border-saubio-forest/40 hover:text-saubio-forest"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>

          <button
            type="submit"
            className="rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingIndicator tone="light" size="xs" />
                {t('bookingForm.creating')}
              </span>
            ) : (
              t('bookingForm.submit')
            )}
          </button>
        </form>

        <div className="space-y-4 lg:max-w-sm w-full">
          <SurfaceCard variant="soft" padding="md">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                {t('bookingForm.availability.title')}
              </h2>
              <Pill tone={availabilityTone[availability.status]}>
                {t(`bookingForm.availability.${availability.status}`)}
              </Pill>
            </div>
            {availability.status === 'conflict' && availability.booking ? (
              <p className="mt-3 text-sm text-saubio-slate/70">
                {t('bookingForm.availability.conflictDetail', {
                  city: availability.booking.address.city,
                  start: formatDateTime(availability.booking.startAt),
                })}
              </p>
            ) : null}
            {availability.status === 'past' ? (
              <p className="mt-3 text-sm text-saubio-slate/70">
                {t('bookingForm.availability.pastDetail')}
              </p>
            ) : null}
            {availability.status === 'invalid' ? (
              <p className="mt-3 text-sm text-saubio-slate/70">
                {t('bookingForm.availability.invalidDetail')}
              </p>
            ) : null}
          </SurfaceCard>

          <SurfaceCard variant="soft" padding="md">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
              {t('bookingForm.summary.title')}
            </h2>
            <dl className="mt-4 space-y-3 text-sm text-saubio-slate/80">
              <div className="flex items-center justify-between">
                <dt>{t('bookingForm.summary.base')}</dt>
                <dd className="font-semibold text-saubio-forest">{formatEuro(estimate.base)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>{t('bookingForm.summary.eco')}</dt>
                <dd className="font-semibold text-saubio-forest">{formatEuro(estimate.ecoSurcharge)}</dd>
              </div>
              {estimate.addOnTotal > 0 ? (
                <div className="flex items-center justify-between">
                  <dt>{t('bookingForm.summary.addOns', 'Services additionnels')}</dt>
                  <dd className="font-semibold text-saubio-forest">{formatEuro(estimate.addOnTotal)}</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <dt>{t('bookingForm.summary.tax')}</dt>
                <dd className="font-semibold text-saubio-forest">{formatEuro(estimate.tax)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-saubio-forest/10 pt-3 text-base font-semibold text-saubio-forest">
                <dt>{t('bookingForm.summary.total')}</dt>
                <dd>{formatEuro(estimate.total)}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <MatchingTimelineCard
            isSmartMatch={form.mode === 'smart_match'}
            hasFilters={Boolean(providerSearchParams)}
            suggestionsLoading={providerSuggestionsQuery.isFetching}
            suggestionsError={providerSuggestionsQuery.isError}
            suggestionsCount={providerSuggestions.length}
            teamSelectedName={selectedTeam?.name}
            teamCount={providerTeams.length}
            manualSelectionPending={form.mode === 'manual' && safeRequiredProviders > selectedProviderIds.length}
            requiredProviders={safeRequiredProviders}
            pendingSelectionCount={Math.max(safeRequiredProviders - selectedProviderIds.length, 0)}
            stageOverrides={matchingStageEvents}
          />

          <SurfaceCard variant="soft" padding="md">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
                {t('bookingDashboard.timelineTitle')}
              </h2>
              <div className="flex w-full flex-wrap gap-2 text-xs">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as BookingStatusFilter)}
                  className="w-full flex-1 rounded-full border border-saubio-forest/15 bg-saubio-mist/30 px-4 py-2 text-saubio-forest outline-none transition focus:border-saubio-forest min-w-[180px]"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all'
                        ? t('bookingDashboard.filterAllStatuses')
                        : formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
                <input
                  value={cityFilter}
                  onChange={(event) => setCityFilter(event.target.value)}
                  placeholder={t('bookingDashboard.cityPlaceholder') ?? ''}
                  className="w-full flex-1 rounded-full border border-saubio-forest/15 bg-saubio-mist/30 px-4 py-2 text-saubio-forest outline-none transition focus:border-saubio-forest min-w-[180px]"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              {bookingsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={`recent-booking-skeleton-${index}`} className="h-16 rounded-3xl" />
                  ))}
                </div>
              ) : bookingsQuery.isError ? (
                <ErrorState
                  title={t('bookingDashboard.errorTitle')}
                  description={t('bookingDashboard.errorDescription')}
                  onRetry={() => {
                    void bookingsQuery.refetch();
                  }}
                />
              ) : filteredBookings.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-saubio-forest/20 bg-saubio-mist/40 p-6 text-center text-saubio-slate/60">
                  {t('bookingDashboard.emptyTitle')}
                </p>
              ) : (
                filteredBookings.slice(0, 5).map((booking) => (
                  <article key={booking.id} className="rounded-2xl border border-saubio-forest/15 bg-white/90 p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-saubio-slate/50">
                      <span>{booking.address.city}</span>
                      <span>{formatDateTime(booking.startAt)}</span>
                    </div>
                    <p className="mt-2 font-semibold text-saubio-forest">
                      {booking.service} · {booking.surfacesSquareMeters} m²
                    </p>
                  </article>
                ))
              )}
            </div>
          </SurfaceCard>
        </div>
      </div>
      {focusedProvider ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-saubio-slate/60 backdrop-blur"
            onClick={() => setFocusedProviderId(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-2xl rounded-4xl bg-white p-6 shadow-soft-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">
                  {t('bookingForm.providerSelection.profile', 'Profil prestataire')}
                </p>
                <h3 className="text-2xl font-semibold text-saubio-forest">{focusedProvider.displayName}</h3>
                <p className="text-sm text-saubio-slate/60">{focusedProvider.serviceAreas.join(', ')}</p>
              </div>
              <button
                type="button"
                onClick={() => setFocusedProviderId(null)}
                className="rounded-full border border-saubio-forest/20 p-2 text-saubio-slate/60 hover:border-saubio-forest/60 hover:text-saubio-forest"
                aria-label={t('bookingForm.providerSelection.closeDetails', 'Fermer')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-3xl border border-saubio-forest/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
                  {t('bookingForm.providerSelection.stats', 'Indicateurs')}
                </p>
                <p className="text-sm text-saubio-slate/70">
                  {t('bookingForm.providerSelection.experience', {
                    count: focusedProvider.yearsExperience ?? 1,
                    defaultValue: `${focusedProvider.yearsExperience ?? 1} ans d’expérience`,
                  })}
                </p>
                <p className="text-sm text-saubio-slate/70">
                  {focusedProvider.ratingAverage
                    ? `★ ${focusedProvider.ratingAverage.toFixed(1)} (${focusedProvider.ratingCount})`
                    : t('bookingForm.providerSelection.noReviews', 'Nouveau partenaire')}
                </p>
                <p className="text-sm font-semibold text-saubio-forest">
                  {formatEuro(focusedProvider.hourlyRateCents / 100)}/h
                </p>
                <p className="text-xs text-saubio-slate/60">
                  {focusedProvider.offersEco
                    ? t('bookingForm.providerSelection.ecoReady', 'Kit bio disponible')
                    : t('bookingForm.providerSelection.ecoUnavailable', 'Utilise vos produits')}
                </p>
              </div>
              <div className="space-y-2 rounded-3xl border border-saubio-forest/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
                  {t('bookingForm.providerSelection.languages', 'Langues')}
                </p>
                <p className="text-sm text-saubio-slate/70">{focusedProvider.languages.join(', ')}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
                  {t('bookingForm.providerSelection.services', 'Services')}
                </p>
                <p className="text-sm text-saubio-slate/70">
                  {focusedProvider.serviceCategories
                    .map((service) => t(`bookingForm.services.${service}`, service))
                    .join(', ')}
                </p>
              </div>
            </div>
            {focusedProvider.bio ? (
              <div className="mt-4 rounded-3xl border border-saubio-forest/10 bg-saubio-mist/20 p-4 text-sm text-saubio-slate/80">
                {focusedProvider.bio}
              </div>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-saubio-forest/30 px-4 py-2 text-sm font-semibold text-saubio-forest"
                onClick={() => setFocusedProviderId(null)}
              >
                {t('bookingForm.providerSelection.closeDetails', 'Fermer')}
              </button>
              <button
                type="button"
                className="rounded-full bg-saubio-forest px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  if (focusedProviderId) {
                    toggleProviderSelection(focusedProviderId);
                  }
                  setFocusedProviderId(null);
                }}
              >
                {focusedProviderId && selectedProviderIds.includes(focusedProviderId)
                  ? t('bookingForm.providerSelection.remove', 'Retirer')
                  : t('bookingForm.providerSelection.select', 'Choisir')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <SuccessToast
        open={showSuccessToast}
        message={successToastMessage ?? t('bookingForm.successMessage', 'Votre demande a été envoyée.')}
        onDismiss={() => {
          setShowSuccessToast(false);
          setSuccessToastMessage(undefined);
        }}
        onAction={() => router.push('/client/bookings')}
      />
    </div>
  );
}

export default function CreateBookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-saubio-slate/60">Chargement…</div>}>
      <CreateBookingPageContent />
    </Suspense>
  );
}

type TeamScheduleInsightProps = {
  schedule?: ProviderTeamSchedule;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
};

function TeamScheduleInsight({ schedule, isLoading, hasError, onRetry }: TeamScheduleInsightProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-saubio-mist/60 bg-white/70 px-3 py-2 text-xs text-saubio-slate/70">
        <LoadingIndicator size="xs" />
        <span>{t('bookingForm.teamSchedule.loading', 'Analyse du planning…')}</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        <span>
          {t('bookingForm.teamSchedule.error', 'Impossible de charger le planning de cette équipe.')}
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-red-500/60 px-3 py-1 text-[11px] font-semibold text-red-700 transition hover:border-red-500"
        >
          {t('bookingForm.teamSchedule.retry', 'Réessayer')}
        </button>
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  const primaryMembers = schedule.members.slice(0, 3);
  const remaining = Math.max(0, schedule.members.length - primaryMembers.length);

  return (
    <SurfaceCard
      variant="soft"
      padding="sm"
      className="mt-3 space-y-3 border border-saubio-mist/80 bg-white text-sm text-saubio-forest"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{t('bookingForm.teamSchedule.title', 'Disponibilité de l’équipe')}</p>
          <p className="text-xs text-saubio-slate/70">
            {t('bookingForm.teamSchedule.capacity', '{{hours}} h / semaine', {
              hours: schedule.weeklyCapacityHours.toLocaleString(undefined, {
                maximumFractionDigits: 1,
              }),
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Pill tone="forest">
            {t('bookingForm.teamSchedule.members', '{{active}} / {{total}} actifs', {
              active: schedule.activeMembers,
              total: schedule.totalMembers,
            })}
          </Pill>
          <Pill tone="sun">{schedule.timezone}</Pill>
        </div>
      </div>

      {primaryMembers.length ? (
        <ul className="space-y-2 text-xs text-saubio-slate/80">
          {primaryMembers.map((member) => (
            <li
              key={member.providerId}
              className="flex items-center justify-between gap-3 rounded-2xl bg-saubio-mist/30 px-3 py-2"
            >
              <div>
                <p className="font-semibold text-saubio-forest">
                  {member.displayName || t('bookingForm.teamSchedule.memberFallback', 'Membre')}
                </p>
                <p className="text-[11px] text-saubio-slate/70">
                  {member.weeklyHours
                    ? t('bookingForm.teamSchedule.memberHours', '{{hours}} h / semaine', {
                        hours: member.weeklyHours,
                      })
                    : t('bookingForm.teamSchedule.memberHoursUnknown', 'Volume non précisé')}
                </p>
              </div>
              <div className="flex flex-col items-end text-[11px] text-saubio-slate/70">
                {member.isLead ? (
                  <span className="font-semibold uppercase text-saubio-forest">
                    {t('bookingForm.teamSchedule.lead', 'Lead')}
                  </span>
                ) : null}
                <span>
                  {member.blockingAssignments
                    ? t('bookingForm.teamSchedule.memberBusy', '{{count}} mission(s)', {
                        count: member.blockingAssignments,
                      })
                    : t('bookingForm.teamSchedule.memberAvailable', 'Disponible')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-saubio-slate/70">
          {t('bookingForm.teamSchedule.empty', 'Aucun membre n’est configuré pour cette équipe.')}
        </p>
      )}

      {remaining > 0 ? (
        <p className="text-[11px] text-saubio-slate/60">
          {t('bookingForm.teamSchedule.otherMembers', '+{{count}} membre(s) supplémentaires', {
            count: remaining,
          })}
        </p>
      ) : null}
    </SurfaceCard>
  );
}

type CheckoutSummaryCardProps = {
  breakdown: CheckoutBreakdown;
  ecoPreference: string;
};

function CheckoutSummaryCard({ breakdown, ecoPreference }: CheckoutSummaryCardProps) {
  const { t } = useTranslation();
  const loyaltyEarned = breakdown.loyalty > 0;

  return (
    <SurfaceCard variant="soft" padding="md" className="space-y-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {t('bookingForm.checkout.summaryTitle', 'Récapitulatif')}
        </h2>
        <p className="text-xs text-saubio-slate/70">
          {ecoPreference === 'bio'
            ? t('bookingForm.checkout.ecoNote', 'Option bio activée · produits certifiés EU Ecolabel.')
            : t('bookingForm.checkout.standardNote', 'Consommables fournis par vos soins.')}
        </p>
      </div>
      <dl className="space-y-1 text-sm text-saubio-slate/80">
        <div className="flex items-center justify-between">
          <dt>{t('bookingForm.checkout.base', 'Base')}</dt>
          <dd className="font-semibold text-saubio-forest">{formatEuro(breakdown.base)}</dd>
        </div>
        {breakdown.addOns > 0 ? (
          <div className="flex items-center justify-between">
            <dt>{t('bookingForm.checkout.addOns', 'Options ajoutées')}</dt>
            <dd className="font-semibold text-saubio-forest">{formatEuro(breakdown.addOns)}</dd>
          </div>
        ) : null}
        {breakdown.eco > 0 ? (
          <div className="flex items-center justify-between">
            <dt>{t('bookingForm.checkout.eco', 'Surcharge éco')}</dt>
            <dd className="font-semibold text-saubio-forest">{formatEuro(breakdown.eco)}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <dt>{t('bookingForm.checkout.tax', 'TVA (19%)')}</dt>
          <dd className="font-semibold text-saubio-forest">{formatEuro(breakdown.tax)}</dd>
        </div>
        {loyaltyEarned ? (
          <div className="flex items-center justify-between text-saubio-slate/70">
            <dt>{t('bookingForm.checkout.loyalty', 'Crédit fidélité estimé')}</dt>
            <dd>- {formatEuro(breakdown.loyalty)}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between pt-2 text-base font-semibold text-saubio-forest">
          <dt>{t('bookingForm.checkout.total', 'Total TTC')}</dt>
          <dd>{formatEuro(breakdown.total)}</dd>
        </div>
      </dl>
      <p className="text-xs text-saubio-slate/60">
        {t(
          'bookingForm.checkout.loyaltyHint',
          'Vos crédits fidélité seront appliqués automatiquement lors des prochaines missions.'
        )}
      </p>
    </SurfaceCard>
  );
}
