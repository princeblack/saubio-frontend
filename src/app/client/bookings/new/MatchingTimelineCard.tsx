'use client';

import { useTranslation } from 'react-i18next';
import { SurfaceCard, Pill } from '@saubio/ui';

type MatchingTimelineCardProps = {
  isSmartMatch: boolean;
  hasFilters: boolean;
  suggestionsLoading: boolean;
  suggestionsError: boolean;
  suggestionsCount: number;
  teamSelectedName?: string;
  teamCount: number;
  manualSelectionPending: boolean;
  requiredProviders: number;
  pendingSelectionCount: number;
  stageOverrides?: Record<string, { status: string; count?: number }>;
};

export function MatchingTimelineCard({
  isSmartMatch,
  hasFilters,
  suggestionsLoading,
  suggestionsError,
  suggestionsCount,
  teamSelectedName,
  teamCount,
  manualSelectionPending,
  requiredProviders,
  pendingSelectionCount,
  stageOverrides,
}: MatchingTimelineCardProps) {
  const { t } = useTranslation();
  const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

  const mapOverrideStatus = (value: string): 'completed' | 'in_progress' | 'alert' | 'pending' => {
    switch (value) {
      case 'completed':
        return 'completed';
      case 'started':
        return 'in_progress';
      case 'error':
        return 'alert';
      default:
        return 'pending';
    }
  };

  const steps = [
    {
      id: 'filters',
      label: t('bookingForm.matching.steps.filters', '1. Pré-analyse'),
      description: hasFilters
        ? t('bookingForm.matching.filtersReady', 'Ville, surface et créneau renseignés.')
        : t('bookingForm.matching.filtersMissing', 'Complétez votre adresse et vos horaires.'),
      status: hasFilters ? 'completed' : 'pending',
    },
    {
      id: 'suggestions',
      label: t('bookingForm.matching.steps.providers', '2. Suggestions prestataires'),
      description: suggestionsError
        ? t('bookingForm.matching.providersError', 'Impossible de charger les partenaires pour le moment.')
        : suggestionsLoading
          ? t('bookingForm.matching.providersLoading', 'Analyse des disponibilités…')
          : suggestionsCount > 0
            ? t('bookingForm.matching.providersReady', '{{count}} partenaire(s) disponible(s).', {
                count: suggestionsCount,
              })
            : t('bookingForm.matching.providersEmpty', 'Aucun prestataire compatible – essayez un autre créneau.'),
      status: suggestionsError
        ? 'alert'
        : suggestionsLoading
          ? 'in_progress'
          : suggestionsCount > 0
            ? 'completed'
            : hasFilters
              ? 'pending'
              : 'pending',
    },
    {
      id: 'team',
      label: t('bookingForm.matching.steps.team', '3. Fallback équipe'),
      description: teamSelectedName
        ? t('bookingForm.matching.teamSelected', 'Équipe {{name}} sélectionnée.', { name: teamSelectedName })
        : teamCount > 0
          ? t('bookingForm.matching.teamAvailable', 'Équipe Saubio disponible en renfort.')
          : t('bookingForm.matching.teamEmpty', 'Aucune équipe prête. Notre support peut en activer une.'),
      status: teamSelectedName ? 'completed' : teamCount > 0 ? 'in_progress' : 'pending',
    },
  ];

  const modeBadgeText = isSmartMatch
    ? t('bookingForm.matching.mode.smart', 'Mode Smart Match')
    : t('bookingForm.matching.mode.manual', 'Sélection manuelle');

  return (
    <SurfaceCard variant="soft" padding="md">
      <div className="flex flex-col gap-2 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('bookingForm.matching.title', 'Matching automatique')}
          </h2>
          <Pill tone={isSmartMatch ? 'forest' : 'sun'}>{modeBadgeText}</Pill>
        </div>
        <p className="text-xs text-saubio-slate/70">
          {isSmartMatch
            ? t(
                'bookingForm.matching.subtitle.smart',
                'Nous trouvons pour vous les meilleurs prestataires dans la zone sélectionnée.'
              )
            : t(
                'bookingForm.matching.subtitle.manual',
                'Choisissez vos intervenants. Sélectionnez au moins {{count}} profil(s).',
                { count: requiredProviders }
              )}
        </p>
      </div>
      <ol className="space-y-3 text-sm">
        {steps.map((step) => {
          const override = stageOverrides?.[step.id];
          const currentStatus = override?.status ? mapOverrideStatus(override.status) : step.status;
          const count =
            typeof override?.count === 'number' ? override.count : step.id === 'suggestions' ? suggestionsCount : undefined;
          const description =
            step.id === 'suggestions' && typeof count === 'number'
              ? count > 0
                ? t('bookingForm.matching.providersReady', { count })
                : t(
                    'bookingForm.matching.providersEmpty',
                    'Aucun partenaire n’est disponible sur ce créneau. Essayez un autre horaire ou contactez notre équipe.'
                  )
              : step.description;
          return (
            <li
              key={step.id}
              className={cx(
                'rounded-2xl border px-4 py-3',
                currentStatus === 'completed'
                  ? 'border-saubio-forest/20 bg-white'
                  : currentStatus === 'in_progress'
                    ? 'border-saubio-sun/40 bg-saubio-sun/10'
                    : currentStatus === 'alert'
                      ? 'border-red-300 bg-red-50'
                      : 'border-saubio-mist/40 bg-white/70'
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-saubio-forest">{step.label}</p>
                <span
                  className={cx(
                    'text-[0.65rem] font-semibold uppercase tracking-[0.2em]',
                    currentStatus === 'completed'
                      ? 'text-saubio-forest'
                      : currentStatus === 'in_progress'
                        ? 'text-saubio-sun'
                        : currentStatus === 'alert'
                          ? 'text-red-600'
                          : 'text-saubio-slate/50'
                  )}
                >
                  {currentStatus === 'completed'
                    ? t('bookingForm.matching.status.completed', 'OK')
                    : currentStatus === 'in_progress'
                      ? t('bookingForm.matching.status.progress', 'En cours')
                      : currentStatus === 'alert'
                        ? t('bookingForm.matching.status.alert', 'Action requise')
                        : t('bookingForm.matching.status.pending', 'À venir')}
                </span>
              </div>
              <p className="mt-1 text-xs text-saubio-slate/70">{description}</p>
            </li>
          );
        })}
      </ol>
      {!isSmartMatch && manualSelectionPending ? (
        <div className="mt-3 rounded-2xl border border-saubio-sun/40 bg-saubio-sun/10 p-3 text-xs text-saubio-forest">
          {t(
            'bookingForm.matching.manualReminder',
            'Sélectionnez encore {{count}} prestataire(s) pour finaliser.',
            {
              count: pendingSelectionCount,
              defaultValue: `Sélectionnez ${pendingSelectionCount} prestataire(s).`,
            }
          )}
        </div>
      ) : null}
    </SurfaceCard>
  );
}
