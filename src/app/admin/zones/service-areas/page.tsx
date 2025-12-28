'use client';

import { SurfaceCard } from '@saubio/ui';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAdminProviderServiceAreas } from '@saubio/utils';

export default function AdminZoneServiceAreasPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const serviceAreasQuery = useAdminProviderServiceAreas({ page, pageSize: 25, search: search || undefined });
  const data = serviceAreasQuery.data;
  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Zones & Matching</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Zones de service déclarées</h1>
        <p className="text-sm text-saubio-slate/70">Consultez les zones d'intervention renseignées par les prestataires et identifiez les écarts.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Rechercher un prestataire ou un code postal…"
            className="h-11 flex-1 rounded-2xl border border-saubio-forest/10 px-3 text-sm text-saubio-forest outline-none"
          />
        </div>

        {serviceAreasQuery.isLoading ? (
          <div className="py-8 text-center text-sm text-saubio-slate/70">Chargement des zones déclarées…</div>
        ) : serviceAreasQuery.isError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" />
            Impossible de récupérer les données.
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-saubio-slate/70">Aucun prestataire trouvé.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-saubio-slate/80">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                    <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                    <th className="px-3 py-2 text-left font-semibold">Code postal principal</th>
                    <th className="px-3 py-2 text-left font-semibold">Zones couvertes</th>
                    <th className="px-3 py-2 text-left font-semibold">Services</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.providerId} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2 font-semibold text-saubio-forest">{item.providerName}</td>
                      <td className="px-3 py-2">{item.providerEmail}</td>
                      <td className="px-3 py-2">
                        {item.baseCity ? `${item.baseCity} (${item.basePostalCode ?? '—'})` : item.basePostalCode ?? '—'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1 text-xs text-saubio-slate/70">
                          {item.serviceZones.length === 0
                            ? '—'
                            : item.serviceZones.map((zone) => (
                                <span key={zone.id} className="rounded-xl border border-saubio-forest/10 px-2 py-1">
                                  {zone.name} {zone.postalCode ? `(${zone.postalCode})` : ''}
                                </span>
                              ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/70">
                        {item.serviceCategories.length === 0 ? '—' : item.serviceCategories.join(', ')}
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
