'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FlowStepper } from '../common/FlowStepper';

const FLOW_ROUTES = ['/bookings/planning', '/bookings/select-provider', '/bookings/account'];

const STEP_ORDER = ['details', 'providers', 'account'] as const;
type StepId = (typeof STEP_ORDER)[number];

const resolveStepFromPath = (pathname: string | null): StepId => {
  if (!pathname) {
    return 'details';
  }
  if (pathname.startsWith('/bookings/account')) {
    return 'account';
  }
  if (pathname.startsWith('/bookings/select-provider')) {
    return 'providers';
  }
  return 'details';
};

export function BookingFlowStepper() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const shouldRender = Boolean(pathname && FLOW_ROUTES.some((route) => pathname.startsWith(route)));
  if (!shouldRender) {
    return null;
  }

  const steps = useMemo(
    () => [
      {
        id: 'details' as StepId,
        label: t('bookingFlow.steps.details.title', '1. Détails de la mission'),
        description: t(
          'bookingFlow.steps.details.description',
          'Adresse, fréquence et préférences de nettoyage'
        ),
      },
      {
        id: 'providers' as StepId,
        label: t('bookingFlow.steps.providers.title', '2. Prestataire'),
        description: t(
          'bookingFlow.steps.providers.description',
          'Comparez les professionnels disponibles ou laissez Saubio choisir'
        ),
      },
      {
        id: 'account' as StepId,
        label: t('bookingFlow.steps.account.title', '3. Compte & confirmation'),
        description: t(
          'bookingFlow.steps.account.description',
          'Connexion, création du compte et récapitulatif avec paiement'
        ),
      },
    ],
    [t]
  );

  const currentStep = resolveStepFromPath(pathname);
  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === currentStep));

  return <FlowStepper steps={steps} activeStepId={currentStep} className="mb-6" />;
}
