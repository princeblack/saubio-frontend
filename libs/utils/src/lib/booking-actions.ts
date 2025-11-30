import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BookingRequest } from '@saubio/models';
import { bookingsQueryKey } from './api-queries';
import { ApiClient, createApiClient } from './api-client';

const clientFactory = () =>
  createApiClient({
    includeCredentials: true,
  });

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<BookingRequest, unknown, { id: string; reason?: string }, { previous?: BookingRequest[] }>({
    mutationFn: async ({ id, reason }) => {
      const client: ApiClient = clientFactory();
      return client.cancelBooking(id, reason ? { reason } : undefined);
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: bookingsQueryKey });
      const previous = queryClient.getQueryData<BookingRequest[]>(bookingsQueryKey);
      if (previous) {
        queryClient.setQueryData(
          bookingsQueryKey,
          previous.map((booking) =>
            booking.id === id ? { ...booking, status: 'cancelled' } : booking
          )
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bookingsQueryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
    },
  });
};
