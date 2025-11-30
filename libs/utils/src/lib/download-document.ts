'use client';

import { getSharedTokens } from './api-client';

export const downloadDocument = async (url: string, fileName?: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const tokens = getSharedTokens();
  const headers: Record<string, string> = {};
  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`DOCUMENT_DOWNLOAD_FAILED_${response.status}`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName ?? 'document.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 30_000);
};
