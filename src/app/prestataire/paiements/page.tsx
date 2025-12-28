'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRequireRole, useProviderBankInfo, useSaveProviderBankInfoMutation } from '@saubio/utils';
import { SectionTitle, SectionDescription, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../components/feedback/ErrorState';

const maskIban = (iban?: string | null) => {
  if (!iban) return null;
  const normalized = iban.replace(/\s+/g, '').toUpperCase();
  if (normalized.length <= 8) return normalized;
  return `${normalized.slice(0, 2)}••••••${normalized.slice(-4)}`;
};

export default function ProviderPayoutPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const bankInfoQuery = useProviderBankInfo();
  const saveBankMutation = useSaveProviderBankInfoMutation();

  const [form, setForm] = useState({ accountHolder: '', iban: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const data = bankInfoQuery.data;
    if (!data) return;
    setForm((prev) => ({
      accountHolder: data.accountHolder ?? prev.accountHolder,
      iban: '',
    }));
  }, [bankInfoQuery.data]);

  if (!session.user) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    const accountHolder = form.accountHolder.trim() || `${session.user.firstName ?? ''} ${session.user.lastName ?? ''}`.trim() || session.user.email;
    const normalizedIban = form.iban.replace(/\s+/g, '').toUpperCase();
    if (!/^[A-Z0-9]{15,34}$/.test(normalizedIban)) {
      setError(t('providerProfilePage.payout.ibanError', 'IBAN invalide. Vérifiez le format.'));
      return;
    }
    saveBankMutation.mutate(
      { accountHolder, iban: normalizedIban },
      {
        onSuccess: (response) => {
          setMessage(
            response.status === 'active'
              ? t('providerProfilePage.payout.success', 'Coordonnées bancaires enregistrées. Vous recevrez vos paiements automatiquement.')
              : t('providerProfilePage.payout.pendingReview', 'Coordonnées enregistrées, validation en cours.')
          );
          setForm({ accountHolder, iban: '' });
          void bankInfoQuery.refetch();
        },
        onError: () => {
          setError(t('providerProfilePage.payout.error', 'Impossible d’enregistrer vos coordonnées pour le moment.'));
        },
      }
    );
  };

  const status = bankInfoQuery.data?.status ?? 'inactive';
  const statusTone =
    status === 'active'
      ? 'bg-emerald-100 text-emerald-900'
      : status === 'failed'
        ? 'bg-red-100 text-red-800'
        : 'bg-amber-100 text-amber-900';
  const statusLabel = {
    active: t('providerProfilePage.payout.statusLabel.verified', 'Paiements activés'),
    pending: t('providerProfilePage.payout.statusLabel.in_review', 'Validation en cours'),
    inactive: t('providerProfilePage.payout.statusLabel.pending', 'À compléter'),
    failed: t('providerProfilePage.payout.statusLabel.rejected', 'Rejeté'),
  }[status];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerProfilePage.payout.requiredTitle', 'Activez vos paiements')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'providerProfilePage.payout.requiredDescription',
            'Ajoutez vos coordonnées bancaires pour recevoir vos paiements. Tout se passe dans l’application, sans redirection externe.'
          )}
        </SectionDescription>
      </header>

      {bankInfoQuery.isLoading ? (
        <SurfaceCard variant="soft" padding="md" className="space-y-4">
          <Skeleton className="h-4 w-48 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-32 rounded-3xl" />
        </SurfaceCard>
      ) : bankInfoQuery.isError ? (
        <ErrorState
          title={t('providerDashboard.errorTitle', 'Impossible de charger')}
          description={t('providerDashboard.errorDescription', 'Réessayez dans quelques instants.')}
          onRetry={() => void bankInfoQuery.refetch()}
        />
      ) : (
        <SurfaceCard variant="soft" padding="md" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-saubio-slate/90">
                {t('providerProfilePage.payout.status', 'Statut')}
              </p>
              <p className="text-xs text-saubio-slate/60">
                {t('providerProfilePage.payout.statusHint.pending', 'Vérification en cours.')}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold ${statusTone}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="rounded-2xl border border-saubio-forest/10 bg-white p-4 text-sm text-saubio-slate-900">
            <dl className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold uppercase tracking-wide text-xs text-saubio-slate/60">
                  {t('providerProfilePage.payout.accountHolder', 'Titulaire du compte')}
                </dt>
                <dd>{bankInfoQuery.data?.accountHolder ?? '—'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold uppercase tracking-wide text-xs text-saubio-slate/60">
                  IBAN
                </dt>
                <dd>{bankInfoQuery.data?.ibanMasked ?? '—'}</dd>
              </div>
              {bankInfoQuery.data?.bankName ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-semibold uppercase tracking-wide text-xs text-saubio-slate/60">
                    {t('providerProfilePage.payout.bank', 'Banque')}
                  </dt>
                  <dd>{bankInfoQuery.data.bankName}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
              {t('providerProfilePage.payout.accountHolder', 'Titulaire du compte')}
              <input
                type="text"
                value={form.accountHolder}
                onChange={(event) => setForm((state) => ({ ...state, accountHolder: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-saubio-forest"
                placeholder={`${session.user.firstName ?? ''} ${session.user.lastName ?? ''}`.trim()}
                required
              />
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
              IBAN
              <input
                type="text"
                inputMode="text"
                value={form.iban}
                onChange={(event) => setForm((state) => ({ ...state, iban: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-saubio-forest/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-saubio-forest"
                placeholder="DE00 0000 0000 0000 0000 00"
                required
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
              disabled={saveBankMutation.isPending}
            >
              {saveBankMutation.isPending
                ? t('providerProfilePage.payout.opening', 'Activation en cours…')
                : t('providerProfilePage.payout.cta', 'Enregistrer mes coordonnées bancaires')}
            </button>
            {message ? <p className="text-xs text-saubio-forest">{message}</p> : null}
            {error ? <p className="text-xs text-red-700">{error}</p> : null}
          </form>
        </SurfaceCard>
      )}
    </div>
  );
}
