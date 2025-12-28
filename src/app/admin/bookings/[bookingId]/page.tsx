'use client';

import { SurfaceCard, Skeleton } from '@saubio/ui';
import { Calendar, MapPin, Timer, Phone, Mail, AlertTriangle } from 'lucide-react';
import { ErrorState } from '../../../../components/feedback/ErrorState';
import { formatDateTime, useAdminBookingDetails } from '@saubio/utils';
import type { BookingStatus } from '@saubio/models';

const statusTone = (status: BookingStatus) => {
  switch (status) {
    case 'confirmed':
    case 'in_progress':
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending_provider':
    case 'pending_client':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'cancelled':
    case 'disputed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'draft':
    default:
      return 'bg-slate-50 text-saubio-slate border-slate-200';
  }
};

const statusLabel = (status: BookingStatus) => {
  switch (status) {
    case 'pending_provider':
      return 'En attente prestataire';
    case 'pending_client':
      return 'En attente client';
    case 'confirmed':
      return 'Confirmé';
    case 'in_progress':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    case 'cancelled':
      return 'Annulé';
    case 'disputed':
      return 'Litige';
    case 'draft':
    default:
      return 'Brouillon';
  }
};

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const capitalize = (text?: string | null) =>
  text
    ? text
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : '—';

export default function AdminBookingDetailPage({ params }: { params: { bookingId: string } }) {
  const bookingId = params.bookingId;
  const detailQuery = useAdminBookingDetails(bookingId);
  const { data: booking, isLoading, isError, refetch } = detailQuery;

  if (isLoading && !booking) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <ErrorState
        title="Réservation introuvable"
        description="Impossible de charger cette mission. Vérifiez l’identifiant ou réessayez."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">
            Réservation #{booking.id}
          </p>
          <h1 className="text-3xl font-semibold text-saubio-forest">Suivi complet</h1>
          <div className="flex flex-wrap gap-3 text-sm text-saubio-slate/70">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Créée le {formatDateTime(booking.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {booking.shortNotice ? 'Short notice' : 'Planifiée'}
            </span>
          </div>
        </div>
        <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${statusTone(booking.status)}`}>
          {statusLabel(booking.status)}
        </span>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="flex items-center gap-2 text-saubio-forest">
            <MapPin className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.35em]">Adresse</p>
          </div>
          <p className="text-lg font-semibold text-saubio-forest">{booking.address.streetLine1}</p>
          <p className="text-sm text-saubio-slate/70">
            {booking.address.postalCode} {booking.address.city}
          </p>
          {booking.address.accessNotes ? (
            <p className="text-xs text-saubio-slate/60">{booking.address.accessNotes}</p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <div className="flex items-center gap-2 text-saubio-forest">
            <Timer className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.35em]">Créneau</p>
          </div>
          <p className="text-lg font-semibold text-saubio-forest">{formatDateTime(booking.startAt)}</p>
          <p className="text-sm text-saubio-slate/70">Fin prévue {formatDateTime(booking.endAt)}</p>
          <p className="text-xs text-saubio-slate/60">
            {booking.frequency === 'once' ? 'Ponctuelle' : capitalize(booking.frequency)} •{' '}
            {booking.durationHours ? `${booking.durationHours}h` : 'Durée estimée'}
          </p>
        </SurfaceCard>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Client</p>
          <p className="text-lg font-semibold text-saubio-forest">{booking.client.name}</p>
          <p className="text-sm text-saubio-slate/70">{booking.client.email ?? '—'}</p>
          <div className="flex flex-wrap gap-3 text-sm text-saubio-slate/70">
            {booking.client.phone ? (
              <a href={`tel:${booking.client.phone}`} className="inline-flex items-center gap-2 text-saubio-forest underline-offset-4 hover:underline">
                <Phone className="h-4 w-4" />
                {booking.client.phone}
              </a>
            ) : null}
            {booking.client.email ? (
              <a href={`mailto:${booking.client.email}`} className="inline-flex items-center gap-2 text-saubio-forest underline-offset-4 hover:underline">
                <Mail className="h-4 w-4" />
                Envoyer un email
              </a>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Prestataire</p>
          <p className="text-lg font-semibold text-saubio-forest">
            {booking.provider ? booking.provider.name : 'Non assigné'}
          </p>
          <p className="text-sm text-saubio-slate/70">
            {booking.provider?.email ?? (booking.provider ? '—' : 'En attente d’assignation')}
          </p>
        </SurfaceCard>
      </section>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Mission</p>
            <p className="text-lg font-semibold text-saubio-forest">{capitalize(booking.service)}</p>
          </div>
          <span className="rounded-full border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest">
            {booking.ecoPreference === 'bio' ? 'Option Éco +' : 'Standard'}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Notes client</p>
            <p>{booking.notes ?? '—'}</p>
          </div>
          <div className="text-sm text-saubio-slate/70">
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Notes Ops</p>
            <p>{booking.opsNotes ?? '—'}</p>
          </div>
        </div>
      </SurfaceCard>

      <section className="grid gap-4 md:grid-cols-2">
        <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Paiement</p>
          {booking.payment ? (
            <>
              <p className="text-lg font-semibold text-saubio-forest">
                {currencyFormatter.format(booking.payment.amountCents / 100)}
              </p>
              <p className="text-sm text-saubio-slate/70">
                Statut : {booking.payment ? paymentLabel(booking.payment.status) : '—'}
              </p>
              {booking.payment.method ? (
                <p className="text-xs text-saubio-slate/60">Méthode : {booking.payment.method.toUpperCase()}</p>
              ) : null}
              {booking.payment.externalReference ? (
                <p className="text-xs text-saubio-slate/60">Réf. {booking.payment.externalReference}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-saubio-slate/70">Aucun paiement enregistré pour le moment.</p>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Tarification</p>
          <p className="text-lg font-semibold text-saubio-forest">
            Total {currencyFormatter.format(booking.pricing.totalCents / 100)}
          </p>
          <p className="text-xs text-saubio-slate/60">
            Sous-total {currencyFormatter.format(booking.pricing.subtotalCents / 100)} • TVA{' '}
            {currencyFormatter.format(booking.pricing.taxCents / 100)}
          </p>
        </SurfaceCard>
      </section>

      <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Assignments</p>
        {booking.assignments.length === 0 ? (
          <p className="text-sm text-saubio-slate/70">Aucun prestataire confirmé.</p>
        ) : (
          <div className="space-y-3">
            {booking.assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between rounded-2xl border border-saubio-forest/10 bg-saubio-mist/50 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold text-saubio-forest">{assignment.provider.name}</p>
                  <p className="text-xs text-saubio-slate/60">Assigné le {formatDateTime(assignment.assignedAt)}</p>
                </div>
                <span className="text-xs text-saubio-slate/60 uppercase tracking-[0.3em]">
                  {assignment.status === 'confirmed' ? 'Confirmé' : capitalize(assignment.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="space-y-3 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Journal & actions</p>
        {booking.auditLog.length === 0 ? (
          <p className="text-sm text-saubio-slate/70">Aucune action enregistrée.</p>
        ) : (
          <div className="space-y-2 text-sm text-saubio-slate/70">
            {booking.auditLog.map((entry) => (
              <div key={entry.timestamp} className="rounded-2xl border border-saubio-forest/10 bg-saubio-mist/40 px-3 py-2">
                <p className="text-xs text-saubio-slate/60">{formatDateTime(entry.timestamp)}</p>
                <p className="font-semibold text-saubio-forest">{entry.action.toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

const paymentLabel = (status: string) => {
  switch (status) {
    case 'captured':
    case 'released':
      return 'Payé';
    case 'pending':
    case 'requires_action':
    case 'authorized':
    case 'capture_pending':
    case 'held':
      return 'En attente';
    case 'failed':
    case 'disputed':
      return 'Échec';
    case 'refunded':
      return 'Remboursé';
    default:
      return status;
  }
};
