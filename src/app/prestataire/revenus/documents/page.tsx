'use client';

import { useTranslation } from 'react-i18next';
import {
  useProviderDocuments,
  useRequireRole,
  formatDateTime,
  downloadDocument,
} from '@saubio/utils';
import { SectionDescription, SectionTitle, SurfaceCard, Skeleton } from '@saubio/ui';
import { ErrorState } from '../../../../components/feedback/ErrorState';

export default function ProviderRevenueDocumentsPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const documentsQuery = useProviderDocuments();

  if (!session.user) {
    return null;
  }

  const handleDocumentDownload = (documentId: string, url: string, name?: string) => {
    void downloadDocument(url, name ?? 'document.pdf').catch((error) => {
      console.error('Saubio::DocumentDownload', documentId, error);
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerRevenue.documentsTitle', 'Relevés & factures')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'providerRevenue.documentsSubtitle',
            'Téléchargez vos relevés de paiements et factures précédentes.'
          )}
        </SectionDescription>
      </header>

      <SurfaceCard variant="soft" padding="md" className="space-y-4 border border-saubio-mist/60">
        {documentsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`doc-skeleton-${index}`} className="h-12 rounded-2xl" />
            ))}
          </div>
        ) : documentsQuery.isError ? (
          <ErrorState
            title={t('providerRevenue.documentsErrorTitle', 'Impossible de charger vos relevés')}
            description={t('providerRevenue.documentsErrorDescription', 'Réessayez dans quelques instants.')}
            onRetry={() => {
              void documentsQuery.refetch();
            }}
          />
        ) : (documentsQuery.data ?? []).length ? (
          <ul className="space-y-3 text-sm text-saubio-slate/80">
            {(documentsQuery.data ?? []).map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-saubio-forest/10 bg-white/80 px-4 py-3 shadow-soft-sm"
              >
                <div>
                  <p className="font-semibold text-saubio-forest">{doc.name}</p>
                  <p className="text-xs text-saubio-slate/60">{formatDateTime(doc.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDocumentDownload(doc.id, doc.url, doc.name)}
                  className="text-xs font-semibold text-saubio-forest underline"
                >
                  {t('providerRevenue.documentsDownload', 'Télécharger')}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-saubio-slate/60">
            {t('providerRevenue.documentsEmpty', 'Vos relevés seront disponibles après votre premier paiement.')}
          </p>
        )}
      </SurfaceCard>
    </div>
  );
}
