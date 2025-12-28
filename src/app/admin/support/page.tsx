'use client';

import dynamic from 'next/dynamic';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import { MessageCircle, LifeBuoy, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAdminSupportOverview } from '@saubio/utils';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const AreaChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.AreaChart })), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => ({ default: mod.Area })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });

export default function AdminSupportOverviewPage() {
  const { data, isLoading } = useAdminSupportOverview();
  const metrics = [
    {
      label: 'Tickets ouverts',
      value: data?.metrics.openTickets?.toLocaleString('fr-FR') ?? '—',
      caption: 'Tous statuts confondus',
      icon: MessageCircle,
      tone: 'bg-sky-100 text-sky-900',
    },
    {
      label: 'Tickets urgents',
      value: data?.metrics.urgentTickets?.toLocaleString('fr-FR') ?? '—',
      caption: 'Priorité haute & urgente',
      icon: AlertTriangle,
      tone: 'bg-saubio-sun/50 text-saubio-forest',
    },
    {
      label: 'Litiges actifs',
      value: data?.metrics.activeDisputes?.toLocaleString('fr-FR') ?? '—',
      caption: 'Ouverts ou en analyse',
      icon: LifeBuoy,
      tone: 'bg-rose-100 text-rose-900',
    },
    {
      label: '< 24h résolus',
      value:
        data?.metrics.resolution24hRate !== undefined
          ? `${data.metrics.resolution24hRate.toFixed(0)} %`
          : '—',
      caption: 'Tickets clos en moins de 24h',
      icon: ShieldCheck,
      tone: 'bg-emerald-100 text-emerald-900',
    },
  ];

  const timeline = data?.timeline ?? [];
  const disputeReasons = data?.disputeReasons ?? [];
  const recentTickets = data?.recentTickets ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Support & litiges</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Centre de support</h1>
        <p className="text-sm text-saubio-slate/70">Suivez les tickets, litiges et les dernières interactions client/prestataire.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((card) => {
          const Icon = card.icon;
          return (
            <SurfaceCard key={card.label} className="flex items-center justify-between rounded-3xl p-5 shadow-soft-lg">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-3 h-7 w-20 rounded-full" />
                ) : (
                  <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
                )}
                <p className="text-xs text-saubio-slate/60">{card.caption}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
            </SurfaceCard>
          );
        })}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Volume tickets vs litiges</p>
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-3xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <XAxis dataKey="date" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="tickets" stroke="#1c332a" fill="#1c332a15" strokeWidth={3} />
                  <Area type="monotone" dataKey="disputes" stroke="#f472b6" fill="#f472b610" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-4 text-sm font-semibold text-saubio-forest">Motifs principaux des litiges</p>
          <div className="h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-3xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disputeReasons}>
                  <XAxis dataKey="reason" tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1c332a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Derniers tickets mis à jour</p>
            <p className="text-xs text-saubio-slate/60">Tickets client ou prestataire mis en avant pour revue rapide.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : (
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Sujet</th>
                  <th className="px-3 py-2 text-left font-semibold">Demandeur</th>
                  <th className="px-3 py-2 text-left font-semibold">Priorité</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2 text-left font-semibold">MAJ</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-saubio-forest/5 last:border-0">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{ticket.id}</td>
                    <td className="px-3 py-2">{ticket.subject}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{ticket.requester}</td>
                    <td className="px-3 py-2 capitalize">{ticket.priority}</td>
                    <td className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-sky-900">
                      {ticket.status.replace('_', ' ')}
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">
                      {new Date(ticket.updatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
                {recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-xs text-saubio-slate/60">
                      Aucun ticket récent sur la période sélectionnée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
