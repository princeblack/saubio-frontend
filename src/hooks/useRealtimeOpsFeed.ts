'use client';

import { useCallback, useState } from 'react';
import type { NotificationRealtimeEvent } from '@saubio/models';
import { useNotificationStream } from '@saubio/utils';

type RealtimeOpsFeedOptions = {
  enabled?: boolean;
  types?: NotificationRealtimeEvent['type'][];
  limit?: number;
};

export type RealtimeOpsEvent = {
  id: string;
  type: NotificationRealtimeEvent['type'];
  payload: NotificationRealtimeEvent['payload'];
  createdAt: string;
};

export const useRealtimeOpsFeed = (options: RealtimeOpsFeedOptions = {}) => {
  const { enabled = true, types, limit = 20 } = options;
  const [events, setEvents] = useState<RealtimeOpsEvent[]>([]);

  const handleEvent = useCallback(
    (event: NotificationRealtimeEvent) => {
      if (types && types.length > 0 && !types.includes(event.type)) {
        return;
      }
      const createdAt = event.createdAt ?? new Date().toISOString();
      setEvents((current) => {
        const next: RealtimeOpsEvent[] = [
          {
            id: `${event.type}-${createdAt}-${Math.random().toString(36).slice(2)}`,
            type: event.type,
            payload: event.payload ?? {},
            createdAt,
          },
          ...current,
        ];
        return next.slice(0, Math.max(1, limit));
      });
    },
    [limit, types]
  );

  useNotificationStream({
    enabled,
    onEvent: handleEvent,
  });

  return { events };
};
