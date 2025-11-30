'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SectionDescription,
  SectionTitle,
  SurfaceCard,
  FormField,
  LoadingIndicator,
  Skeleton,
} from '@saubio/ui';
import {
  useRequireRole,
  useAdminProviderTeams,
  useCreateAdminProviderTeamMutation,
  useUpdateAdminProviderTeamMutation,
  useDeleteAdminProviderTeamMutation,
  useAssignFallbackTeamMutation,
  useProviderTeamPlan,
  formatDateTime,
} from '@saubio/utils';
import type { ProviderTeam, ServiceCategory } from '@saubio/models';
import { Plus, Trash2, Edit, Users, CalendarDays, X } from 'lucide-react';

interface TeamFormState {
  ownerId: string;
  name: string;
  description: string;
  serviceCategories: string;
  preferredSize: string;
  notes: string;
  defaultDailyCapacity: string;
  timezone: string;
}

interface MemberFormState {
  providerId: string;
  role: string;
  isLead: boolean;
  orderIndex: number;
}

const emptyTeamForm: TeamFormState = {
  ownerId: '',
  name: '',
  description: '',
  serviceCategories: '',
  preferredSize: '2',
  notes: '',
  defaultDailyCapacity: '',
  timezone: 'Europe/Berlin',
};

const emptyMemberRow = (): MemberFormState => ({ providerId: '', role: '', isLead: false, orderIndex: 0 });

