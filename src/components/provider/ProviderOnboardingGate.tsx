'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProviderOnboardingStatus, useSession } from '@saubio/utils';
import { LoadingIndicator } from '@saubio/ui';

const CORE_TASKS = new Set(['identity', 'address', 'phone']);
const SOFT_ALLOWED_PREFIXES = [
  '/prestataire/onboarding',
  '/prestataire/onboarding/identity',
  '/prestataire/profile',
];

interface ProviderOnboardingGateProps {
  children: ReactNode;
}

export const ProviderOnboardingGate = ({ children }: ProviderOnboardingGateProps) => {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasProviderRole = session.user?.roles.includes('provider');
  const statusQuery = useProviderOnboardingStatus(Boolean(hasProviderRole));

  const pendingCoreTask = useMemo(() => {
    if (!statusQuery.data) {
      return undefined;
    }
    return statusQuery.data.tasks.find(
      (task) => CORE_TASKS.has(task.id) && task.status !== 'completed'
    );
  }, [statusQuery.data]);

  useEffect(() => {
    if (!hasProviderRole || statusQuery.isLoading || !statusQuery.data) {
      return;
    }
    const status = statusQuery.data;
    const isWizardRoute = pathname?.startsWith('/register/provider');
    const isChecklistRoute = pathname?.startsWith('/prestataire/onboarding');
    const isSoftAllowed = Boolean(
      pathname && SOFT_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    );

    if (pendingCoreTask) {
      if (!isWizardRoute && !isSoftAllowed) {
        const target = `/register/provider?step=${pendingCoreTask.id}`;
        router.replace(target);
      }
      return;
    }

    if (!status.allCompleted && !isChecklistRoute && !isSoftAllowed) {
      router.replace('/prestataire/onboarding');
    }
  }, [
    hasProviderRole,
    statusQuery.isLoading,
    statusQuery.data,
    pendingCoreTask,
    pathname,
    router,
  ]);

  if (!hasProviderRole) {
    return <>{children}</>;
  }

  if (statusQuery.isLoading || statusQuery.isFetching) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingIndicator tone="dark" size="md" />
      </div>
    );
  }

  if (!statusQuery.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-saubio-slate/70">
        Impossible de charger votre statut d’onboarding.
      </div>
    );
  }

  const status = statusQuery.data;
  const isWizardRoute = pathname?.startsWith('/register/provider');
  const isChecklistRoute = pathname?.startsWith('/prestataire/onboarding');
  const isSoftAllowed = Boolean(
    pathname && SOFT_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );

  if (pendingCoreTask && !isWizardRoute) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingIndicator tone="dark" size="md" />
      </div>
    );
  }

  if (!pendingCoreTask && !status.allCompleted && !isChecklistRoute && !isSoftAllowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingIndicator tone="dark" size="md" />
      </div>
    );
  }

  return <>{children}</>;
};
