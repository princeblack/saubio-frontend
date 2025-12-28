'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAdminUsers,
  useUpdateAdminUserMutation,
  useRequireRole,
  formatDateTime,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton, Pill } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

const roleOptions = ['all', 'client', 'provider', 'company', 'employee', 'admin'] as const;
const statusOptions = ['all', 'active', 'invited', 'suspended'] as const;

type RoleOption = (typeof roleOptions)[number];
type StatusOption = (typeof statusOptions)[number];

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['employee'] });
  const [roleFilter, setRoleFilter] = useState<RoleOption>('all');
  const [statusFilter, setStatusFilter] = useState<StatusOption>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const usersQuery = useAdminUsers({
    role: roleFilter,
    status: statusFilter,
    search: search.trim() || undefined,
  });
  const updateMutation = useUpdateAdminUserMutation({
    role: roleFilter,
    status: statusFilter,
    search: search.trim() || undefined,
  });

  if (!session.user) {
    return null;
  }

  const handleAction = (id: string, status: 'active' | 'suspended') => {
    setFeedback(null);
    updateMutation.mutate(
      { id, payload: { status } },
      {
        onSuccess: (_user, variables) => {
          const key = status === 'active' ? 'toast.activated' : 'toast.suspended';
          setFeedback(t(`adminUsers.${key}`));
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('adminUsers.title')}
        </SectionTitle>
        <SectionDescription>{t('adminUsers.subtitle')}</SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('adminUsers.filters.search') ?? ''}
            className="w-full max-w-xs rounded-full border border-saubio-forest/15 bg-white px-4 py-2 outline-none transition focus:border-saubio-forest"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as RoleOption)}
            className="rounded-full border border-saubio-forest/15 bg-white px-4 py-2 outline-none transition focus:border-saubio-forest"
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {t(`adminUsers.role.${option}`)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusOption)}
            className="rounded-full border border-saubio-forest/15 bg-white px-4 py-2 outline-none transition focus:border-saubio-forest"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {t(`adminUsers.status.${option}`)}
              </option>
            ))}
          </select>
        </div>

        {feedback ? (
          <p className="text-xs font-semibold text-emerald-600">{feedback}</p>
        ) : null}

        {usersQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`user-skeleton-${index}`} className="h-14 rounded-3xl" />
            ))}
          </div>
        ) : usersQuery.isError ? (
          <ErrorState
            title={t('adminDashboard.errorTitle', t('bookingDashboard.errorTitle'))}
            description={t('adminDashboard.section.placeholderDescription')}
            onRetry={() => {
              void usersQuery.refetch();
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-saubio-forest/10 text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-saubio-slate/50">
                  <th className="py-2 pr-4">{t('adminUsers.columns.name')}</th>
                  <th className="py-2 pr-4">{t('adminUsers.columns.email')}</th>
                  <th className="py-2 pr-4">{t('adminUsers.columns.role')}</th>
                  <th className="py-2 pr-4">{t('adminUsers.columns.status')}</th>
                  <th className="py-2 pr-4">{t('adminUsers.columns.createdAt')}</th>
                  <th className="py-2 pr-4">{t('adminUsers.columns.lastLogin')}</th>
                  <th className="py-2">{t('adminUsers.columns.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saubio-forest/10">
                {(usersQuery.data ?? []).map((user) => (
                  <tr key={user.id} className="hover:bg-white/60">
                    <td className="py-3 pr-4 font-semibold text-saubio-forest">{user.name}</td>
                    <td className="py-3 pr-4 text-saubio-slate/70">{user.email}</td>
                    <td className="py-3 pr-4 text-xs uppercase tracking-wide text-saubio-slate/60">
                      {t(`adminUsers.role.${user.role}`)}
                    </td>
                    <td className="py-3 pr-4">
                      <Pill tone={user.status === 'active' ? 'forest' : user.status === 'invited' ? 'sun' : 'mist'}>
                        {t(`adminUsers.status.${user.status}`)}
                      </Pill>
                    </td>
                    <td className="py-3 pr-4 text-xs text-saubio-slate/60">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-xs text-saubio-slate/60">
                      {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}
                    </td>
                    <td className="py-3 text-xs">
                      <div className="flex flex-wrap gap-2">
                        {user.status !== 'active' ? (
                          <button
                            type="button"
                            onClick={() => handleAction(user.id, 'active')}
                            className="rounded-full bg-saubio-forest px-3 py-1 font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-60"
                            disabled={updateMutation.isPending}
                          >
                            {t('adminUsers.actions.activate')}
                          </button>
                        ) : null}
                        {user.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => handleAction(user.id, 'suspended')}
                            className="rounded-full border border-saubio-forest/30 px-3 py-1 font-semibold text-saubio-forest transition hover:border-saubio-forest disabled:opacity-60"
                            disabled={updateMutation.isPending}
                          >
                            {t('adminUsers.actions.suspend')}
                          </button>
                        ) : null}
                        {user.status === 'invited' ? (
                          <button
                            type="button"
                            onClick={() => setFeedback(t('adminUsers.actions.reinvite'))}
                            className="rounded-full border border-saubio-forest/30 px-3 py-1 font-semibold text-saubio-forest transition hover:border-saubio-forest"
                          >
                            {t('adminUsers.actions.reinvite')}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
