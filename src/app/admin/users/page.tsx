'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { UserRole } from '@saubio/models';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Users, UserCheck, ShieldCheck, UserPlus } from 'lucide-react';
import { useAdminUsersOverview } from '@saubio/utils';
import { ErrorState } from '../../../components/feedback/ErrorState';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const LineChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.LineChart })), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => ({ default: mod.Line })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => ({ default: mod.Legend })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => ({ default: mod.Pie })), { ssr: false });

const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Clients',
  provider: 'Prestataires',
  company: 'Entreprises',
  employee: 'Employés',
  admin: 'Admins',
};

const ROLE_COLORS: Record<UserRole, string> = {
  client: '#1c332a',
  provider: '#4f9c7f',
  company: '#74a1cf',
  employee: '#f5c94c',
  admin: '#d3d8e2',
};

const statusTone = (status: string) => {
  if (status === 'active') return 'border-emerald-500 text-emerald-700';
  if (status === 'invited') return 'border-amber-500 text-amber-900';
  return 'border-rose-500 text-rose-700';
};

const statusLabel = (status: string) => {
  if (status === 'active') return 'Actif';
  if (status === 'invited') return 'Invité';
  return 'Suspendu';
};

export default function AdminUsersOverviewPage() {
  const overviewQuery = useAdminUsersOverview();
  const { data: overview, isLoading, isError } = overviewQuery;

  const numberFormatter = useMemo(() => new Intl.NumberFormat('fr-FR'), []);
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    []
  );

  const timelineData = useMemo(() => {
    if (!overview) return [];
    return overview.timeline.map((point) => ({
      label: dateFormatter.format(new Date(point.date)),
      clients: point.clients,
      providers: point.providers,
    }));
  }, [overview, dateFormatter]);

  const distributionData = useMemo(() => {
    if (!overview) return [];
    return overview.distribution.map((entry) => ({
      name: ROLE_LABELS[entry.role],
      value: entry.value,
      fill: ROLE_COLORS[entry.role],
    }));
  }, [overview]);

  const cards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        label: 'Utilisateurs',
        helper: 'Tous rôles confondus',
        value: numberFormatter.format(overview.stats.totalUsers),
        icon: Users,
        tone: 'bg-saubio-forest/10 text-saubio-forest',
      },
      {
        label: 'Clients',
        helper: 'Particuliers + entreprises',
        value: numberFormatter.format(overview.stats.clients),
        icon: Users,
        tone: 'bg-sky-100 text-sky-900',
      },
      {
        label: 'Prestataires actifs',
        helper: `${numberFormatter.format(overview.stats.providers.pending)} en attente`,
        value: numberFormatter.format(overview.stats.providers.active),
        icon: UserCheck,
        tone: 'bg-emerald-100 text-emerald-900',
      },
      {
        label: 'Prestataires suspendus',
        helper: 'Manuels ou automatiques',
        value: numberFormatter.format(overview.stats.providers.suspended),
        icon: ShieldCheck,
        tone: 'bg-rose-100 text-rose-900',
      },
      {
        label: 'Employés',
        helper: 'Ops & support',
        value: numberFormatter.format(overview.stats.employees),
        icon: UserPlus,
        tone: 'bg-saubio-sun/40 text-saubio-forest',
      },
      {
        label: 'Admins',
        helper: 'Accès complet',
        value: numberFormatter.format(overview.stats.admins),
        icon: ShieldCheck,
        tone: 'bg-slate-200 text-saubio-forest',
      },
    ];
  }, [overview, numberFormatter]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Utilisateurs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Vue globale des comptes</h1>
        <p className="text-sm text-saubio-slate/70">Suivez en temps réel l’évolution de la base clients, prestataires et équipes internes.</p>
      </header>

      {isError ? (
        <ErrorState
          title="Impossible de charger les statistiques"
          description="Un problème technique empêche la récupération des données utilisateurs."
          onRetry={() => overviewQuery.refetch()}
        />
      ) : null}

      {isLoading && !overview ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`users-overview-skeleton-${index}`} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : null}

      {overview ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <SurfaceCard key={card.label} className="flex items-center justify-between rounded-3xl p-5 shadow-soft-lg">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{card.label}</p>
                    <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
                    <p className="text-xs text-saubio-slate/60">{card.helper}</p>
                  </div>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </SurfaceCard>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Nouveaux comptes</p>
                <span className="text-xs text-saubio-slate/60">6 dernières semaines</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis dataKey="label" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clients" name="Clients" stroke="#1c332a" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="providers" name="Prestataires" stroke="#4f9c7f" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Répartition par rôle</p>
                <span className="text-xs text-saubio-slate/60">Base totale</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} dataKey="value" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm text-saubio-slate/70">
                {distributionData.map((role) => (
                  <li key={role.name} className="flex items-center justify-between">
                    <span className="font-semibold text-saubio-forest">{role.name}</span>
                    <span>{numberFormatter.format(role.value)}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </section>

          <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-saubio-forest">Derniers comptes créés</p>
              <span className="text-xs text-saubio-slate/60">Top 10</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-saubio-slate/80">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                    <th className="px-3 py-2 text-left font-semibold">Nom</th>
                    <th className="px-3 py-2 text-left font-semibold">Rôle</th>
                    <th className="px-3 py-2 text-left font-semibold">Inscription</th>
                    <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recent.map((user) => (
                    <tr key={user.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2 font-semibold text-saubio-forest">{user.name}</td>
                      <td className="px-3 py-2">{ROLE_LABELS[user.role]}</td>
                      <td className="px-3 py-2 text-saubio-slate/60">{dateFormatter.format(new Date(user.createdAt))}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusTone(user.status)}`}>
                          {statusLabel(user.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        </>
      ) : null}
    </div>
  );
}
