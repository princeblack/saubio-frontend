'use client';

import { SurfaceCard } from '@saubio/ui';
import { useAdminServiceCatalog, useAdminServiceOptions } from '@saubio/utils';
import { Layers, ClipboardList, AlertCircle } from 'lucide-react';

export default function AdminServiceOptionsPage() {
  const catalogQuery = useAdminServiceCatalog();
  const optionsQuery = useAdminServiceOptions();
  const services = catalogQuery.data?.services ?? [];
  const options = optionsQuery.data?.options ?? [];

  const serviceMap = new Map(services.map((service) => [service.id, service]));
  const grouped = options.reduce<Record<string, typeof options>>((acc, option) => {
    acc[option.serviceId] = acc[option.serviceId] ?? [];
    acc[option.serviceId].push(option);
    return acc;
  }, {});

  const isLoading = catalogQuery.isLoading || optionsQuery.isLoading;
  const hasError = catalogQuery.isError || optionsQuery.isError;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Services & Tarifs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Options & add-ons</h1>
        <p className="text-sm text-saubio-slate/70">
          Liste exhaustive des options affichées aux clients lors de la réservation (vitres, four, eco, etc.).
        </p>
      </header>

      {isLoading ? (
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/90 p-6 shadow-soft-lg">
          <p className="text-sm text-saubio-slate/70">Chargement des options…</p>
        </SurfaceCard>
      ) : hasError ? (
        <SurfaceCard className="rounded-3xl border border-rose-200 bg-white/95 p-6 shadow-soft-lg">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">Impossible de récupérer les options. Merci de réessayer.</p>
          </div>
        </SurfaceCard>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/60">Services avec options</p>
                  <p className="text-3xl font-semibold text-saubio-forest">{optionsQuery.data?.summary.servicesCovered ?? 0}</p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/70 text-saubio-forest">
                  <Layers className="h-5 w-5" />
                </span>
              </div>
            </SurfaceCard>
            <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-saubio-slate/60">Options cataloguées</p>
                  <p className="text-3xl font-semibold text-saubio-forest">{optionsQuery.data?.summary.totalOptions ?? 0}</p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/70 text-saubio-forest">
                  <ClipboardList className="h-5 w-5" />
                </span>
              </div>
            </SurfaceCard>
          </section>

          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-saubio-forest">Arborescence des options</p>
              <span className="text-xs text-saubio-slate/60">{options.length} options actives</span>
            </div>
            <div className="space-y-4">
              {services.map((service) => {
                const serviceOptions = grouped[service.id] ?? [];
                return (
                  <div key={service.id} className="rounded-2xl border border-saubio-forest/10 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-saubio-forest">{service.title}</p>
                        <p className="text-xs text-saubio-slate/60">{serviceOptions.length} option(s)</p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          serviceOptions.length ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}
                      >
                        {serviceOptions.length ? 'Actif' : 'Aucune option'}
                      </span>
                    </div>
                    {serviceOptions.length > 0 && (
                      <ul className="mt-3 space-y-1 rounded-2xl bg-saubio-mist/50 p-3 text-sm text-saubio-slate/80">
                        {serviceOptions.map((option) => (
                          <li key={option.id} className="flex items-center justify-between">
                            <span>{option.label}</span>
                            <span className="text-xs text-saubio-slate/60">{option.priceImpactType === 'included' ? 'Inclus' : option.priceImpactType}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
