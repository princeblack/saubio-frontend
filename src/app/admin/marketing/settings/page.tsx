'use client';

import { SurfaceCard, Skeleton } from '@saubio/ui';
import { AlertTriangle, ToggleLeft } from 'lucide-react';
import { useMemo } from 'react';
import { useAdminMarketingSettings } from '@saubio/utils';

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function AdminMarketingSettingsPage() {
  const settingsQuery = useAdminMarketingSettings();
  const data = settingsQuery.data;

  const toggles = useMemo(
    () => [
      {
        label: 'Activer codes promo',
        description: 'Permet aux clients de saisir un coupon',
        enabled: data?.toggles.promoCodesEnabled ?? false,
      },
      {
        label: 'Activer parrainage',
        description: 'Programme parrain/filleul visible dans l’app',
        enabled: data?.toggles.referralEnabled ?? false,
      },
      {
        label: 'Notifications marketing',
        description: 'Emails + push marketing',
        enabled: data?.toggles.marketingNotificationsEnabled ?? false,
      },
    ],
    [data?.toggles]
  );

  const policy = useMemo(
    () => [
      {
        label: 'Limite codes promo / client',
        value: data ? `${data.policy.maxPromoCodesPerClient} / mois` : '—',
      },
      {
        label: 'Règles de cumul',
        value: data?.policy.stackingRules ?? 'Aucune règle personnalisée',
      },
      {
        label: 'Zones réservées',
        value: data?.policy.restrictedZones ?? 'Promo globale (pas de restriction)',
      },
    ],
    [data?.policy]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Marketing & codes promo</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Paramètres marketing</h1>
        <p className="text-sm text-saubio-slate/70">Activez/désactivez les fonctionnalités, définissez les limites et gardez un log des modifications.</p>
      </header>

      {settingsQuery.isError && (
        <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Impossible de charger les paramètres marketing.</p>
            <p className="text-rose-600/90">
              {settingsQuery.error instanceof Error
                ? settingsQuery.error.message
                : 'Veuillez réessayer dans quelques instants.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Toggles globaux</p>
          {settingsQuery.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`toggle-skeleton-${index}`} className="h-14 rounded-2xl" />
              ))}
            </div>
          )}
          {!settingsQuery.isLoading && (
            <ul className="space-y-3 text-sm text-saubio-slate/80">
              {toggles.map((setting) => (
                <li key={setting.label} className="rounded-2xl border border-saubio-forest/10 p-3">
                  <div className="flex items-center justify-between text-saubio-forest">
                    <div>
                      <p className="font-semibold">{setting.label}</p>
                      <p className="text-xs text-saubio-slate/60">{setting.description}</p>
                    </div>
                    <ToggleLeft
                      className={`h-6 w-6 ${
                        setting.enabled ? 'text-saubio-forest' : 'text-saubio-slate/40'
                      }`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="mb-3 text-sm font-semibold text-saubio-forest">Politique générale</p>
          {settingsQuery.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`policy-skeleton-${index}`} className="h-16 rounded-2xl" />
              ))}
            </div>
          )}
          {!settingsQuery.isLoading && (
            <ul className="space-y-3 text-sm text-saubio-slate/80">
              {policy.map((item) => (
                <li key={item.label} className="rounded-2xl border border-saubio-forest/10 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{item.label}</p>
                  <p className="text-saubio-forest whitespace-pre-line">{item.value}</p>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Logs de modification</p>
        {settingsQuery.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`log-skeleton-${index}`} className="h-16 rounded-2xl" />
            ))}
          </div>
        )}
        {!settingsQuery.isLoading && (
          <ul className="space-y-2 text-sm text-saubio-slate/80">
            {data?.logs.map((log) => (
              <li key={log.id} className="rounded-2xl bg-saubio-mist/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">
                  {formatDateTime(log.createdAt)} • {log.user ? `${log.user.name}` : 'Système'}
                </p>
                <p className="text-saubio-forest">{log.label}</p>
                {(log.previousValue || log.newValue) && (
                  <p className="text-xs text-saubio-slate/60">
                    {log.previousValue ?? '—'} → {log.newValue ?? '—'}
                  </p>
                )}
              </li>
            ))}
            {data && data.logs.length === 0 && (
              <li className="rounded-2xl border border-dashed border-saubio-forest/20 p-4 text-center text-saubio-slate/60">
                Aucun changement consigné pour l’instant.
              </li>
            )}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
