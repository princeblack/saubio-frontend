import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AdminUser,
  UpdateAdminUserPayload,
  ProviderOnboardingRequest,
  UpdateProviderOnboardingStatusPayload,
  AdminProviderIdentityReview,
  ProviderIdentityDocumentSummary,
  ProviderTeam,
  CreateProviderTeamPayload,
  UpdateProviderTeamPayload,
  BookingRequest,
  ListBookingsParams,
  BookingLockSummary,
  BookingLockUpdatePayload,
  PaymentMandateRecord,
  PaymentEventRecord,
  CreatePaymentMandatePayload,
} from '@saubio/models';
import {
  adminUsersQueryKey,
  adminUsersQueryOptions,
  adminSupportQueryOptions,
  adminSupportQueryKey,
  adminTicketsQueryOptions,
  adminTicketsQueryKey,
  adminOperationsQueryOptions,
  adminOperationsQueryKey,
  adminDashboardQueryOptions,
  adminDashboardQueryKey,
  adminBookingsQueryOptions,
  adminProviderRequestsQueryOptions,
  adminProviderRequestsQueryKey,
  adminProviderIdentityQueueQueryOptions,
  adminProviderIdentityQueueQueryKey,
  adminProviderIdentityReviewQueryOptions,
  adminProviderIdentityReviewQueryKey,
  payoutBatchesQueryOptions,
  payoutBatchesQueryKey,
  adminProviderTeamsQueryOptions,
  adminProviderTeamsQueryKey,
  providerTeamPlanQueryOptions,
  bookingLocksQueryOptions,
  bookingLocksQueryKey,
  paymentMandatesQueryOptions,
  paymentMandatesQueryKey,
  paymentEventsQueryOptions,
  bookingsQueryKey,
} from './api-queries';
import { createApiClient } from './api-client';

const clientFactory = () =>
  createApiClient({
    includeCredentials: true,
  });

export const useAdminUsers = (params: { role?: string; status?: string; search?: string } = {}) => {
  return useQuery(adminUsersQueryOptions(params));
};

export const useUpdateAdminUserMutation = (params: { role?: string; status?: string; search?: string } = {}) => {
  const queryClient = useQueryClient();
  return useMutation<AdminUser, unknown, { id: string; payload: UpdateAdminUserPayload }>({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.updateAdminUser(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey(params) });
    },
  });
};

export const useAdminSupportPipeline = () => {
  return useQuery(adminSupportQueryOptions());
};

export const useAdminTickets = () => {
  return useQuery(adminTicketsQueryOptions());
};

export const useAdminOperations = () => {
  return useQuery(adminOperationsQueryOptions());
};

export const useAdminDashboard = () => {
  return useQuery(adminDashboardQueryOptions());
};

export const useAdminBookings = (params: ListBookingsParams) => {
  return useQuery(adminBookingsQueryOptions(params));
};

export const useAdminProviderRequests = () => {
  return useQuery(adminProviderRequestsQueryOptions());
};

export const useAdminIdentityQueue = (status?: 'not_started' | 'submitted' | 'verified' | 'rejected') => {
  return useQuery<AdminProviderIdentityReview[]>(adminProviderIdentityQueueQueryOptions(status));
};

export const useAdminProviderIdentityReview = (providerId?: string) => {
  return useQuery(adminProviderIdentityReviewQueryOptions(providerId));
};

export const useUpdateAdminProviderRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ProviderOnboardingRequest, unknown, { id: string; payload: UpdateProviderOnboardingStatusPayload }>({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.updateAdminProviderRequest(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProviderRequestsQueryKey });
    },
  });
};

export const useReviewProviderIdentityDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ProviderIdentityDocumentSummary,
    unknown,
    { providerId: string; documentId: string; status: 'verified' | 'rejected'; notes?: string }
  >({
    mutationFn: async ({ providerId, documentId, status, notes }) => {
      const client = clientFactory();
      return client.reviewProviderIdentityDocument(providerId, { documentId, status, notes });
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityQueueQueryKey() });
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityReviewQueryKey(variables.providerId) });
    },
  });
};

export const useCompleteWelcomeSessionAdminMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminProviderIdentityReview, unknown, { providerId: string }>({
    mutationFn: async ({ providerId }) => {
      const client = clientFactory();
      return client.completeAdminWelcomeSession(providerId);
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityQueueQueryKey() });
      queryClient.invalidateQueries({ queryKey: adminProviderIdentityReviewQueryKey(variables.providerId) });
    },
  });
};

export const useManualPayoutBatchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { scheduledFor?: string; note?: string } = {}) => {
      const client = clientFactory();
      return client.createManualPayoutBatch(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutBatchesQueryKey });
    },
  });
};

export const usePayoutBatches = () => {
  return useQuery(payoutBatchesQueryOptions());
};

export const useAdminProviderTeams = (ownerId?: string) => {
  return useQuery(adminProviderTeamsQueryOptions(ownerId));
};

export const useProviderTeamPlan = (
  teamId: string | null,
  range: { start?: string; end?: string } = {}
) => {
  return useQuery(providerTeamPlanQueryOptions(teamId, range));
};

export const useBookingLocks = (bookingId: string | null) => {
  return useQuery(bookingLocksQueryOptions(bookingId));
};

export const usePaymentMandates = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...paymentMandatesQueryOptions(),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (query.isSuccess) {
      queryClient.invalidateQueries({ queryKey: paymentEventsQueryOptions().queryKey });
    }
  }, [query.isSuccess, query.data, queryClient]);

  return query;
};

export const useCreatePaymentMandateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<PaymentMandateRecord, unknown, CreatePaymentMandatePayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.createPaymentMandate(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMandatesQueryKey });
      queryClient.invalidateQueries({ queryKey: paymentEventsQueryOptions().queryKey });
    },
  });
};

export const usePaymentEvents = () => {
  return useQuery<PaymentEventRecord[]>(paymentEventsQueryOptions());
};

export const useConfirmBookingLocksMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<BookingLockSummary[], unknown, { bookingId: string; payload?: BookingLockUpdatePayload }>({
    mutationFn: async ({ bookingId, payload }) => {
      const client = clientFactory();
      return client.confirmBookingLocks(bookingId, payload ?? {});
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingLocksQueryKey(variables.bookingId) });
    },
  });
};

export const useReleaseBookingLocksMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<BookingLockSummary[], unknown, { bookingId: string; payload?: BookingLockUpdatePayload }>({
    mutationFn: async ({ bookingId, payload }) => {
      const client = clientFactory();
      return client.releaseBookingLocks(bookingId, payload ?? {});
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingLocksQueryKey(variables.bookingId) });
    },
  });
};

export const useCreateAdminProviderTeamMutation = (ownerId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProviderTeam, unknown, CreateProviderTeamPayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.createProviderTeam(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey() });
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey(ownerId) });
      }
    },
  });
};

export const useUpdateAdminProviderTeamMutation = (ownerId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProviderTeam, unknown, { id: string; payload: UpdateProviderTeamPayload }>({
    mutationFn: async ({ id, payload }) => {
      const client = clientFactory();
      return client.updateProviderTeam(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey() });
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey(ownerId) });
      }
    },
  });
};

export const useDeleteAdminProviderTeamMutation = (ownerId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, unknown, string>({
    mutationFn: async (id) => {
      const client = clientFactory();
      return client.deleteProviderTeam(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey() });
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey(ownerId) });
      }
    },
  });
};

export const useAssignFallbackTeamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<BookingRequest, unknown, string>({
    mutationFn: async (bookingId) => {
      const client = clientFactory();
      return client.assignFallbackTeam(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOperationsQueryKey });
      queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
      queryClient.invalidateQueries({ queryKey: adminProviderTeamsQueryKey() });
      queryClient.invalidateQueries({ queryKey: bookingsQueryKey });
    },
  });
};
