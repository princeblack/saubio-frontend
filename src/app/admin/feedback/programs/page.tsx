'use client';

import { useState } from 'react';
import { SurfaceCard, Badge } from '@saubio/ui';
import {
  useAdminQualityProgram,
  useAdminQualityProgramDetail,
} from '@saubio/utils';
import { AlertTriangle, Award, Info } from 'lucide-react';

export default function AdminFeedbackProgramsPage() {
  const { data, isLoading } = useAdminQualityProgram();
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const { data: providerDetail } = useAdminQualityProgramDetail(selectedProviderId ?? undefined);

  const summary = data?.summary;
  const atRisk = data?.atRiskProviders ?? [];
  const top = data?.topProviders ?? [];

  const summaryCards = [
    {
      label: 'Prestataires actifs',
      value: summary?.totalProviders?.toString() ?? '0',
      caption: 'Suivis par le programme qualité',
      tone: 'bg-saubio-forest/10 text-saubio-forest',
      icon: Info,
    },
    {
      label: 'À surveiller',
      value: summary?.atRiskCount?.toString() ?? '0',
      caption: 'Score faible ou incidents récents',
      tone: 'bg-amber-100 text-amber-900',
      icon: AlertTriangle,
    },
    {
      label: 'Top prestataires',
      value: summary?.topCount?.toString() ?? '0',
      caption: 'Score > 4.7 et constance élevée',
      tone: 'bg-emerald-100 text-emerald-900',
      icon: Award,
    },
    {
      label: 'Incidents (30 j)',
      value: summary?.incidentsLast30Days?.toString() ?? '0',
      caption: 'Litiges qualité ouverts',
      tone: 'bg-saubio-sun/40 text-saubio-forest',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Feedback & qualité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Programme qualité prestataires</h1>
        <p className="text-sm text-saubio-slate/70">
          Identifiez les profils à accompagner, visualisez les meilleurs prestataires et consultez leurs historiques.
          {isLoading ? ' (chargement en cours...)' : ''}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <SurfaceCard key={card.label} className="flex min-h-[120px] items-center justify-between rounded-3xl p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
                <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
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
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-saubio-forest">Prestataires à surveiller</p>
              <p className="text-xs text-saubio-slate/60">Score faible, incidents ou tendance négative</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                  <th className="px-3 py-2 text-left font-semibold">Score</th>
                  <th className="px-3 py-2 text-left font-semibold">Avis 90 j</th>
                  <th className="px-3 py-2 text-left font-semibold">Bookings 30 j</th>
                  <th className="px-3 py-2 text-left font-semibold">Incidents</th>
                  <th className="px-3 py-2 text-left font-semibold">Flags</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map((provider) => (
                  <tr
                    key={provider.id}
                    className="cursor-pointer border-b border-saubio-forest/5 transition hover:bg-saubio-forest/5"
                    onClick={() => setSelectedProviderId(provider.id)}
                  >
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      {provider.name}
                      <p className="text-xs text-saubio-slate/60">{provider.city ?? '—'}</p>
                    </td>
                    <td className="px-3 py-2">{provider.ratingAverage?.toFixed(2) ?? '—'} / 5</td>
                    <td className="px-3 py-2">{provider.reviewsLast30Days}</td>
                    <td className="px-3 py-2">{provider.bookingsLast30Days}</td>
                    <td className="px-3 py-2">{provider.incidentsOpen}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {provider.flags?.map((flag) => (
                          <Badge key={flag} size="sm" className="bg-red-100 text-red-900">
                            {flag.replace('_', ' ')}
                          </Badge>
                        ))}
                        {!provider.flags?.length && (
                          <span className="text-xs text-saubio-slate/60">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!atRisk.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      Aucun prestataire critique identifié.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-saubio-forest">Top prestataires</p>
              <p className="text-xs text-saubio-slate/60">Sélection premium Saubio</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                  <th className="px-3 py-2 text-left font-semibold">Score</th>
                  <th className="px-3 py-2 text-left font-semibold">Avis 90 j</th>
                  <th className="px-3 py-2 text-left font-semibold">Bookings 30 j</th>
                  <th className="px-3 py-2 text-left font-semibold">Incidents</th>
                  <th className="px-3 py-2 text-left font-semibold">Tendance</th>
                </tr>
              </thead>
              <tbody>
                {top.map((provider) => (
                  <tr
                    key={provider.id}
                    className="cursor-pointer border-b border-saubio-forest/5 transition hover:bg-saubio-forest/5"
                    onClick={() => setSelectedProviderId(provider.id)}
                  >
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      {provider.name}
                      <p className="text-xs text-saubio-slate/60">{provider.city ?? '—'}</p>
                    </td>
                    <td className="px-3 py-2">{provider.ratingAverage?.toFixed(2) ?? '—'} / 5</td>
                    <td className="px-3 py-2">{provider.reviewsLast30Days}</td>
                    <td className="px-3 py-2">{provider.bookingsLast30Days}</td>
                    <td className="px-3 py-2">{provider.incidentsOpen}</td>
                    <td className="px-3 py-2 capitalize">{provider.trend}</td>
                  </tr>
                ))}
                {!top.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      Aucun prestataire “top” pour l’instant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      </div>

      {providerDetail && (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-saubio-forest">Fiche qualité</p>
              <h2 className="text-2xl font-semibold text-saubio-forest">{providerDetail.profile.name}</h2>
              <p className="text-xs text-saubio-slate/60">{providerDetail.profile.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {providerDetail.profile.flags?.map((flag) => (
                <Badge key={flag} size="sm" className="bg-saubio-sun/40 text-saubio-forest">
                  {flag.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Note moyenne</p>
              <p className="text-2xl font-semibold text-saubio-forest">
                {providerDetail.stats.averageScore !== null
                  ? `${providerDetail.stats.averageScore.toFixed(2)} / 5`
                  : '—'}
              </p>
              <p className="text-xs text-saubio-slate/60">{providerDetail.stats.totalReviews} avis</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Avis 90 jours</p>
              <p className="text-2xl font-semibold text-saubio-forest">{providerDetail.stats.reviewsLast90Days}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Incidents ouverts</p>
              <p className="text-2xl font-semibold text-saubio-forest">{providerDetail.stats.incidentsOpen}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Incidents 90 jours</p>
              <p className="text-2xl font-semibold text-saubio-forest">
                {providerDetail.stats.incidentsLast90Days}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <SurfaceCard className="border border-saubio-forest/10 bg-white/90 p-4">
              <p className="mb-3 text-sm font-semibold text-saubio-forest">Avis récents</p>
              <div className="space-y-3">
                {providerDetail.recentReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-saubio-forest/10 p-3">
                    <p className="text-sm font-semibold text-saubio-forest">
                      {review.score.toFixed(1)} / 5 — {review.booking.service}
                    </p>
                    <p className="text-xs text-saubio-slate/60">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-saubio-slate/80">{review.comment ?? 'Pas de commentaire'}</p>
                  </div>
                ))}
                {!providerDetail.recentReviews.length && (
                  <p className="text-sm text-saubio-slate/60">Aucun avis récent.</p>
                )}
              </div>
            </SurfaceCard>

            <SurfaceCard className="border border-saubio-forest/10 bg-white/90 p-4">
              <p className="mb-3 text-sm font-semibold text-saubio-forest">Incidents qualité</p>
              <div className="space-y-3">
                {providerDetail.recentIncidents.map((incident) => (
                  <div key={incident.id} className="rounded-2xl border border-saubio-forest/10 p-3">
                    <p className="text-sm font-semibold text-saubio-forest">
                      {incident.status.toUpperCase()} — {incident.booking.service}
                    </p>
                    <p className="text-xs text-saubio-slate/60">
                      {new Date(incident.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-saubio-slate/80">{incident.reason}</p>
                  </div>
                ))}
                {!providerDetail.recentIncidents.length && (
                  <p className="text-sm text-saubio-slate/60">Aucun incident déclaré.</p>
                )}
              </div>
            </SurfaceCard>
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
