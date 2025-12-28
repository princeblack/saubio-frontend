'use client';

import { SurfaceCard } from '@saubio/ui';

const STATIC_PAGES = [
  { name: 'Accueil', seo: 'Nettoyage éco-responsable', status: 'Publié', updated: '15 janv.' },
  { name: 'Services', seo: 'Nos offres', status: 'Publié', updated: '14 janv.' },
  { name: 'Nettoyage Berlin', seo: 'Ménage Berlin', status: 'Brouillon', updated: '11 janv.' },
  { name: 'Politique cookies', seo: 'Cookies Saubio', status: 'Publié', updated: '10 janv.' },
];

export default function AdminCmsPagesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Pages statiques</h1>
        <p className="text-sm text-saubio-slate/70">Accueil, services, légales, SEO locales… éditez sans déployer.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between text-xs text-saubio-slate/70">
          <input placeholder="Rechercher une page" className="rounded-full border border-saubio-forest/20 px-3 py-1 outline-none" />
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest">Créer une page</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Page</th>
                <th className="px-3 py-2 text-left font-semibold">SEO / Titre</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière mise à jour</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {STATIC_PAGES.map((page) => (
                <tr key={page.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{page.name}</td>
                  <td className="px-3 py-2">{page.seo}</td>
                  <td className="px-3 py-2">{page.status}</td>
                  <td className="px-3 py-2">{page.updated}</td>
                  <td className="px-3 py-2 text-saubio-forest underline">Éditer</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
