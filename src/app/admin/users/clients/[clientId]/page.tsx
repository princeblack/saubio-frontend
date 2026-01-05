'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SurfaceCard, Skeleton, PrimaryButton, Pill } from '@saubio/ui';
import { useAdminClientDetail, useUpdateAdminUserMutation } from '@saubio/utils';
import { ArrowLeft, Download, CreditCard, MapPin, Calendar, Phone, Mail } from 'lucide-react';
import { ErrorState } from '../../../../../components/feedback/ErrorState';
import { SuccessToast } from '../../../../../components/system/SuccessToast';

type DialogState = { action: 'suspend' | 'activate'; open: boolean };

const statusTone = (status: string) => {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  if (status === 'invited') return 'bg-amber-50 text-amber-800 border border-amber-100';
  return 'bg-rose-50 text-rose-700 border border-rose-100';
};

const statusLabel = (status: string) => {
  if (status === 'active') return 'Actif';
  if (status === 'invited') return 'Invité';
  return 'Suspendu';
};

export default function AdminClientDetailPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = typeof params?.clientId === 'string' ? params.clientId : undefined;
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const query = useAdminClientDetail(clientId);
  const updateUser = useUpdateAdminUserMutation();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }),
    []
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: undefined,
      }),
    []
  );

  const client = query.data;

  const handleExportJson = () => {
    if (!client) return;
    const blob = new Blob([JSON.stringify(client, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-${client.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = (status: 'active' | 'suspended') => {
    if (!clientId) return;
    updateUser.mutate(
      { id: clientId, payload: { status } },
      {
        onSuccess: () => {
          setToastMessage(
            status === 'active' ? 'Le compte a été réactivé.' : 'Le compte a été suspendu.'
          );
          setDialog(null);
          query.refetch();
        },
      }
    );
  };

  if (query.isError) {
    return (
      <ErrorState
        title="Impossible d’afficher le profil"
        description="Un incident empêche la récupération de ce client."
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center rounded-full border border-saubio-forest/20 px-3 py-1 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/60"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </button>
          {client ? (
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Client</p>
              <h1 className="text-3xl font-semibold text-saubio-forest">{client.name}</h1>
              <p className="text-sm text-saubio-slate/70">
                {client.email} · {client.phone ?? '—'}
              </p>
            </div>
          ) : (
            <Skeleton className="h-12 w-64 rounded-3xl" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PrimaryButton variant="outline" onClick={handleExportJson} disabled={!client}>
            <Download className="mr-2 h-4 w-4" />
            Exporter (JSON)
          </PrimaryButton>
          <PrimaryButton
            variant="outline"
            disabled={!client}
            onClick={() => router.push(`/admin/finance/payments?clientId=${client?.id ?? ''}`)}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Voir paiements
          </PrimaryButton>
          <PrimaryButton disabled={!client} onClick={() => router.push(`/admin/bookings?clientId=${client?.id ?? ''}`)}>
            Voir réservations
          </PrimaryButton>
        </div>
      </div>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
        {client ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Identité</p>
              <div className="mt-3 space-y-2 text-sm text-saubio-slate/80">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-saubio-slate/50" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-saubio-slate/50" />
                  <span>{client.phone ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-saubio-slate/50" />
                  <span>Compte créé le {dateFormatter.format(new Date(client.createdAt))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/60">Statut</span>
                  <Pill tone="mint" className={statusTone(client.status)}>
                    {statusLabel(client.status)}
                  </Pill>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-saubio-slate/60">Type</span>
                  <span className="rounded-full bg-saubio-mist/60 px-3 py-1 text-xs font-semibold text-saubio-slate/80">
                    {client.type === 'company' ? 'Entreprise' : 'Particulier'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm text-saubio-slate/80">
              <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Chiffres clés</p>
              <div className="rounded-2xl border border-saubio-forest/10 bg-saubio-mist/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">Total dépensé</p>
                <p className="text-2xl font-semibold text-saubio-forest">
                  {currencyFormatter.format((client.totalSpentCents ?? 0) / 100)}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-saubio-forest/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">Réservations</p>
                  <p className="text-xl font-semibold text-saubio-forest">{client.totalBookings}</p>
                </div>
                <div className="rounded-2xl border border-saubio-forest/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">Dernière mission</p>
                  <p className="text-sm text-saubio-slate/70">
                    {client.lastBooking ? dateFormatter.format(new Date(client.lastBooking.startAt)) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Skeleton className="h-40 w-full rounded-3xl" />
        )}

        {client ? (
          <div className="flex flex-wrap gap-3">
            {client.status !== 'suspended' ? (
              <PrimaryButton
                variant="outline"
                tone="danger"
                onClick={() => setDialog({ action: 'suspend', open: true })}
                disabled={updateUser.isPending}
              >
                Suspendre le compte
              </PrimaryButton>
            ) : (
              <PrimaryButton
                variant="outline"
                onClick={() => setDialog({ action: 'activate', open: true })}
                disabled={updateUser.isPending}
              >
                Réactiver le compte
              </PrimaryButton>
            )}
          </div>
        ) : null}
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-saubio-forest">
            <MapPin className="h-4 w-4" />
            Adresses sauvegardées
          </div>
          {client ? (
            client.addresses.length > 0 ? (
              <ul className="space-y-3 text-sm text-saubio-slate/80">
                {client.addresses.map((address) => (
                  <li key={address.id} className="rounded-2xl border border-saubio-forest/10 bg-saubio-mist/40 p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">{address.label}</p>
                    <p className="font-semibold text-saubio-forest">{address.streetLine1}</p>
                    {address.streetLine2 ? <p>{address.streetLine2}</p> : null}
                    <p>
                      {address.postalCode} {address.city}
                    </p>
                    <p className="text-xs text-saubio-slate/60">{address.countryCode}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-saubio-mist/60 px-3 py-4 text-sm text-saubio-slate/60">
                Aucune adresse sauvegardée.
              </p>
            )
          ) : (
            <Skeleton className="h-32 w-full rounded-3xl" />
          )}
        </SurfaceCard>

        <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-saubio-forest">
            <CreditCard className="h-4 w-4" />
            Derniers paiements
          </div>
          {client ? (
            client.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-saubio-slate/80">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                      <th className="px-3 py-2 text-left font-semibold">Date</th>
                      <th className="px-3 py-2 text-left font-semibold">Montant</th>
                      <th className="px-3 py-2 text-left font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-saubio-forest/5 last:border-none">
                        <td className="px-3 py-2">{dateFormatter.format(new Date(payment.createdAt))}</td>
                        <td className="px-3 py-2">{currencyFormatter.format(payment.amountCents / 100)}</td>
                        <td className="px-3 py-2 capitalize">{payment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-2xl bg-saubio-mist/60 px-3 py-4 text-sm text-saubio-slate/60">
                Aucun paiement enregistré.
              </p>
            )
          ) : (
            <Skeleton className="h-32 w-full rounded-3xl" />
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/5 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-saubio-forest">
          <Calendar className="h-4 w-4" />
          Réservations récentes
        </div>
        {client ? (
          client.bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-saubio-slate/80">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                    <th className="px-3 py-2 text-left font-semibold">Mission</th>
                    <th className="px-3 py-2 text-left font-semibold">Statut</th>
                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                    <th className="px-3 py-2 text-left font-semibold">Montant</th>
                    <th className="px-3 py-2 text-left font-semibold">Prestataire</th>
                  </tr>
                </thead>
                <tbody>
                  {client.bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-saubio-forest/5 last:border-none">
                      <td className="px-3 py-2 font-semibold text-saubio-forest">{booking.service}</td>
                      <td className="px-3 py-2 capitalize">{booking.status}</td>
                      <td className="px-3 py-2">{dateFormatter.format(new Date(booking.startAt))}</td>
                      <td className="px-3 py-2">{currencyFormatter.format(booking.totalCents / 100)}</td>
                      <td className="px-3 py-2">{booking.providerName ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-2xl bg-saubio-mist/60 px-3 py-4 text-sm text-saubio-slate/60">
              Aucune réservation récente.
            </p>
          )
        ) : (
          <Skeleton className="h-32 w-full rounded-3xl" />
        )}
      </SurfaceCard>

      {dialog?.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft-lg">
            <h2 className="text-lg font-semibold text-saubio-forest">
              {dialog.action === 'suspend' ? 'Suspendre le client' : 'Réactiver le client'}
            </h2>
            <p className="mt-2 text-sm text-saubio-slate/70">
              Cette action mettra à jour immédiatement le statut du compte. Un email peut être envoyé automatiquement.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded-full border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-slate/70"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(dialog.action === 'suspend' ? 'suspended' : 'active')}
                disabled={updateUser.isPending}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition focus:outline-none ${
                  dialog.action === 'suspend'
                    ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-400'
                    : 'bg-saubio-forest hover:bg-saubio-moss focus:ring-2 focus:ring-saubio-forest/60'
                } ${updateUser.isPending ? 'opacity-60' : ''}`}
              >
                {updateUser.isPending ? 'Veuillez patienter…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessToast open={Boolean(toastMessage)} message={toastMessage ?? undefined} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
