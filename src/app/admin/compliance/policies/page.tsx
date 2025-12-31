'use client';

import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import { formatDateTime, useAdminMarketingSettings } from '@saubio/utils';

export default function AdminCompliancePoliciesPage() {
  const settingsQuery = useAdminMarketingSettings();
  const settings = settingsQuery.data;

  const toggles = settings
    ? [
        { label: 'Promo codes', value: settings.toggles.promoCodesEnabled ? 'Activés' : 'Désactivés' },
        { label: 'Programme de parrainage', value: settings.toggles.referralEnabled ? 'Actif' : 'Inactif' },
        {
          label: 'Notifications marketing',
          value: settings.toggles.marketingNotificationsEnabled ? 'Autorisées' : 'Bloquées',
        },
        { label: 'Max codes / client', value: settings.policy.maxPromoCodesPerClient.toString() },
      ]
    : [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Conformité & sécurité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Politiques & CGU</h1>
        <p className="text-sm text-saubio-slate/70">
          Centralisez les paramètres de diffusion (promo codes, cookies, notifications) et l&apos;historique des modifications.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {settingsQuery.isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <SurfaceCard
                key={`skeleton-${idx}`}
                className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg"
              >
                <div className="h-4 w-24 rounded-full bg-saubio-forest/10" />
                <div className="mt-3 h-6 w-16 rounded-full bg-saubio-forest/10" />
              </SurfaceCard>
            ))
          : toggles.map((toggle) => (
              <SurfaceCard
                key={toggle.label}
                className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm text-saubio-slate/70 shadow-soft-lg"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">{toggle.label}</p>
                <p className="text-3xl font-semibold text-saubio-forest">{toggle.value}</p>
              </SurfaceCard>
            ))}
      </section>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 space-y-1">
          <p className="text-sm font-semibold text-saubio-forest">Politique promo / consentement</p>
          {settings ? (
            <div className="grid gap-2 text-sm text-saubio-slate/70 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Empilement autorisé</p>
                <p>{settings.policy.stackingRules ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/50">Zones restreintes</p>
                <p>{settings.policy.restrictedZones ?? '—'}</p>
              </div>
            </div>
          ) : null}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-saubio-forest">Historique des mises à jour</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-saubio-slate/80">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  <th className="px-3 py-2 text-left font-semibold">Champ</th>
                  <th className="px-3 py-2 text-left font-semibold">Ancienne valeur</th>
                  <th className="px-3 py-2 text-left font-semibold">Nouvelle valeur</th>
                  <th className="px-3 py-2 text-left font-semibold">Mis à jour par</th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {settingsQuery.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : settings?.logs && settings.logs.length > 0 ? (
                  settings.logs.map((log) => (
                    <tr key={log.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2 font-semibold text-saubio-forest">{log.label}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{log.previousValue ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{log.newValue ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{log.user?.name ?? log.user?.email ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                      Aucun changement enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
