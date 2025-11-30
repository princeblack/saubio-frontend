import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProfileResponse,
  UpdatePasswordPayload,
  UpdateProfilePayload,
} from '@saubio/models';
import {
  profileAuditQueryKey,
  profileAuditQueryOptions,
  profileQueryKey,
  profileQueryOptions,
} from './api-queries';
import { createApiClient } from './api-client';

const clientFactory = () =>
  createApiClient({
    includeCredentials: true,
  });

export const useProfile = () => {
  return useQuery(profileQueryOptions());
};

export const useProfileAuditTrail = () => {
  return useQuery(profileAuditQueryOptions());
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ProfileResponse, unknown, UpdateProfilePayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      await client.updateProfile(payload);
      return client.getProfile();
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey(), profile);
      queryClient.setQueryData(profileAuditQueryKey(), profile.profileAudits);
    },
  });
};

export const useUpdatePasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, unknown, UpdatePasswordPayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.updatePassword(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueryKey() });
    },
  });
};
