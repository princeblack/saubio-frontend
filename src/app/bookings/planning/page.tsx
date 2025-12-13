'use client';

import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { ProviderServiceType, ServiceCategory } from '@saubio/models';
import { SERVICE_CATALOG } from '@saubio/models';
import { priceEstimateQueryOptions, postalCodeLookupQueryOptions, formatEuro, formatDateTime } from '@saubio/utils';
import { SectionTitle, SurfaceCard } from '@saubio/ui';
import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  Check,
  ChevronDown,
  Clock4,
  Leaf,
  MapPin,
  Building2,
  Factory,
  PanelsTopLeft,
  Ruler,
  Sparkles,
  Tag,
  ShieldCheck,
  Droplets,
  Flame,
  Boxes,
} from 'lucide-react';
import {
  loadBookingPlannerState,
  saveBookingPlannerState,
} from '../../../utils/bookingPlannerStorage';

type ServiceOption = ProviderServiceType & { icon?: LucideIcon };
type TranslatedServiceOption = ServiceOption & {
  label: string;
  description: string;
  includedOptions: string[];
};

const SERVICE_ICON_MAP: Partial<Record<ServiceCategory, LucideIcon>> = {
  residential: Sparkles,
  office: Building2,
  industrial: Factory,
  windows: PanelsTopLeft,
  disinfection: ShieldCheck,
  eco_plus: Leaf,
  carpet: Ruler,
  upholstery: Ruler,
  spring: Sparkles,
  final: Sparkles,
  cluttered: Tag,
  construction: Factory,
  move_out: Boxes,
  pigeon_cleanup: ShieldCheck,
  restaurant: Building2,
  heavy_dirty: Sparkles,
  carpet_laundry: Ruler,
  wintergarden: PanelsTopLeft,
  nicotine_removal: Sparkles,
  fire_damage: Flame,
  clearout: Boxes,
  wood_terrace: Leaf,
  water_damage: Droplets,
  hoarder: Tag,
  deep_disinfection: ShieldCheck,
};

const BASE_SERVICE_OPTIONS: ServiceOption[] = SERVICE_CATALOG.map((service) => ({
  ...service,
  icon: SERVICE_ICON_MAP[service.id],
}));

const SERVICE_DURATION = {
  MIN: 2,
  MAX: 12,
  STEP: 0.5,
} as const;

const DURATION_PRESETS = Array.from(
  { length: Math.floor((SERVICE_DURATION.MAX - SERVICE_DURATION.MIN) / SERVICE_DURATION.STEP) + 1 },
  (_, index) => SERVICE_DURATION.MIN + index * SERVICE_DURATION.STEP
);

const FREQUENCY_OPTIONS = [
  {
    id: 'once',
    label: 'Une seule fois',
    tagline: 'Flexibilité complète',
    features: [ 'Nettoyage unique', 'Choix libre du créneau'],
  },
  {
    id: 'weekly',
    label: 'Chaque semaine',
    tagline: 'Jusqu’à -7%',
    features: ['Prestataire attitré', 'Pas de contrat minimum', 'Nettoyage régulier'],
    highlight: true,
  },
  {
    id: 'biweekly',
    label: 'Tous les 15 jours',
    tagline: 'Jusqu’à -5%',
    features: ['Prestataire attitré', 'Pas de contrat minimum', 'Nettoyage régulier'],
  },
  
] as const;

const ECO_OPTIONS = [
  { id: 'standard', label: 'Standard' },
  { id: 'bio', label: 'BIO / produits verts' },
] as const;

const SOIL_LEVELS = [
  { id: 'light', label: 'leicht' },
  { id: 'normal', label: 'normal' },
  { id: 'strong', label: 'stark' },
  { id: 'extreme', label: 'extrem' },
] as const;

