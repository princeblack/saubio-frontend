import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateBookingPayload,
  BookingCreationResponse,
  BookingRequest,
  CheckoutPaymentIntentResponse,
} from '@saubio/models';
import { bookingsQueryKey } from './api-queries';
import { ApiClient, createApiClient } from './api-client';
import { getSession } from './session-store';

type OptimisticContext = {
  previous?: BookingRequest[];
};

type CreateBookingDraftPayload = CreateBookingPayload & { guestToken: string };

const apiClientFactory = () =>
  createApiClient({
    includeCredentials: true,
  });

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<BookingCreationResponse, unknown, CreateBookingPayload, OptimisticContext>({
    mutationFn: async (payload) => {
      const client: ApiClient = apiClientFactory();
      return client.createBooking(payload);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: bookingsQueryKey });
      const previous = queryClient.getQueryData<BookingRequest[]>(bookingsQueryKey);

      if (previous) {
        const optimisticStatus =
          payload.mode === 'smart_match'
            ? 'pending_provider'
            : (payload.providerIds ?? []).length > 0
            ? 'pending_client'
            : 'draft';

        const session = getSession();
        const sessionUserId = session.user?.id ?? 'me';

        const optimisticBooking: BookingRequest = {
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clientId: payload.clientId ?? sessionUserId,
          companyId: payload.companyId,
          address: payload.address,
          service: payload.service,
          surfacesSquareMeters: payload.surfacesSquareMeters,
          startAt: payload.startAt,
          endAt: payload.endAt,
          frequency: payload.frequency,
          mode: payload.mode,
          ecoPreference: payload.ecoPreference,
          requiredProviders: payload.requiredProviders ?? 1,
          matchingRetryCount: 0,
          providerIds: payload.providerIds ?? [],
          attachments: [],
          notes: payload.notes,
          status: optimisticStatus,
          pricing: {
            subtotalCents: 0,
            ecoSurchargeCents: 0,
            loyaltyCreditsCents: 0,
            extrasCents: 0,
            taxCents: 0,
            currency: 'EUR',
            totalCents: 0,
          },
          auditLog: [],
        };

        queryClient.setQueryData<BookingRequest[]>(bookingsQueryKey, [optimisticBooking, ...previous]);
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

export const useCreateBookingDraftMutation = () => {
  return useMutation<BookingCreationResponse, unknown, CreateBookingDraftPayload>({
    mutationFn: async (payload) => {
      const client = createApiClient({ includeCredentials: false });
      return client.createBookingDraft(payload);
    },
  });
};

export const useClaimBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<BookingRequest, unknown, { id: string; guestToken: string }>({
    mutationFn: async ({ id, guestToken }) => {
      const client = apiClientFactory();
      return client.claimBooking(id, { guestToken });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
    },
  });
};

export const useCapturePaymentMutation = () => {
  return useMutation<{ success: boolean }, unknown, { bookingId: string }>({
    mutationFn: async ({ bookingId }) => {
      const client = createApiClient({ includeCredentials: true });
      return client.captureBookingPayment(bookingId);
    },
  });
};

export const useCheckoutPaymentIntent = (bookingId: string | null) => {
  return useQuery({
    queryKey: ['checkout-payment-intent', bookingId],
    queryFn: async () => {
      const client = createApiClient({ includeCredentials: true });
      return client.prepareCheckoutPayment(bookingId!);
    },
    enabled: Boolean(bookingId),
  });
};
