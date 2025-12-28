'use client';

import { SurfaceCard } from '@saubio/ui';
import { AlertCircle, Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAdminPostalZones } from '@saubio/utils';

export default function AdminZonesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const zonesQuery = useAdminPostalZones({ search, page, pageSize: 25 });
  const data = zonesQuery.data;

  const rows = data?.items ?? [];
  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Zones & Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Gestion des zones</h1>
        <p className="text-sm text-saubio-slate/70">
          Listez les villes/codes postaux où Saubio est actif, ajustez les services disponibles et ajoutez des commentaires internes.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-saubio-forest/10 bg-saubio-mist px-3">
            <Filter className="h-4 w-4 text-saubio-slate/60" />
            <input
              type="text"
              placeholder="Filtrer par ville ou code postal…"
              className="h-11 flex-1 border-none bg-transparent text-sm text-saubio-forest outline-none"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <button
            className="rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest"
            onClick={() => {
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            Appliquer
          </button>
        </div>

        {zonesQuery.isLoading ? (
          <div className="py-10 text-center text-sm text-saubio-slate/70">Chargement du référentiel…</div>
        ) : zonesQuery.isError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" />
            Impossible de charger le référentiel des zones.
          </div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-saubio-slate/70">Aucune zone ne correspond à la recherche.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-saubio-slate/80">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                    <th className="px-3 py-2 text-left font-semibold">Code postal</th>
                    <th className="px-3 py-2 text-left font-semibold">Ville</th>
                    <th className="px-3 py-2 text-left font-semibold">Région</th>
                    <th className="px-3 py-2 text-left font-semibold">Pays</th>
                    <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((zone) => (
                    <tr key={zone.postalCode} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2 font-semibold text-saubio-forest">{zone.postalCode}</td>
                      <td className="px-3 py-2">
                        <p className="font-semibold text-saubio-forest">{zone.city}</p>
                        <p className="text-xs text-saubio-slate/60">{zone.area ?? '—'}</p>
                      </td>
                      <td className="px-3 py-2">{zone.state ?? '—'}</td>
                      <td className="px-3 py-2">{zone.countryCode ?? 'DE'}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {zone.active ? 'Active' : 'Désactivée'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-saubio-slate/60">
              <span>
                Page {data?.page ?? 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-2xl border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Précédent
                </button>
                <button
                  className="rounded-2xl border border-saubio-forest/20 px-3 py-1 text-saubio-forest disabled:opacity-40"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}
      </SurfaceCard>
    </div>
  );
}
