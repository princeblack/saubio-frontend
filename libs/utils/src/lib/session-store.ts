import type { User } from '@saubio/models';

export interface SessionState {
  user?: User;
}

type Listener = (session: SessionState) => void;

interface SessionPersistence {
  load: () => Promise<SessionState | undefined> | SessionState | undefined;
  store: (session: SessionState) => Promise<void> | void;
  clear: () => Promise<void> | void;
}

let currentSession: SessionState = {};
const listeners = new Set<Listener>();
let persistence: SessionPersistence | null = null;

const notify = () => {
  for (const listener of listeners) {
    listener(currentSession);
  }
};

export const getSession = () => currentSession;

export const setSession = (session: SessionState) => {
  currentSession = session;
  notify();
  if (persistence) {
    if (session.user) {
      void persistence.store(session);
    } else {
      void persistence.clear();
    }
  }
};

export const clearSession = () => {
  currentSession = {};
  notify();
  if (persistence) {
    void persistence.clear();
  }
};

export const subscribeSession = (listener: Listener) => {
  listeners.add(listener);
  listener(currentSession);
  return () => listeners.delete(listener);
};

export const configureSessionPersistence = (value: SessionPersistence) => {
  persistence = value;
};

export const loadPersistedSession = async () => {
  if (!persistence) return;
  const stored = await persistence.load();
  if (stored && stored.user) {
    currentSession = stored;
    notify();
  }
};
