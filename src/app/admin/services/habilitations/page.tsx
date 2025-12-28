'use client';

import { SurfaceCard } from '@saubio/ui';
import { AlertCircle, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { useAdminServiceHabilitations } from '@saubio/utils';

const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (label: string, tone: 'positive' | 'warning' | 'neutral') => {
  const base = 'inline-flex rounded-full px-3 py-1 text-xs font-semibold';
  if (tone === 'positive') {
    return <span className={`${base} border border-emerald-200 bg-emerald-50 text-emerald-700`}>{label}</span>;
  }
  if (tone === 'warning') {
    return <span className={`${base} border border-amber-200 bg-amber-50 text-amber-800`}>{label}</span>;
  }
  return <span className={`${base} border border-saubio-forest/15 bg-saubio-mist/60 text-saubio-slate/80`}>{label}</span>;
};

const identityLabel = (status?: string | null) => {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case 'verified':
      return statusBadge('Identité vérifiée', 'positive');
    case 'submitted':
      return statusBadge('En cours de vérification', 'warning');
    case 'rejected':
      return statusBadge('Rejetée', 'warning');
    default:
      return statusBadge('Non démarrée', 'neutral');
  }
};

const payoutLabel = (status?: string | null, ready?: boolean) => {
  const normalized = status?.toLowerCase();
  if (ready || normalized === 'active') {
    return statusBadge('Mandat actif', 'positive');
  }
  if (normalized === 'failed') {
    return statusBadge('Mandat refusé', 'warning');
  }
  return statusBadge('En attente', 'neutral');
};

const documentSummary = (count: number) => {
  if (count === 0) return 'Aucun document';
  if (count === 1) return '1 document';
  return `${count} documents`;
};

export default function AdminServiceHabilitationsPage() {
  const habilitationsQuery = useAdminServiceHabilitations();
  const data = habilitationsQuery.data;
  const items = data?.items ?? [];

  const cards = [
    {
      label: 'Prestataires actifs',
      value: data ? numberFormatter.format(data.summary.totalProviders) : '—',
      subtitle: 'Comptes proposant au moins un service',
      icon: Users,
    },
    {
      label: 'Identité validée',
      value: data ? numberFormatter.format(data.summary.verifiedProviders) : '—',
      subtitle: 'Prestataires vérifiés',
      icon: ShieldCheck,
    },
    {
      label: 'Mandats actifs',
      value: data ? numberFormatter.format(data.summary.payoutReadyProviders) : '—',
      subtitle: 'Paiement prêt côté prestataire',
      icon: CheckCircle2,
    },
    {
      label: 'Services couverts',
      value: data ? numberFormatter.format(data.summary.servicesCovered) : '—',
      subtitle: 'Services avec au moins un prestataire',
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Services & Tarifs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Habilitations prestataires</h1>
        <p className="text-sm text-saubio-slate/70">
          Visualisez les prestataires réellement certifiés, l’état des mandats de paiement et les documents de conformité.
        </p>
      </header>

      {habilitationsQuery.isLoading ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/90 p-8 text-center shadow-soft-lg">
          <p className="text-sm text-saubio-slate/70">Chargement des habilitations…</p>
        </SurfaceCard>
      ) : habilitationsQuery.isError ? (
        <SurfaceCard className="rounded-3xl border border-rose-200 bg-white/90 p-6 shadow-soft-lg">
          <div className="flex items-center gap-3 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Impossible de charger les habilitations</p>
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
                <SurfaceCard key={card.label} className="flex items-center justify-between rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{card.label}</p>
                    <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
                    <p className="text-xs text-saubio-slate/60">{card.subtitle}</p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/70 text-saubio-forest">
                    <Icon className="h-5 w-5" />
                  </span>
                </SurfaceCard>
              );
            })}
          </section>

          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            {items.length === 0 ? (
              <p className="text-sm text-saubio-slate/60">Aucun prestataire n’a encore déclaré de services.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-saubio-slate/80">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                      <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                      <th className="px-3 py-2 text-left font-semibold">Service</th>
                      <th className="px-3 py-2 text-left font-semibold">Identité</th>
                      <th className="px-3 py-2 text-left font-semibold">Paiement</th>
                      <th className="px-3 py-2 text-left font-semibold">Documents</th>
                      <th className="px-3 py-2 text-left font-semibold">Dernière mission</th>
                      <th className="px-3 py-2 text-right font-semibold">Missions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={`${item.providerId}-${item.serviceId}`} className="border-b border-saubio-forest/5 last:border-none">
                        <td className="px-3 py-2">
                          <p className="font-semibold text-saubio-forest">{item.providerName}</p>
                          <p className="text-xs text-saubio-slate/60">{item.providerEmail}</p>
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-semibold text-saubio-forest">{item.serviceName}</p>
                          <p className="text-xs text-saubio-slate/60">{item.serviceId}</p>
                        </td>
                        <td className="px-3 py-2">{identityLabel(item.identityStatus)}</td>
                        <td className="px-3 py-2">{payoutLabel(item.payoutStatus, item.payoutReady)}</td>
                        <td className="px-3 py-2">
                          <p className="font-semibold text-saubio-forest">{documentSummary(item.documents.length)}</p>
                          {item.documents.slice(0, 2).map((doc) => (
                            <p key={doc.id} className="text-xs text-saubio-slate/60">
                              {doc.type} • {doc.reviewStatus}
                            </p>
                          ))}
                        </td>
                        <td className="px-3 py-2 text-saubio-slate/70">{formatDate(item.lastMissionAt)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-saubio-forest">
                          {numberFormatter.format(item.missionsCompleted)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