const CLEANING_WISHES: (Partial<
  Record<ServiceCategory, { id: string; label: string }[]>
> & {
  default: { id: string; label: string }[];
}) = {
  residential: [
    { id: 'bathroom', label: 'Bad/Sanitär' },
    { id: 'kitchen', label: 'Küche' },
    { id: 'oven', label: 'Backofen' },
    { id: 'fridge', label: 'Kühlschrank' },
    { id: 'floors', label: 'Böden reinigen' },
  { id: 'balcony', label: 'Balkon' },
  { id: 'windows', label: 'Fenster' },
  { id: 'dusting', label: 'Staubwischen' },
  { id: 'closets', label: 'Schränke' },
  { id: 'furniture', label: 'Möbel/Flächen' },
  { id: 'radiators', label: 'Heizkörper' },
  { id: 'doors', label: 'Türen' },
  { id: 'carpet', label: 'Teppich saugen' },
  { id: 'cellar', label: 'Keller' },
  { id: 'windows_inout', label: 'Fenster innen/außen' },
  { id: 'bedding', label: 'Komplette Bettwäsche' },
  { id: 'appliances', label: 'Großgeräte reinigen' },
],
  office: [
    { id: 'workstations', label: 'Arbeitsplätze' },
    { id: 'meeting', label: 'Konferenzräume' },
    { id: 'kitchenette', label: 'Kaffeeküche' },
    { id: 'restrooms', label: 'Sanitärflächen' },
    { id: 'windows', label: 'Fenster' },
    { id: 'floorcare', label: 'Bodenpflege' },
    { id: 'reception', label: 'Empfang' },
    { id: 'trash', label: 'Müllentsorgung' },
    { id: 'it', label: 'IT-Equipment' },
    { id: 'breakroom', label: 'Pausebereich' },
    { id: 'archiving', label: 'Leichtes Archivieren' },
  ],
  industrial: [
    { id: 'machines', label: 'Maschinen' },
    { id: 'storage', label: 'Lagerflächen' },
    { id: 'highdust', label: 'Hochstaub' },
    { id: 'sanitary', label: 'Sanitärbereiche' },
    { id: 'production', label: 'Produktionslinien' },
    { id: 'loading', label: 'Laderampen' },
    { id: 'decontamination', label: 'Leichte Dekontamination' },
    { id: 'resin', label: 'Harz-/Sicherheitsboden' },
    { id: 'technical', label: 'Technikräume' },
  ],
  windows: [
    { id: 'altbau', label: 'Altbaufenster' },
    { id: 'awning', label: 'Vordach' },
    { id: 'frames', label: 'Mit Rahmen' },
    { id: 'fugen', label: 'Fugen/Falze' },
    { id: 'inside', label: 'Nur innen' },
    { id: 'outside', label: 'Nur außen' },
    { id: 'inside_outside', label: 'Innen/Aussen' },
    { id: 'jalousie', label: 'Jalousien' },
    { id: 'roller', label: 'Rollladen' },
    { id: 'sill', label: 'Fensterbänke' },
    { id: 'sprossen', label: 'Sprossenfenster' },
    { id: 'skylight', label: 'Oberlichter' },
    { id: 'wintergarden', label: 'Wintergarten' },
    { id: 'rain_protection', label: 'Schutzbeschichtung' },
    { id: 'film', label: 'Folien (De-/Montage)' },
    { id: 'outdoor_ads', label: 'Außenwerbung' },
  ],
  disinfection: [
    { id: 'surface', label: 'Oberflächen' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'vehicle', label: 'Fahrzeuge' },
    { id: 'sanitary', label: 'Sanitärbereiche' },
    { id: 'ulv', label: 'ULV/Berieselung' },
    { id: 'touchpoints', label: 'Häufige Kontaktpunkte' },
    { id: 'frontdesk', label: 'Empfang/Kundenbereich' },
  ],
  carpet: [
    { id: 'livingroom', label: 'Wohnzimmerteppich' },
    { id: 'runner', label: 'Läufer' },
    { id: 'stairs', label: 'Treppen' },
    { id: 'office', label: 'Büroteppich' },
    { id: 'bauarbeiten', label: 'Bauarbeiten' },
    { id: 'blood', label: 'Blut' },
    { id: 'erbrochenes', label: 'Erbrochenes' },
    { id: 'flecken', label: 'Flecken' },
    { id: 'laufspuren', label: 'Laufspuren' },
    { id: 'move', label: 'Umzug' },
    { id: 'redwine', label: 'Rotwein' },
    { id: 'urine', label: 'Urin' },
    { id: 'waterdamage', label: 'Wasserschade' },
    { id: 'odor', label: 'Geruchsentfernung' },
    { id: 'protector', label: 'Schutzbeschichtung' },
    { id: 'fastdry', label: 'Schnelltrocknung' },
  ],
  upholstery: [],
  spring: [
    { id: 'bathroom', label: 'Bad/Sanitär' },
    { id: 'armaturen', label: 'Armaturen' },
    { id: 'bathtub', label: 'Badewanne' },
    { id: 'shower', label: 'Dusche' },
    { id: 'tiles', label: 'Fliesen/Fugen' },
    { id: 'sink', label: 'Waschbecken' },
    { id: 'wc', label: 'WC Bereich' },
    { id: 'kitchen', label: 'Küche' },
    { id: 'countertop', label: 'Arbeitsplatte' },
    { id: 'oven', label: 'Backofen' },
    { id: 'hood', label: 'Dunstabzug' },
    { id: 'dishes', label: 'Geschirr' },
    { id: 'fridge', label: 'Kühlschrank' },
    { id: 'cooktop', label: 'Kochfeld' },
    { id: 'machines', label: 'Küchenmaschinen' },
    { id: 'microwave', label: 'Mikrowelle' },
    { id: 'drawers', label: 'Schubladen' },
    { id: 'sinkarea', label: 'Spülbereich' },
    { id: 'dusting', label: 'Staubwischen' },
    { id: 'furniture', label: 'Möbel/Flächen' },
    { id: 'tables', label: 'Tische/Stühle' },
    { id: 'closet_outside', label: 'Schrank aussen' },
    { id: 'closet_inside', label: 'Schrank innen' },
    { id: 'bed', label: 'Bett/Gestell' },
    { id: 'nightstand', label: 'Nachttisch' },
    { id: 'pictures', label: 'Bilder/Rahmen' },
    { id: 'lamps', label: 'Lampen' },
    { id: 'tv', label: 'TV/HiFi' },
    { id: 'windowsills', label: 'Fensterbänke' },
    { id: 'switches', label: 'Lichtschalter' },
    { id: 'sockets', label: 'Steckdosen' },
    { id: 'heating', label: 'Heizung' },
    { id: 'cobwebs', label: 'Spinnweben' },
    { id: 'floors', label: 'Böden reinigen' },
    { id: 'baseboards', label: 'Sockelleisten' },
    { id: 'carpet', label: 'Teppich saugen' },
    { id: 'couch', label: 'Couch saugen' },
    { id: 'doors', label: 'Türen' },
    { id: 'vent', label: 'Lüftung' },
    { id: 'balcony', label: 'Balkon' },
    { id: 'cellar', label: 'Keller' },
    { id: 'garage', label: 'Garage' },
    { id: 'wine', label: 'Weinkeller' },
    { id: 'library', label: 'Bibliothek/Ordnen' },
  ],
  final: [
    { id: 'balcony', label: 'Balkon' },
    { id: 'basenrein', label: 'Besenrein' },
    { id: 'bathroom', label: 'Bad/Sanitär' },
    { id: 'cellar', label: 'Keller' },
    { id: 'floors', label: 'Böden reinigen' },
    { id: 'kitchen', label: 'Küche' },
    { id: 'tenant_change', label: 'Mieterwechsel' },
    { id: 'handover', label: 'Objektübergabe' },
    { id: 'closet_inside', label: 'Schrank innen' },
    { id: 'closet_outside', label: 'Schrank aussen' },
    { id: 'doors', label: 'Türen' },
    { id: 'paint', label: 'Kleine Lackkorrekturen' },
    { id: 'waste', label: 'Kartons/Abfall entsorgen' },
    { id: 'metal', label: 'Metallpolitur' },
  ],
  cluttered: [
    { id: 'balcony', label: 'Balkon' },
    { id: 'bathroom', label: 'Bad/Sanitär' },
    { id: 'cleanout', label: 'Entrümpelung' },
    { id: 'desinfection', label: 'Desinfektion' },
    { id: 'disposal', label: 'Entsorgung' },
    { id: 'feces', label: 'Fäkalien' },
    { id: 'keller', label: 'Keller' },
    { id: 'kitchen', label: 'Küche' },
    { id: 'furniture', label: 'Möbel/Flächen' },
    { id: 'inventory', label: 'Inventar erfassen' },
    { id: 'recycling', label: 'Deponie/Recycler koordinieren' },
    { id: 'odor', label: 'Geruchsbehandlung' },
  ],
  default: [
    { id: 'floors', label: 'Böden' },
    { id: 'windows', label: 'Fenster' },
    { id: 'sanitary', label: 'Sanitär' },
  ],
};

const UPHOLSTERY_ITEMS = [
  { id: 'sofa_two', label: '2-Sitzer' },
  { id: 'sofa_three', label: '3-Sitzer' },
  { id: 'corner_small', label: 'Eck-Couch klein' },
  { id: 'corner_large', label: 'Eck-Couch groß' },
  { id: 'armchair', label: 'Sessel' },
  { id: 'stool', label: 'Hocker' },
  { id: 'chair_with_back', label: 'Stuhl mit Lehne' },
  { id: 'chair_without_back', label: 'Stuhl ohne Lehne' },
  { id: 'custom_couch', label: 'Couch individuell' },
] as const;

const UPHOLSTERY_ADDONS = [
  { id: 'anti_dust', label: 'Anti-Acariens' },
  { id: 'leather', label: 'Cuir & simili' },
  { id: 'decor_cushions', label: 'Coussins décoratifs' },
] as const;

const createDefaultUpholsteryQuantities = () =>
  UPHOLSTERY_ITEMS.reduce<Record<string, number>>((acc, item) => {
    acc[item.id] = 0;
    return acc;
  }, {});

export const estimateCleaningHours = (areaM2: number | null | undefined): number | null => {
  if (areaM2 === null || areaM2 === undefined || Number.isNaN(areaM2) || areaM2 <= 0) {
    return null;
  }
  let estimated = SERVICE_DURATION.MIN;
  if (areaM2 > 50) {
    const extraM2 = areaM2 - 50;
    const extraSteps = Math.ceil(extraM2 / 15);
    estimated += extraSteps * SERVICE_DURATION.STEP;
  }
  if (estimated > SERVICE_DURATION.MAX) {
    estimated = SERVICE_DURATION.MAX;
  }
  if (estimated < SERVICE_DURATION.MIN) {
    estimated = SERVICE_DURATION.MIN;
  }
  return estimated;
};

const PLATFORM_FEE_CENTS = 300;

const toInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const getDefaultStartAt = () => {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(9, 0, 0, 0);
  return toInputValue(now);
};

const clampToWindow = (value: string) => {
  if (!value) return value;
  const current = new Date(value);
  if (Number.isNaN(current.getTime())) {
    return value;
  }
  const opening = new Date(current);
  opening.setHours(7, 0, 0, 0);
  const closing = new Date(current);
  closing.setHours(19, 30, 0, 0);
  if (current < opening) {
    return toInputValue(opening);
  }
  if (current > closing) {
    return toInputValue(closing);
  }
  return value;
};

const computeEndDate = (startValue: string, hours: number) => {
  if (!startValue) return null;
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) {
    return null;
  }
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  const end = new Date(start);
  end.setHours(end.getHours() + wholeHours);
  end.setMinutes(end.getMinutes() + minutes);
  return end;
};

function BookingPlanningPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPostal = searchParams?.get('postalCode') ?? '';

  const [postalCode] = useState(initialPostal);
  const [service, setService] = useState<ServiceCategory>('residential');
  const [frequency, setFrequency] = useState<(typeof FREQUENCY_OPTIONS)[number]['id']>('once');
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [serviceDropdownFocusIndex, setServiceDropdownFocusIndex] = useState(() =>
    Math.max(0, BASE_SERVICE_OPTIONS.findIndex((option) => option.id === 'residential'))
  );
  const serviceDropdownRef = useRef<HTMLDivElement | null>(null);
  const serviceListRef = useRef<HTMLDivElement | null>(null);
  const hoursDropdownRef = useRef<HTMLDivElement | null>(null);
  const [hours, setHours] = useState(2);
  const [surface, setSurface] = useState('');
  const [startAt, setStartAt] = useState(getDefaultStartAt());
  const [ecoPreference, setEcoPreference] = useState<(typeof ECO_OPTIONS)[number]['id']>('standard');
  const [couponCode, setCouponCode] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactStreet, setContactStreet] = useState('');
  const [contactStreetNumber, setContactStreetNumber] = useState('');
  const [contactFloor, setContactFloor] = useState('');
  const [hasSeparateCleaningAddress, setHasSeparateCleaningAddress] = useState(false);
  const [cleaningStreet, setCleaningStreet] = useState('');
  const [cleaningStreetNumber, setCleaningStreetNumber] = useState('');
  const [cleaningPostal, setCleaningPostal] = useState('');
  const [cleaningCity, setCleaningCity] = useState('');
  const [hasSeparateContact, setHasSeparateContact] = useState(false);
  const [alternateContactFirstName, setAlternateContactFirstName] = useState('');
  const [alternateContactLastName, setAlternateContactLastName] = useState('');
  const [alternateContactPhone, setAlternateContactPhone] = useState('');
  const [soilLevel, setSoilLevel] = useState<(typeof SOIL_LEVELS)[number]['id']>('normal');
  const [selectedWishes, setSelectedWishes] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [upholsteryQuantities, setUpholsteryQuantities] = useState<Record<string, number>>(
    createDefaultUpholsteryQuantities
  );
  const [upholsteryAddons, setUpholsteryAddons] = useState<string[]>([]);
  const [hoursMenuOpen, setHoursMenuOpen] = useState(false);
  const [areaSuggestion, setAreaSuggestion] = useState<{ area: number; hours: number } | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const persistenceRestoreRef = useRef(false);
  const [hasHydratedPersistence, setHasHydratedPersistence] = useState(false);
  const [serviceDetailsOpen, setServiceDetailsOpen] = useState(true);
  const [addressDetailsOpen, setAddressDetailsOpen] = useState(true);

  const serviceOptions = useMemo<TranslatedServiceOption[]>(
    () =>
      BASE_SERVICE_OPTIONS.map((option) => ({
        ...option,
        label: t(`bookingPlanner.services.${option.id}.label`, option.title),
        description: t(`bookingPlanner.services.${option.id}.description`, option.description),
        includedOptions: option.includedOptions.map((text, index) =>
          t(`bookingPlanner.services.${option.id}.included.${index}`, text)
        ),
      })),
    [t]
  );

  const frequencyOptions = useMemo(
    () =>
      FREQUENCY_OPTIONS.map((option) => ({
        ...option,
        label: t(`bookingPlanner.frequency.options.${option.id}.label`, option.label),
        tagline: t(`bookingPlanner.frequency.options.${option.id}.tagline`, option.tagline),
        features: option.features.map((feature, index) =>
          t(`bookingPlanner.frequency.options.${option.id}.features.${index}`, feature)
        ),
      })),
    [t]
  );

  const ecoOptions = useMemo(
    () =>
      ECO_OPTIONS.map((option) => ({
        ...option,
        label: t(`bookingPlanner.eco.options.${option.id}`, option.label),
      })),
    [t]
  );

  const soilLevelOptions = useMemo(
    () =>
      SOIL_LEVELS.map((level) => ({
        ...level,
        label: t(`bookingPlanner.soilLevels.${level.id}`, level.label),
      })),
    [t]
  );

  const upholsteryItems = useMemo(
    () =>
      UPHOLSTERY_ITEMS.map((item) => ({
        ...item,
        label: t(`bookingPlanner.upholstery.items.${item.id}`, item.label),
      })),
    [t]
  );

  const upholsteryAddonOptions = useMemo(
    () =>
      UPHOLSTERY_ADDONS.map((addon) => ({
        ...addon,
        label: t(`bookingPlanner.upholstery.addons.${addon.id}`, addon.label),
      })),
    [t]
  );

  useEffect(() => {
    const stored = loadBookingPlannerState();
    if (!stored) {
      setHasHydratedPersistence(true);
      return;
    }
    persistenceRestoreRef.current = true;
    if (stored.service && BASE_SERVICE_OPTIONS.some((option) => option.id === stored.service)) {
      setService(stored.service as ServiceCategory);
    }
    if (stored.frequency && FREQUENCY_OPTIONS.some((option) => option.id === stored.frequency)) {
      setFrequency(stored.frequency as (typeof FREQUENCY_OPTIONS)[number]['id']);
    }
    if (typeof stored.hours === 'number' && Number.isFinite(stored.hours)) {
      setHours(clampHoursValue(stored.hours));
    }
    if (typeof stored.surface === 'string') {
      setSurface(stored.surface);
    }
    if (typeof stored.startAt === 'string' && stored.startAt) {
      setStartAt(stored.startAt);
    }
    if (stored.ecoPreference && ECO_OPTIONS.some((option) => option.id === stored.ecoPreference)) {
      setEcoPreference(stored.ecoPreference as (typeof ECO_OPTIONS)[number]['id']);
    }
    if (typeof stored.couponCode === 'string') {
      setCouponCode(stored.couponCode);
    }
    if (typeof stored.contactPhone === 'string') {
      setContactPhone(stored.contactPhone);
    }
    if (typeof stored.contactCompany === 'string') {
      setContactCompany(stored.contactCompany);
    }
    if (typeof stored.contactFirstName === 'string') {
      setContactFirstName(stored.contactFirstName);
    }
    if (typeof stored.contactLastName === 'string') {
      setContactLastName(stored.contactLastName);
    }
    if (typeof stored.contactStreet === 'string') {
      setContactStreet(stored.contactStreet);
    }
    if (typeof stored.contactStreetNumber === 'string') {
      setContactStreetNumber(stored.contactStreetNumber);
    }
    if (typeof stored.contactFloor === 'string') {
      setContactFloor(stored.contactFloor);
    }
    if (typeof stored.hasSeparateCleaningAddress === 'boolean') {
      setHasSeparateCleaningAddress(stored.hasSeparateCleaningAddress);
    }
    if (typeof stored.cleaningStreet === 'string') {
      setCleaningStreet(stored.cleaningStreet);
    }
    if (typeof stored.cleaningStreetNumber === 'string') {
      setCleaningStreetNumber(stored.cleaningStreetNumber);
    }
    if (typeof stored.cleaningPostal === 'string') {
      setCleaningPostal(stored.cleaningPostal);
    }
    if (typeof stored.cleaningCity === 'string') {
      setCleaningCity(stored.cleaningCity);
    }
    if (typeof stored.hasSeparateContact === 'boolean') {
      setHasSeparateContact(stored.hasSeparateContact);
    }
    if (typeof stored.alternateContactFirstName === 'string') {
      setAlternateContactFirstName(stored.alternateContactFirstName);
    }
    if (typeof stored.alternateContactLastName === 'string') {
      setAlternateContactLastName(stored.alternateContactLastName);
    }
    if (typeof stored.alternateContactPhone === 'string') {
      setAlternateContactPhone(stored.alternateContactPhone);
    }
    if (stored.soilLevel && SOIL_LEVELS.some((level) => level.id === stored.soilLevel)) {
      setSoilLevel(stored.soilLevel as (typeof SOIL_LEVELS)[number]['id']);
    }
    if (Array.isArray(stored.selectedWishes)) {
      setSelectedWishes(stored.selectedWishes);
    }
    if (typeof stored.additionalNotes === 'string') {
      setAdditionalNotes(stored.additionalNotes);
    }
    const defaultQuantities = createDefaultUpholsteryQuantities();
    setUpholsteryQuantities(
      stored.upholsteryQuantities ? { ...defaultQuantities, ...stored.upholsteryQuantities } : defaultQuantities
    );
    if (Array.isArray(stored.upholsteryAddons)) {
      setUpholsteryAddons(stored.upholsteryAddons);
    }
    setAreaSuggestion(
      stored.areaSuggestion && typeof stored.areaSuggestion.area === 'number' && typeof stored.areaSuggestion.hours === 'number'
        ? stored.areaSuggestion
        : null
    );
    if (typeof stored.termsAccepted === 'boolean') {
      setTermsAccepted(stored.termsAccepted);
    }
    if (typeof stored.serviceDetailsOpen === 'boolean') {
      setServiceDetailsOpen(stored.serviceDetailsOpen);
    }
    if (typeof stored.addressDetailsOpen === 'boolean') {
      setAddressDetailsOpen(stored.addressDetailsOpen);
    }
    window.setTimeout(() => {
      persistenceRestoreRef.current = false;
      setHasHydratedPersistence(true);
    }, 0);
  }, []);
  const sanitizedPostal = postalCode.trim();
  const normalizedPostal = sanitizedPostal.replace(/\D/g, '').slice(0, 5);
  const locationPostal = normalizedPostal || sanitizedPostal;
  const postalLookupQuery = useQuery(
    postalCodeLookupQueryOptions(normalizedPostal.length === 5 ? normalizedPostal : null)
  );
  const postalMatch = postalLookupQuery.data ?? null;
  const locationCity = postalMatch?.city ?? '';
  const isPostalLookupLoading = postalLookupQuery.isFetching || postalLookupQuery.isPending;
  const locationLabel = locationPostal
    ? postalMatch
      ? `${locationPostal}, ${postalMatch.city}`
      : isPostalLookupLoading
        ? t('bookingPlanner.location.searching', 'Recherche en cours…')
        : locationPostal
    : null;
  const locationSubline = locationPostal
    ? isPostalLookupLoading
      ? t('bookingPlanner.location.searching', 'Recherche en cours…')
      : postalMatch?.area ??
        postalMatch?.state ??
        t('bookingPlanner.location.preview', 'Zone estimée autour de ce code postal.')
    : t('bookingPlanner.location.prompt', 'Indiquez votre code postal pour voir les disponibilités.');
  const clampHoursValue = (value: number) =>
    Math.min(SERVICE_DURATION.MAX, Math.max(SERVICE_DURATION.MIN, value));

  useEffect(() => {
    if (!hasHydratedPersistence) {
      return;
    }
    saveBookingPlannerState({
      service,
      frequency,
      hours,
      surface,
      startAt,
      ecoPreference,
      couponCode,
      contactPhone,
      contactCompany,
      contactFirstName,
      contactLastName,
      contactStreet,
      contactStreetNumber,
      contactFloor,
      hasSeparateCleaningAddress,
      cleaningStreet,
      cleaningStreetNumber,
      cleaningPostal,
      cleaningCity,
      hasSeparateContact,
      alternateContactFirstName,
      alternateContactLastName,
      alternateContactPhone,
      soilLevel,
      selectedWishes,
      additionalNotes,
      upholsteryQuantities,
      upholsteryAddons,
      areaSuggestion,
      termsAccepted,
      serviceDetailsOpen,
      addressDetailsOpen,
    });
  }, [
    service,
    frequency,
    hours,
    surface,
    startAt,
    ecoPreference,
    couponCode,
    contactPhone,
    contactCompany,
    contactFirstName,
    contactLastName,
    contactStreet,
    contactStreetNumber,
    contactFloor,
    hasSeparateCleaningAddress,
    cleaningStreet,
    cleaningStreetNumber,
    cleaningPostal,
    cleaningCity,
    hasSeparateContact,
    alternateContactFirstName,
    alternateContactLastName,
    alternateContactPhone,
    soilLevel,
    selectedWishes,
    additionalNotes,
    upholsteryQuantities,
    upholsteryAddons,
    areaSuggestion,
    termsAccepted,
    serviceDetailsOpen,
    addressDetailsOpen,
    hasHydratedPersistence,
  ]);

  const selectedService = useMemo(
    () => serviceOptions.find((option) => option.id === service),
    [service, serviceOptions]
  );
  const selectedServiceIndex = useMemo(
    () => Math.max(0, serviceOptions.findIndex((option) => option.id === service)),
    [service, serviceOptions]
  );
  const cleaningWishOptions = useMemo(() => {
    if (service === 'upholstery') {
      return [];
    }
    const source = CLEANING_WISHES[service] ?? CLEANING_WISHES.default;
    const namespace: ServiceCategory | 'default' = CLEANING_WISHES[service] ? service : 'default';
    return [...source]
      .map((option) => ({
        ...option,
        label: t(`bookingPlanner.wishes.${namespace}.${option.id}`, option.label),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'de'));
  }, [service, t]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        hoursDropdownRef.current &&
        !hoursDropdownRef.current.contains(event.target as Node)
      ) {
        setHoursMenuOpen(false);
      }
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target as Node)
      ) {
        setServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (serviceDropdownOpen && serviceListRef.current) {
      serviceListRef.current.focus();
    }
  }, [serviceDropdownOpen]);

  useEffect(() => {
    setServiceDropdownFocusIndex(selectedServiceIndex);
  }, [selectedServiceIndex]);

  useEffect(() => {
    if (persistenceRestoreRef.current) {
      return;
    }
    setSurface('');
    setHours(SERVICE_DURATION.MIN);
    setStartAt(getDefaultStartAt());
    setEcoPreference('standard');
    setCouponCode('');
    setContactPhone('');
    setContactCompany('');
    setContactFirstName('');
    setContactLastName('');
    setContactStreet('');
    setContactStreetNumber('');
    setContactFloor('');
    setHasSeparateCleaningAddress(false);
    setCleaningStreet('');
    setCleaningStreetNumber('');
    setCleaningPostal('');
    setCleaningCity('');
    setHasSeparateContact(false);
    setAlternateContactFirstName('');
    setAlternateContactLastName('');
    setAlternateContactPhone('');
    setSoilLevel('normal');
    setSelectedWishes([]);
    setAdditionalNotes('');
    setUpholsteryQuantities(createDefaultUpholsteryQuantities());
    setUpholsteryAddons([]);
    setAreaSuggestion(null);
    setTermsAccepted(false);
    setServiceDetailsOpen(true);
    setAddressDetailsOpen(true);
  }, [service]);
  const estimateQuery = useQuery({
    ...priceEstimateQueryOptions({
      postalCode: sanitizedPostal,
      hours,
      service,
    }),
    enabled: sanitizedPostal.length >= 4,
  });

  const estimate = estimateQuery.data;
  const minStartAt = useMemo(() => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    minDate.setHours(7, 0, 0, 0);
    return toInputValue(minDate);
  }, []);

  const leadTimeDays = useMemo(() => {
    if (!startAt) return 0;
    const start = new Date(startAt);
    if (Number.isNaN(start.getTime())) {
      return 0;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = start.getTime() - today.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [startAt]);

  const isShortNotice = leadTimeDays <= 1;

  const averageHourlyCents = useMemo(() => {
    if (
      typeof estimate?.minHourlyRateCents === 'number' &&
      typeof estimate?.maxHourlyRateCents === 'number'
    ) {
      return Math.round((estimate.minHourlyRateCents + estimate.maxHourlyRateCents) / 2);
    }
    return estimate?.minHourlyRateCents ?? estimate?.maxHourlyRateCents ?? null;
  }, [estimate]);

  const depositHoldCents =
    isShortNotice && averageHourlyCents
      ? Math.round(averageHourlyCents * hours + PLATFORM_FEE_CENTS)
      : null;

  const endAt = useMemo(() => computeEndDate(startAt, hours), [startAt, hours]);

  const continueDisabled = sanitizedPostal.length < 4 || !startAt || !termsAccepted;

  const toggleWish = (wishId: string) => {
    setSelectedWishes((prev) =>
      prev.includes(wishId) ? prev.filter((id) => id !== wishId) : [...prev, wishId]
    );
  };

  // Wrapper so every hours update respects platform bounds and so we can track auto-suggestions.
  const applyHoursUpdate = (value: number, options?: { suggested?: boolean; area?: number }) => {
    const clamped = clampHoursValue(value);
    setHours(clamped);
    if (options?.suggested && typeof options.area === 'number') {
      // Store the auto-suggestion so we can show the helper banner.
      setAreaSuggestion({ area: options.area, hours: clamped });
    } else {
      setAreaSuggestion(null);
    }
  };

  const adjustUpholsteryQuantity = (id: string, delta: number) => {
    setUpholsteryQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      if (next === prev[id]) {
        return prev;
      }
      return { ...prev, [id]: next };
    });
  };

  const toggleUpholsteryAddon = (addonId: string) => {
    setUpholsteryAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleSurfaceChange = (value: string) => {
    setSurface(value);
    const numeric = parseFloat(value);
    if (!value || Number.isNaN(numeric) || numeric <= 0) {
      setAreaSuggestion(null);
      return;
    }
    const estimated = estimateCleaningHours(numeric);
    if (estimated !== null) {
      applyHoursUpdate(estimated, { suggested: true, area: numeric });
    }
  };

  const handleManualHoursChange = (value: number) => {
    applyHoursUpdate(value);
  };

  const handleServiceSelect = (optionId: ServiceCategory) => {
    setService(optionId);
    setServiceDropdownOpen(false);
  };

  const handleServiceKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!serviceDropdownOpen) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setServiceDropdownFocusIndex((prev) => (prev + 1) % serviceOptions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setServiceDropdownFocusIndex((prev) =>
        prev - 1 < 0 ? serviceOptions.length - 1 : prev - 1
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = serviceOptions[serviceDropdownFocusIndex];
      if (option) {
        handleServiceSelect(option.id);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setServiceDropdownOpen(false);
    }
  };

  const handleUpholsteryInputChange = (id: string, value: string) => {
    const numeric = Math.max(0, Number(value) || 0);
    setUpholsteryQuantities((prev) => ({
      ...prev,
      [id]: numeric,
    }));
  };

  const handleStartAtChange = (value: string) => {
    const clamped = clampToWindow(value);
    const min = new Date(minStartAt);
    const nextValue = new Date(clamped);
    if (Number.isNaN(nextValue.getTime()) || nextValue < min) {
      setStartAt(minStartAt);
      return;
    }
    setStartAt(clamped);
  };

  const [shortNoticeDialogOpen, setShortNoticeDialogOpen] = useState(false);
  const pendingShortNoticeParams = useRef<string | null>(null);

  const buildSearchParams = () => {
    const params = new URLSearchParams({
      postalCode: sanitizedPostal,
      service,
      frequency,
      hours: String(hours),
      ecoPreference,
      startAt,
      leadTimeDays: String(leadTimeDays),
      shortNotice: isShortNotice ? '1' : '0',
    });
    if (endAt) {
      params.set('endAt', endAt.toISOString());
    }
    if (surface) {
      params.set('surfacesSquareMeters', surface);
    }
    if (couponCode.trim()) {
      params.set('coupon', couponCode.trim());
    }
    if (depositHoldCents) {
      params.set('estimatedDepositCents', String(Math.round(depositHoldCents)));
    }
    return params;
  };

  const handleContinue = () => {
    if (continueDisabled) {
      return;
    }
    const params = buildSearchParams();
    const targetQuery = params.toString();
    if (isShortNotice) {
      pendingShortNoticeParams.current = targetQuery;
      setShortNoticeDialogOpen(true);
      return;
    }
    router.push(`/bookings/select-provider?${targetQuery}`);
  };

  const confirmShortNoticeFlow = () => {
    const next = pendingShortNoticeParams.current;
    setShortNoticeDialogOpen(false);
    if (!next) {
      return;
    }
    router.push(`/bookings/account?${next}`);
  };

  const cancelShortNoticeFlow = () => {
    pendingShortNoticeParams.current = null;
    setShortNoticeDialogOpen(false);
  };

  const estimateReady = !estimateQuery.isFetching && !estimateQuery.isPending;
  const minHourlyRateCents =
    typeof estimate?.minHourlyRateCents === 'number' ? estimate.minHourlyRateCents : null;
  const minStartingPrice =
    minHourlyRateCents !== null ? Math.max(0, (minHourlyRateCents * hours) / 100) : null;
  let startingPriceDisplay = '';
  if (!estimateReady) {
    startingPriceDisplay = t('bookingPlanner.summary.waiting', 'Estimation en cours…');
  } else if (minStartingPrice !== null) {
    startingPriceDisplay = formatEuro(minStartingPrice);
  } else {
    startingPriceDisplay = t(
      'bookingPlanner.summary.startingUnavailable',
      'Tarif indisponible pour cette zone.'
    );
  }

  const pageContent = (
    <div className="mx-auto max-w-6xl space-y-8 px-0 py-4">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[800px]">
          <SurfaceCard className="min-h-[800px] p-0">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.frequency', 'Fréquence')}
              </span>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {frequencyOptions.map((option) => {
                  const isSelected = option.id === frequency;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFrequency(option.id)}
                      className={`group relative flex h-full flex-col rounded-[28px] border-2 px-5 py-2 text-left shadow-sm transition ${
                        isSelected
                          ? 'border-saubio-forest bg-saubio-forest text-white'
                          : 'border-saubio-forest/15 bg-white text-saubio-slate/80 hover:border-saubio-forest/40'
                      }`}
                    >
                      {option.highlight ? (
                        <span className="absolute -right-2 top-5 flex flex-col items-center text-[0px]">
                          <span className="h-8 w-5 rounded-t-full bg-saubio-sun shadow" />
                          <span
                            className="h-3 w-5 bg-saubio-sun"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                          />
                        </span>
                      ) : null}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold leading-tight">
                            {option.label}
                          </p>
                          <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-saubio-slate/60'}`}>
                            {option.tagline}
                          </p>
                        </div>
                      </div>
                      <div className={`mt-4 flex-1 space-y-2 text-[13px] ${isSelected ? 'text-white/90' : 'text-saubio-slate/70'}`}>
                        {option.features.map((feature, featureIndex) => (
                          <div key={`${option.id}-${featureIndex}`} className="flex items-start gap-2">
                            <Check className={`mt-0.5 h-4 w-4 ${isSelected ? 'text-white' : 'text-saubio-forest'}`} />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div
                        className={`mt-5 rounded-full border px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-wide ${
                          isSelected
                            ? 'border-white bg-white text-saubio-forest'
                            : 'border-saubio-forest/20 text-saubio-slate/70'
                        }`}
                      >
                        {isSelected
                          ? t('bookingPlanner.frequency.selected', 'Sélectionné')
                          : t('bookingPlanner.frequency.select', 'Choisir')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-8 p-2 rounded-4xl   bg-slate-50 ">
              <div className="flex flex-col h-[600px]   lg:flex-row">
                <div className="flex flex-col h-fit gap-3 rounded-3xl border border-saubio-forest/10 bg-saubio-mist/40 p-4 text-sm lg:w-64">
                  <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                    {t('bookingPlanner.fields.service', 'Type de service')}
                  </span>
                  <div ref={serviceDropdownRef} className="relative">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-saubio-forest/20 bg-white px-4 py-3 text-left text-sm font-semibold text-saubio-slate/80 transition hover:border-saubio-forest/40 focus:outline-none focus:ring-2 focus:ring-saubio-forest/30"
                      aria-haspopup="listbox"
                      aria-expanded={serviceDropdownOpen}
                      onClick={() => setServiceDropdownOpen((prev) => !prev)}
                    >
                      <span className="flex items-center gap-2">
                        {selectedService?.icon ? (
                          <selectedService.icon className="h-4 w-4 text-saubio-forest" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-saubio-forest" />
                        )}
                        {selectedService?.label}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-saubio-forest transition-transform ${
                          serviceDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {serviceDropdownOpen ? (
                      <div
                        ref={serviceListRef}
                        tabIndex={-1}
                        role="listbox"
                        aria-activedescendant={serviceOptions[serviceDropdownFocusIndex]?.id}
                        onKeyDown={handleServiceKeyDown}
                        className="absolute z-30 mt-2 w-full rounded-2xl border border-saubio-forest/15 bg-white shadow-soft-lg"
                      >
                        <div className="max-h-72 overflow-y-auto">
                          {serviceOptions.map((option, index) => {
                            const Icon = option.icon ?? Sparkles;
                            const isSelected = service === option.id;
                            const isFocused = index === serviceDropdownFocusIndex;
                            return (
                              <button
                                key={option.id}
                                id={option.id}
                                role="option"
                                type="button"
                                aria-selected={isSelected}
                                onClick={() => handleServiceSelect(option.id)}
                                onMouseEnter={() => setServiceDropdownFocusIndex(index)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                                  isFocused
                                    ? 'bg-saubio-mist/60 text-saubio-forest'
                                    : 'text-saubio-slate/80 hover:bg-saubio-mist/30'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="text-[13px] font-semibold">{option.label}</span>
                                {isSelected ? (
                                  <Check className="ml-auto h-4 w-4 text-saubio-forest" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex-1 space-y-5 text-sm lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2">
                  <details
                    open={serviceDetailsOpen}
                    onToggle={(event) => setServiceDetailsOpen(event.currentTarget.open)}
                    className="group rounded-3xl border border-saubio-forest/10 px-4 py-4"
                  >
                    <summary className="flex cursor-pointer flex-col items-center text-base font-semibold text-saubio-forest">
                      <div className="flex w-full items-center justify-center gap-2">
                        <ChevronDown className="h-5 w-5 text-saubio-forest transition-transform duration-300 group-open:rotate-180" />
                        <span className="text-center">
                          {selectedService?.label ?? t('bookingPlanner.sections.details', 'Détails du service')}
                        </span>
                      </div>
                    </summary>
                    <div className="mt-4 divide-y divide-saubio-forest/10">
                      {selectedService ? (
                        <div className="space-y-3 py-4">
                          <p className="text-sm text-saubio-slate/80">{selectedService.description}</p>
                          <ul className="list-disc space-y-1 pl-5 text-sm text-saubio-slate/70">
                            {selectedService.includedOptions.map((option) => (
                              <li key={`${selectedService.id}-${option}`}>{option}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-4 py-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/70 text-saubio-forest">
                          <Ruler className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            <span>{t('bookingPlanner.fields.surface', 'Surface estimée')}</span>
                            <span>{t('bookingPlanner.fields.surfaceOptional', 'Optionnel')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              inputMode="decimal"
                              pattern="\\d*(\\.\\d*)?"
                              value={surface}
                              onChange={(event) => {
                                const nextValue = event.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                                handleSurfaceChange(nextValue);
                              }}
                              placeholder={t('bookingPlanner.fields.surfacePlaceholder', 'Ex : 85 m²')}
                              className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-base outline-none focus:border-saubio-forest"
                            />
                            <span className="text-sm font-semibold text-saubio-slate/70">
                              {t('bookingPlanner.fields.squareMetersUnit', 'm²')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 py-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/70 text-saubio-forest">
                          <Clock4 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            <span>{t('bookingPlanner.fields.hours', 'Durée souhaitée')}</span>
                            <span>{t('bookingPlanner.fields.hoursHelp', 'Ajustable avec votre prestataire')}</span>
                          </div>
                          <div className="relative" ref={hoursDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setHoursMenuOpen((prev) => !prev)}
                              className="flex w-full items-center justify-between rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm font-semibold text-saubio-slate/80 transition focus:border-saubio-forest"
                            >
                              <span>
                                {Number.isInteger(hours)
                                  ? `${hours} ${t('bookingPlanner.fields.hoursUnit', 'Heure')}`
                                  : `${hours.toFixed(1)} ${t('bookingPlanner.fields.hoursUnit', 'Heure')}`}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 text-saubio-forest transition-transform ${
                                  hoursMenuOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {hoursMenuOpen ? (
                              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-saubio-forest/15 bg-white shadow-soft-lg">
                                <div className="max-h-56 overflow-y-auto">
                                  {DURATION_PRESETS.map((preset) => {
                                    const label = Number.isInteger(preset)
                                      ? `${preset} ${t('bookingPlanner.fields.hoursUnit', 'Heure')}`
                                      : `${preset.toFixed(1)} ${t('bookingPlanner.fields.hoursUnit', 'Heure')}`;
                                    const isSelected = preset === hours;
                                    return (
                                      <button
                                        type="button"
                                        key={preset}
                                        onClick={() => {
                                          handleManualHoursChange(preset);
                                          setHoursMenuOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                                          isSelected
                                            ? 'bg-saubio-mist/60 font-semibold text-saubio-forest'
                                            : 'text-saubio-slate/80 hover:bg-saubio-mist/30'
                                        }`}
                                      >
                                        <span>{label}</span>
                                        {isSelected ? (
                                          <Check className="h-4 w-4 shrink-0 text-saubio-forest" />
                                        ) : null}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          {areaSuggestion ? (
                            <p className="text-xs text-saubio-slate/60">
                              {t(
                                'bookingPlanner.fields.surfaceRecommendation',
                                'Basierend auf der von Ihnen angegebenen Fläche von {{area}} m² empfehlen wir eine Reinigungsdauer von {{hours}} Stunden. Sie können diese Angabe jederzeit anpassen.',
                                {
                                  area: areaSuggestion.area,
                                  hours: Number.isInteger(areaSuggestion.hours)
                                    ? areaSuggestion.hours
                                    : areaSuggestion.hours.toFixed(1),
                                }
                              )}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 py-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/70 text-saubio-forest">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            <span>{t('bookingPlanner.fields.startAt', 'Date & heure')}</span>
                            <span>{t('bookingPlanner.fields.startAtBadge', '7h-19h30')}</span>
                          </div>
                          <input
                            type="datetime-local"
                            value={startAt}
                            min={minStartAt}
                            onChange={(event) => handleStartAtChange(event.target.value)}
                            className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                          />
                          <p className="text-xs text-saubio-slate/60">
                            {t(
                              'bookingPlanner.fields.sameDayDisabled',
                              'Les demandes débutent au minimum le lendemain.'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 py-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/70 text-saubio-forest">
                          <Leaf className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.fields.eco', 'Préférence éco')}
                          </span>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {ecoOptions.map((option) => {
                              const isSelected = option.id === ecoPreference;
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => setEcoPreference(option.id)}
                                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                    isSelected
                                      ? 'border-saubio-forest bg-saubio-forest text-white'
                                      : 'border-saubio-forest/20 text-saubio-slate/70 hover:border-saubio-forest/50'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="py-4">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                          <span>{t('bookingPlanner.fields.soilLevel', 'Grad der Verschmutzung')}</span>
                          <span className="rounded-full bg-saubio-sun/30 px-3 py-0.5 text-[10px] font-semibold text-saubio-sun">
                            {t('bookingPlanner.fields.required', 'obligatoire')}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {soilLevelOptions.map((level) => {
                            const isSelected = soilLevel === level.id;
                            return (
                              <button
                                key={level.id}
                                type="button"
                                onClick={() => setSoilLevel(level.id)}
                                className={`rounded-2xl border px-3 py-2 text-sm font-semibold capitalize transition ${
                                  isSelected
                                    ? 'border-saubio-forest bg-saubio-forest text-white'
                                    : 'border-saubio-forest/20 bg-white text-saubio-slate/70 hover:border-saubio-forest/40'
                                }`}
                              >
                                {level.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="py-4">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                          <span>{t('bookingPlanner.fields.wishes', 'Reinigungswünsche')}</span>
                          <span className="rounded-full border border-saubio-slate/20 px-3 py-0.5 text-[10px] uppercase text-saubio-slate/60">
                            {t('bookingPlanner.fields.optional', 'optionnel')}
                          </span>
                        </div>
                        {service === 'upholstery' ? (
                          <div className="mt-3 space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                            {upholsteryItems.map((item) => {
                                const value = upholsteryQuantities[item.id] ?? 0;
                                return (
                                  <div
                                    key={item.id}
                                    className="rounded-3xl border border-saubio-forest/10 bg-white px-4 py-3 text-saubio-slate/80 shadow-sm"
                                  >
                                    <p className="text-sm font-semibold">{item.label}</p>
                                    <div className="mt-3 flex items-center justify-between gap-2">
                                      <button
                                        type="button"
                                        onClick={() => adjustUpholsteryQuantity(item.id, -1)}
                                        className="h-9 w-9 rounded-full border border-saubio-forest/30 text-lg font-semibold text-saubio-forest transition hover:bg-saubio-mist/70"
                                        aria-label={t('bookingPlanner.upholstery.decrement', 'Réduire')}
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min={0}
                                        value={value}
                                        onChange={(event) =>
                                          handleUpholsteryInputChange(item.id, event.target.value)
                                        }
                                        className="w-16 rounded-2xl border border-saubio-forest/20 bg-saubio-mist/30 py-1 text-center text-base font-semibold text-saubio-forest outline-none focus:border-saubio-forest"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => adjustUpholsteryQuantity(item.id, 1)}
                                        className="h-9 w-9 rounded-full border border-saubio-forest/30 text-lg font-semibold text-saubio-forest transition hover:bg-saubio-mist/70"
                                        aria-label={t('bookingPlanner.upholstery.increment', 'Augmenter')}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="space-y-2 text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                              <span>{t('bookingPlanner.upholstery.addons', 'Options supplémentaires')}</span>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {upholsteryAddonOptions.map((addon) => (
                                  <label
                                    key={addon.id}
                                    className="flex items-center gap-2 rounded-2xl bg-saubio-mist/40 px-3 py-2 text-sm text-saubio-slate/80"
                                  >
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
                                      checked={upholsteryAddons.includes(addon.id)}
                                      onChange={() => toggleUpholsteryAddon(addon.id)}
                                    />
                                    <span>{addon.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {cleaningWishOptions.map((wish) => (
                              <label
                                key={wish.id}
                                className="flex items-center gap-2 rounded-2xl bg-saubio-mist/40 px-3 py-2 text-sm text-saubio-slate/80"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
                                  checked={selectedWishes.includes(wish.id)}
                                  onChange={() => toggleWish(wish.id)}
                                />
                                <span>{wish.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="py-4">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                          <span>{t('bookingPlanner.fields.additionalInfo', 'Informations complémentaires')}</span>
                          <span className="rounded-full border border-saubio-slate/20 px-3 py-0.5 text-[10px] uppercase text-saubio-slate/60">
                            {t('bookingPlanner.fields.optional', 'optionnel')}
                          </span>
                        </div>
                        <textarea
                          value={additionalNotes}
                          onChange={(event) => setAdditionalNotes(event.target.value)}
                          rows={3}
                          className="mt-3 w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-saubio-forest"
                          placeholder={t(
                            'bookingPlanner.fields.additionalInfoPlaceholder',
                            'Décrivez vos attentes spécifiques, accès, animaux…'
                          )}
                        />
                      </div>
                    </div>
                  </details>
                  <details
                    open={addressDetailsOpen}
                    onToggle={(event) => setAddressDetailsOpen(event.currentTarget.open)}
                    className="group rounded-3xl border border-saubio-forest/10 px-4 py-4"
                  >
                    <summary className="flex cursor-pointer flex-col items-center text-base font-semibold text-saubio-forest">
                      <div className="flex w-full items-center justify-center gap-2">
                        <ChevronDown className="h-5 w-5 text-saubio-forest transition-transform duration-300 group-open:rotate-180" />
                        <span className="text-center">{t('bookingPlanner.sections.address', 'Informations & adresse')}</span>
                      </div>
                    </summary>
                    <div className="mt-5 space-y-4 text-sm">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.fields.phone', 'Téléphone')}
                          </span>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(event) => setContactPhone(event.target.value)}
                            className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                            placeholder="+49 30 1234567"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.fields.company', 'Société (optionnel)')}
                          </span>
                          <input
                            value={contactCompany}
                            onChange={(event) => setContactCompany(event.target.value)}
                            className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                            placeholder="Entreprise / copropriété"
                          />
                        </label>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.fields.firstName', 'Prénom')}
                          </span>
                          <input
                            value={contactFirstName}
                            onChange={(event) => setContactFirstName(event.target.value)}
                            className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.fields.lastName', 'Nom')}
                          </span>
                          <input
                            value={contactLastName}
                            onChange={(event) => setContactLastName(event.target.value)}
                            className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                          />
                        </label>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.fields.street', 'Rue')}
                          </span>
                          <input
                            value={contactStreet}
                            onChange={(event) => setContactStreet(event.target.value)}
                            className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                            placeholder="Karl-Marx-Allee"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.fields.streetNumber', 'N°')}
                          </span>
                          <input
                            value={contactStreetNumber}
                            onChange={(event) => setContactStreetNumber(event.target.value)}
                            className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                            placeholder="92"
                          />
                        </label>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.fields.postal', 'Code postal')}
                          </span>
                          <input
                            value={locationPostal}
                            disabled
                            className="w-full rounded-2xl border border-saubio-forest/15 bg-saubio-mist/50 px-4 py-3 text-saubio-slate/60 outline-none"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.fields.city', 'Ville')}
                          </span>
                          <input
                            value={locationCity}
                            disabled
                            className="w-full rounded-2xl border border-saubio-forest/15 bg-saubio-mist/50 px-4 py-3 text-saubio-slate/60 outline-none"
                            placeholder={t('bookingPlanner.fields.cityPlaceholder', 'Ville détectée')}
                          />
                        </label>
                      </div>
                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                          {t('bookingPlanner.fields.floor', 'Étage / interphone')}
                        </span>
                        <input
                          value={contactFloor}
                          onChange={(event) => setContactFloor(event.target.value)}
                          className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                          placeholder="4e étage, sonnette Müller"
                        />
                      </label>
                      <div className="space-y-3 rounded-2xl border border-saubio-forest/10 bg-saubio-mist/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                        <span>{t('bookingPlanner.address.optionsTitle', 'Options')}</span>
                        <div className="space-y-2 text-[13px] normal-case text-saubio-slate/80">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
                              checked={hasSeparateCleaningAddress}
                              onChange={(event) => setHasSeparateCleaningAddress(event.target.checked)}
                            />
                            <span>{t('bookingPlanner.address.cleaningToggle', 'Ajouter une adresse de nettoyage distincte')}</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
                              checked={hasSeparateContact}
                              onChange={(event) => setHasSeparateContact(event.target.checked)}
                            />
                            <span>{t('bookingPlanner.address.contactToggle', 'Ajouter un interlocuteur distinct')}</span>
                          </label>
                        </div>
                      </div>
                      {hasSeparateCleaningAddress ? (
                        <div className="space-y-4 border-t border-saubio-forest/10 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.address.cleaningTitle', 'Adresse de nettoyage')}
                          </p>
                          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                                {t('bookingPlanner.fields.street', 'Rue')}
                              </span>
                              <input
                                value={cleaningStreet}
                                onChange={(event) => setCleaningStreet(event.target.value)}
                                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                                placeholder="Sonnenallee"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                                {t('bookingPlanner.fields.streetNumber', 'N°')}
                              </span>
                              <input
                                value={cleaningStreetNumber}
                                onChange={(event) => setCleaningStreetNumber(event.target.value)}
                                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                                placeholder="12"
                              />
                            </label>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                                {t('bookingPlanner.fields.postal', 'Code postal')}
                              </span>
                              <input
                                value={cleaningPostal}
                                onChange={(event) => setCleaningPostal(event.target.value)}
                                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                                placeholder="10115"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                                {t('bookingPlanner.fields.city', 'Ville')}
                              </span>
                              <input
                                value={cleaningCity}
                                onChange={(event) => setCleaningCity(event.target.value)}
                                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                                placeholder="Berlin"
                              />
                            </label>
                          </div>
                        </div>
                      ) : null}
                      {hasSeparateContact ? (
                        <div className="space-y-4 border-t border-saubio-forest/10 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                            {t('bookingPlanner.address.contactTitle', 'Interlocuteur sur place')}
                          </p>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                                {t('bookingPlanner.fields.firstName', 'Prénom')}
                              </span>
                              <input
                                value={alternateContactFirstName}
                                onChange={(event) => setAlternateContactFirstName(event.target.value)}
                                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                                {t('bookingPlanner.fields.lastName', 'Nom')}
                              </span>
                              <input
                                value={alternateContactLastName}
                                onChange={(event) => setAlternateContactLastName(event.target.value)}
                                className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                              />
                            </label>
                          </div>
                          <label className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
                              {t('bookingPlanner.fields.phone', 'Téléphone')}
                            </span>
                            <input
                              type="tel"
                              value={alternateContactPhone}
                              onChange={(event) => setAlternateContactPhone(event.target.value)}
                              className="w-full rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 outline-none focus:border-saubio-forest"
                              placeholder="+49 30 9876543"
                            />
                          </label>
                        </div>
                      ) : null}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>
        <aside className="text-xs">
          <div className="space-y-2 lg:sticky lg:top-8">
            <SurfaceCard className="space-y-2" >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
                {t('bookingPlanner.location.title', 'Localisation détectée')}
              </p>
              
              <div className="flex items-center gap-2 rounded-3xl border border-saubio-forest/15 bg-saubio-mist/50 px-4 py-2">
                <MapPin className="h-6 w-6 text-saubio-forest" />
                <div>
                  <p className="text-sm font-semibold text-saubio-forest">
                    {locationLabel || t('bookingPlanner.location.placeholder', 'En attente de saisie')}
                  </p>
                  <p className="text-xs text-saubio-slate/60">{locationSubline}</p>
                </div>
              </div>
            </SurfaceCard>
            <SurfaceCard padding="lg" className="space-y-4 text-xs">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
                {t('bookingPlanner.summary.title', 'Aperçu de votre réservation')}
              </p>
              <div className="space-y-3 text-saubio-slate/80">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
                  <span>{t('bookingPlanner.summary.zone', 'Zone')}</span>
                  <span className="text-right font-semibold text-saubio-forest">
                    {locationLabel || t('bookingPlanner.summary.pending', 'À renseigner')}
                  </span>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
                  <span>{t('bookingPlanner.summary.service', 'Service')}</span>
                  <span className="text-right font-semibold text-saubio-forest break-words">
                    {serviceOptions.find((option) => option.id === service)?.label ?? ''}
                  </span>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
                  <span>{t('bookingPlanner.summary.frequency', 'Fréquence')}</span>
                  <span className="text-right font-semibold text-saubio-forest">
                    {frequencyOptions.find((option) => option.id === frequency)?.label ?? ''}
                  </span>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
                  <span>{t('bookingPlanner.summary.duration', 'Durée')}</span>
                  <span className="text-right font-semibold text-saubio-forest">{hours}h</span>
                </div>
                <div className="flex flex-col">
                  <span>{t('bookingPlanner.summary.slot', 'Créneau demandé')}</span>
                  <span className="font-semibold text-saubio-forest">
                    {startAt
                      ? `${formatDateTime(new Date(startAt))}${
                          endAt ? ` → ${formatDateTime(endAt)}` : ''
                        }`
                      : t('bookingPlanner.summary.pending', 'À renseigner')}
                  </span>
                </div>
              </div>
              <hr className="border-saubio-mist/60" />
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-saubio-slate/70">
                    {t('bookingPlanner.summary.startingLabel', 'Votre prix commence à partir de')}
                  </span>
                  <span className="text-lg font-semibold text-saubio-forest">{startingPriceDisplay}</span>
                </div>
                <p className="text-xs text-saubio-slate/60">
                  {t(
                    'bookingPlanner.summary.startingHint',
                    'Le prix final variera en fonction du prestataire de nettoyage choisi à l’étape suivante.'
                  )}
                </p>
              </div>
              <hr className="border-saubio-mist/60" />
              {isShortNotice ? (
                <p className="text-xs text-saubio-slate/70">
                  {depositHoldCents
                    ? t(
                        'bookingPlanner.summary.deposit',
                        'Un blocage temporaire d’environ {{amount}} sera effectué lors de la confirmation.',
                        { amount: formatEuro(depositHoldCents / 100) }
                      )
                    : t(
                        'bookingPlanner.summary.depositFallback',
                        'Un blocage temporaire sera effectué lors de la confirmation.'
                      )}
                </p>
              ) : null}
              {estimate?.providersConsidered ? (
                <p className="text-xs text-saubio-slate/50">
                  {t('bookingPlanner.summary.providers', {
                    defaultValue: '{{count}} prestataire(s) actifs dans la zone.',
                    count: estimate.providersConsidered,
                  })}
                </p>
              ) : null}
            </SurfaceCard>
            <div className="space-y-2 rounded-3xl border border-saubio-forest/15 bg-white/60 px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-saubio-slate/60">
                {t('bookingPlanner.fields.coupon', 'Code promo (optionnel)')}
              </span>
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="WELCOME10"
                className="w-full rounded-2xl border border-saubio-forest/20 bg-white px-4 py-2 text-sm uppercase tracking-wider outline-none focus:border-saubio-forest"
              />
              <p className="text-[11px] text-saubio-slate/60">
                {t('bookingPlanner.fields.couponHelp', 'Le code promo sera appliqué avant le paiement.')}
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-3xl border border-saubio-forest/15 bg-white/60 px-4 py-3 text-xs text-saubio-slate/80">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-saubio-forest/40 text-saubio-forest focus:ring-saubio-forest"
              />
              <span>
                {t(
                  'bookingPlanner.summary.terms',
                  "J'accepte que mes données soient utilisées pour traiter ma demande et j'accepte les"
                )}{' '}
                <a
                  href="/agb"
                  className="text-saubio-forest underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t('bookingPlanner.summary.termsLink', 'Conditions générales')}
                </a>{' '}
                {t('bookingPlanner.summary.and', 'et')}{' '}
                <a
                  href="/datenschutz"
                  className="text-saubio-forest underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t('bookingPlanner.summary.privacyLink', 'politique de confidentialité')}
                </a>
                .
              </span>
            </label>
            <button
              type="button"
              onClick={handleContinue}
              disabled={continueDisabled}
              className="w-full rounded-full bg-saubio-forest px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-saubio-forest/40"
            >
              {t('bookingPlanner.summary.cta', 'Continuer vers la réservation')}
            </button>
            <p className="text-center text-xs text-saubio-slate/50">
              {t(
                'bookingPlanner.summary.loginHint',
                'Vous pourrez créer un compte ou vous connecter à l’étape suivante.'
              )}
            </p>
          </div>
        </aside>
      </div>
      {shortNoticeDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-saubio-slate/70 px-4 py-6 backdrop-blur-sm">
          <SurfaceCard padding="lg" className="max-w-lg space-y-4 text-sm text-saubio-slate/80">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/60">
                {t('bookingPlanner.shortNotice.title', 'Préavis court détecté')}
              </p>
              <p className="text-saubio-slate/80">
                {t(
                  'bookingPlanner.shortNotice.message',
                  'Les demandes à moins de 24h sont envoyées automatiquement à tous les prestataires disponibles afin de trouver rapidement un intervenant. Vous serez averti dès qu’un professionnel accepte votre mission et le montant dû sera calculé à ce moment-là.'
                )}
              </p>
              <p className="text-xs text-saubio-slate/60">
                {t(
                  'bookingPlanner.shortNotice.hint',
                  'Confirmez pour poursuivre la réservation et enregistrer vos informations.'
                )}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={cancelShortNoticeFlow}
                className="w-full rounded-full border border-saubio-forest/20 px-5 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/50 sm:w-auto"
              >
                {t('bookingPlanner.shortNotice.cancel', 'Modifier ma demande')}
              </button>
              <button
                type="button"
                onClick={confirmShortNoticeFlow}
                className="w-full rounded-full bg-saubio-forest px-5 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss sm:w-auto"
              >
                {t('bookingPlanner.shortNotice.confirm', 'Continuer')}
              </button>
            </div>
          </SurfaceCard>
        </div>
      ) : null}
    </div>
  );

  return pageContent;
}

export default function BookingPlanningPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-saubio-slate/60">Chargement…</div>}>
      <BookingPlanningPageContent />
    </Suspense>
  );
}
