'use client';

import { useTranslation } from 'react-i18next';
import { ErrorBanner } from '@saubio/ui';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabelKey?: string;
}

export function ErrorState({ title, description, onRetry, retryLabelKey }: ErrorStateProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('system.error.generic');
  const resolvedDescription = description ?? undefined;
  const actionLabel = onRetry ? t(retryLabelKey ?? 'system.actions.retry', 'Retry') : undefined;

  return (
    <ErrorBanner
      title={resolvedTitle}
      description={resolvedDescription}
      actionLabel={actionLabel}
      onAction={onRetry}
    />
  );
}
