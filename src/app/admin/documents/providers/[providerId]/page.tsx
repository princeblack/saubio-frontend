'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SurfaceCard } from '@saubio/ui';
import {
  useAdminIdentityVerification,
  useApproveIdentityVerificationMutation,
  useRejectIdentityVerificationMutation,
  useResetIdentityVerificationMutation,
  useMarkIdentityUnderReviewMutation,
} from '@saubio/utils';

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const statusPalette: Record<string, { label: string; classes: string }> = {
  pending: { label: 'En attente', classes: 'bg-amber-50 text-amber-800 border border-amber-100' },
  under_review: { label: 'En revue', classes: 'bg-sky-50 text-sky-800 border border-sky-100' },
  approved: { label: 'Validé', classes: 'bg-emerald-50 text-emerald-800 border border-emerald-100' },
  rejected: { label: 'Rejeté', classes: 'bg-rose-50 text-rose-700 border border-rose-100' },
};

const renderStatusBadge = (status: string) => {
  const key = status.toLowerCase();
  const palette = statusPalette[key] ?? statusPalette.pending;
  return <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${palette.classes}`}>{palette.label}</span>;
};

interface DetailPageProps {
  params: { providerId: string };
}

export default function AdminIdentityDetailPage({ params }: DetailPageProps) {
  const providerId = params.providerId;
  const detailQuery = useAdminIdentityVerification(providerId);
  const approveMutation = useApproveIdentityVerificationMutation();
  const rejectMutation = useRejectIdentityVerificationMutation();
  const resetMutation = useResetIdentityVerificationMutation();
  const underReviewMutation = useMarkIdentityUnderReviewMutation();

  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [resetReason, setResetReason] = useState('');
  const [resetDocumentId, setResetDocumentId] = useState<string>('all');

  const detail = detailQuery.data;
  const timeline = detail?.timeline ?? [];
  const documents = detail?.documents ?? [];

  const isLoading = detailQuery.isLoading;

  const handleApprove = (documentId: string) => {
    approveMutation.mutate({ providerId, documentId, notes: decisionNotes[documentId] });
  };

  const handleReject = (documentId: string) => {
    const reason = rejectReasons[documentId];
    if (!reason) {
      alert('Merci de renseigner un motif de rejet.');
      return;
    }
    rejectMutation.mutate({ providerId, documentId, reason, notes: decisionNotes[documentId] });
  };

  const handleReset = () => {
    if (!resetReason.trim()) {
      alert('Merci de préciser un motif à envoyer au prestataire.');
      return;
    }
    resetMutation.mutate({
      providerId,
      documentId: resetDocumentId === 'all' ? undefined : resetDocumentId,
      reason: resetReason.trim(),
    });
    setResetReason('');
    setResetDocumentId('all');
  };

  const handleUnderReview = (documentId: string) => {
    underReviewMutation.mutate({
      providerId,
      payload: { documentId, notes: decisionNotes[documentId] || undefined },
    });
  };

  const actionDisabled = approveMutation.isPending || rejectMutation.isPending || underReviewMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm text-saubio-slate">
          Chargement du dossier…
        </SurfaceCard>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6">
        <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 text-sm text-saubio-slate">
          Dossier introuvable.
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/admin/documents/providers" className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">
          ← Retour aux vérifications
        </Link>
        <h1 className="text-3xl font-semibold text-saubio-forest">Dossier {detail.provider.name}</h1>
        <p className="text-sm text-saubio-slate/70">Consultez tous les documents envoyés et prenez une décision.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Prestataire</p>
            <p className="text-lg font-semibold text-saubio-forest">{detail.provider.name}</p>
            <p className="text-sm text-saubio-slate/70">{detail.provider.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Statut profil</p>
            <p className="text-lg font-semibold capitalize text-saubio-forest">{detail.provider.status.replace('_', ' ')}</p>
            <p className="text-xs text-saubio-slate/60">
              Vérifié par {detail.provider.reviewer ?? '—'} le {formatDateTime(detail.provider.reviewedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-saubio-slate/60">Commentaire interne</p>
            <p className="text-sm text-saubio-slate/70">{detail.provider.notes ?? '—'}</p>
          </div>
        </div>
      </SurfaceCard>

      <section className="space-y-4">
        {documents.map((doc) => {
          const canMarkUnderReview = doc.status === 'pending' || doc.status === 'under_review';
          const canDecide = doc.status === 'pending' || doc.status === 'under_review';
          return (
            <SurfaceCard key={doc.id} className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-saubio-forest">{doc.documentLabel}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-saubio-slate/60">
                  <span>Envoyé le {formatDateTime(doc.submittedAt)}</span>
                  {renderStatusBadge(doc.status)}
                </div>
                {doc.underReviewBy ? (
                  <p className="text-xs text-saubio-slate/60">
                    En revue par {doc.underReviewBy} depuis {formatDateTime(doc.underReviewAt)}
                    {doc.underReviewNotes ? ` · ${doc.underReviewNotes}` : ''}
                  </p>
                ) : null}
                <p className="text-xs text-saubio-slate/60">Commentaire: {doc.notes ?? '—'}</p>
                <div className="flex gap-3 text-xs">
                  <a href={doc.downloadUrl} target="_blank" rel="noreferrer" className="text-saubio-forest underline">
                    Ouvrir le document
                  </a>
                  <span className="text-saubio-slate/60">Face: {doc.side ?? 'n/a'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 lg:w-64">
                <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
                  <span className="mb-1 block">Notes internes</span>
                  <textarea
                    rows={3}
                    value={decisionNotes[doc.id] ?? ''}
                    onChange={(event) => setDecisionNotes((prev) => ({ ...prev, [doc.id]: event.target.value }))}
                    className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
                  <span className="mb-1 block">Motif de rejet</span>
                  <textarea
                    rows={2}
                    value={rejectReasons[doc.id] ?? ''}
                    onChange={(event) => setRejectReasons((prev) => ({ ...prev, [doc.id]: event.target.value }))}
                    className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
                    placeholder="ex: document illisible"
                  />
                </label>
                <div className="flex flex-col gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => handleUnderReview(doc.id)}
                    disabled={actionDisabled || !canMarkUnderReview}
                    className="rounded-full border border-sky-200 px-4 py-2 font-semibold text-sky-700 disabled:opacity-50"
                  >
                    Marquer en revue
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(doc.id)}
                    disabled={actionDisabled || !canDecide}
                    className="rounded-full bg-saubio-forest px-4 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    Approuver
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(doc.id)}
                    disabled={actionDisabled || !canDecide}
                    className="rounded-full border border-red-200 px-4 py-2 font-semibold text-red-600 disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
              <div className="lg:w-56">
                <div className="overflow-hidden rounded-2xl border border-saubio-mist bg-saubio-mist/20">
                  {doc.mimeType?.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doc.downloadUrl} alt={doc.name} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 p-4 text-center text-xs text-saubio-slate/70">
                      <span>Prévisualisation indisponible.</span>
                      <a href={doc.downloadUrl} target="_blank" rel="noreferrer" className="text-saubio-forest underline">
                        Télécharger
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </SurfaceCard>
          );
        })}
      </section>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="text-sm font-semibold text-saubio-forest">Demander de nouveaux documents</p>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Document ciblé</span>
            <select
              value={resetDocumentId}
              onChange={(event) => setResetDocumentId(event.target.value)}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            >
              <option value="all">Tous les documents</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.documentLabel}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Message au prestataire</span>
            <textarea
              rows={2}
              value={resetReason}
              onChange={(event) => setResetReason(event.target.value)}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
              placeholder="Merci de renvoyer un scan haute qualité du passeport."
            />
            <span className="text-[11px] text-saubio-slate/60">Obligatoire — min. 3 caractères.</span>
          </label>
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={resetMutation.isPending || resetReason.trim().length < 3}
          className="rounded-full border border-saubio-forest/30 px-6 py-2 text-sm font-semibold text-saubio-forest disabled:opacity-50"
        >
          Demander un nouveau document
        </button>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <p className="mb-3 text-sm font-semibold text-saubio-forest">Historique des actions</p>
        <div className="space-y-3">
          {timeline.length ? (
            timeline.map((entry) => (
              <div key={entry.id} className="flex flex-col border-l-2 border-saubio-forest/20 pl-4">
                <p className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                  {formatDateTime(entry.createdAt)}
                </p>
                <p className="text-sm font-semibold text-saubio-forest">{entry.action.replace('_', ' ')}</p>
                <p className="text-xs text-saubio-slate/70">
                  Par {entry.actorLabel ?? 'Système'} · {entry.documentLabel ?? '—'}
                </p>
                <p className="text-xs text-saubio-slate/70">
                  {entry.payload?.reason ?? entry.payload?.notes ?? '—'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-saubio-slate/70">Aucune action enregistrée.</p>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
