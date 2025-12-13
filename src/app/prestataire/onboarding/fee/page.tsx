'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  ApiError,
  useProviderOnboardingStatus,
  useProviderSignupFeeIntentMutation,
  useRequireRole,
} from '@saubio/utils';
import { SectionTitle, SurfaceCard, LoadingIndicator } from '@saubio/ui';

export default function ProviderSignupFeePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const statusQuery = useProviderOnboardingStatus(Boolean(session.user));
  const createIntentMutation = useProviderSignupFeeIntentMutation();
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const signupFeeTask = statusQuery.data?.tasks?.find((task) => task.id === 'signup_fee');
    if (signupFeeTask?.status === 'completed') {
      router.replace('/prestataire/onboarding');
    }
  }, [statusQuery.data, router]);

  if (!session.user) {
    return null;
  }

  if (statusQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingIndicator tone="dark" size="md" />
      </div>
    );
  }

  const resolveErrorMessage = (error?: unknown) => {
    const fallback = t(
      'providerOnboardingChecklist.signupFee.error',
      'Impossible de lancer le paiement pour le moment.'
    );
    if (error instanceof ApiError) {
      const body = error.body as { message?: string } | undefined;
      if (body?.message) {
        return body.message;
      }
    }
    return fallback;
  };

  const startPayment = () => {
    setPaymentMessage(null);
    setIsRedirecting(true);
    createIntentMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result.alreadyPaid) {
          setPaymentMessage(
            t('providerOnboardingChecklist.signupFee.alreadyPaid', 'Vous avez déjà réglé ces frais.')
          );
          void statusQuery.refetch();
          router.replace('/prestataire/onboarding');
          return;
        }

        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }

        setPaymentMessage(resolveErrorMessage());
      },
      onError: (error) => {
        setPaymentMessage(resolveErrorMessage(error));
      },
      onSettled: () => {
        setIsRedirecting(false);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/prestataire/onboarding"
          className="text-sm font-semibold text-saubio-forest transition hover:text-saubio-moss"
        >
          ← {t('common.back', 'Retour')}
        </Link>
      </div>
      <header className="space-y-2">
        <SectionTitle as="h1" size="large">
          {t('providerOnboardingChecklist.signupFee.title', 'Frais d’inscription unique')}
        </SectionTitle>
        <p className="text-sm text-saubio-slate/70">
          {t(
            'providerOnboardingChecklist.signupFee.description',
            'Des frais uniques de 25€ couvrent la constitution de votre dossier et la session de bienvenue.'
          )}
        </p>
      </header>

      <SurfaceCard variant="soft" padding="lg" className="space-y-4 border border-saubio-forest/10">
        {paymentMessage ? <p className="text-sm text-saubio-forest">{paymentMessage}</p> : null}
        <button
          type="button"
          onClick={startPayment}
          disabled={createIntentMutation.isPending || isRedirecting}
          className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-50"
        >
          {isRedirecting || createIntentMutation.isPending
            ? t('providerOnboardingChecklist.signupFee.loading', 'Préparation du paiement…')
            : t('providerOnboardingChecklist.signupFee.cta', 'Payer 25€')}
        </button>
        <p className="text-xs text-saubio-slate/60">
          {t(
            'providerOnboardingChecklist.signupFee.redirectNotice',
            'Vous serez redirigé vers notre page de paiement sécurisée pour finaliser la transaction.'
          )}
        </p>
      </SurfaceCard>
    </div>
  );
}
