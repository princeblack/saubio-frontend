'use client';

import { Toast } from '@saubio/ui';
import { useTranslation } from 'react-i18next';

type SuccessToastProps = {
  open: boolean;
  title?: string;
  message?: string;
  actionLabel?: string;
  onDismiss: () => void;
  onAction?: () => void;
};

export function SuccessToast({
  open,
  title,
  message,
  actionLabel,
  onDismiss,
  onAction,
}: SuccessToastProps) {
  const { t } = useTranslation();

  return (
    <Toast
      open={open}
      variant="success"
      title={title ?? t('system.success.title', 'Demande enregistrée')}
      description={message}
      dismissLabel={t('system.success.dismiss', 'Merci')}
      onDismiss={onDismiss}
      actions={
        onAction
          ? [
              {
                label: actionLabel ?? t('system.success.action', 'Voir mes réservations'),
                onClick: () => {
                  onAction();
                  onDismiss();
                },
              },
            ]
          : undefined
      }
    />
  );
}
