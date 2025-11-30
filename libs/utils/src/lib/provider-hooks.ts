import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BookingRequest,
  ProviderMissionFilters,
  UpdateProviderProfilePayload,
  CreateProviderOnboardingPayload,
  ProviderOnboardingRequest,
  UpdateProviderMissionPayload,
  ProviderPaymentsOnboardingPayload,
  ProviderOnboardingResponse,
  ProviderIdentityPayload,
  ProviderIdentityDocumentUploadPayload,
  ProviderAddressPayload,
  ProviderPhonePayload,
  ProviderPhoneRequestPayload,
  ProviderOnboardingStatus,
  UpdateProviderAvailabilityPayload,
  CreateProviderTimeOffPayload,
  ProviderAvailabilityOverview,
} from '@saubio/models';
import {
  providerDashboardQueryKey,
  providerDashboardQueryOptions,
  providerMissionQueryKey,
  providerMissionQueryOptions,
  providerMissionsQueryKey,
  providerMissionsQueryOptions,
  providerPaymentsQueryKey,
  providerPaymentsQueryOptions,
  providerResourcesQueryKey,
  providerResourcesQueryOptions,
  providerProfileQueryKey,
  providerProfileQueryOptions,
  providerDocumentsQueryKey,
  providerDocumentsQueryOptions,
  providerOnboardingStatusQueryKey,
  providerOnboardingStatusQueryOptions,
  providerAvailabilityQueryKey,
  providerAvailabilityQueryOptions,
  providerInvitationsQueryKey,
  providerInvitationsQueryOptions,
} from './api-queries';
import { createApiClient } from './api-client';
import type { ProviderBookingInvitation } from '@saubio/models';

const clientFactory = () =>
  createApiClient({
    includeCredentials: true,
  });

export const useProviderDashboard = () => {
  return useQuery(providerDashboardQueryOptions());
};

export const useProviderMissions = (filters: ProviderMissionFilters = {}) => {
  return useQuery(providerMissionsQueryOptions(filters));
};

export const useProviderMission = (id: string) => {
  return useQuery(providerMissionQueryOptions(id));
};

export const useProviderInvitations = () => {
  return useQuery(providerInvitationsQueryOptions());
};

type UpdateMissionVariables = UpdateProviderMissionPayload & { id: string };

export const useUpdateProviderMissionStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<BookingRequest, unknown, UpdateMissionVariables>({
    mutationFn: async ({ id, ...payload }) => {
      const client = clientFactory();
      return client.updateProviderMissionStatus(id, payload);
    },
    onSuccess: (mission) => {
      queryClient.invalidateQueries({ queryKey: ['api', 'provider', 'missions'] });
      queryClient.invalidateQueries({ queryKey: providerMissionQueryKey(mission.id) });
      queryClient.invalidateQueries({ queryKey: providerDashboardQueryKey });
    },
  });
};

export const useProviderPayments = () => {
  return useQuery(providerPaymentsQueryOptions());
};

export const useProviderResources = () => {
  return useQuery(providerResourcesQueryOptions());
};

export const useProviderProfile = () => {
  return useQuery(providerProfileQueryOptions());
};

export const useProviderDocuments = () => {
  return useQuery(providerDocumentsQueryOptions());
};

export const useUpdateProviderProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProviderProfilePayload) => {
      const client = clientFactory();
      return client.updateProviderProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerProfileQueryKey() });
      queryClient.invalidateQueries({ queryKey: providerDashboardQueryKey });
    },
  });
};

type RespondInvitationVariables = { id: string; action: 'accept' | 'decline' };

export const useRespondProviderInvitationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ProviderBookingInvitation, unknown, RespondInvitationVariables>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.respondProviderInvitation(payload.id, payload.action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerInvitationsQueryKey });
      queryClient.invalidateQueries({ queryKey: providerDashboardQueryKey });
      queryClient.invalidateQueries({ queryKey: providerMissionsQueryKey({}) });
    },
  });
};

export const useProviderOnboardingMutation = () => {
  return useMutation<ProviderOnboardingRequest, unknown, CreateProviderOnboardingPayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.createProviderOnboarding(payload);
    },
  });
};

export const useProviderPaymentsOnboardingMutation = () => {
  return useMutation<ProviderOnboardingResponse, unknown, void>({
    mutationFn: async () => {
      const client = clientFactory();
      return client.startProviderOnboardingSelf();
    },
  });
};

export const useProviderOnboardingStatus = (enabled = true) => {
  const options = providerOnboardingStatusQueryOptions();
  return useQuery<ProviderOnboardingStatus>({
    ...options,
    enabled,
  });
};

export const useProviderAvailability = () => {
  return useQuery(providerAvailabilityQueryOptions());
};

export const useCreateProviderIdentitySessionMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const client = clientFactory();
      return client.createProviderIdentitySession();
    },
  });
};

export const useProviderSignupFeeIntentMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const client = clientFactory();
      return client.createProviderSignupFeeIntent();
    },
  });
};

export const useUploadProviderIdentityDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProviderIdentityDocumentUploadPayload) => {
      const client = clientFactory();
      return client.uploadProviderIdentityDocument(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerOnboardingStatusQueryKey });
      queryClient.invalidateQueries({ queryKey: providerProfileQueryKey() });
    },
  });
};

export const useCompleteProviderWelcomeSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (providerId: string) => {
      const client = clientFactory();
      return client.completeProviderWelcomeSession(providerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerOnboardingStatusQueryKey });
    },
  });
};

export const useCompleteProviderIdentityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProviderIdentityPayload) => {
      const client = clientFactory();
      return client.completeProviderIdentity(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerOnboardingStatusQueryKey });
      queryClient.invalidateQueries({ queryKey: providerProfileQueryKey() });
    },
  });
};

export const useUpdateProviderAvailabilityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ProviderAvailabilityOverview, unknown, UpdateProviderAvailabilityPayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.updateProviderAvailability(payload);
    },
    onSuccess: (overview) => {
      queryClient.setQueryData(providerAvailabilityQueryKey, overview);
    },
  });
};

export const useCreateProviderTimeOffMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ProviderAvailabilityOverview, unknown, CreateProviderTimeOffPayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.createProviderTimeOff(payload);
    },
    onSuccess: (overview) => {
      queryClient.setQueryData(providerAvailabilityQueryKey, overview);
    },
  });
};

export const useDeleteProviderTimeOffMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ProviderAvailabilityOverview, unknown, string>({
    mutationFn: async (timeOffId) => {
      const client = clientFactory();
      return client.deleteProviderTimeOff(timeOffId);
    },
    onSuccess: (overview) => {
      queryClient.setQueryData(providerAvailabilityQueryKey, overview);
    },
  });
};

export const useCompleteProviderAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProviderAddressPayload) => {
      const client = clientFactory();
      return client.completeProviderAddress(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerOnboardingStatusQueryKey });
      queryClient.invalidateQueries({ queryKey: providerProfileQueryKey() });
    },
  });
};

export const useCompleteProviderPhoneMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProviderPhonePayload) => {
      const client = clientFactory();
      return client.completeProviderPhone(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerOnboardingStatusQueryKey });
      queryClient.invalidateQueries({ queryKey: providerProfileQueryKey() });
    },
  });
};

export const useRequestProviderPhoneVerificationMutation = () => {
  return useMutation<
    { success: boolean; expiresAt: string },
    unknown,
    ProviderPhoneRequestPayload
  >({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.requestProviderPhoneVerification(payload);
    },
  });
};
