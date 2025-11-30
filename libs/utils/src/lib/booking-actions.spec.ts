import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bookingsQueryKey } from './api-queries';
import { useCancelBookingMutation } from './booking-actions';

const cancelBookingMock = jest.fn();

jest.mock('./api-client', () => ({
  createApiClient: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApiClient } = require('./api-client') as { createApiClient: jest.Mock };

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = (client: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };

describe('useCancelBookingMutation', () => {
  beforeEach(() => {
    cancelBookingMock.mockReset();
    createApiClient.mockReset();
    createApiClient.mockReturnValue({ cancelBooking: cancelBookingMock });
  });

  it('optimistically marks bookings as cancelled and invalidates queries', async () => {
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    queryClient.setQueryData(bookingsQueryKey, [
      { id: 'booking-1', status: 'confirmed' },
      { id: 'booking-2', status: 'pending_provider' },
    ]);

    cancelBookingMock.mockResolvedValue({ id: 'booking-1' });

    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCancelBookingMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'booking-1' });
    });

    const bookings = queryClient.getQueryData<{ id: string; status: string }[]>(bookingsQueryKey);
    expect(bookings).toBeDefined();
    expect(bookings?.find((booking) => booking.id === 'booking-1')?.status).toBe('cancelled');
    expect(cancelBookingMock).toHaveBeenCalledWith('booking-1', undefined);
    expect(createApiClient).toHaveBeenCalledWith({ includeCredentials: true });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: bookingsQueryKey });
    });

    invalidateSpy.mockRestore();
  });

  it('rolls back status when mutation fails', async () => {
    const queryClient = createQueryClient();
    const wrapper = createWrapper(queryClient);
    queryClient.setQueryData(bookingsQueryKey, [{ id: 'booking-1', status: 'confirmed' }]);

    cancelBookingMock.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useCancelBookingMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ id: 'booking-1' })).rejects.toThrow('network error');
    });

    const bookings = queryClient.getQueryData<{ id: string; status: string }[]>(bookingsQueryKey);
    expect(bookings?.[0].status).toBe('confirmed');
  });
});
