'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { ProviderOnboardingTask } from '@saubio/models';
import {
  useRequireRole,
  useProviderOnboardingStatus,
  useProviderPaymentsOnboardingMutation,
} from '@saubio/utils';
import { SectionTitle, SurfaceCard, LoadingIndicator } from '@saubio/ui';
import { CheckCircle2, Clock } from 'lucide-react';

type TaskLinkConfig = {
  href: string;
  labelKey: string;
  fallbackLabel: string;
  menuKey: string;
};

/**
 * Mapping between the onboarding checklist entries, the new provider routes and their
 * corresponding sidebar/menu destination. This keeps the checklist, navigation menu
 * and onboarding flow aligned.
 */
const TASK_ROUTE_MAP: Partial<Record<ProviderOnboardingTask['id'], TaskLinkConfig>> = {
  profile: {
    href: '/prestataire/profile/identity',
    labelKey: 'providerOnboardingChecklist.profile.cta',
    fallbackLabel: 'Mettre à jour',
    menuKey: 'sidebar.provider.profileSection',
  },
  account: {
    href: '/prestataire/profile/identity',
    labelKey: 'providerOnboardingChecklist.profile.cta',
    fallbackLabel: 'Mettre à jour',
    menuKey: 'sidebar.provider.profileSection',
  },
  identity: {
    href: '/prestataire/profile/identity',
    labelKey: 'providerOnboardingChecklist.identityForm.cta',
    fallbackLabel: 'Compléter',
    menuKey: 'sidebar.provider.profileSection',
  },
  address: {
    href: '/prestataire/profile/address',
    labelKey: 'providerOnboardingChecklist.address.cta',
    fallbackLabel: 'Ajouter mon adresse',
    menuKey: 'sidebar.provider.profileAddress',
  },
  service_areas: {
    href: '/prestataire/profile/address',
    labelKey: 'providerOnboardingChecklist.serviceAreas.cta',
    fallbackLabel: 'Définir ma zone',
    menuKey: 'sidebar.provider.profileAddress',
  },
  pricing: {
    href: '/prestataire/profile/pricing',
    labelKey: 'providerOnboardingChecklist.pricing.cta',
    fallbackLabel: 'Définir mon tarif',
    menuKey: 'sidebar.provider.earningsPricing',
  },
  availability: {
    href: '/prestataire/disponibilites',
    labelKey: 'providerOnboardingChecklist.availability.cta',
    fallbackLabel: 'Définir mes créneaux',
    menuKey: 'sidebar.provider.availabilitySection',
  },
  schedule: {
    href: '/prestataire/disponibilites',
    labelKey: 'providerOnboardingChecklist.availability.cta',
    fallbackLabel: 'Définir mes créneaux',
    menuKey: 'sidebar.provider.availabilitySection',
  },
};

export default function ProviderOnboardingChecklistPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupFeeSuccess = searchParams?.get('signupFee') === 'success';
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const statusQuery = useProviderOnboardingStatus(Boolean(session.user));
  const paymentsMutation = useProviderPaymentsOnboardingMutation();
  const refetchRef = useRef(statusQuery.refetch);
  const pollStartedRef = useRef(false);
  const [signupFeePollingTimeout, setSignupFeePollingTimeout] = useState(false);

  useEffect(() => {
    refetchRef.current = statusQuery.refetch;
  }, [statusQuery.refetch]);

  useEffect(() => {
    if (!signupFeeSuccess || pollStartedRef.current) {
      return;
    }
    pollStartedRef.current = true;
    setSignupFeePollingTimeout(false);
    let attempts = 0;
    let stop = false;

    const poll = async () => {
      if (stop) return;
      attempts += 1;
      console.debug(`[Onboarding] Signup fee poll attempt #${attempts}`);
      const result = await refetchRef.current();
      const tasks = result.data?.tasks ?? [];
      const signupTask = tasks.find((task) => task.id === 'signup_fee');
      console.debug(`[Onboarding] signupFeeTask status = ${signupTask?.status ?? 'unknown'}`);
      if (signupTask?.status === 'completed') {
        stop = true;
        pollStartedRef.current = false;
        console.debug('[Onboarding] Signup fee completed, stopping polling.');
        void router.replace('/prestataire/onboarding', { scroll: false });
        return;
      }
      if (attempts >= 15) {
        stop = true;
        pollStartedRef.current = false;
        setSignupFeePollingTimeout(true);
        console.debug('[Onboarding] Signup fee polling timed out.');
        void router.replace('/prestataire/onboarding', { scroll: false });
      }
    };

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, 2000);

    return () => {
      stop = true;
      clearInterval(interval);
      pollStartedRef.current = false;
    };
  }, [signupFeeSuccess, router]);

  if (!session.user) {
    return null;
  }

  const onboardingData = statusQuery.data ?? statusQuery.previousData;

  if (!onboardingData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingIndicator tone="dark" size="md" />
      </div>
    );
  }

  const { tasks, progress, allCompleted } = onboardingData;
  const signupFeeTask = tasks.find((task) => task.id === 'signup_fee');
  const awaitingSignupFeeConfirmation = Boolean(
    signupFeeSuccess && signupFeeTask?.status !== 'completed' && !signupFeePollingTimeout
  );
  const signupFeeTimeoutMessage = Boolean(
    signupFeePollingTimeout && signupFeeTask?.status !== 'completed'
  );

  const handlePayoutOnboarding = () => {
    paymentsMutation.mutate(undefined, {
      onSuccess: (response) => {
        window.open(response.url, '_blank', 'noopener,noreferrer');
      },
    });
  };

  const renderTaskControls = (task: ProviderOnboardingTask) => {
    if (task.status === 'completed') {
      return <CheckCircle2 className="h-6 w-6 text-saubio-forest" />;
    }

    const destination = TASK_ROUTE_MAP[task.id];
    if (destination) {
      return (
        <Link
          href={destination.href}
          className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
        >
          {t(destination.labelKey, destination.fallbackLabel)}
        </Link>
      );
    }

    switch (task.id) {
      case 'phone':
        return (
          <Link
            href="/register/provider?step=phone"
            className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
          >
            {t('providerOnboardingChecklist.phone.cta', 'Vérifier')}
          </Link>
        );
      case 'payments':
        return (
          <button
            type="button"
            onClick={handlePayoutOnboarding}
            className="rounded-full bg-saubio-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
            disabled={paymentsMutation.isPending}
          >
            {paymentsMutation.isPending
              ? t('providerOnboardingChecklist.payments.pending', 'Ouverture du portail…')
              : t('providerOnboardingChecklist.payments.cta', 'Activer les paiements')}
          </button>
        );
      case 'id_check':
        return (
          <button
            type="button"
            onClick={() => router.push('/prestataire/onboarding/identity')}
            className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
          >
            {t('providerOnboardingChecklist.identity.cta', 'Téléverser une pièce')}
          </button>
        );
      case 'signup_fee':
        return (
          <button
            type="button"
            onClick={() => router.push('/prestataire/onboarding/fee')}
            className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
          >
            {t('providerOnboardingChecklist.signupFee.cta', 'Payer 25€')}
          </button>
        );
      case 'welcome_session':
        return (
          <span className="text-xs font-semibold text-saubio-slate/60">
            {t(
              'providerOnboardingChecklist.welcome.pending',
              'Notre équipe vous contactera pour planifier cette session.'
            )}
          </span>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-xs text-saubio-slate/60">
            <Clock className="h-4 w-4" />
            {task.durationMinutes
              ? t('providerOnboardingChecklist.duration', '{{count}} min', {
                  count: task.durationMinutes,
                })
              : t('providerOnboardingChecklist.pending', 'À faire')}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerOnboardingChecklist.title', 'Activez votre compte')}
        </SectionTitle>
        <p className="text-sm text-saubio-slate/70">
          {t(
            'providerOnboardingChecklist.subtitle',
            'Finalisez ces étapes pour recevoir des missions et vos paiements.'
          )}
        </p>
        {awaitingSignupFeeConfirmation ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
            {t(
              'providerOnboardingChecklist.signupFee.waiting',
              'Paiement reçu, validation en cours. Cette étape sera cochée automatiquement.'
            )}
          </div>
        ) : null}
        {signupFeeTimeoutMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {t(
              'providerOnboardingChecklist.signupFee.timeout',
              'Nous n’avons pas encore reçu la confirmation Mollie. Vérifiez votre paiement ou réessayez.'
            )}
          </div>
        ) : null}
        <div>
          <div className="flex items-center justify-between text-sm font-semibold text-saubio-forest">
            <span>{progress}%</span>
            <span>
              {t('providerOnboardingChecklist.steps', '{{completed}} / {{total}} étapes', {
                completed: statusQuery.data.stepsCompleted,
                total: statusQuery.data.totalSteps,
              })}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-saubio-mist">
            <div
              className="h-2 rounded-full bg-saubio-forest transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <SurfaceCard variant="soft" padding="lg" className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-saubio-forest/10 px-5 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-saubio-forest">{task.title}</p>
              <p className="text-xs text-saubio-slate/70">{task.description}</p>
            </div>
            {renderTaskControls(task)}
          </div>
        ))}
      </SurfaceCard>

      {paymentsMutation.isError ? (
        <p className="text-xs text-red-500">
          {t(
            'providerOnboardingChecklist.payments.error',
            'Impossible d’ouvrir le portail de versement pour le moment. Réessayez plus tard.'
          )}
        </p>
      ) : null}

      {allCompleted ? (
        <SurfaceCard variant="soft" padding="lg" className="text-center">
          <p className="text-lg font-semibold text-saubio-forest">
            {t('providerOnboardingChecklist.allDone.title', 'Votre compte est prêt !')}
          </p>
          <p className="mt-2 text-sm text-saubio-slate/70">
            {t(
              'providerOnboardingChecklist.allDone.description',
              'Vous pouvez maintenant répondre aux demandes et planifier vos missions.'
            )}
          </p>
          <Link
            href="/prestataire/revenus"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-saubio-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss"
          >
            {t('providerOnboardingChecklist.allDone.cta', 'Accéder à mon espace')}
          </Link>
        </SurfaceCard>
      ) : (
        <p className="text-xs text-saubio-slate/60">
          {t(
            'providerOnboardingChecklist.help',
            'Besoin d’aide ? Contactez notre équipe support pour finaliser votre inscription.'
          )}
        </p>
      )}
    </div>
  );
}
