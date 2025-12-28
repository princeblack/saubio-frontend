'use client';

import { SurfaceCard } from '@saubio/ui';

const KPI = [
  { label: 'Pages publiées', value: '24', caption: 'Accueil, services, villes…' },
  { label: 'Articles blog', value: '56', caption: '+3 brouillons' },
  { label: 'Templates email', value: '18', caption: 'Transactionnels + marketing' },
  { label: 'Médias', value: '1 320', caption: 'Images optimisées' },
];

const PAGES = [
  { name: 'Accueil', lastEdit: '15 janv.', status: 'Publié', editor: 'Nina' },
  { name: 'Services', lastEdit: '14 janv.', status: 'Publié', editor: 'Alex' },
  { name: 'Nettoyage Berlin', lastEdit: '11 janv.', status: 'Brouillon', editor: 'Marketing' },
  { name: 'FAQ', lastEdit: '9 janv.', status: 'Publié', editor: 'Support' },
];

export default function AdminCmsOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Gestion du contenu public</h1>
        <p className="text-sm text-saubio-slate/70">Éditez le site, blog, FAQ, pages locales, emails et références SEO.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((card) => (
          <SurfaceCard key={card.label} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{card.label}</p>
            <p className="text-3xl font-semibold text-saubio-forest">{card.value}</p>
            <p className="text-xs text-saubio-slate/60">{card.caption}</p>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Pages récentes</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Créer une page</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Page</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière édition</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Édité par</th>
              </tr>
            </thead>
            <tbody>
              {PAGES.map((page) => (
                <tr key={page.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{page.name}</td>
                  <td className="px-3 py-2">{page.lastEdit}</td>
                  <td className="px-3 py-2">{page.status}</td>
                  <td className="px-3 py-2">{page.editor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