export default function AdminTeamsPage() {
  const session = useRequireRole({ allowedRoles: ['admin', 'employee'] });
  const { t } = useTranslation();
  const [ownerFilter, setOwnerFilter] = useState('');
  const [teamForm, setTeamForm] = useState<TeamFormState>(emptyTeamForm);
  const [memberRows, setMemberRows] = useState<MemberFormState[]>([emptyMemberRow()]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [planTeamId, setPlanTeamId] = useState<string | null>(null);

  const ownerFilterValue = ownerFilter.trim() || undefined;
  const teamsQuery = useAdminProviderTeams(ownerFilterValue);
  const teams = teamsQuery.data ?? [];

  const createMutation = useCreateAdminProviderTeamMutation(ownerFilterValue);
  const updateMutation = useUpdateAdminProviderTeamMutation(ownerFilterValue);
  const deleteMutation = useDeleteAdminProviderTeamMutation(ownerFilterValue);
  const assignFallbackMutation = useAssignFallbackTeamMutation();

  const inputClasses =
    'w-full rounded-2xl border border-saubio-forest/15 px-4 py-2 text-sm text-saubio-forest focus:border-saubio-forest focus:outline-none';

  const sortedTeams = useMemo(() => {
    return teams.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [teams]);
  const planQuery = useProviderTeamPlan(planTeamId);
  const selectedPlanTeam = sortedTeams.find((team) => team.id === planTeamId) ?? null;

  if (!session.user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingIndicator tone="dark" />
      </div>
    );
  }

  const resetForm = () => {
    setTeamForm(emptyTeamForm);
    setMemberRows([emptyMemberRow()]);
    setEditingTeamId(null);
    setFormError(null);
  };

  const applyTeamToForm = (team: ProviderTeam) => {
    setTeamForm({
      ownerId: team.ownerId,
      name: team.name,
      description: team.description ?? '',
      serviceCategories: (team.serviceCategories ?? []).join(', '),
      preferredSize: team.preferredSize ? String(team.preferredSize) : '',
      notes: team.notes ?? '',
      defaultDailyCapacity: team.defaultDailyCapacity ? String(team.defaultDailyCapacity) : '',
      timezone: team.timezone ?? 'Europe/Berlin',
    });
    setMemberRows(
      team.members.length
        ? team.members.map((member) => ({
            providerId: member.providerId,
            role: member.role ?? '',
            isLead: member.isLead,
            orderIndex: member.orderIndex,
          }))
        : [emptyMemberRow()]
    );
    setEditingTeamId(team.id);
  };

  const handleMemberChange = (index: number, key: keyof MemberFormState, value: string | boolean | number) => {
    setMemberRows((rows) =>
      rows.map((row, idx) => (idx === index ? { ...row, [key]: value } : row))
    );
  };

  const addMemberRow = () => {
    setMemberRows((rows) => [...rows, emptyMemberRow()]);
  };

  const removeMemberRow = (index: number) => {
    setMemberRows((rows) => rows.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const ownerId = teamForm.ownerId.trim();
    const name = teamForm.name.trim();
    if (!ownerId || !name) {
      setFormError(t('adminTeamsPage.validation.required', 'Renseignez l’ID du propriétaire et un nom.'));
      return;
    }
    const normalizedMembers = memberRows
      .map((member, orderIndex) => ({
        providerId: member.providerId.trim(),
        role: member.role.trim() || undefined,
        isLead: member.isLead,
        orderIndex: member.orderIndex ?? orderIndex,
      }))
      .filter((member) => member.providerId.length > 0);

    if (!normalizedMembers.length) {
      setFormError(t('adminTeamsPage.validation.members', 'Ajoutez au moins un membre.'));
      return;
    }

    const payload = {
      ownerId,
      name,
      description: teamForm.description.trim() || undefined,
      serviceCategories: teamForm.serviceCategories
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean) as ServiceCategory[],
      preferredSize: teamForm.preferredSize.trim() ? Number(teamForm.preferredSize) : undefined,
      notes: teamForm.notes.trim() || undefined,
      defaultDailyCapacity: teamForm.defaultDailyCapacity.trim()
        ? Number(teamForm.defaultDailyCapacity)
        : undefined,
      timezone: teamForm.timezone.trim() || undefined,
      members: normalizedMembers,
    };

    if (editingTeamId) {
      updateMutation.mutate(
        { id: editingTeamId, payload },
        {
          onSuccess: () => {
            setFeedback(t('adminTeamsPage.feedback.updated', 'Équipe mise à jour.'));
            resetForm();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setFeedback(t('adminTeamsPage.feedback.created', 'Équipe créée.'));
          resetForm();
        },
      });
    }
  };

  const handleDelete = (teamId: string) => {
    if (!window.confirm(t('adminTeamsPage.confirmDelete', 'Supprimer cette équipe ?'))) {
      return;
    }
    deleteMutation.mutate(teamId, {
      onSuccess: () => {
        setFeedback(t('adminTeamsPage.feedback.deleted', 'Équipe supprimée.'));
        if (editingTeamId === teamId) {
          resetForm();
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('adminTeamsPage.title', 'Équipes prestataires')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'adminTeamsPage.subtitle',
            'Centralisez les groupes d’intervention pour faciliter le matching automatique et la planification terrain.'
          )}
        </SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FormField label={t('adminTeamsPage.filters.owner', 'Filtrer par propriétaire')}>
            <input
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              placeholder={t('adminTeamsPage.filters.ownerPlaceholder', 'ID profil prestataire') ?? ''}
              className={inputClasses}
            />
          </FormField>
          {feedback ? <p className="text-xs font-semibold text-saubio-forest">{feedback}</p> : null}
        </div>

        {teamsQuery.isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`team-skeleton-${index}`} className="h-32 rounded-3xl" />
            ))}
          </div>
        ) : teamsQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t('adminTeamsPage.error', 'Impossible de charger les équipes. Réessayez plus tard.')}
          </div>
        ) : sortedTeams.length === 0 ? (
          <p className="text-sm text-saubio-slate/70">
            {t('adminTeamsPage.empty', 'Aucune équipe configurée pour le moment.')}
          </p>
        ) : (
          <div className="space-y-3">
            {sortedTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-3xl border border-saubio-forest/10 bg-white/90 p-4 shadow-soft-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-saubio-forest">{team.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">
                      {t('adminTeamsPage.ownerLabel', { defaultValue: 'Propriétaire #{id}', id: team.ownerId.slice(-6) })}
                    </p>
                    <p className="text-xs text-saubio-slate/70">
                      {team.serviceCategories.length
                        ? team.serviceCategories.join(', ')
                        : t('adminTeamsPage.allServices', 'Tous services')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPlanTeamId(team.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
                    >
                      <CalendarDays className="h-4 w-4" /> {t('adminTeamsPage.planButton', 'Planning')}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTeamToForm(team)}
                      className="inline-flex items-center gap-1 rounded-full border border-saubio-forest/25 px-3 py-1 text-xs font-semibold text-saubio-forest transition hover:border-saubio-forest"
                    >
                      <Edit className="h-4 w-4" /> {t('common.edit', 'Modifier')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(team.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-400"
                    >
                      <Trash2 className="h-4 w-4" /> {t('common.delete', 'Supprimer')}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-saubio-slate/70">
                  <span className="inline-flex items-center gap-1 rounded-full bg-saubio-mist/60 px-3 py-1 font-semibold">
                    <Users className="h-4 w-4" />
                    {t('adminTeamsPage.membersCount', { defaultValue: '{{count}} membre(s)', count: team.members.length })}
                  </span>
                  {team.preferredSize ? (
                    <span className="rounded-full border border-saubio-forest/15 px-3 py-1">
                      {t('adminTeamsPage.preferredSize', {
                        defaultValue: 'Taille cible: {{count}}',
                        count: team.preferredSize,
                      })}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-saubio-forest/15 px-3 py-1">
                    ID: {team.id}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-saubio-slate/80">
                  {team.members.map((member) => (
                    <div key={member.id} className="rounded-2xl border border-saubio-forest/10 px-3 py-2">
                      <span className="font-semibold">{member.providerId}</span>
                      <span className="mx-2 text-saubio-slate/50">·</span>
                      <span>{member.role || t('adminTeamsPage.memberRoleFallback', 'Membre')}</span>
                      {member.isLead ? (
                        <span className="ml-2 rounded-full bg-saubio-moss/10 px-2 py-0.5 text-xs font-semibold text-saubio-forest">
                          {t('adminTeamsPage.leadBadge', 'Lead')}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
                {team.fallbackQueue && team.fallbackQueue.length ? (
                  <div className="mt-4 space-y-2 rounded-2xl border border-saubio-sun/30 bg-saubio-sun/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saubio-slate/60">
                      {t('adminTeamsPage.fallbackQueue.title', 'Escalades en attente')}
                    </p>
                    <ul className="space-y-2">
                      {team.fallbackQueue.map((mission) => {
                        const isAssigning =
                          assignFallbackMutation.isPending && assignFallbackMutation.variables === mission.bookingId;
                        return (
                          <li
                            key={`${team.id}-${mission.bookingId}`}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-saubio-forest/10 bg-white/80 px-3 py-2 text-xs text-saubio-slate/70"
                          >
                            <div>
                              <p className="font-semibold text-saubio-forest">
                                {t('adminTeamsPage.fallbackQueue.missionLabel', {
                                  defaultValue: 'Mission {{id}}',
                                  id: mission.bookingId.slice(-6),
                                })}
                              </p>
                              <p>
                                {t('adminTeamsPage.fallbackQueue.window', {
                                  defaultValue: '{{start}} · {{city}}',
                                  start: formatDateTime(mission.startAt),
                                  city: mission.city ?? t('adminTeamsPage.fallbackQueue.cityFallback', 'Ville inconnue'),
                                })}
                              </p>
                              <p className="text-[11px] uppercase tracking-[0.2em] text-saubio-slate/50">
                                {mission.requestedAt
                                  ? t('adminTeamsPage.fallbackQueue.requestedAt', {
                                      defaultValue: 'Reçu {{date}}',
                                      date: formatDateTime(mission.requestedAt),
                                    })
                                  : t('adminTeamsPage.fallbackQueue.manual', 'Ajout manuel')}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => assignFallbackMutation.mutate(mission.bookingId)}
                              disabled={isAssigning}
                              className="rounded-full border border-saubio-forest/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-saubio-forest transition hover:border-saubio-forest disabled:cursor-not-allowed disabled:border-saubio-slate/20 disabled:text-saubio-slate/50"
                            >
                              {isAssigning
                                ? t('adminTeamsPage.fallbackQueue.assigning', 'Assignation…')
                                : t('adminTeamsPage.fallbackQueue.assign', 'Assigner cette équipe')}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <SectionTitle as="h3">
              {t('adminTeamsPage.plan.title', 'Planning prévisionnel')}
            </SectionTitle>
            <p className="text-xs text-saubio-slate/70">
              {planTeamId && selectedPlanTeam
                ? t('adminTeamsPage.plan.subtitleSelected', {
                    defaultValue: 'Fuseau {{timezone}} · ID {{id}}',
                    timezone: selectedPlanTeam.timezone ?? 'Europe/Berlin',
                    id: selectedPlanTeam.id.slice(-6),
                  })
                : t('adminTeamsPage.plan.subtitle', 'Sélectionnez une équipe pour visualiser les capacités.')}
            </p>
          </div>
          {planTeamId ? (
            <button
              type="button"
              onClick={() => setPlanTeamId(null)}
              className="inline-flex items-center gap-1 rounded-full border border-saubio-forest/25 px-3 py-1 text-xs font-semibold text-saubio-forest"
            >
              <X className="h-4 w-4" /> {t('common.close', 'Fermer')}
            </button>
          ) : null}
        </div>
        {!planTeamId ? (
          <p className="text-sm text-saubio-slate/70">
            {t(
              'adminTeamsPage.plan.empty',
              'Cliquez sur “Planning” dans la liste des équipes pour charger leurs capacités sur les prochains jours.'
            )}
          </p>
        ) : planQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-saubio-slate/70">
            <LoadingIndicator tone="dark" /> {t('common.loading', 'Chargement…')}
          </div>
        ) : planQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {t('adminTeamsPage.plan.error', 'Impossible de charger le planning. Réessayez plus tard.')}
          </div>
        ) : planQuery.data?.days.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {planQuery.data.days.slice(0, 6).map((day) => (
              <div key={day.id} className="rounded-3xl border border-saubio-forest/10 bg-white/80 p-4 shadow-soft-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-saubio-forest">
                      {formatDateTime(day.date, { dateStyle: 'full' })}
                    </p>
                    <p className="text-xs text-saubio-slate/70">
                      {t('adminTeamsPage.plan.capacity', {
                        defaultValue: '{{booked}} / {{total}} réservations',
                        booked: day.capacityBooked,
                        total: day.capacitySlots,
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-saubio-mist/70 px-3 py-1 text-xs font-semibold text-saubio-forest">
                    {t('adminTeamsPage.plan.remaining', {
                      defaultValue: '{{count}} dispo',
                      count: Math.max(day.capacitySlots - day.capacityBooked, 0),
                    })}
                  </span>
                </div>
                {day.slots.length ? (
                  <ul className="mt-2 space-y-1 text-xs text-saubio-slate/80">
                    {day.slots.slice(0, 3).map((slot) => (
                      <li
                        key={slot.id}
                        className="flex items-center justify-between rounded-2xl bg-saubio-mist/40 px-3 py-1"
                      >
                        <span>
                          {formatDateTime(slot.startAt, { timeStyle: 'short' })} –{' '}
                          {formatDateTime(slot.endAt, { timeStyle: 'short' })}
                        </span>
                        <span className="font-semibold text-saubio-forest">
                          {slot.booked}/{slot.capacity}
                        </span>
                      </li>
                    ))}
                    {day.slots.length > 3 ? (
                      <li className="text-[11px] uppercase tracking-[0.2em] text-saubio-slate/60">
                        {t('adminTeamsPage.plan.moreSlots', {
                          defaultValue: '+{{count}} créneaux supplémentaires',
                          count: day.slots.length - 3,
                        })}
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-saubio-slate/60">
                    {t('adminTeamsPage.plan.noSlots', 'Aucun verrouillage pour cette journée.')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-saubio-slate/70">
            {t('adminTeamsPage.plan.noData', 'Aucune capacité disponible sur la période sélectionnée.')}
          </p>
        )}
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="lg" className="space-y-5">
        <div className="space-y-1">
          <SectionTitle as="h2">
            {editingTeamId
              ? t('adminTeamsPage.form.titleEdit', 'Modifier une équipe')
              : t('adminTeamsPage.form.titleCreate', 'Créer une équipe')}
          </SectionTitle>
          <p className="text-xs text-saubio-slate/70">
            {t(
              'adminTeamsPage.form.subtitle',
              'Associez les prestataires qui travaillent régulièrement ensemble pour accélérer les matchings.'
            )}
          </p>
          {formError ? <p className="text-xs font-semibold text-red-600">{formError}</p> : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={t('adminTeamsPage.form.ownerId', 'ID propriétaire')} requiredMark>
              <input
                value={teamForm.ownerId}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, ownerId: event.target.value }))}
                className={inputClasses}
              />
            </FormField>
            <FormField label={t('adminTeamsPage.form.name', 'Nom de l’équipe')} requiredMark>
              <input
                value={teamForm.name}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, name: event.target.value }))}
                className={inputClasses}
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={t('adminTeamsPage.form.description', 'Description')}>
              <input
                value={teamForm.description}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, description: event.target.value }))}
                className={inputClasses}
              />
            </FormField>
            <FormField label={t('adminTeamsPage.form.services', 'Services couverts')} hint={t('adminTeamsPage.form.servicesHint', 'Séparez par des virgules')}>
              <input
                value={teamForm.serviceCategories}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, serviceCategories: event.target.value }))}
                className={inputClasses}
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={t('adminTeamsPage.form.preferredSize', 'Taille cible')}>
              <input
                type="number"
                min={1}
                max={20}
                value={teamForm.preferredSize}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, preferredSize: event.target.value }))}
                className={inputClasses}
              />
            </FormField>
            <FormField label={t('adminTeamsPage.form.notes', 'Notes ops')}>
              <input
                value={teamForm.notes}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, notes: event.target.value }))}
                className={inputClasses}
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label={t('adminTeamsPage.form.dailyCapacity', 'Capacité quotidienne')}
              hint={t('adminTeamsPage.form.dailyCapacityHint', 'Nombre max. d’intervenants que l’équipe accepte par jour')}
            >
              <input
                type="number"
                min={1}
                max={50}
                value={teamForm.defaultDailyCapacity}
                onChange={(event) =>
                  setTeamForm((prev) => ({ ...prev, defaultDailyCapacity: event.target.value }))
                }
                className={inputClasses}
              />
            </FormField>
            <FormField label={t('adminTeamsPage.form.timezone', 'Fuseau horaire')}>
              <input
                value={teamForm.timezone}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, timezone: event.target.value }))}
                placeholder="Europe/Berlin"
                className={inputClasses}
              />
            </FormField>
          </div>

          <div className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/90 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-saubio-forest">
                {t('adminTeamsPage.form.membersTitle', 'Membres de l’équipe')}
              </p>
              <button
                type="button"
                onClick={addMemberRow}
                className="inline-flex items-center gap-1 rounded-full border border-saubio-forest/30 px-3 py-1 text-xs font-semibold text-saubio-forest"
              >
                <Plus className="h-4 w-4" /> {t('adminTeamsPage.form.addMember', 'Ajouter')}
              </button>
            </div>
            {memberRows.map((member, index) => (
              <div key={`member-${index}`} className="grid gap-3 md:grid-cols-[1.2fr,1fr,0.6fr,auto]">
                <input
                  value={member.providerId}
                  onChange={(event) => handleMemberChange(index, 'providerId', event.target.value)}
                  placeholder={t('adminTeamsPage.form.memberId', 'ID prestataire') ?? ''}
                  className={inputClasses}
                />
                <input
                  value={member.role}
                  onChange={(event) => handleMemberChange(index, 'role', event.target.value)}
                  placeholder={t('adminTeamsPage.form.memberRole', 'Rôle (ex: spécialiste vitres)') ?? ''}
                  className={inputClasses}
                />
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 text-xs text-saubio-slate/70">
                    <input
                      type="checkbox"
                      checked={member.isLead}
                      onChange={(event) => handleMemberChange(index, 'isLead', event.target.checked)}
                    />
                    {t('adminTeamsPage.form.lead', 'Lead')}
                  </label>
                  <input
                    type="number"
                    value={member.orderIndex}
                    onChange={(event) => handleMemberChange(index, 'orderIndex', Number(event.target.value))}
                    className="w-16 rounded-2xl border border-saubio-forest/15 px-2 py-1 text-sm"
                    min={0}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeMemberRow(index)}
                    disabled={memberRows.length === 1}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-full bg-saubio-forest px-6 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-50"
            >
              {editingTeamId
                ? t('adminTeamsPage.form.submitEdit', 'Mettre à jour')
                : t('adminTeamsPage.form.submitCreate', 'Créer l’équipe')}
            </button>
            {editingTeamId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-saubio-forest/25 px-6 py-2 text-sm font-semibold text-saubio-forest"
              >
                {t('common.cancel', 'Annuler')}
              </button>
            ) : null}
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}
