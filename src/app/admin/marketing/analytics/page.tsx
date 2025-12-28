'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import {
  formatEuro,
  useAdminPromoCodes,
  useAdminPromoCodeStats,
  useAdminPromoCodeUsages,
} from '@saubio/utils';

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

const RANGE_OPTIONS = [
  { label: '7 j', value: 7 },
  { label: '30 j', value: 30 },
  { label: '90 j', value: 90 },
];

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' });

const buildRangeParams = (days: number) => {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
};

export default function AdminMarketingAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState(30);
  const [selectedCodeId, setSelectedCodeId] = useState<string | undefined>(undefined);
  const rangeParams = useMemo(() => buildRangeParams(rangeDays), [rangeDays]);

  const promoCodesQuery = useAdminPromoCodes({ page: 1, pageSize: 50, status: 'active' });

  useEffect(() => {
    if (!selectedCodeId && promoCodesQuery.data?.items.length) {
      setSelectedCodeId(promoCodesQuery.data.items[0].id);
    }
  }, [promoCodesQuery.data, selectedCodeId]);

  const statsQuery = useAdminPromoCodeStats(selectedCodeId, rangeParams);
  const usageQuery = useAdminPromoCodeUsages(selectedCodeId, { ...rangeParams, page: 1, pageSize: 25 });

  const promoDetail = statsQuery.data?.promoCode;
  const timelineData = useMemo(
    () =>
      (statsQuery.data?.timeline ?? []).map((entry) => ({
        date: entry.date,
        usages: entry.usages,
        discount: entry.discountCents / 100,
      })),
    [statsQuery.data]
  );
  const services = statsQuery.data?.services ?? [];
  const usages = usageQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Marketing & codes promo</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Analytics promo</h1>
        <p className="text-sm text-saubio-slate/70">
          Analysez les performances réelles de chaque code (volume, réduction générée, clients touchés).
        </p>
        <div className="flex flex-wrap gap-3">
          <select
            className="rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
            value={selectedCodeId ?? ''}
            onChange={(event) => setSelectedCodeId(event.target.value || undefined)}
          >
            {!promoCodesQuery.data && <option value="">Chargement…</option>}
            {(promoCodesQuery.data?.items ?? []).map((code) => (
              <option key={code.id} value={code.id}>
                {code.code}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRangeDays(option.value)}
                className={`rounded-2xl border px-3 py-1 text-xs font-semibold transition ${
                  option.value === rangeDays
                    ? 'border-saubio-forest bg-saubio-forest text-white'
                    : 'border-saubio-forest/20 text-saubio-forest'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {!selectedCodeId ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-sm text-saubio-slate/70">
            Aucun code actif n’est disponible pour le moment. Créez un code promo pour commencer à mesurer sa performance.
          </p>
        </SurfaceCard>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[{
              label: 'Utilisations totales',
              value: statsQuery.data ? statsQuery.data.stats.totalUsages : '—',
            },
            {
              label: 'Réduction totale',
              value: statsQuery.data ? formatEuro(statsQuery.data.stats.totalDiscountCents / 100) : '—',
            },
            {
              label: 'Clients uniques',
              value: statsQuery.data ? statsQuery.data.stats.uniqueClients : '—',
            },
            {
              label: 'Dernière utilisation',
              value: promoDetail?.lastUsedAt ? formatDate(promoDetail.lastUsedAt) : '—',
            }].map((card) => (
              <SurfaceCard key={card.label} className="rounded-3xl p-5 shadow-soft-lg">
                <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
                <p className="text-3xl font-semibold text-saubio-forest">
                  {statsQuery.isLoading ? <Skeleton className="h-8 w-20" /> : card.value}
                </p>
              </SurfaceCard>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Evolution</p>
                <span className="text-xs text-saubio-slate/60">{rangeDays} derniers jours</span>
              </div>
              <div className="h-64">
                {statsQuery.isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : timelineData.length === 0 ? (
                  <p className="text-sm text-saubio-slate/60">Aucune donnée sur cette période.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#5f6f6e' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => dateFormatter.format(new Date(value))}
                      />
                      <YAxis tick={{ fill: '#5f6f6e' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value: number | string, key) =>
                          key === 'discount' ? formatEuro(Number(value)) : value
                        }
                        labelFormatter={(value) => dateFormatter.format(new Date(value))}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="usages" name="Utilisations" stroke="#4f9c7f" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="discount" name="Réduction (€)" stroke="#f5c94c" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <p className="mb-3 text-sm font-semibold text-saubio-forest">Détails du code</p>
              {statsQuery.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : promoDetail ? (
                <dl className="space-y-2 text-sm text-saubio-slate/80">
                  <div className="flex justify-between">
                    <dt>Type</dt>
                    <dd className="font-semibold text-saubio-forest">
                      {promoDetail.type === 'fixed'
                        ? formatEuro((promoDetail.fixedAmountCents ?? 0) / 100)
                        : `${promoDetail.percentage ?? 0} %`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Validité</dt>
                    <dd>{formatDate(promoDetail.startsAt)} → {formatDate(promoDetail.endsAt)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Panier minimum</dt>
                    <dd>{promoDetail.minBookingTotalCents ? formatEuro(promoDetail.minBookingTotalCents / 100) : '—'}</dd>
                  </div>
                  <div>
                    <dt>Services</dt>
                    <dd>
                      {(promoDetail.applicableServices ?? []).length > 0
                        ? promoDetail.applicableServices.join(', ')
                        : 'Tous'}
                    </dd>
                  </div>
                  <div>
                    <dt>Zones</dt>
                    <dd>
                      {(promoDetail.applicablePostalCodes ?? []).length > 0
                        ? promoDetail.applicablePostalCodes.join(', ')
                        : 'Toutes'}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-saubio-slate/60">Sélectionnez un code pour voir les détails.</p>
              )}
            </SurfaceCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Utilisations détaillées</p>
                <span className="text-xs text-saubio-slate/60">{usages.length} lignes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-saubio-slate/80">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                      <th className="px-3 py-2 text-left font-semibold">Date</th>
                      <th className="px-3 py-2 text-left font-semibold">Client</th>
                      <th className="px-3 py-2 text-left font-semibold">Réservation</th>
                      <th className="px-3 py-2 text-left font-semibold">Service</th>
                      <th className="px-3 py-2 text-left font-semibold">Réduction</th>
                      <th className="px-3 py-2 text-left font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageQuery.isLoading
                      ? Array.from({ length: 6 }).map((_, index) => (
                          <tr key={`stats-usage-${index}`} className="border-b border-saubio-forest/5">
                            <td colSpan={6} className="px-3 py-4">
                              <Skeleton className="h-6 w-full" />
                            </td>
                          </tr>
                        ))
                      : usages.length === 0
                        ? (
                            <tr>
                              <td colSpan={6} className="px-3 py-6 text-center text-saubio-slate/60">
                                Aucune utilisation enregistrée pour ce code.
                              </td>
                            </tr>
                          )
                        : (
                            usages.map((usage) => (
                              <tr key={usage.id} className="border-b border-saubio-forest/5 last:border-none">
                                <td className="px-3 py-2 text-saubio-slate/60">{dateFormatter.format(new Date(usage.usedAt))}</td>
                                <td className="px-3 py-2">{usage.client?.name ?? 'Client invité'}</td>
                                <td className="px-3 py-2">{usage.bookingId ?? '—'}</td>
                                <td className="px-3 py-2">{usage.bookingService ?? '—'}</td>
                                <td className="px-3 py-2">{formatEuro((usage.discountCents ?? 0) / 100)}</td>
                                <td className="px-3 py-2 capitalize">{usage.bookingStatus ?? usage.status}</td>
                              </tr>
                            ))
                          )}
                  </tbody>
                </table>
              </div>
            </SurfaceCard>

            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <p className="mb-3 text-sm font-semibold text-saubio-forest">Services concernés</p>
              {statsQuery.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : services.length === 0 ? (
                <p className="text-sm text-saubio-slate/60">Aucun service spécifique ciblé.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {services.map((service) => (
                    <li key={service.service} className="flex items-center justify-between">
                      <span className="font-semibold text-saubio-forest">{service.service}</span>
                      <span className="text-saubio-slate/70">{service.usages} usage(s)</span>
                    </li>
                  ))}
                </ul>
              )}
            </SurfaceCard>
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(value?: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '—';
}
