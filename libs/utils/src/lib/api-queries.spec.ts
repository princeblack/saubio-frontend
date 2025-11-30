import {
  bookingDetailQueryKey,
  bookingDetailQueryOptions,
  bookingsQueryKey,
  bookingsQueryOptions,
  healthQueryKey,
  healthQueryOptions,
} from './api-queries';

describe('api queries helpers', () => {
  it('exposes stable query keys', () => {
    expect(healthQueryKey).toEqual(['api', 'health']);
    expect(bookingsQueryKey).toEqual(['api', 'bookings']);
  });

  it('calls provided client for health query fn', async () => {
    const client = {
      health: jest.fn().mockResolvedValue({
        status: 'ok',
        timestamp: new Date().toISOString(),
        defaultLocale: 'de',
        supportedLocales: ['de', 'en'],
      }),
      listBookings: jest.fn(),
      getBooking: jest.fn(),
    };

    const result = await healthQueryOptions(client).queryFn();

    expect(result.status).toBe('ok');
    expect(client.health).toHaveBeenCalledTimes(1);
  });

  it('calls provided client for bookings query fn', async () => {
    const client = {
      health: jest.fn(),
      listBookings: jest.fn().mockResolvedValue([{ id: 'booking-1' }]),
      getBooking: jest.fn(),
    };

    const result = await bookingsQueryOptions(client).queryFn();

    expect(result).toHaveLength(1);
    expect(client.listBookings).toHaveBeenCalledTimes(1);
  });

  it('calls provided client for booking detail query fn', async () => {
    const client = {
      health: jest.fn(),
      listBookings: jest.fn(),
      getBooking: jest.fn().mockResolvedValue({ id: 'booking-1' }),
    };

    const result = await bookingDetailQueryOptions('booking-1', client).queryFn();

    expect(result.id).toBe('booking-1');
    expect(client.getBooking).toHaveBeenCalledWith('booking-1');
    expect(bookingDetailQueryKey('booking-1')).toEqual(['api', 'booking', 'booking-1']);
  });
});
