'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useRequireRole,
  useProviderProfile,
  useUploadProviderIdentityDocumentMutation,
} from '@saubio/utils';
import { SectionTitle, SurfaceCard, LoadingIndicator } from '@saubio/ui';
import { UploadCloud, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

const DOCUMENT_OPTIONS = [
  { value: 'id_card', label: 'Carte d’identité' },
  { value: 'passport', label: 'Passeport' },
  { value: 'residence_permit', label: 'Titre de séjour' },
] as const;

const SIDE_OPTIONS = [
  { value: 'front', label: 'Recto' },
  { value: 'back', label: 'Verso' },
  { value: 'selfie', label: 'Selfie' },
] as const;

const MAX_INLINE_BYTES = 5_000_000;

export default function ProviderIdentityPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const profileQuery = useProviderProfile();
  const uploadMutation = useUploadProviderIdentityDocumentMutation();

  const [documentType, setDocumentType] = useState<(typeof DOCUMENT_OPTIONS)[number]['value']>('id_card');
  const [side, setSide] = useState<(typeof SIDE_OPTIONS)[number]['value']>('front');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const identityDocuments =
    (profileQuery.data?.documents ?? []).filter((doc) => doc.type === 'identity') ?? [];

  if (!session.user) {
    return null;
  }

  if (profileQuery.isLoading || !profileQuery.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingIndicator tone="dark" size="md" />
      </div>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
    setStatusMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError(t('providerIdentityPage.errors.noFile', 'Veuillez sélectionner un fichier.'));
      return;
    }
    try {
      setError(null);
      setStatusMessage(null);
      const dataUrl = await readFileAsDataUrl(selectedFile);
      if (dataUrl.length > MAX_INLINE_BYTES) {
        setError(
          t(
            'providerIdentityPage.errors.fileTooLarge',
            'Le fichier est trop volumineux. Merci de compresser la photo.'
          )
        );
        return;
      }
      await uploadMutation.mutateAsync({
        documentType,
        side,
        fileData: dataUrl,
        fileName: selectedFile.name,
      });
      setStatusMessage(
        t(
          'providerIdentityPage.success.pendingReview',
          'Document envoyé. Notre équipe vous informera dès validation.'
        )
      );
      setSelectedFile(null);
      void profileQuery.refetch();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('providerIdentityPage.errors.generic', 'Impossible d’envoyer le document.');
      setError(message);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerIdentityPage.title', 'Vérifiez votre identité')}
        </SectionTitle>
        <p className="text-sm text-saubio-slate/70">
          {t(
            'providerIdentityPage.subtitle',
            'Téléversez vos pièces officielles. Un membre de l’équipe confirmera votre identité sous 24-48h.'
          )}
        </p>
      </header>

      <SurfaceCard variant="soft" padding="lg" className="space-y-6">
        <div className="rounded-3xl border border-saubio-mist/60 p-5 text-sm text-saubio-slate/70">
          <ul className="list-disc space-y-1 pl-5">
            <li>{t('providerIdentityPage.requirements.format', 'Formats acceptés : JPG, PNG ou PDF (max. 5 Mo).')}</li>
            <li>{t('providerIdentityPage.requirements.quality', 'Prenez une photo nette, sans reflet ni doigt.')}</li>
            <li>{t('providerIdentityPage.requirements.sides', 'Ajoutez le recto, le verso et un selfie pour valider plus vite.')}</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-saubio-forest/10 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
              <span>{t('providerIdentityPage.form.documentType', 'Type de document')}</span>
              <select
                className="w-full rounded-2xl border border-saubio-mist/70 bg-white px-3 py-2 text-sm text-saubio-slate focus:border-saubio-forest focus:outline-none"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value as typeof documentType)}
              >
                {DOCUMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
              <span>{t('providerIdentityPage.form.side', 'Face')}</span>
              <select
                className="w-full rounded-2xl border border-saubio-mist/70 bg-white px-3 py-2 text-sm text-saubio-slate focus:border-saubio-forest focus:outline-none"
                value={side}
                onChange={(event) => setSide(event.target.value as typeof side)}
              >
                {SIDE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-saubio-mist/80 px-6 py-10 text-center text-sm text-saubio-slate/70 transition hover:border-saubio-forest/60">
            <UploadCloud className="mb-2 h-8 w-8 text-saubio-forest" />
            {selectedFile ? (
              <>
                <span className="font-semibold text-saubio-forest">{selectedFile.name}</span>
                <span className="text-xs text-saubio-slate/60">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold text-saubio-forest">
                  {t('providerIdentityPage.upload.cta', 'Déposez votre document')}
                </span>
                <span className="text-xs text-saubio-slate/60">
                  {t('providerIdentityPage.upload.hint', 'Cliquez pour sélectionner un fichier')}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*,.pdf"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {statusMessage ? <p className="text-sm text-saubio-forest">{statusMessage}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={uploadMutation.isPending || !selectedFile}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-saubio-forest px-6 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-50"
            >
              {uploadMutation.isPending
                ? t('providerIdentityPage.upload.submitting', 'Envoi en cours…')
                : t('providerIdentityPage.upload.submit', 'Envoyer ce document')}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setError(null);
                setStatusMessage(null);
              }}
              className="rounded-full border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest"
            >
              {t('common.cancel', 'Annuler')}
            </button>
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-saubio-forest">
          <ShieldCheck className="h-5 w-5" />
          {t('providerIdentityPage.uploaded.title', 'Documents fournis')}
        </div>
        {identityDocuments.length === 0 ? (
          <p className="text-sm text-saubio-slate/60">
            {t('providerIdentityPage.uploaded.empty', 'Aucun document envoyé pour le moment.')}
          </p>
        ) : (
          <ul className="space-y-3">
            {identityDocuments.map((doc) => {
              const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
              const status = doc.reviewStatus ?? 'submitted';
              const reviewer = doc.reviewerId;
              const notes = doc.reviewNotes;
              return (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-saubio-mist/70 px-4 py-3"
                >
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-saubio-forest">
                      <FileText className="h-4 w-4" />
                      <span>{doc.name ?? 'Document'}</span>
                    </div>
                    <p className="text-xs text-saubio-slate/60">
                      {t('providerIdentityPage.uploaded.meta', '{{type}} • {{date}}', {
                        type: metadata['documentType'] ?? 'ID',
                        date: new Date(doc.uploadedAt).toLocaleDateString(),
                      })}
                    </p>
                    {notes ? <p className="text-xs text-saubio-slate/60">{notes}</p> : null}
                    {reviewer ? (
                      <p className="text-xs text-saubio-slate/60">
                        {t('providerIdentityPage.uploaded.reviewedBy', 'Revu par {{name}}', {
                          name: reviewer,
                        })}
                      </p>
                    ) : null}
                  </div>
                  <span className={getStatusBadgeClasses(status)}>
                    {status === 'approved'
                      ? t('providerIdentityPage.status.verified', 'Validé')
                      : status === 'rejected'
                        ? t('providerIdentityPage.status.rejected', 'Rejeté')
                        : t('providerIdentityPage.status.submitted', 'En attente')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="lg" className="flex items-start gap-3 text-sm text-saubio-slate/70">
        <AlertTriangle className="mt-1 h-5 w-5 text-saubio-gold" />
        <p>
          {t(
            'providerIdentityPage.help',
            'En cas de difficulté ou pour accélérer la validation, envoyez vos documents à onboarding@saubio.io.'
          )}
        </p>
      </SurfaceCard>
    </div>
  );
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('FILE_READ_ERROR'));
    reader.readAsDataURL(file);
  });

function getStatusBadgeClasses(status: string) {
  if (status === 'verified') {
    return 'inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700';
  }
  if (status === 'rejected') {
    return 'inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600';
  }
  return 'inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700';
}
