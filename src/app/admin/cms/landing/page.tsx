'use client';

import { SurfaceCard } from '@saubio/ui';

const LANDINGS = [
  { path: '/nettoyage-berlin', status: 'Publié', city: 'Berlin', lastEdit: '15 janv.' },
  { path: '/nettoyage-hambourg', status: 'Publié', city: 'Hambourg', lastEdit: '12 janv.' },
  { path: '/nettoyage-munich', status: 'Brouillon', city: 'Munich', lastEdit: '11 janv.' },
];

export default function AdminCmsLandingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Landing pages localisées</h1>
        <p className="text-sm text-saubio-slate/70">Générez des pages SEO par ville / code postal avec contenu personnalisé.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between text-xs text-saubio-slate/70">
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest">Nouvelle page ville</button>
          <select className="rounded-full border border-saubio-forest/20 px-3 py-1">
            <option>Filtrer par statut</option>
            <option>Publié</option>
            <option>Brouillon</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">URL</th>
                <th className="px-3 py-2 text-left font-semibold">Ville</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière édition</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {LANDINGS.map((landing) => (
                <tr key={landing.path} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-mono text-xs">{landing.path}</td>
                  <td className="px-3 py-2">{landing.city}</td>
                  <td className="px-3 py-2">{landing.status}</td>
                  <td className="px-3 py-2">{landing.lastEdit}</td>
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
