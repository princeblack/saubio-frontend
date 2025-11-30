import { useEffect, useState } from 'react';
import { getSharedTokens, subscribeToTokens } from './api-client';

export const useAccessToken = () => {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => getSharedTokens()?.accessToken ?? null
  );

  useEffect(() => {
    const unsubscribe = subscribeToTokens((tokens) => {
      setAccessToken(tokens?.accessToken ?? null);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return accessToken;
};
