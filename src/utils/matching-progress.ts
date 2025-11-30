import type { TFunction } from 'i18next';

export const MATCHING_STAGE_DEFINITIONS = [
  {
    id: 'short_notice',
    labelKey: 'matchingProgress.stage.shortNotice',
    fallbackLabel: 'Diffusion express',
    descriptionKey: 'matchingProgress.stage.shortNoticeDesc',
    fallbackDescription:
      'Invitation simultanée des prestataires disponibles sur votre zone pour les créneaux urgents.',
  },
  {
    id: 'matching',
    labelKey: 'matchingProgress.stage.matching',
    fallbackLabel: 'Matching automatique',
    descriptionKey: 'matchingProgress.stage.matchingDesc',
    fallbackDescription: 'Analyse des disponibilités, scoring et capacités partenaires.',
  },
  {
    id: 'assignment',
    labelKey: 'matchingProgress.stage.assignment',
    fallbackLabel: 'Affectation des équipes',
    descriptionKey: 'matchingProgress.stage.assignmentDesc',
    fallbackDescription: 'Confirmation des prestataires et équipes retenus.',
  },
  {
    id: 'team',
    labelKey: 'matchingProgress.stage.fallback',
    fallbackLabel: 'Planification Ops',
    descriptionKey: 'matchingProgress.stage.fallbackDesc',
    fallbackDescription: 'Escalades, équipes internes ou renforts manuels si nécessaire.',
  },
] as const;

const STATUS_COPY: Record<
  string,
  { labelKey: string; fallback: string; variant: 'positive' | 'warning' | 'neutral' | 'danger' }
> = {
  completed: {
    labelKey: 'matchingProgress.status.completed',
    fallback: 'Terminé',
    variant: 'positive',
  },
  locked: {
    labelKey: 'matchingProgress.status.locked',
    fallback: 'Verrouillé',
    variant: 'positive',
  },
  in_progress: {
    labelKey: 'matchingProgress.status.inProgress',
    fallback: 'En cours',
    variant: 'warning',
  },
  started: {
    labelKey: 'matchingProgress.status.started',
    fallback: 'Démarré',
    variant: 'warning',
  },
  awaiting_client: {
    labelKey: 'matchingProgress.status.awaitingClient',
    fallback: 'En attente client',
    variant: 'warning',
  },
  pending: {
    labelKey: 'matchingProgress.status.pending',
    fallback: 'En attente',
    variant: 'neutral',
  },
  cancelled: {
    labelKey: 'matchingProgress.status.cancelled',
    fallback: 'Annulé',
    variant: 'danger',
  },
  failed: {
    labelKey: 'matchingProgress.status.failed',
    fallback: 'Échec',
    variant: 'danger',
  },
  error: {
    labelKey: 'matchingProgress.status.failed',
    fallback: 'Échec',
    variant: 'danger',
  },
  broadcasted: {
    labelKey: 'matchingProgress.status.broadcasted',
    fallback: 'Invitations envoyées',
    variant: 'warning',
  },
  accepted: {
    labelKey: 'matchingProgress.status.accepted',
    fallback: 'Accepté',
    variant: 'positive',
  },
  declined: {
    labelKey: 'matchingProgress.status.declined',
    fallback: 'Refusé',
    variant: 'neutral',
  },
  no_providers: {
    labelKey: 'matchingProgress.status.noProviders',
    fallback: 'Aucun prestataire',
    variant: 'danger',
  },
};

export const getMatchingStageLabel = (stageId: string, t: TFunction) => {
  const definition = MATCHING_STAGE_DEFINITIONS.find((stage) => stage.id === stageId);
  return definition ? t(definition.labelKey, definition.fallbackLabel) : stageId;
};

export const getMatchingStageDescription = (stageId: string, t: TFunction) => {
  const definition = MATCHING_STAGE_DEFINITIONS.find((stage) => stage.id === stageId);
  return definition ? t(definition.descriptionKey, definition.fallbackDescription) : '';
};

export const resolveMatchingStatusCopy = (
  status: string,
  t: TFunction
): { label: string; variant: 'positive' | 'warning' | 'neutral' | 'danger' } => {
  const meta = STATUS_COPY[status] ?? STATUS_COPY.pending;
  return {
    label: t(meta.labelKey, meta.fallback),
    variant: meta.variant,
  };
};
