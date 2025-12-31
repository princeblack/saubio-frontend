'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { SurfaceCard, Skeleton, PrimaryButton } from '@saubio/ui';
import { ShieldCheck, KeyRound, Users, AlertTriangle, Check, X } from 'lucide-react';
import {
  formatDateTime,
  useAdminRoles,
  useAdminEmployees,
  useAdminSecurityLogs,
  useUpdateEmployeeRoleMutation,
} from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';
import { SuccessToast } from '../../../../components/system/SuccessToast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'invited', label: 'Invitations' },
  { value: 'suspended', label: 'Suspendus' },
];

const ROLE_FILTERS = [
  { value: 'all', label: 'Tous les rôles' },
  { value: 'employee', label: 'Employés' },
  { value: 'admin', label: 'Admins' },
];

const ROLE_COLUMN_ORDER = [
  { id: 'client', label: 'Client' },
  { id: 'provider', label: 'Prestataire' },
  { id: 'employee', label: 'Employé' },
  { id: 'admin', label: 'Admin' },
];

const statusTone = (status: string) => {
  if (status === 'active') return 'border-emerald-500 text-emerald-700';
  if (status === 'invited') return 'border-amber-500 text-amber-900';
  return 'border-rose-500 text-rose-700';
};

const statusLabel = (status: string) => {
  if (status === 'active') return 'Actif';
  if (status === 'invited') return 'Invitation';
  return 'Suspendu';
};

