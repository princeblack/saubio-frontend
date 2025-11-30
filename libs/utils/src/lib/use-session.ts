import { useSyncExternalStore } from 'react';
import { getSession, subscribeSession } from './session-store';

export const useSession = () =>
  useSyncExternalStore(subscribeSession, getSession, getSession);
