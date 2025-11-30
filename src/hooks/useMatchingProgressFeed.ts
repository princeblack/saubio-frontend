'use client';

import { useCallback, useMemo, useState } from 'react';
import type { NotificationRealtimeEvent } from '@saubio/models';
import { useNotificationStream } from '@saubio/utils';

type MatchingProgressVariant = 'positive' | 'warning' | 'neutral' | 'danger';

export type MatchingProgressEvent = {
  stage: string;
  status: string;
  bookingId?: string;
  count?: number;
  message?: string;
  createdAt: string;
  teamCandidateId?: string;
};

type UseMatchingProgressFeedOptions = {
  enabled?: boolean;
  filterBookingId?: string;
  limit?: number;
};

export const useMatchingProgressFeed = (options: UseMatchingProgressFeedOptions = {}) => {
  const { enabled = true, filterBookingId, limit = 20 } = options;
  const [events, setEvents] = useState<MatchingProgressEvent[]>([]);

  const handleEvent = useCallback(
    (event: NotificationRealtimeEvent) => {
      if (event.type !== 'matching_progress') {
        return;
      }
      const payload = event.payload ?? {};
      const bookingId =
        typeof payload?.bookingId === 'string' ? (payload.bookingId as string) : undefined;
      if (filterBookingId && bookingId !== filterBookingId) {
        return;
      }
      const stage = typeof payload?.stage === 'string' ? (payload.stage as string) : null;
      const status = typeof payload?.status === 'string' ? (payload.status as string) : null;
      if (!stage || !status) {
        return;
      }
      const count = typeof payload?.count === 'number' ? (payload.count as number) : undefined;
      const message = typeof payload?.message === 'string' ? (payload.message as string) : undefined;
      const teamCandidateId =
        typeof payload?.teamCandidateId === 'string' ? (payload.teamCandidateId as string) : undefined;
      const createdAt = event.createdAt ?? new Date().toISOString();
      setEvents((current) => {
        const updated = [
          {
            stage,
            status,
            bookingId,
            count,
            message,
            createdAt,
            teamCandidateId,
          },
          ...current,
        ];
        return updated.slice(0, Math.max(1, limit));
      });
    },
    [filterBookingId, limit]
  );

  useNotificationStream({
    enabled,
    onEvent: handleEvent,
  });

  const latestByStage = useMemo<Record<string, MatchingProgressEvent>>(() => {
    const map: Record<string, MatchingProgressEvent> = {};
    events.forEach((event) => {
      if (!map[event.stage]) {
        map[event.stage] = event;
      }
    });
    return map;
  }, [events]);

  return { events, latestByStage };
};

export const resolveMatchingStatusVariant = (status: string): MatchingProgressVariant => {
  switch (status) {
    case 'completed':
    case 'locked':
    case 'accepted':
      return 'positive';
    case 'in_progress':
    case 'started':
    case 'awaiting_client':
    case 'broadcasted':
      return 'warning';
    case 'cancelled':
    case 'failed':
    case 'error':
    case 'no_providers':
      return 'danger';
    case 'declined':
      default:
      return status === 'declined' ? 'neutral' : 'neutral';
  }
};
