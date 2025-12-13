const STORAGE_KEY = 'booking_planner_state_v1';

type StoredAreaSuggestion = { area: number; hours: number };

export type BookingPlannerPersistedState = {
  service?: string;
  frequency?: string;
  hours?: number;
  surface?: string;
  startAt?: string;
  ecoPreference?: string;
  couponCode?: string;
  contactPhone?: string;
  contactCompany?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactStreet?: string;
  contactStreetNumber?: string;
  contactFloor?: string;
  hasSeparateCleaningAddress?: boolean;
  cleaningStreet?: string;
  cleaningStreetNumber?: string;
  cleaningPostal?: string;
  cleaningCity?: string;
  hasSeparateContact?: boolean;
  alternateContactFirstName?: string;
  alternateContactLastName?: string;
  alternateContactPhone?: string;
  soilLevel?: string;
  selectedWishes?: string[];
  additionalNotes?: string;
  upholsteryQuantities?: Record<string, number>;
  upholsteryAddons?: string[];
  areaSuggestion?: StoredAreaSuggestion | null;
  termsAccepted?: boolean;
  serviceDetailsOpen?: boolean;
  addressDetailsOpen?: boolean;
};

const isBrowser = () => typeof window !== 'undefined';

export const loadBookingPlannerState = (): BookingPlannerPersistedState | null => {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as BookingPlannerPersistedState;
  } catch {
    return null;
  }
};

export const saveBookingPlannerState = (state: BookingPlannerPersistedState) => {
  if (!isBrowser()) {
    return;
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
};

export const clearBookingPlannerState = () => {
  if (!isBrowser()) {
    return;
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
