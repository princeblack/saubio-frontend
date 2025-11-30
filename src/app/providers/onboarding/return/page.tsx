'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { SectionDescription, SectionTitle, SurfaceCard } from '@saubio/ui';

export default function ProviderOnboardingReturnPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-6 px-4">
      <header className="space-y-3 text-center">
        <SectionTitle as="h1" size="large">
          {t('providerOnboarding.return.title', 'Informations vérifiées')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'providerOnboarding.return.subtitle',
            'Merci d’avoir complété votre vérification de paiement. Vous pouvez revenir sur votre espace prestataire pour continuer.'
          )}
        </SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="lg" className="space-y-4 text-center">
        <p className="text-sm text-saubio-slate/80">
          {t(
            'providerOnboarding.return.message',
            'Notre partenaire paiement vérifie vos informations. Ce processus peut prendre quelques minutes. Vous recevrez un e-mail de confirmation lorsque votre statut sera mis à jour.'
          )}
        </p>

        <Link
          href="/prestataire/revenus"
          className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-saubio-moss"
        >
          {t('providerOnboarding.return.cta', 'Revenir à mon espace')}
        </Link>
      </SurfaceCard>
    </div>
  );
}
