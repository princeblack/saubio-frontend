'use client';

import { ChangeEvent, FormEventHandler, useEffect, useMemo, useState } from 'react';
import {
  usePaymentMandates,
  usePaymentEvents,
  formatDateTime,
  useCreatePaymentMandateMutation,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, LoadingIndicator } from '@saubio/ui';
import { useTranslation } from 'react-i18next';

type MandateFormState = {
  consumerName: string;
  consumerAccount: string;
  signatureDate: string;
};

const createInitialFormState = (): MandateFormState => ({
  consumerName: '',
  consumerAccount: '',
  signatureDate: new Date().toISOString().slice(0, 10),
});

export default function ClientMandatesPage() {
  const { t } = useTranslation();
  const mandatesQuery = usePaymentMandates();
  const eventsQuery = usePaymentEvents();
  const createMandateMutation = useCreatePaymentMandateMutation();
  const [formState, setFormState] = useState<MandateFormState>(createInitialFormState);

  const isLoading = mandatesQuery.isLoading || eventsQuery.isLoading;
  const isError = mandatesQuery.isError || eventsQuery.isError;
  const creationError =
    createMandateMutation.isError && createMandateMutation.error instanceof Error
      ? createMandateMutation.error.message
      : null;
  const submitDisabled = useMemo(() => {
    const hasName = formState.consumerName.trim().length >= 3;
    const hasAccount = formState.consumerAccount.replace(/\s+/g, '').length >= 8;
    return !hasName || !hasAccount || createMandateMutation.isPending;
  }, [createMandateMutation.isPending, formState.consumerAccount, formState.consumerName]);

  useEffect(() => {
    if (createMandateMutation.isSuccess) {
      setFormState(createInitialFormState());
    }
  }, [createMandateMutation.isSuccess]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (submitDisabled) {
      return;
    }
    createMandateMutation.mutate({
      consumerName: formState.consumerName.trim(),
      consumerAccount: formState.consumerAccount.trim(),
      signatureDate: formState.signatureDate || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingIndicator tone="dark" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-4xl border border-red-200 bg-red-50/80 p-6 text-sm text-red-700">
        {t('clientMandates.error', 'Impossible de charger vos mandats ou l’historique de paiement.')}
      </div>
    );
  }

  const mandates = mandatesQuery.data ?? [];
  const events = eventsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <SectionTitle as="h1" size="large">
          {t('clientMandates.title', 'Mandats bancaires & historique SEPA')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'clientMandates.subtitle',
            'Consultez vos mandats SEPA, leur statut et l’historique des événements reçus de notre prestataire de paiement.'
          )}
        </SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('clientMandates.create.title', 'Ajouter un mandat SEPA')}
          </p>
          <p className="text-xs text-saubio-slate/60">
            {t(
              'clientMandates.create.subtitle',
              'Autorisez Saubio à initier des prélèvements automatiques pour vos réservations. Vos informations IBAN sont chiffrées et transmises à notre prestataire Mollie.'
            )}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 rounded-3xl border border-saubio-forest/10 bg-white/90 p-4 text-sm font-medium text-saubio-slate/80">
              <span>{t('clientMandates.create.consumerName', 'Titulaire du compte')}</span>
              <input
                type="text"
                name="consumerName"
                value={formState.consumerName}
                onChange={handleInputChange}
                placeholder={t('clientMandates.create.consumerName.placeholder', 'Ex. Marie Dupont')}
                className="rounded-2xl border border-saubio-mist px-3 py-2 text-base font-normal outline-none focus:border-saubio-forest focus:ring-2 focus:ring-saubio-forest/20"
                required
              />
            </label>
            <label className="flex flex-col gap-2 rounded-3xl border border-saubio-forest/10 bg-white/90 p-4 text-sm font-medium text-saubio-slate/80">
              <span>{t('clientMandates.create.consumerAccount', 'IBAN')}</span>
              <input
                type="text"
                name="consumerAccount"
                value={formState.consumerAccount}
                onChange={handleInputChange}
                placeholder={t('clientMandates.create.consumerAccount.placeholder', 'DE89 3704 0044 0532 0130 00')}
                className="uppercase tracking-wider rounded-2xl border border-saubio-mist px-3 py-2 text-base font-normal outline-none focus:border-saubio-forest focus:ring-2 focus:ring-saubio-forest/20"
                required
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 rounded-3xl border border-saubio-forest/10 bg-white/90 p-4 text-sm font-medium text-saubio-slate/80 md:w-72">
            <span>{t('clientMandates.create.signatureDate', 'Date de signature')}</span>
            <input
              type="date"
              name="signatureDate"
              value={formState.signatureDate}
              onChange={handleInputChange}
              className="rounded-2xl border border-saubio-mist px-3 py-2 text-base font-normal outline-none focus:border-saubio-forest focus:ring-2 focus:ring-saubio-forest/20"
            />
          </label>
          {creationError && (
            <p className="text-sm text-red-600">
              {t('clientMandates.create.error', 'Impossible de créer le mandat : {{message}}', {
                message: creationError,
              })}
            </p>
          )}
          {createMandateMutation.isSuccess && (
            <p className="text-sm text-saubio-forest">
              {t('clientMandates.create.success', 'Mandat enregistré avec succès. Il peut prendre quelques minutes avant d’apparaître dans la liste.')}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitDisabled}
              className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-6 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-saubio-forest/90 disabled:cursor-not-allowed disabled:bg-saubio-forest/30"
            >
              {createMandateMutation.isPending
                ? t('clientMandates.create.submitting', 'Création en cours…')
                : t('clientMandates.create.submit', 'Autoriser ce compte')}
            </button>
            <p className="text-xs text-saubio-slate/60">
              {t(
                'clientMandates.create.hint',
                'En validant, vous autorisez Saubio (mollie payments) à débiter ce compte pour vos réservations confirmées.'
              )}
            </p>
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('clientMandates.list.title', 'Mandats enregistrés')}
          </p>
          <p className="text-xs text-saubio-slate/60">
            {t(
              'clientMandates.list.subtitle',
              'Chaque mandat autorise un prélèvement SEPA. Vérifiez qu’il est actif avant vos prochaines réservations.'
            )}
          </p>
        </div>
        {mandates.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-saubio-forest/15 bg-white/70 p-4 text-center text-sm text-saubio-slate/60">
            {t('clientMandates.list.empty', 'Aucun mandat SEPA n’est enregistré pour votre compte.').toString()}
          </p>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-saubio-forest/10 bg-white shadow-soft-md">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-saubio-mist/40 text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('clientMandates.table.provider', 'PSP')}</th>
                  <th className="px-4 py-3 font-semibold">{t('clientMandates.table.reference', 'Référence')}</th>
                  <th className="px-4 py-3 font-semibold">{t('clientMandates.table.status', 'Statut')}</th>
                  <th className="px-4 py-3 font-semibold">{t('clientMandates.table.bank', 'Banque')}</th>
                  <th className="px-4 py-3 font-semibold">{t('clientMandates.table.acceptedAt', 'Accepté le')}</th>
                  <th className="px-4 py-3 font-semibold">{t('clientMandates.table.syncedAt', 'Synchronisé')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saubio-forest/10">
                {mandates.map((mandate) => (
                  <tr key={mandate.id} className="text-saubio-slate/80">
                    <td className="px-4 py-3 text-xs uppercase text-saubio-slate/60">
                      {mandate.provider ?? 'mollie'}
                    </td>
                    <td className="px-4 py-3">{mandate.reference ?? mandate.externalMandateId}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-saubio-mist/50 px-3 py-1 text-xs font-semibold uppercase">
                        {mandate.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {mandate.bankCountry ? `${mandate.bankCountry}${mandate.bankCode ? ` · ${mandate.bankCode}` : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-saubio-slate/60">
                      {mandate.acceptedAt ? formatDateTime(mandate.acceptedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-saubio-slate/60">
                      {mandate.lastSyncedAt ? formatDateTime(mandate.lastSyncedAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="md" className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
            {t('clientMandates.events.title', 'Historique des événements SEPA')}
          </p>
          <p className="text-xs text-saubio-slate/60">
            {t(
              'clientMandates.events.subtitle',
              'Chaque entrée correspond à un message de notre prestataire de paiement (Mollie). Utile pour diagnostiquer des paiements en cours ou refusés.'
            )}
          </p>
        </div>
        {events.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-saubio-forest/15 bg-white/70 p-4 text-center text-sm text-saubio-slate/60">
            {t('clientMandates.events.empty', 'Aucun événement n’a encore été reçu pour vos paiements.').toString()}
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="rounded-3xl border border-saubio-forest/10 bg-white/90 p-4 shadow-soft-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-saubio-forest">
                      {event.type.replace(/\./g, ' › ')}
                    </p>
                    <p className="text-xs text-saubio-slate/60">
                      {event.provider} · {formatDateTime(event.createdAt)}
                    </p>
                  </div>
                  <code className="rounded-2xl bg-saubio-mist/30 px-3 py-1 text-[11px] text-saubio-slate/70">
                    #{event.paymentId ?? '—'}
                  </code>
                </div>
                <pre className="mt-3 max-h-48 overflow-auto rounded-2xl bg-saubio-mist/50 p-3 text-xs text-saubio-slate/80">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
