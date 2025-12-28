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
import Link from 'next/link';

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

export default function ProviderIdentityVerificationPage() {
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
  const identityStatus = (profileQuery.data?.identityVerificationStatus ?? 'not_started').toLowerCase();

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

  const identityStatusTone =
    identityStatus === 'verified'
      ? 'bg-emerald-100 text-emerald-800'
      : identityStatus === 'rejected'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-800';

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <SectionTitle as="h1" size="large">
            {t('providerIdentityPage.title', 'Vérifiez votre identité')}
          </SectionTitle>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${identityStatusTone}`}>
            {t(`providerProfilePage.identity.status.${identityStatus}`, identityStatus)}
          </span>
        </div>
        <p className="text-sm text-saubio-slate/70">
          {t(
            'providerIdentityPage.subtitle',
            'Téléversez vos pièces officielles. Un membre de l’équipe confirmera votre identité sous 24-48h.'
          )}
        </p>
        <p className="text-xs text-saubio-slate/60">
          {t('providerIdentityPage.summary.documents', '{{count}} document(s) envoyés', {
            count: identityDocuments.length,
          })}
        </p>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-5 border border-saubio-mist/60">
        {identityDocuments.length ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saubio-slate/50">
              {t('providerIdentityPage.sentDocuments', 'Documents envoyés')}
            </p>
            <ul className="space-y-1 text-xs text-saubio-slate/70">
              {identityDocuments.slice(0, 5).map((doc) => (
                <li
                  key={doc.id}
                  className="flex justify-between gap-4 rounded-2xl border border-saubio-mist/60 px-3 py-2"
                >
                  <span className="font-semibold">{doc.name ?? 'Document'}</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
            {identityDocuments.length > 5 ? (
              <p className="text-[11px] text-saubio-slate/50">
                {t('providerIdentityPage.moreDocuments', '+{{count}} autres documents', {
                  count: identityDocuments.length - 5,
                })}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-saubio-slate/60">
            {t('providerIdentityPage.noDocuments', 'Aucun document envoyé pour le moment.')}
          </p>
        )}
        <div className="rounded-3xl border border-saubio-mist/60 p-5 text-sm text-saubio-slate/70">
          <div className="mb-3 flex items-center gap-2 text-saubio-forest">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-sm font-semibold">
              {t('providerIdentityPage.requirements.title', 'Conseils pour une validation rapide')}
            </p>
          </div>
          <ul className="list-disc space-y-1 pl-5">
            <li>{t('providerIdentityPage.requirements.format', 'Formats acceptés : JPG, PNG ou PDF (max. 5 Mo).')}</li>
            <li>{t('providerIdentityPage.requirements.quality', 'Prenez une photo nette, sans reflet ni doigt.')}</li>
            <li>{t('providerIdentityPage.requirements.sides', 'Ajoutez le recto, le verso et un selfie pour valider plus vite.')}</li>
          </ul>
        </div>
      </SurfaceCard>

      <SurfaceCard variant="soft" padding="lg" className="space-y-6">
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
                <span className="text-xs text-saubio-slate/60">{(selectedFile.size / 1024).toFixed(0)} KB</span>
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
            <input type="file" accept="image/*,.pdf" className="sr-only" onChange={handleFileChange} />
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
              className="inline-flex items-center justify-center rounded-full border border-saubio-forest/30 px-6 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest"
            >
              {t('providerIdentityPage.upload.reset', 'Réinitialiser')}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            {t('providerIdentityPage.alert.title', 'Besoin d’aide ?')}
          </div>
          <p>
            {t(
              'providerIdentityPage.alert.description',
              'En cas de difficulté ou pour accélérer la validation, envoyez vos documents à onboarding@saubio.io.'
            )}
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs text-amber-900/80">
            <FileText className="h-4 w-4" />
            <Link href="/prestataire/ressources" className="underline">
              {t('providerIdentityPage.alert.resources', 'Consulter le centre d’aide')}
            </Link>
          </p>
        </div>
      </SurfaceCard>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('INVALID_FILE'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
