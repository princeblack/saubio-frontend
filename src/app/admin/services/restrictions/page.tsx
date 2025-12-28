'use client';

import { useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import {
  useAdminServiceCatalog,
  useAdminServicePreviewMutation,
  type AdminServicePreviewParams,
  formatEuro,
} from '@saubio/utils';
import { Loader2, RefreshCcw } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

export default function AdminServicePreviewPage() {
  const catalogQuery = useAdminServiceCatalog();
  const previewMutation = useAdminServicePreviewMutation();
  const services = catalogQuery.data?.services ?? [];

  const [form, setForm] = useState<AdminServicePreviewParams>({
    service: services[0]?.id ?? 'residential',
    postalCode: '10115',
    hours: 3,
    ecoPreference: 'standard',
  });

  const handleChange = (field: keyof AdminServicePreviewParams, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === 'hours' ? Number(value) : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    previewMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Services & Tarifs</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Aperçu côté client</h1>
        <p className="text-sm text-saubio-slate/70">
          Simulez une estimation telle qu’affichée à un client : code postal, durée et préférence éco.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Service</label>
              <select
                className="mt-1 w-full rounded-2xl border border-saubio-forest/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saubio-forest/40"
                value={form.service}
              onChange={(event) => handleChange('service', event.target.value)}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Code postal</label>
              <input
                className="mt-1 w-full rounded-2xl border border-saubio-forest/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saubio-forest/40"
                value={form.postalCode}
                onChange={(event) => handleChange('postalCode', event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Durée</label>
              <input
                type="number"
                min={1}
                step={0.5}
                className="mt-1 w-full rounded-2xl border border-saubio-forest/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saubio-forest/40"
                value={form.hours}
                onChange={(event) => handleChange('hours', event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Préférence éco</label>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saubio-forest/40"
              value={form.ecoPreference}
              onChange={(event) => handleChange('ecoPreference', event.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="bio">Öko / bio</option>
            </select>
          </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-saubio-forest px-4 py-2 text-sm font-semibold text-white hover:bg-saubio-forest/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={previewMutation.isPending}
            >
              {previewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simuler'}
            </button>
          </SurfaceCard>
        </form>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Résultat</p>
          {previewMutation.isIdle && !previewMutation.data ? (
            <p className="text-sm text-saubio-slate/70">Remplissez le formulaire pour obtenir une estimation.</p>
          ) : previewMutation.isLoading ? (
            <p className="text-sm text-saubio-slate/70">Calcul en cours…</p>
          ) : previewMutation.isError ? (
            <div className="flex items-center gap-2 text-rose-700">
              <RefreshCcw className="h-4 w-4" />
              <p className="text-sm">Simulation impossible. Vérifiez les paramètres.</p>
            </div>
          ) : previewMutation.data ? (
            <div className="space-y-3 text-sm text-saubio-slate/80">
              <div className="rounded-2xl border border-saubio-forest/10 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Plage tarifaire locale</p>
                <p className="text-2xl font-semibold text-saubio-forest">
                  {formatEuro((previewMutation.data.estimate.minTotalCents ?? 0) / 100)} →{' '}
                  {formatEuro((previewMutation.data.estimate.maxTotalCents ?? 0) / 100)}
                </p>
                <p className="text-xs text-saubio-slate/60">
                  {previewMutation.data.estimate.providersConsidered} prestataires pris en compte
                </p>
              </div>
              <div className="rounded-2xl border border-saubio-forest/10 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Tarif horaire</p>
                <p className="text-lg font-semibold text-saubio-forest">
                  {formatEuro((previewMutation.data.estimate.minHourlyRateCents ?? 0) / 100)} →{' '}
                  {formatEuro((previewMutation.data.estimate.maxHourlyRateCents ?? 0) / 100)}
                </p>
                <p className="text-xs text-saubio-slate/60">
                  Estimation pour {numberFormatter.format(previewMutation.data.hours)} h · code postal {previewMutation.data.postalCode}
                </p>
              </div>
            </div>
          ) : null}
        </SurfaceCard>
      </div>
    </div>
  );
}
