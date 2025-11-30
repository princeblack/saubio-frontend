import { ApiClient, ApiError } from './api-client';
import type { AuthResponse, HealthResponse } from '@saubio/models';

const makeHeaders = (map: Record<string, string>) => ({
  get: (key: string) => map[key.toLowerCase()] ?? null,
});

describe('ApiClient', () => {
  it('performs a GET request against the configured base URL', async () => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      defaultLocale: 'de',
      supportedLocales: ['de', 'en'],
    };

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: makeHeaders({ 'content-type': 'application/json' }),
      json: async () => response,
      text: async () => JSON.stringify(response),
    });

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001/api',
      fetchFn: fetchMock as unknown as typeof fetch,
    });

    const result = await client.health();

    expect(result.status).toBe('ok');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/health',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('stores tokens received from auth endpoints', async () => {
    const authResponse: AuthResponse = {
      user: {
        id: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email: 'demo@saubio.de',
        firstName: 'Demo',
        lastName: 'User',
        roles: ['client'],
        preferredLocale: 'de',
        isActive: true,
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    };

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: makeHeaders({ 'content-type': 'application/json' }),
      json: async () => authResponse,
      text: async () => JSON.stringify(authResponse),
    });

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001/api',
      fetchFn: fetchMock as unknown as typeof fetch,
    });

    await client.login({ email: 'demo@saubio.de', password: 'supersafe' });

    expect(client.getTokens()).toEqual(authResponse.tokens);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/auth/login',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('throws an ApiError on non-success responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: makeHeaders({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Unauthorized' }),
      text: async () => JSON.stringify({ message: 'Unauthorized' }),
    });

    const client = new ApiClient({
      baseUrl: 'http://localhost:3001/api',
      fetchFn: fetchMock as unknown as typeof fetch,
    });

    await expect(client.health()).rejects.toBeInstanceOf(ApiError);
  });
});
