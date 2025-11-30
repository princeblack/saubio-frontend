'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { ProviderOnboardingTask } from '@saubio/models';
import {
  useRequireRole,
  useProviderOnboardingStatus,
  useProviderPaymentsOnboardingMutation,
} from '@saubio/utils';
import { SectionTitle, SurfaceCard, LoadingIndicator } from '@saubio/ui';
import { CheckCircle2, Clock } from 'lucide-react';

export default function ProviderOnboardingChecklistPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const statusQuery = useProviderOnboardingStatus(Boolean(session.user));
  const paymentsMutation = useProviderPaymentsOnboardingMutation();

  if (!session.user) {
    return null;
  }

  if (statusQuery.isLoading || !statusQuery.data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingIndicator tone="dark" size="md" />
      </div>
    );
  }

  const { tasks, progress, allCompleted } = statusQuery.data;

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
    switch (task.id) {
      case 'identity':
        return (
          <Link
            href="/register/provider?step=identity"
            className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
          >
            {t('providerOnboardingChecklist.identityForm.cta', 'Compléter')}
          </Link>
        );
      case 'address':
        return (
          <Link
            href="/register/provider?step=address"
            className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
          >
            {t('providerOnboardingChecklist.address.cta', 'Ajouter mon adresse')}
          </Link>
        );
      case 'phone':
        return (
          <Link
            href="/register/provider?step=phone"
            className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
          >
            {t('providerOnboardingChecklist.phone.cta', 'Vérifier')}
          </Link>
        );
      case 'profile':
        return (
          <Link
            href="/prestataire/profile#public"
            className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
          >
            {t('providerOnboardingChecklist.profile.cta', 'Mettre à jour')}
          </Link>
        );
      case 'pricing':
        return (
          <Link
            href="/prestataire/profile#pricing"
            className="rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
          >
            {t('providerOnboardingChecklist.pricing.cta', 'Définir mon tarif')}
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
