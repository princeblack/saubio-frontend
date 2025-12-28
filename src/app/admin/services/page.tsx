'use client';

import { SurfaceCard } from '@saubio/ui';
import { Layers, Users as UsersIcon, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { formatEuro, useAdminServiceCatalog } from '@saubio/utils';

const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

const formatRate = (cents?: number | null) => {
  if (typeof cents !== 'number') {
    return '—';
  }
  return formatEuro(cents / 100);
};

const formatCount = (value?: number | null) => numberFormatter.format(value ?? 0);

export default function AdminServicesCataloguePage() {
  const catalogQuery = useAdminServiceCatalog();
  const data = catalogQuery.data;
  const services = data?.services ?? [];

  const cards = [
    {
      label: 'Services actifs',
      value: data ? formatCount(data.summary.servicesWithProviders) : '—',
      subtitle: `${formatCount(data?.summary.totalServices)} au total`,
      icon: Layers,
    },
    {
      label: 'Prestataires référencés',
      value: data ? formatCount(data.summary.totalProviders) : '—',
      subtitle: 'Profils proposant au moins un service',
      icon: UsersIcon,
    },
    {
      label: 'Tarif horaire moyen',
      value: data ? formatRate(data.summary.averageHourlyRateCents) : '—',
      subtitle: 'Basé sur les tarifs déclarés',
      icon: DollarSign,
    },
    {
      label: 'Réservations suivies',
      value: data ? formatCount(data.summary.totalBookings) : '—',
      subtitle: 'Historique cumulé par service',
      icon: TrendingUp,
    },
  ];

  const topBookings = services
    .slice()
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  const lowCoverage = services.filter((service) => service.providerCount === 0);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Services & Tarifs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Catalogue des services</h1>
        <p className="text-sm text-saubio-slate/70">
          Visualisez l’offre Saubio, les services les plus réservés et les zones où il faut recruter des prestataires.
        </p>
      </header>

      {catalogQuery.isLoading ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/80 p-8 text-center shadow-soft-lg">
          <p className="text-sm text-saubio-slate/70">Chargement du catalogue…</p>
        </SurfaceCard>
      ) : catalogQuery.isError ? (
        <SurfaceCard className="rounded-3xl border border-rose-200 bg-white/80 p-6 shadow-soft-lg">
          <div className="flex items-center gap-3 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Impossible de charger les services</p>
              <p className="text-sm text-rose-600/80">Merci de réessayer dans quelques instants.</p>
            </div>
          </div>
        </SurfaceCard>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <SurfaceCard key={card.label} className="flex items-center justify-between rounded-3xl border border-saubio-forest/5 bg-white/90 p-5 shadow-soft-lg">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{card.label}</p>
                    <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
                    <p className="text-xs text-saubio-slate/60">{card.subtitle}</p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/80 text-saubio-forest">
                    <Icon className="h-5 w-5" />
                  </span>
                </SurfaceCard>
              );
            })}
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-saubio-forest">Catalogue complet</p>
                <span className="text-xs text-saubio-slate/60">{formatCount(services.length)} services référencés</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-saubio-slate/80">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                      <th className="px-3 py-2 text-left font-semibold">Service</th>
                      <th className="px-3 py-2 text-left font-semibold">Prestataires</th>
                      <th className="px-3 py-2 text-left font-semibold">Tarif moyen</th>
                      <th className="px-3 py-2 text-left font-semibold">Demandes</th>
                      <th className="px-3 py-2 text-left font-semibold">Dernière mission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className="border-b border-saubio-forest/5 last:border-none">
                        <td className="px-3 py-2">
                          <p className="font-semibold text-saubio-forest">{service.title}</p>
                          <p className="text-xs text-saubio-slate/60 line-clamp-2">{service.description}</p>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-semibold text-saubio-forest">{formatCount(service.providerCount)}</span>
                          <p className="text-xs text-saubio-slate/60">{formatCount(service.activeProviderCount)} actifs</p>
                        </td>
                        <td className="px-3 py-2">{formatRate(service.avgHourlyRateCents)}</td>
                        <td className="px-3 py-2">{formatCount(service.bookingsCount)}</td>
                        <td className="px-3 py-2 text-saubio-slate/70">
                          {service.lastBookingAt ? new Date(service.lastBookingAt).toLocaleDateString('fr-FR') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SurfaceCard>

            <div className="space-y-4">
              <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-4 shadow-soft-lg">
                <p className="mb-3 text-sm font-semibold text-saubio-forest">Top services (missions)</p>
                <ul className="space-y-2 text-sm text-saubio-slate/80">
                  {topBookings.length === 0 ? (
                    <li className="text-saubio-slate/60">Pas encore de mission enregistrée.</li>
                  ) : (
                    topBookings.map((service) => (
                      <li key={service.id} className="flex items-center justify-between rounded-2xl bg-saubio-mist/60 px-3 py-2">
                        <span className="font-semibold text-saubio-forest">{service.title}</span>
                        <span>{formatCount(service.bookingsCount)}</span>
                      </li>
                    ))
                  )}
                </ul>
              </SurfaceCard>

              <SurfaceCard className="rounded-3xl border border-amber-200 bg-white/95 p-4 shadow-soft-lg">
                <div className="mb-2 flex items-center gap-2 text-amber-700">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-semibold">Services sans prestataire</p>
                </div>
                {lowCoverage.length === 0 ? (
                  <p className="text-sm text-saubio-slate/70">Tous les services ont au moins un prestataire référencé.</p>
                ) : (
                  <ul className="text-sm text-saubio-slate/80">
                    {lowCoverage.map((service) => (
                      <li key={service.id} className="rounded-xl border border-amber-100 px-3 py-1">
                        {service.title}
                      </li>
                    ))}
                  </ul>
                )}
              </SurfaceCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
