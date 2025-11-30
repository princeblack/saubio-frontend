import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type {
  AuthResponse,
  LoginPayload,
  RefreshPayload,
  RegisterPayload,
} from '@saubio/models';
import { bookingsQueryKey, healthQueryKey } from './api-queries';
import { ApiClient, createApiClient } from './api-client';
import { setSession, clearSession } from './session-store';

type MutateFn<TPayload, TResult> = (payload: TPayload) => Promise<TResult>;

const apiClientFactory = () =>
  createApiClient({
    includeCredentials: true,
  });

const invalidateCoreQueries = (client: QueryClient) => {
  void client.invalidateQueries({ queryKey: healthQueryKey });
  void client.invalidateQueries({ queryKey: bookingsQueryKey });
};

const makeMutation = <TPayload, TResult>(
  mutationFn: MutateFn<TPayload, TResult>,
  options: {
    onSuccess?: (args: {
      response: TResult;
      payload: TPayload;
      queryClient: QueryClient;
    }) => void;
    onSettled?: () => void;
    invalidate?: boolean;
  } = {}
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (response, variables) => {
      if (options.invalidate ?? true) {
        invalidateCoreQueries(queryClient);
      }
      options.onSuccess?.({ response, payload: variables, queryClient });
    },
    onSettled: () => {
      options.onSettled?.();
    },
    meta: {
      source: 'auth',
    },
  });
};

const withClient = <TPayload, TResult>(
  handler: (client: ApiClient, payload: TPayload) => Promise<TResult>
): MutateFn<TPayload, TResult> => {
  return async (payload: TPayload) => {
    const client = apiClientFactory();
    return handler(client, payload);
  };
};

export const useRegisterMutation = () =>
  makeMutation<RegisterPayload, AuthResponse>(withClient((client, payload) => client.register(payload)), {
    onSuccess: ({ response }) => {
      setSession({ user: response.user });
    },
  });

export const useLoginMutation = () =>
  makeMutation<LoginPayload, AuthResponse>(withClient((client, payload) => client.login(payload)), {
    onSuccess: ({ response }) => {
      setSession({ user: response.user });
    },
  });

export const useRefreshMutation = () =>
  makeMutation<RefreshPayload | undefined, AuthResponse>(
    withClient((client, payload) => client.refresh(payload)),
    {
      onSuccess: ({ response }) => {
        setSession({ user: response.user });
      },
    }
  );

export const useLogoutMutation = () =>
  makeMutation<undefined, void>(
    withClient(async (client) => {
      await client.logout();
    }),
    {
      invalidate: false,
      onSuccess: ({ queryClient }) => {
        queryClient.removeQueries({ queryKey: bookingsQueryKey });
        queryClient.removeQueries({ queryKey: healthQueryKey });
        clearSession();
        if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
          const { pathname } = window.location;
          if (pathname !== '/') {
            window.location.replace('/');
          }
        }
      },
    }
  );
