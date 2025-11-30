'use client';

import { useQuery } from '@tanstack/react-query';
import { bookingsQueryOptions, healthQueryOptions, useAccessToken } from '@saubio/utils';

export function useApiHealth() {
  return useQuery(healthQueryOptions());
}

export function useBookingsSnapshot() {
  const accessToken = useAccessToken();
  return useQuery({
    ...bookingsQueryOptions(),
    enabled: Boolean(accessToken),
  });
}
