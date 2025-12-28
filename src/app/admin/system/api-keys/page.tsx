'use client';

import { SurfaceCard } from '@saubio/ui';

const API_KEYS = [
  { name: 'Ops automation', scope: 'Bookings:read, Payments:write', lastUsed: '15 janv. · 08:10', status: 'Actif', rateLimit: '5k req/jour' },
  { name: 'BI exports', scope: 'Bookings:read, Finance:read', lastUsed: '14 janv. · 23:15', status: 'Actif', rateLimit: '2k req/jour' },
  { name: 'Legacy client', scope: 'Bookings:read', lastUsed: 'n/a', status: 'Révoqué', rateLimit: '—' },
];

export default function AdminSystemApiKeysPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Système & intégrations</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Clés API & permissions</h1>
        <p className="text-sm text-saubio-slate/70">Générez des clés internes, assignez scopes, appliquez rotations et rate limits.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Clés existantes</p>
          <button className="rounded-full border border-saubio-forest/20 px-4 py-1.5 text-xs font-semibold text-saubio-forest">Créer une clé</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Scopes</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière utilisation</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Rate limit</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {API_KEYS.map((key) => (
                <tr key={key.name} className="border-b border-saubio-forest/5 last-border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{key.name}</td>
                  <td className="px-3 py-2 text-xs text-saubio-slate/60">{key.scope}</td>
                  <td className="px-3 py-2">{key.lastUsed}</td>
                  <td className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${key.status === 'Actif' ? 'text-emerald-900' : 'text-rose-900'}`}>{key.status}</td>
                  <td className="px-3 py-2">{key.rateLimit}</td>
                  <td className="px-3 py-2 text-xs text-saubio-forest underline">Voir · Révoquer</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
