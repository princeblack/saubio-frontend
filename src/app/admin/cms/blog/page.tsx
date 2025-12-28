'use client';

import { SurfaceCard } from '@saubio/ui';

const ARTICLES = [
  { title: 'Nettoyage éco : nos 5 conseils', status: 'Publié', author: 'Marketing', updated: '15 janv.', tags: 'Éco, Conseils' },
  { title: 'Guide complet pour prestataires', status: 'Brouillon', author: 'Ops', updated: '14 janv.', tags: 'Prestataire' },
  { title: 'FAQ B2B', status: 'Publié', author: 'Support', updated: '13 janv.', tags: 'B2B, FAQ' },
];

export default function AdminCmsBlogPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Blog & articles</h1>
        <p className="text-sm text-saubio-slate/70">Créez, éditez, catégorisez et publiez vos contenus marketing.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between text-xs text-saubio-slate/70">
          <input placeholder="Recherche titre / tag" className="rounded-full border border-saubio-forest/20 px-3 py-1 outline-none" />
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest">Nouvel article</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Titre</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Auteur</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière MAJ</th>
                <th className="px-3 py-2 text-left font-semibold">Tags</th>
              </tr>
            </thead>
            <tbody>
              {ARTICLES.map((article) => (
                <tr key={article.title} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{article.title}</td>
                  <td className="px-3 py-2">{article.status}</td>
                  <td className="px-3 py-2">{article.author}</td>
                  <td className="px-3 py-2">{article.updated}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{article.tags}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
