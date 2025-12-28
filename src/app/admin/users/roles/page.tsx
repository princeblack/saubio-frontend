'use client';

import { SurfaceCard, Skeleton } from '@saubio/ui';
import { ShieldCheck } from 'lucide-react';
import { useAdminRoles } from '@saubio/utils';
import { ErrorState } from '../../../../components/feedback/ErrorState';

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
  const { data, isLoading, isError } = rolesQuery;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Utilisateurs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Rôles & permissions</h1>
        <p className="text-sm text-saubio-slate/70">Aperçu des rôles disponibles et des comptes administrateurs actifs.</p>
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

      <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Administrateurs</p>
          <span className="text-xs text-saubio-slate/60">Accès complet</span>
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
                  <td className="px-3 py-2">{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-3 py-2">
                    {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString('fr-FR') : 'Jamais'}
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
    </div>
  );
}
