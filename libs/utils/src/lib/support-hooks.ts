import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateSupportMessagePayload,
  CreateSupportTicketPayload,
  SupportMessage,
  SupportTicket,
  SupportTicketFilters,
  UpdateSupportTicketPayload,
} from '@saubio/models';
import {
  supportTicketDetailQueryKey,
  supportTicketDetailQueryOptions,
  supportTicketsQueryKey,
  supportTicketsQueryOptions,
} from './api-queries';
import { createApiClient, type ApiClient } from './api-client';

const clientFactory = () =>
  createApiClient({
    includeCredentials: true,
  });

type SupportMutations = Pick<
  ApiClient,
  'createSupportTicket' | 'addSupportMessage' | 'updateSupportTicket'
>;

const makeMutationClient = (): SupportMutations => clientFactory();

export const useSupportTickets = (filters: SupportTicketFilters = {}) => {
  return useQuery(supportTicketsQueryOptions(filters));
};

export const useSupportTicket = (ticketId?: string) => {
  return useQuery(supportTicketDetailQueryOptions(ticketId ?? ''));
};

export const useCreateSupportTicketMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SupportTicket, unknown, CreateSupportTicketPayload>({
    mutationFn: async (payload) => {
      const client = makeMutationClient();
      return client.createSupportTicket(payload);
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData(supportTicketDetailQueryKey(ticket.id), ticket);
      void queryClient.invalidateQueries({ queryKey: ['api', 'support'] });
    },
  });
};

type UpdateSupportTicketInput = UpdateSupportTicketPayload & {
  ticketId: string;
};

export const useUpdateSupportTicketMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SupportTicket, unknown, UpdateSupportTicketInput>({
    mutationFn: async ({ ticketId, ...updates }) => {
      const client = makeMutationClient();
      return client.updateSupportTicket(ticketId, updates);
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData(supportTicketDetailQueryKey(ticket.id), ticket);
      void queryClient.invalidateQueries({ queryKey: ['api', 'support'] });
    },
  });
};

type AddSupportMessageInput = CreateSupportMessagePayload & {
  ticketId: string;
};

export const useAddSupportMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SupportMessage, unknown, AddSupportMessageInput>({
    mutationFn: async ({ ticketId, ...payload }) => {
      const client = makeMutationClient();
      return client.addSupportMessage(ticketId, payload);
    },
    onSuccess: (message, variables) => {
      queryClient.setQueryData<SupportTicket | undefined>(
        supportTicketDetailQueryKey(variables.ticketId),
        (previous) =>
          previous
            ? {
                ...previous,
                messages: [...(previous.messages ?? []), message],
              }
            : previous
      );
      void queryClient.invalidateQueries({ queryKey: ['api', 'support'] });
    },
  });
};