export default function AdminRolesPage() {
  const rolesQuery = useAdminRoles();
  const [employeeFilters, setEmployeeFilters] = useState({
    page: 1,
    pageSize: 15,
    status: 'all',
    role: 'all',
    search: '',
  });
  const employeesQuery = useAdminEmployees({
    page: employeeFilters.page,
    pageSize: employeeFilters.pageSize,
    status: employeeFilters.status !== 'all' ? employeeFilters.status : undefined,
    search: employeeFilters.search || undefined,
    role: employeeFilters.role !== 'all' ? employeeFilters.role : undefined,
  });
  const logsQuery = useAdminSecurityLogs({ category: 'permissions', page: 1, limit: 8 });
  const updateRole = useUpdateEmployeeRoleMutation();

  const [roleDialog, setRoleDialog] = useState<{
    user: { id: string; name: string; role: string; accessRole: string } | null;
    newRole: 'admin' | 'employee';
    reason: string;
  }>({ user: null, newRole: 'employee', reason: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = rolesQuery;
  const employeeData = employeesQuery.data;
  const totalPages = employeeData ? Math.max(1, Math.ceil(employeeData.total / employeeData.pageSize)) : 1;
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: undefined,
      }),
    []
  );

  const openRoleDialog = (user: { id: string; name: string; role: string; accessRole: string }) => {
    setRoleDialog({
      user,
      newRole: user.accessRole === 'admin' ? 'admin' : 'employee',
      reason: '',
    });
  };

  const closeDialog = () => {
    setRoleDialog({ user: null, newRole: 'employee', reason: '' });
  };

  const handleRoleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roleDialog.user) {
      return;
    }
    updateRole.mutate(
      {
        id: roleDialog.user.id,
        payload: {
          role: roleDialog.newRole,
          reason: roleDialog.reason,
        },
      },
      {
        onSuccess: () => {
          setToastMessage('Accès mis à jour avec succès.');
          closeDialog();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Utilisateurs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Rôles & permissions</h1>
        <p className="text-sm text-saubio-slate/70">
          Qui a accès à quoi dans l’admin Saubio, avec matrice des droits et audit en temps réel.
        </p>
      </header>

      {isError ? (
        <ErrorState
          title="Impossible de charger les rôles"
          description="Un incident empêche l’affichage des données."
          onRetry={() => rolesQuery.refetch()}
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {isLoading && !data
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={`roles-skeleton-${index}`} className="h-32 rounded-3xl" />)
          : data?.roles.map((role) => (
              <SurfaceCard key={role.role} className="flex flex-col gap-3 rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{role.role}</p>
                    <p className="text-3xl font-semibold text-saubio-forest">{role.userCount}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-forest/10 text-saubio-forest">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-sm text-saubio-slate/70">{role.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
                  {role.permissions.map((permission) => (
                    <span key={permission} className="rounded-full bg-saubio-mist px-3 py-1">
                      {permission}
                    </span>
                  ))}
                </div>
              </SurfaceCard>
            ))}
      </section>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-saubio-forest">
              <KeyRound className="h-4 w-4" />
              Matrice des autorisations
            </div>
            <p className="text-xs text-saubio-slate/60">
              Revue légale {data?.lastReviewedAt ? formatDateTime(data.lastReviewedAt) : 'n/a'}.
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">Visibilité centralisée</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Capacité</th>
                <th className="px-3 py-2 text-left font-semibold">Description</th>
                {ROLE_COLUMN_ORDER.map((role) => (
                  <th key={role.id} className="px-3 py-2 text-left font-semibold">
                    {role.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`matrix-skel-${index}`}>
                      <td colSpan={ROLE_COLUMN_ORDER.length + 2} className="px-3 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : data?.permissionMatrix.map((entry) => (
                    <tr key={entry.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-3 font-semibold text-saubio-forest">
                        <p>{entry.label}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/50">{entry.category}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-saubio-slate/70">{entry.description}</td>
                      {ROLE_COLUMN_ORDER.map((role) => {
                        const access = entry.roles.find((item) => item.role === role.id);
                        const allowed = access?.allowed ?? false;
                        const scope = access?.scope;
                        return (
                          <td key={`${entry.id}-${role.id}`} className="px-3 py-3 text-xs">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${
                                allowed
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}
                            >
                              {allowed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {allowed ? 'Oui' : 'Non'}
                            </span>
                            {allowed && scope ? (
                              <p className="mt-1 text-[11px] text-saubio-slate/60">{scope}</p>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Administrateurs</p>
            <p className="text-xs text-saubio-slate/60">Accès complet.</p>
          </div>
          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-saubio-slate/60">
            <Users className="h-4 w-4" />
            {data?.adminAccounts.length ?? 0}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Email</th>
                <th className="px-3 py-2 text-left font-semibold">Création</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière connexion</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data
                ? Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`admins-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td colSpan={5} className="px-3 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {data?.adminAccounts.map((admin) => (
                <tr key={admin.id} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{admin.name}</td>
                  <td className="px-3 py-2">{admin.email}</td>
                  <td className="px-3 py-2">{admin.createdAt ? dateFormatter.format(new Date(admin.createdAt)) : '—'}</td>
                  <td className="px-3 py-2">
                    {admin.lastLoginAt ? dateFormatter.format(new Date(admin.lastLoginAt)) : 'Jamais'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusTone(admin.status)}`}>
                      {statusLabel(admin.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {data && data.adminAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-saubio-slate/60">
                    Aucun administrateur enregistré.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg lg:col-span-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-saubio-forest">Employés & accès back-office</p>
              <p className="text-xs text-saubio-slate/60">Filtrez par statut, rôle et recherchez par email.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-saubio-slate/70">
              <input
                type="text"
                value={employeeFilters.search}
                placeholder="Recherche : nom, email..."
                onChange={(event) =>
                  setEmployeeFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                    page: 1,
                  }))
                }
                className="rounded-full border border-saubio-forest/10 px-3 py-1"
              />
              <select
                value={employeeFilters.status}
                onChange={(event) =>
                  setEmployeeFilters((prev) => ({
                    ...prev,
                    status: event.target.value,
                    page: 1,
                  }))
                }
                className="rounded-full border border-saubio-forest/10 px-3 py-1"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={employeeFilters.role}
                onChange={(event) =>
                  setEmployeeFilters((prev) => ({
                    ...prev,
                    role: event.target.value,
                    page: 1,
                  }))
                }
                className="rounded-full border border-saubio-forest/10 px-3 py-1"
              >
                {ROLE_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Nom</th>
                  <th className="px-3 py-2 text-left font-semibold">Email</th>
                  <th className="px-3 py-2 text-left font-semibold">Fonction</th>
                  <th className="px-3 py-2 text-left font-semibold">Accès</th>
                  <th className="px-3 py-2 text-left font-semibold">Création</th>
                  <th className="px-3 py-2 text-left font-semibold">Dernière connexion</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeesQuery.isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`employee-skel-${index}`} className="border-b border-saubio-forest/5">
                        <td colSpan={7} className="px-3 py-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!employeesQuery.isLoading && employeeData?.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-saubio-slate/60">
                      Aucun compte interne ne correspond à vos filtres.
                    </td>
                  </tr>
                ) : null}
                {employeeData?.items.map((employee) => (
                  <tr key={employee.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-3 font-semibold text-saubio-forest">{employee.name}</td>
                    <td className="px-3 py-3">{employee.email}</td>
                    <td className="px-3 py-3 capitalize">{employee.role}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          employee.accessRole === 'admin'
                            ? 'bg-saubio-forest/10 text-saubio-forest border border-saubio-forest/30'
                            : 'bg-saubio-mist text-saubio-slate border border-saubio-forest/10'
                        }`}
                      >
                        {employee.accessRole === 'admin' ? 'Admin' : 'Employé'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{dateFormatter.format(new Date(employee.createdAt))}</td>
                    <td className="px-3 py-3">
                      {employee.lastLoginAt ? dateFormatter.format(new Date(employee.lastLoginAt)) : 'Jamais'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusTone(employee.status)}`}>
                        {statusLabel(employee.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <button
                        type="button"
                        onClick={() => openRoleDialog(employee)}
                        className="rounded-full border border-saubio-forest/20 px-3 py-1 font-semibold text-saubio-forest hover:border-saubio-forest/60"
                      >
                        Modifier le rôle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-saubio-slate/70">
            <p>
              Page {employeeFilters.page} / {totalPages} — {employeeData?.total ?? 0} comptes
            </p>
            <div className="flex items-center gap-2">
              <PrimaryButton
                variant="outline"
                disabled={employeeFilters.page <= 1}
                onClick={() =>
                  setEmployeeFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
              >
                Précédent
              </PrimaryButton>
              <PrimaryButton
                variant="outline"
                disabled={employeeFilters.page >= totalPages}
                onClick={() =>
                  setEmployeeFilters((prev) => ({
                    ...prev,
                    page: Math.min(totalPages, prev.page + 1),
                  }))
                }
              >
                Suivant
              </PrimaryButton>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
          <div className="flex items-center gap-2 text-sm font-semibold text-saubio-forest">
            <AlertTriangle className="h-4 w-4" />
            Traçabilité permissions
          </div>
          <p className="text-xs text-saubio-slate/60">Dernières actions catégorisées “permissions”.</p>
          <div className="space-y-3">
            {logsQuery.isLoading
              ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={`log-skel-${index}`} className="h-16 w-full" />)
              : null}
            {!logsQuery.isLoading && logsQuery.data?.items.length === 0 ? (
              <p className="rounded-2xl bg-saubio-mist/60 px-3 py-4 text-sm text-saubio-slate/60">
                Aucun log sur cette période.
              </p>
            ) : null}
            {logsQuery.data?.items.map((log) => (
              <div key={log.id} className="rounded-2xl border border-saubio-forest/10 bg-white/70 p-3">
                <p className="text-sm font-semibold text-saubio-forest">{log.message}</p>
                <p className="text-xs text-saubio-slate/60">{log.actorEmail ?? 'Système'} · {formatDateTime(log.createdAt)}</p>
                {log.metadata && log.metadata.reason ? (
                  <p className="mt-1 text-xs text-saubio-slate/70">Motif: {String(log.metadata.reason)}</p>
                ) : null}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      {roleDialog.user ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft-lg">
            <h2 className="text-lg font-semibold text-saubio-forest">Modifier le rôle</h2>
            <p className="text-xs text-saubio-slate/60">
              {roleDialog.user.name} — {roleDialog.user.role} ({roleDialog.user.accessRole})
            </p>
            <form onSubmit={handleRoleSubmit} className="mt-4 space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
                <span className="mb-1 block">Nouveau rôle</span>
                <select
                  value={roleDialog.newRole}
                  onChange={(event) =>
                    setRoleDialog((prev) => ({
                      ...prev,
                      newRole: event.target.value as 'admin' | 'employee',
                    }))
                  }
                  className="w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
                >
                  <option value="employee">Employé</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/70">
                <span className="mb-1 block">Motif</span>
                <textarea
                  required
                  minLength={3}
                  value={roleDialog.reason}
                  onChange={(event) =>
                    setRoleDialog((prev) => ({
                      ...prev,
                      reason: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Ex : extension périmètre RGPD"
                  className="w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
                />
              </label>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-full border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-slate/70"
                >
                  Annuler
                </button>
                <PrimaryButton type="submit" disabled={updateRole.isPending}>
                  {updateRole.isPending ? 'Mise à jour…' : 'Confirmer'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <SuccessToast open={Boolean(toastMessage)} message={toastMessage ?? undefined} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
