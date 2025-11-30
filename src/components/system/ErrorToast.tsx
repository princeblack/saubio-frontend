'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  message?: string;
  onRetry?: () => void;
  onDismiss: () => void;
};

export function ErrorToast({ open, message, onRetry, onDismiss }: Props) {
  const { t } = useTranslation();
  const finalMessage = useMemo(
    () => message ?? t('system.apiError.description'),
    [message, t]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-3xl bg-saubio-forest text-white shadow-soft-lg">
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saubio-sun">
            {t('system.apiError.title')}
          </p>
          <p className="text-sm leading-relaxed text-white/85">{finalMessage}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {onRetry ? (
            <button
              type="button"
              onClick={() => {
                onRetry();
                onDismiss();
              }}
              className="rounded-full bg-saubio-sun px-5 py-2 font-semibold text-saubio-forest transition hover:bg-yellow-300"
            >
              {t('system.apiError.retry')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full border border-white/30 px-5 py-2 font-semibold text-white/80 transition hover:border-white hover:text-white"
          >
            {t('system.apiError.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
