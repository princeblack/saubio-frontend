import type { BookingRequest } from '@saubio/models';
import { filterBookings, type BookingStatusFilter } from './booking-filters';

const createBooking = (overrides: Partial<BookingRequest>): BookingRequest => ({
  id: `booking-${Math.random().toString(36).slice(2)}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  clientId: 'client-1',
  companyId: undefined,
  address: {
    streetLine1: 'Street 1',
    streetLine2: undefined,
    postalCode: '10115',
    city: 'Berlin',
    countryCode: 'DE',
  },
  service: 'residential',
  surfacesSquareMeters: 80,
  startAt: new Date().toISOString(),
  endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  frequency: 'once',
  mode: 'smart_match',
  ecoPreference: 'standard',
  providerIds: [],
  attachments: [],
  notes: undefined,
  status: 'pending_provider',
  pricing: {
    subtotalCents: 0,
    ecoSurchargeCents: 0,
    extrasCents: 0,
    taxCents: 0,
    currency: 'EUR',
    totalCents: 0,
  },
  auditLog: [],
  ...overrides,
});

describe('filterBookings', () => {
  const bookings: BookingRequest[] = [
    createBooking({ id: 'booking-1', status: 'confirmed', address: { city: 'Berlin', streetLine1: 'Street 1', streetLine2: undefined, postalCode: '10115', countryCode: 'DE' } }),
    createBooking({ id: 'booking-2', status: 'cancelled', address: { city: 'Munich', streetLine1: 'Street 2', streetLine2: undefined, postalCode: '80331', countryCode: 'DE' } }),
    createBooking({ id: 'booking-3', status: 'pending_provider', address: { city: 'berlin mitte', streetLine1: 'Street 3', streetLine2: undefined, postalCode: '10117', countryCode: 'DE' } }),
  ];

  it('returns all bookings when status is all and city filter empty', () => {
    const result = filterBookings(bookings, { status: 'all', city: '' });
    expect(result).toHaveLength(3);
  });

  it('filters by status case-insensitively', () => {
    const result = filterBookings(bookings, { status: 'CoNfIrMeD' as BookingStatusFilter, city: '' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('booking-1');
  });

  it('filters by city substring case-insensitively', () => {
    const result = filterBookings(bookings, { status: 'all', city: 'berlin' });
    expect(result.map((booking) => booking.id)).toEqual(['booking-1', 'booking-3']);
  });

  it('supports combined filters', () => {
    const result = filterBookings(bookings, { status: 'pending_provider', city: 'berlin' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('booking-3');
  });
});
