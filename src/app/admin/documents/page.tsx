'use client';

import Link from 'next/link';
import { SurfaceCard } from '@saubio/ui';
import { useAdminIdentityVerifications } from '@saubio/utils';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const badgeClasses: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border border-amber-100',
  under_review: 'bg-sky-50 text-sky-800 border border-sky-100',
  approved: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-100',
};

const renderStatus = (status: string) => {
  const key = status.toLowerCase();
  const label =
    key === 'pending'
      ? 'En attente'
      : key === 'under_review'
        ? 'En revue'
        : key === 'approved'
          ? 'Validé'
          : key === 'rejected'
            ? 'Rejeté'
            : status;
  const classes = badgeClasses[key] ?? badgeClasses.pending;
  return <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ${classes}`}>{label}</span>;
};

export default function AdminDocumentsOverviewPage() {
  const pendingQuery = useAdminIdentityVerifications({ status: 'pending', limit: 5 });
  const underReviewQuery = useAdminIdentityVerifications({ status: 'under_review', limit: 1 });
  const verifiedQuery = useAdminIdentityVerifications({ status: 'approved', limit: 1 });
  const rejectedQuery = useAdminIdentityVerifications({ status: 'rejected', limit: 1 });

  const pendingItems = pendingQuery.data?.items ?? [];
  const cards = [
    { label: 'En attente', value: pendingQuery.data?.total ?? 0, caption: 'Docs soumis à traiter' },
    { label: 'En revue', value: underReviewQuery.data?.total ?? 0, caption: 'Analyses en cours' },
    { label: 'Validés', value: verifiedQuery.data?.total ?? 0, caption: 'Prestataires activés' },
    { label: 'Rejetés', value: rejectedQuery.data?.total ?? 0, caption: 'Réupload demandé' },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Compliance prestataires</h1>
        <p className="text-sm text-saubio-slate/70">
          Suivez en temps réel les vérifications identité et les actions menées par l’équipe conformité.
        </p>
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <Link
            href="/admin/documents/providers"
            className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-saubio-forest"
          >
            Files en attente
          </Link>
          <Link
            href="/admin/documents/audit"
            className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-saubio-forest"
          >
            Audit complet
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <SurfaceCard key={card.label} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
            <p className="text-xs text-saubio-slate/60">{card.caption}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Dossiers en attente</p>
          <Link
            href="/admin/documents/providers"
            className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest"
          >
            Tout voir
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                <th className="px-3 py-2 text-left font-semibold">Type doc</th>
                <th className="px-3 py-2 text-left font-semibold">Soumis le</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-4 text-center text-sm text-saubio-slate" colSpan={5}>
                    Chargement des dossiers…
                  </td>
                </tr>
              ) : pendingItems.length ? (
                pendingItems.map((row) => (
                  <tr key={row.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">
                      <div className="flex flex-col">
                        <span>{row.providerName}</span>
                        <span className="text-xs text-saubio-slate/60">{row.providerEmail}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">{row.documentLabel}</td>
                    <td className="px-3 py-2">{formatDate(row.submittedAt)}</td>
                    <td className="px-3 py-2 space-y-1 text-xs">
                      {renderStatus(row.status)}
                      {row.underReviewBy ? (
                        <p className="text-saubio-slate/60">Par {row.underReviewBy}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/documents/providers/${row.providerId}`} className="text-saubio-forest underline">
                        Voir dossier
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center text-sm text-saubio-slate" colSpan={5}>
                    Aucun dossier en attente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
