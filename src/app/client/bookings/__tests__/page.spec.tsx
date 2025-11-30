import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookingDashboardPage from '../page';
import type { BookingRequest } from '@saubio/models';

jest.mock('@saubio/utils', () => {
  const actual = jest.requireActual('@saubio/utils');
  const bookingsQueryKey = actual.bookingsQueryKey;

  return {
    ...actual,
    useRequireRole: jest.fn(() => ({ user: { id: 'demo-client-1', roles: ['client'] } })),
    useAccessToken: jest.fn(() => 'test-token'),
    useCancelBookingMutation: jest.fn(() => ({
      mutate: jest.fn(),
      isPending: false,
    })),
    bookingsQueryOptions: jest.fn(() => ({
      queryKey: bookingsQueryKey,
      queryFn: async () => queryFnMock(),
    })),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === 'bookingDashboard.providers') {
        const count = Number(params?.count ?? 0);
        return count === 1 ? '1 provider assigned' : `${count} providers assigned`;
      }

      const dictionary: Record<string, string> = {
        'bookingDashboard.title': 'Booking dashboard',
        'bookingDashboard.subtitle': 'subtitle',
        'bookingDashboard.ctaCreate': 'New booking',
        'bookingDashboard.filterAllStatuses': 'All statuses',
        'bookingDashboard.filterCityPlaceholder': 'Filter by city',
        'bookingDashboard.emptyTitle': 'No bookings match your filters',
        'bookingDashboard.emptyDescription': 'Adjust the filters or create a new booking.',
        'bookingDashboard.errorTitle': 'Unable to load bookings',
        'bookingDashboard.errorDescription': 'Please try again later.',
        'bookingDashboard.viewDetail': 'View detail',
        'bookingDashboard.providers': '{{count}} provider assigned',
        'bookingDashboard.cancel': 'Cancel booking',
        'bookingDashboard.noPricing': 'Pricing pending',
        'bookingDashboard.timelineHeading': 'Timeline',
        'bookingDashboard.timelineProvider': `Provider ID: ${(params?.providerId as string) ?? ''}`,
        'bookingDashboard.timelineProviders': `Providers: ${(params?.providers as string) ?? ''}`,
        'bookingDashboard.timelineReason': `Reason: ${(params?.reason as string) ?? ''}`,
        'bookingDashboard.noSelectionTitle': 'Select a booking',
        'bookingDashboard.noSelectionDescription': 'Choose an item to see more details.',
        'bookingTimeline.created': 'Created',
        'bookingTimeline.providerAssigned': 'Provider assigned',
        'bookingTimeline.providerRemoved': 'Provider removed',
        'bookingTimeline.statusChanged': 'Status changed',
        'bookingTimeline.statusCancelled': `Status changed to ${(params?.status as string) ?? ''}`,
      };

      if (dictionary[key]) {
        return dictionary[key];
      }

      return key;
    },
  }),
}));

const baseBookings: BookingRequest[] = [
  {
    id: 'booking-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientId: 'demo-client-1',
    companyId: undefined,
    address: {
      streetLine1: 'Street 1',
      streetLine2: undefined,
      postalCode: '10119',
      city: 'Berlin',
      countryCode: 'DE',
      accessNotes: undefined,
    },
    service: 'residential',
    surfacesSquareMeters: 100,
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    frequency: 'weekly',
    mode: 'smart_match',
    ecoPreference: 'bio',
    providerIds: ['provider-berlin-1'],
    attachments: [],
    notes: 'Notes',
    status: 'confirmed',
    pricing: {
      subtotalCents: 18000,
      ecoSurchargeCents: 2700,
      loyaltyCreditsCents: 0,
      extrasCents: 0,
      taxCents: 3933,
      currency: 'EUR',
      totalCents: 24633,
    },
    auditLog: [
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actorId: 'demo-client-1',
        action: 'created',
        metadata: { status: 'pending_provider' },
      },
      {
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        actorId: 'saubio-ops',
        action: 'provider_assigned',
        metadata: { providerId: 'provider-berlin-1' },
      },
    ],
  },
  {
    id: 'booking-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientId: 'demo-client-1',
    companyId: undefined,
    address: {
      streetLine1: 'Street 2',
      streetLine2: undefined,
      postalCode: '10115',
      city: 'Berlin',
      countryCode: 'DE',
      accessNotes: undefined,
    },
    service: 'eco_plus',
    surfacesSquareMeters: 90,
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    frequency: 'once',
    mode: 'smart_match',
    ecoPreference: 'bio',
    providerIds: [],
    attachments: [],
    notes: 'Cancelled note',
    status: 'cancelled',
    pricing: {
      subtotalCents: 15000,
      ecoSurchargeCents: 2250,
      loyaltyCreditsCents: 0,
      extrasCents: 0,
      taxCents: 3307,
      currency: 'EUR',
      totalCents: 20557,
    },
    auditLog: [
      {
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        actorId: 'demo-client-1',
        action: 'created',
        metadata: { status: 'pending_provider' },
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        actorId: 'demo-client-1',
        action: 'status_changed',
        metadata: { from: 'pending_provider', to: 'cancelled', reason: 'client_cancelled' },
      },
    ],
  },
];

let queryFnMock: jest.Mock<Promise<BookingRequest[]>, []>;

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BookingDashboardPage />
    </QueryClientProvider>
  );
};

describe('BookingDashboardPage', () => {
  beforeEach(() => {
    queryFnMock = jest.fn(() => Promise.resolve(baseBookings));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders provider details within the timeline', async () => {
    renderDashboard();

    expect(await screen.findByText('{"providerId":"provider-berlin-1"}')).toBeInTheDocument();
  });

  it('updates timeline when status filter changes to cancelled', async () => {
    renderDashboard();

    const statusSelect = await screen.findByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'cancelled' } });

    await waitFor(() => {
      expect(
        screen.getByText('{"from":"pending_provider","to":"cancelled","reason":"client_cancelled"}')
      ).toBeInTheDocument();
    });
  });

  it('shows empty state when no bookings match filters', async () => {
    queryFnMock = jest.fn(() => Promise.resolve([]));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No bookings match your filters')).toBeInTheDocument();
    });
  });

  it('displays error state when query fails', async () => {
    queryFnMock = jest.fn(() => Promise.reject(new Error('network')));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Unable to load bookings')).toBeInTheDocument();
    });
  });
});
