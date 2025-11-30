'use client';

import Link from 'next/link';
import { SectionDescription, SectionTitle, SurfaceCard } from '@saubio/ui';
import { useRequireRole } from '@saubio/utils';
import { useTranslation } from 'react-i18next';

export default function ProviderStatsPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });

  if (!session.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerStatsPage.title', 'Statistiques et avis')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'providerStatsPage.subtitle',
            'Suivez votre fiabilité, vos évaluations clients et vos revenus clés pour améliorer votre performance.'
          )}
        </SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="lg" className="space-y-4 border border-saubio-mist/60">
        <p className="text-sm text-saubio-slate/80">
          {t(
            'providerStatsPage.comingSoon',
            'Le tableau de statistiques arrive bientôt : fiabilité, taux de réponse, avis détaillés et tendances de revenus.'
          )}
        </p>
        <p className="text-xs text-saubio-slate/60">
          {t(
            'providerStatsPage.betaNotice',
            'Vous pouvez déjà consulter vos revenus actuels dans la rubrique “Revenus”. Les avis clients seront affichés ici très prochainement.'
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/prestataire/revenus"
            className="inline-flex items-center justify-center rounded-full border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
          >
            {t('providerStatsPage.cta.revenue', 'Consulter mes revenus')}
          </Link>
          <Link
            href="/prestataire/ressources"
            className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-saubio-moss"
          >
            {t('providerStatsPage.cta.resources', 'Voir les bonnes pratiques')}
          </Link>
        </div>
      </SurfaceCard>
      <SurfaceCard
        id="reviews"
        variant="soft"
        padding="lg"
        className="space-y-3 border border-saubio-mist/60"
      >
        <p className="text-sm font-semibold text-saubio-forest">
          {t('providerStatsPage.reviewsTitle', 'Avis clients')}
        </p>
        <p className="text-sm text-saubio-slate/70">
          {t(
            'providerStatsPage.reviewsDescription',
            'Vous pourrez bientôt consulter et répondre à vos avis directement depuis cette page.'
          )}
        </p>
        <p className="text-xs text-saubio-slate/60">
          {t('providerStatsPage.reviewsHint', 'Suivi détaillé disponible dans une prochaine mise à jour.')}
        </p>
      </SurfaceCard>
    </div>
  );
}
