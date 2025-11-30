'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  type Query,
  type QueryCacheNotifyEvent,
  type MutationCacheNotifyEvent,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  ApiError,
  configureTokenPersistence,
  loadPersistedTokens,
  configureSessionPersistence,
  loadPersistedSession,
} from '@saubio/utils';
import { ErrorToast } from '../components/system/ErrorToast';

type Props = {
  children: ReactNode;
};

type ErrorState = {
  id: string;
  error: unknown;
  retry?: () => void;
};

const TOKEN_STORAGE_KEY = 'saubio.auth.tokens';

const isApiQuery = (query: Query) => {
  const key = query.queryKey;
  return Array.isArray(key) && key[0] === 'api';
};

const deriveMessage = (error: unknown): string | undefined => {
  if (!error) return undefined;
  if (error instanceof ApiError) {
    if (typeof error.body === 'object' && error.body && 'message' in error.body) {
      const bodyMessage = (error.body as Record<string, unknown>).message;
      if (typeof bodyMessage === 'string') {
        return bodyMessage;
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return undefined;
};

export function QueryProvider({ children }: Props) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 60_000,
          },
        },
      })
  );
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const [lastErrorKey, setLastErrorKey] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    configureTokenPersistence({
      load: () => {
        try {
          const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
          if (!raw) return undefined;
          return JSON.parse(raw);
        } catch {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          return undefined;
        }
      },
      store: (tokens) => {
        try {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
        } catch (error) {
          console.warn('SaubioTelemetry', {
            type: 'token_persistence_error',
            stage: 'store',
            error,
          });
        }
      },
      clear: () => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      },
    });

    configureSessionPersistence({
      load: () => {
        try {
          const raw = window.localStorage.getItem('saubio.auth.session');
          if (!raw) return undefined;
          return JSON.parse(raw);
        } catch {
          window.localStorage.removeItem('saubio.auth.session');
          return undefined;
        }
      },
      store: (session) => {
        try {
          window.localStorage.setItem('saubio.auth.session', JSON.stringify(session));
        } catch (error) {
          console.warn('SaubioTelemetry', {
            type: 'session_persistence_error',
            stage: 'store',
            error,
          });
        }
      },
      clear: () => {
        window.localStorage.removeItem('saubio.auth.session');
      },
    });

    (async () => {
      try {
        await Promise.all([loadPersistedTokens(), loadPersistedSession()]);
      } catch (error) {
        console.warn('SaubioTelemetry', {
          type: 'token_session_load_error',
          error,
        });
      }
    })().catch((error) => {
      console.warn('SaubioTelemetry', {
        type: 'token_session_load_error_unhandled',
        error,
      });
    });
  }, []);

  useEffect(() => {
    const handleQueryEvent = (event: QueryCacheNotifyEvent) => {
      if (!event || event.type !== 'updated') return;
      const { query } = event;
      if (!isApiQuery(query) || query.state.status !== 'error') {
        return;
      }

      if (query.state.error instanceof ApiError && query.state.error.status === 401) {
        return;
      }

      const message = deriveMessage(query.state.error);
      const errorKey = `${query.queryHash}:${message}`;
      if (lastErrorKey === errorKey) {
        return;
      }

      console.warn('SaubioTelemetry', {
        type: 'api_query_error',
        queryKey: query.queryKey,
        message,
        timestamp: Date.now(),
      });

      setLastErrorKey(errorKey);
      setErrorState({
        id: errorKey,
        error: query.state.error,
        retry: () => {
          void client.invalidateQueries({ queryKey: query.queryKey });
        },
      });
    };

    const handleMutationEvent = (event: MutationCacheNotifyEvent) => {
      if (!event || event.type !== 'updated') return;
      const { mutation } = event;
      if (mutation.options?.meta?.source !== 'auth') {
        return;
      }
      if (mutation.state.status !== 'error') return;

      if (mutation.state.error instanceof ApiError && mutation.state.error.status === 401) {
        return;
      }

      const message = deriveMessage(mutation.state.error);
      const errorKey = `mutation:${mutation.mutationId}:${message}`;

      console.warn('SaubioTelemetry', {
        type: 'api_mutation_error',
        mutationId: mutation.mutationId,
        message,
        timestamp: Date.now(),
      });

      setLastErrorKey(errorKey);
      setErrorState({
        id: errorKey,
        error: mutation.state.error,
      });
    };

    const unsubscribeQuery = client.getQueryCache().subscribe(handleQueryEvent);
    const unsubscribeMutation = client.getMutationCache().subscribe(handleMutationEvent);

    return () => {
      unsubscribeQuery?.();
      unsubscribeMutation?.();
    };
  }, [client, lastErrorKey]);

  const toastMessage = useMemo(() => deriveMessage(errorState?.error), [errorState]);

  return (
    <QueryClientProvider client={client}>
      {children}
      <ErrorToast
        open={Boolean(errorState)}
        message={toastMessage}
        onRetry={errorState?.retry}
        onDismiss={() => {
          setErrorState(null);
          setLastErrorKey(null);
        }}
      />
    </QueryClientProvider>
  );
}
