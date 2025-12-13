'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ServiceCategory } from '@saubio/models';
import {
  useProviderServiceCatalog,
  useUpdateProviderServiceCatalogMutation,
  useRequireRole,
} from '@saubio/utils';
import {
  SectionDescription,
  SectionTitle,
  SurfaceCard,
  LoadingIndicator,
} from '@saubio/ui';
import { ErrorState } from '../../../../components/feedback/ErrorState';
import { CheckCircle2, Circle, Info, Search } from 'lucide-react';

export default function ProviderServicesPage() {
  const { t } = useTranslation();
  const session = useRequireRole({ allowedRoles: ['provider', 'employee', 'admin'] });
  const catalogQuery = useProviderServiceCatalog();
  const updateMutation = useUpdateProviderServiceCatalogMutation();
  const [selection, setSelection] = useState<ServiceCategory[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filterTerm, setFilterTerm] = useState('');

  useEffect(() => {
    if (catalogQuery.data) {
      setSelection(catalogQuery.data.selected);
    }
  }, [catalogQuery.data]);

  const serviceTypes = catalogQuery.data?.serviceTypes ?? [];
  const initialSelection = catalogQuery.data?.selected ?? [];

  const localizedServices = useMemo(() => {
    return serviceTypes.map((service) => {
      const label = t(`bookingPlanner.services.${service.id}.label`, service.title);
      const description = t(
        `bookingPlanner.services.${service.id}.description`,
        service.description
      );
      const includedOptions = service.includedOptions.map((option, index) =>
        t(`bookingPlanner.services.${service.id}.included.${index}`, option)
      );
      return {
        ...service,
        label,
        localizedDescription: description,
        localizedOptions: includedOptions,
      };
    });
  }, [serviceTypes, t]);

  const allServiceIds = localizedServices.map((service) => service.id);
  const filteredServices = useMemo(() => {
    if (!filterTerm.trim()) {
      return localizedServices;
    }
    const normalized = filterTerm.trim().toLowerCase();
    return localizedServices.filter((service) =>
      service.label.toLowerCase().includes(normalized)
    );
  }, [filterTerm, localizedServices]);

  const hasAllSelected = allServiceIds.length > 0 && allServiceIds.every((id) => selection.includes(id));

  const normalizedInitial = useMemo(() => initialSelection.slice().sort().join(','), [initialSelection]);
  const normalizedCurrent = useMemo(() => selection.slice().sort().join(','), [selection]);
  const hasChanges = normalizedInitial !== normalizedCurrent;

  const toggleService = (id: ServiceCategory) => {
    setErrorMessage('');
    setSuccessMessage('');
    setSelection((current) =>
      current.includes(id) ? current.filter((service) => service !== id) : [...current, id]
    );
  };

  const handleToggleAll = () => {
    if (hasAllSelected) {
      setSelection([]);
    } else {
      setSelection(allServiceIds);
    }
  };

  const handleSave = () => {
    setErrorMessage('');
    setSuccessMessage('');
    updateMutation.mutate(
      { serviceTypes: selection },
      {
        onSuccess: () => {
          setSuccessMessage(t('providerServicesPage.success', 'Ihre Auswahl wurde gespeichert.'));
        },
        onError: (error) => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : t('system.error.generic', 'Ein Fehler ist aufgetreten.')
          );
        },
      }
    );
  };

  if (!session.user) {
    return null;
  }

  if (catalogQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingIndicator tone="dark" size="md" />
      </div>
    );
  }

  if (catalogQuery.isError || !catalogQuery.data) {
    return (
      <ErrorState
        title={t('system.error.generic', 'Ein Fehler ist aufgetreten.')}
        description={t('system.error.retry', 'Bitte versuchen Sie es später erneut.')}
        onRetry={() => catalogQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <SectionTitle as="h1" size="large">
          {t('providerServicesPage.title', 'Angebotene Services')}
        </SectionTitle>
        <SectionDescription>
          {t(
            'providerServicesPage.subtitle',
            'Wählen Sie aus, welche Reinigungsservices Sie aktuell anbieten. Kund:innen sehen diese Angaben bei der Buchung.'
          )}
        </SectionDescription>
      </header>

      {successMessage ? (
        <div className="rounded-2xl border border-saubio-forest/20 bg-saubio-mist/40 px-4 py-3 text-sm font-semibold text-saubio-forest">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-3xl border border-saubio-forest/10 bg-saubio-mist/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-2 text-sm text-saubio-slate/70 sm:w-auto sm:flex-1">
          <Search className="h-4 w-4 text-saubio-slate/40" aria-hidden="true" />
          <input
            type="search"
            value={filterTerm}
            onChange={(event) => setFilterTerm(event.target.value)}
            placeholder={t('providerServicesPage.filterPlaceholder', 'Filter services')}
            className="w-full border-none bg-transparent text-sm text-saubio-slate/80 outline-none"
            aria-label={t('providerServicesPage.filterLabel', 'Filter services')}
          />
        </label>
        <button
          type="button"
          onClick={handleToggleAll}
          className="inline-flex items-center justify-center rounded-full border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest transition hover:border-saubio-forest/40"
        >
          {hasAllSelected
            ? t('providerServicesPage.unselectAll', 'Unselect all')
            : t('providerServicesPage.selectAll', 'Select all')}
        </button>
      </div>

      {filteredServices.length === 0 ? (
        <div className="rounded-3xl border border-saubio-forest/10 bg-white px-5 py-6 text-center text-sm text-saubio-slate/70">
          {t('providerServicesPage.emptyFiltered', 'No services match your search.')}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
        {filteredServices.map((service) => {
          const isSelected = selection.includes(service.id);
          return (
            <button
              type="button"
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`flex h-full flex-col gap-3 rounded-3xl border px-5 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-saubio-forest ${
                isSelected
                  ? 'border-saubio-forest bg-saubio-forest/5 shadow-soft-lg'
                  : 'border-saubio-forest/15 bg-white hover:border-saubio-forest/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-saubio-forest">{service.label}</p>
                  <p className="text-sm text-saubio-slate/70">{service.localizedDescription}</p>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-saubio-forest" aria-hidden="true" />
                ) : (
                  <Circle className="h-5 w-5 text-saubio-slate/30" aria-hidden="true" />
                )}
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-saubio-slate/70">
                {service.localizedOptions.map((option) => (
                  <li key={`${service.id}-${option}`}>{option}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
      )}

      <SurfaceCard variant="soft" padding="md" className="flex items-start gap-3 border border-saubio-mist/80">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-saubio-forest" />
        <p className="text-sm text-saubio-slate/80">
          {t(
            'providerServicesPage.additionalInfo',
            'Kund:innen können im Freitext zusätzliche Wünsche angeben, die über diese Standardleistungen hinausgehen. Wenn Sie diese Aufgaben übernehmen können, dürfen Sie die entsprechenden Aufträge natürlich annehmen.'
          )}
        </p>
      </SurfaceCard>

      <div className="flex flex-col gap-3 border-t border-saubio-forest/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-saubio-slate/70">
          {t(
            'providerServicesPage.selectionHint',
            'Mindestens ein Service sollte ausgewählt sein, damit passende Anfragen angezeigt werden.'
          )}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
          className="inline-flex items-center justify-center rounded-full bg-saubio-forest px-6 py-2 text-sm font-semibold text-white transition hover:bg-saubio-moss disabled:opacity-50"
        >
          {updateMutation.isPending
            ? t('providerServicesPage.saving', 'Speichern...')
            : t('providerServicesPage.save', 'Auswahl speichern')}
        </button>
      </div>
    </div>
  );
}
