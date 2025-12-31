'use client';

import { useMemo } from 'react';
import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import {
  formatDateTime,
  useAdminMarketingLandingPages,
  useAdminNotificationTemplates,
} from '@saubio/utils';

const statusTone: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-900',
  draft: 'bg-saubio-sun/10 text-saubio-sun/80',
  archived: 'bg-saubio-slate/10 text-saubio-slate/70',
};

export default function AdminCmsOverviewPage() {
  const landingQuery = useAdminMarketingLandingPages();
  const templatesQuery = useAdminNotificationTemplates();

  const pages = landingQuery.data?.pages ?? [];
  const published = pages.filter((page) => page.status === 'published').length;
  const drafts = pages.filter((page) => page.status === 'draft').length;
  const totalConversions = pages.reduce((acc, page) => acc + page.conversions, 0);
  const mostRecentPages = useMemo(
    () =>
      [...pages]
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
        .slice(0, 5),
    [pages]
  );

  const cards = [
    { label: 'Pages marketing', value: pages.length, caption: `${published} publiées` },
    { label: 'Brouillons actifs', value: drafts, caption: 'À relire / traduire' },
    { label: 'Conversions cumulées', value: totalConversions, caption: 'Landing trackées' },
    {
      label: 'Templates email',
      value: templatesQuery.data?.length ?? 0,
      caption: 'Transactionnels + marketing',
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Gestion du contenu public</h1>
        <p className="text-sm text-saubio-slate/70">
          Pages locales, landing SEO, templates email : un seul cockpit pour monitorer les contenus publiés.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <SurfaceCard
            key={card.label}
            className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm text-saubio-slate/70 shadow-soft-lg"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">
              {landingQuery.isLoading && card.label !== 'Templates email'
                ? '…'
                : card.value.toLocaleString('fr-FR')}
            </p>
            <p className="text-xs text-saubio-slate/60">{card.caption}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-saubio-forest">Pages récentes</p>
            <p className="text-xs text-saubio-slate/60">Dernières mises à jour issues du CMS marketing.</p>
          </div>
          <a className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest" href="/admin/cms/pages">
            Créer / éditer
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Titre</th>
                <th className="px-3 py-2 text-left font-semibold">URL</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière édition</th>
              </tr>
            </thead>
            <tbody>
              {landingQuery.isLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : mostRecentPages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucune page enregistrée.
                  </td>
                </tr>
              ) : (
                mostRecentPages.map((page) => (
                  <tr key={page.id} className="border-b border-saubio-forest/5 last:border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{page.title}</td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{page.path}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[page.status] ?? statusTone.draft}`}>
                        {page.status === 'published' ? 'Publié' : page.status === 'archived' ? 'Archivé' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(page.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
