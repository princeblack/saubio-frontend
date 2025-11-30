import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { getApiBaseUrl } from '@saubio/config';
import type {
  ListNotificationsParams,
  MarkManyNotificationsPayload,
  Notification,
  NotificationPreference,
  NotificationRealtimeEvent,
  UpdateNotificationPreferencesPayload,
} from '@saubio/models';
import { createApiClient } from './api-client';
import { useAccessToken } from './use-access-token';
import {
  notificationPreferencesQueryKey,
  notificationPreferencesQueryOptions,
  notificationsQueryOptions,
} from './api-queries';

const clientFactory = () =>
  createApiClient({
    includeCredentials: true,
  });

type UseNotificationsOptions = {
  enabled?: boolean;
};

export const useNotifications = (params: ListNotificationsParams = {}, options?: UseNotificationsOptions) => {
  const accessToken = useAccessToken();
  const queryOptions = notificationsQueryOptions(params);
  return useQuery({
    ...queryOptions,
    enabled: Boolean(accessToken) && (options?.enabled ?? true),
  });
};

export const useNotificationPreferences = (targetUserId?: string) => {
  const accessToken = useAccessToken();
  return useQuery({
    ...notificationPreferencesQueryOptions(targetUserId),
    enabled: Boolean(accessToken),
  });
};

type NotificationStreamOptions = {
  enabled?: boolean;
  onEvent?: (event: NotificationRealtimeEvent) => void;
};

export const useNotificationStream = (options: NotificationStreamOptions = {}) => {
  const { enabled = true, onEvent } = options;
  const queryClient = useQueryClient();
  const reconnectTimeout = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const accessToken = useAccessToken();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !accessToken) {
      return;
    }

    let isMounted = true;

    const connect = () => {
      if (!isMounted || eventSourceRef.current) {
        return;
      }
      const baseUrl = getApiBaseUrl();
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const params = new URLSearchParams({
        access_token: accessToken,
      });
      const streamUrl = new URL(`notifications/stream?${params.toString()}`, normalizedBase).toString();
      const source = new EventSource(streamUrl, { withCredentials: true });
      eventSourceRef.current = source;

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as NotificationRealtimeEvent;
          onEvent?.(data);
        } catch {
          // ignore malformed events
        }
        void queryClient.invalidateQueries({ queryKey: ['api', 'notifications'] });
      };

      source.onerror = () => {
        source.close();
        eventSourceRef.current = null;
        if (!isMounted) {
          return;
        }
        reconnectTimeout.current = window.setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout.current) {
        window.clearTimeout(reconnectTimeout.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, onEvent, queryClient, accessToken]);
};

type MarkNotificationReadInput = {
  id: string;
  targetUserId?: string;
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Notification, unknown, MarkNotificationReadInput>({
    mutationFn: async ({ id, targetUserId }) => {
      const client = clientFactory();
      return client.markNotificationRead(id, { targetUserId });
    },
    onSuccess: (notification) => {
      queryClient.setQueriesData<Notification[] | undefined>(
        { queryKey: ['api', 'notifications'] },
        (current) =>
          current?.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  ...notification,
                }
              : item
          ) ?? current
      );
      void queryClient.invalidateQueries({ queryKey: ['api', 'notifications'] });
    },
  });
};

export const useMarkManyNotificationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, unknown, MarkManyNotificationsPayload>({
    mutationFn: async (payload) => {
      const client = clientFactory();
      return client.markManyNotifications(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['api', 'notifications'] });
    },
  });
};

export const useUpdateNotificationPreferencesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<NotificationPreference, unknown, { payload: UpdateNotificationPreferencesPayload; targetUserId?: string }>({
    mutationFn: async ({ payload, targetUserId }) => {
      const client = clientFactory();
      return client.updateNotificationPreferences(payload, { targetUserId });
    },
    onSuccess: (preferences, variables) => {
      const targetUserId = variables?.targetUserId;
      queryClient.setQueryData(notificationPreferencesQueryKey(targetUserId), preferences);
      void queryClient.invalidateQueries({ queryKey: ['api', 'notifications'] });
    },
  });
};
