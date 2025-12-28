'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Plus, Pencil, Power } from 'lucide-react';
import { SurfaceCard, Skeleton } from '@saubio/ui';
import {
  formatEuro,
  useAdminPromoCodes,
  useCreateAdminPromoCode,
  useUpdateAdminPromoCode,
  useToggleAdminPromoCodeStatus,
  useAdminPromoCodeDetail,
} from '@saubio/utils';
import type { AdminPromoCodeDetail, AdminPromoCodeListItem, PromoCodeType } from '@saubio/models';
import type { AdminPromoCodeMutationPayload } from '@saubio/utils';

const STATUS_FILTERS = [
  { label: 'Tous', value: 'all' },
  { label: 'Actifs', value: 'active' },
  { label: 'Inactifs', value: 'inactive' },
  { label: 'Programmés', value: 'scheduled' },
  { label: 'Expirés', value: 'expired' },
] as const;

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString('fr-FR') : '—');

const resolveStatus = (record: AdminPromoCodeListItem) => {
  const now = Date.now();
  const start = record.startsAt ? Date.parse(record.startsAt) : null;
  const end = record.endsAt ? Date.parse(record.endsAt) : null;
  if (!record.isActive) return { label: 'Inactif', tone: 'bg-rose-50 text-rose-700 border-rose-200' };
  if (start && start > now) return { label: 'Programmé', tone: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (end && end < now) return { label: 'Expiré', tone: 'bg-slate-100 text-slate-500 border-slate-200' };
  return { label: 'Actif', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
};

const defaultFormState = {
  code: '',
  description: '',
  type: 'percent' as PromoCodeType,
  fixedAmount: '',
  percentage: '10',
  startsAt: '',
  endsAt: '',
  maxTotalUsages: '',
  maxUsagesPerUser: '',
  minBookingTotal: '',
  applicableServices: '',
  applicablePostalCodes: '',
  isActive: true,
};

const sanitizeEuro = (value: string) => {
  if (!value) return undefined;
  const numeric = Number(value.replace(',', '.'));
  if (Number.isNaN(numeric)) return undefined;
  return Math.round(numeric * 100);
};

const sanitizeInt = (value: string) => {
  if (!value) return undefined;
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) return undefined;
  return Math.max(0, numeric);
};

const splitList = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const extractErrorMessage = (error: unknown) => {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in (error as Record<string, unknown>)) {
    const candidate = (error as { message?: unknown }).message;
    if (typeof candidate === 'string') {
      return candidate;
    }
  }
  return undefined;
};

const buildPayloadFromForm = (state: typeof defaultFormState): AdminPromoCodeMutationPayload => ({
  code: state.code,
  description: state.description || undefined,
  type: state.type,
  fixedAmountCents: state.type === 'fixed' ? sanitizeEuro(state.fixedAmount) ?? undefined : undefined,
  percentage: state.type === 'percent' ? sanitizeInt(state.percentage) ?? undefined : undefined,
  startsAt: state.startsAt || undefined,
  endsAt: state.endsAt || undefined,
  maxTotalUsages: sanitizeInt(state.maxTotalUsages) ?? undefined,
  maxUsagesPerUser: sanitizeInt(state.maxUsagesPerUser) ?? undefined,
  minBookingTotalCents: sanitizeEuro(state.minBookingTotal) ?? undefined,
  applicableServices: splitList(state.applicableServices),
  applicablePostalCodes: splitList(state.applicablePostalCodes),
  isActive: state.isActive,
});

const buildFormStateFromDetail = (detail: AdminPromoCodeDetail) => ({
  code: detail.code,
  description: detail.description ?? '',
  type: detail.type,
  fixedAmount: detail.fixedAmountCents ? (detail.fixedAmountCents / 100).toString() : '',
  percentage: detail.percentage?.toString() ?? '',
  startsAt: detail.startsAt ? detail.startsAt.slice(0, 10) : '',
  endsAt: detail.endsAt ? detail.endsAt.slice(0, 10) : '',
  maxTotalUsages: detail.maxTotalUsages?.toString() ?? '',
  maxUsagesPerUser: detail.maxUsagesPerUser?.toString() ?? '',
  minBookingTotal: detail.minBookingTotalCents ? (detail.minBookingTotalCents / 100).toString() : '',
  applicableServices: (detail.applicableServices ?? []).join(', '),
  applicablePostalCodes: (detail.applicablePostalCodes ?? []).join(', '),
  isActive: detail.isActive ?? true,
});

interface PromoCodeEditorProps {
  mode: 'create' | 'edit';
  promoId?: string;
  onCancel: () => void;
  onSubmit: (payload: AdminPromoCodeMutationPayload, promoId?: string) => void;
  isSubmitting: boolean;
  errorMessage?: string;
}

function PromoCodeEditor({ mode, promoId, onCancel, onSubmit, isSubmitting, errorMessage }: PromoCodeEditorProps) {
  const detailQuery = useAdminPromoCodeDetail(mode === 'edit' ? promoId : undefined);
  const [formState, setFormState] = useState(defaultFormState);

  useEffect(() => {
    if (mode === 'create') {
      setFormState(defaultFormState);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && detailQuery.data) {
      setFormState(buildFormStateFromDetail(detailQuery.data));
    }
  }, [mode, detailQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(buildPayloadFromForm(formState), promoId);
  };

  const form = (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="col-span-2 text-sm font-semibold text-saubio-forest">
            Code promo
            <input
              type="text"
              value={formState.code}
              onChange={(event) => setFormState((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              required
            />
          </label>
          <label className="col-span-2 text-sm font-semibold text-saubio-forest">
            Description (interne)
            <textarea
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              rows={2}
            />
          </label>
          <label className="text-sm font-semibold text-saubio-forest">
            Type
            <select
              value={formState.type}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, type: event.target.value as PromoCodeType }))
              }
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            >
              <option value="percent">Pourcentage</option>
              <option value="fixed">Montant fixe</option>
            </select>
          </label>
          {formState.type === 'fixed' ? (
            <label className="text-sm font-semibold text-saubio-forest">
              Montant (en €)
              <input
                type="number"
                min="0"
                step="0.5"
                value={formState.fixedAmount}
                onChange={(event) => setFormState((prev) => ({ ...prev, fixedAmount: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
                required
              />
            </label>
          ) : (
            <label className="text-sm font-semibold text-saubio-forest">
              Pourcentage (%)
              <input
                type="number"
                min="1"
                max="100"
                value={formState.percentage}
                onChange={(event) => setFormState((prev) => ({ ...prev, percentage: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
                required
              />
            </label>
          )}
          <label className="text-sm font-semibold text-saubio-forest">
            Date de début
            <input
              type="date"
              value={formState.startsAt}
              onChange={(event) => setFormState((prev) => ({ ...prev, startsAt: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold text-saubio-forest">
            Date de fin
            <input
              type="date"
              value={formState.endsAt}
              onChange={(event) => setFormState((prev) => ({ ...prev, endsAt: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold text-saubio-forest">
            Utilisations totales max
            <input
              type="number"
              min="0"
              value={formState.maxTotalUsages}
              onChange={(event) => setFormState((prev) => ({ ...prev, maxTotalUsages: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold text-saubio-forest">
            Utilisations par utilisateur
            <input
              type="number"
              min="0"
              value={formState.maxUsagesPerUser}
              onChange={(event) => setFormState((prev) => ({ ...prev, maxUsagesPerUser: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold text-saubio-forest">
            Panier minimum (en €)
            <input
              type="number"
              min="0"
              step="0.5"
              value={formState.minBookingTotal}
              onChange={(event) => setFormState((prev) => ({ ...prev, minBookingTotal: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
            />
          </label>
          <label className="col-span-2 text-sm font-semibold text-saubio-forest">
            Services applicables (séparés par des virgules)
            <input
              type="text"
              value={formState.applicableServices}
              onChange={(event) => setFormState((prev) => ({ ...prev, applicableServices: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              placeholder="residential, office…"
            />
          </label>
          <label className="col-span-2 text-sm font-semibold text-saubio-forest">
            Codes postaux (séparés par des virgules)
            <input
              type="text"
              value={formState.applicablePostalCodes}
              onChange={(event) => setFormState((prev) => ({ ...prev, applicablePostalCodes: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2"
              placeholder="10115, 10437…"
            />
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm font-semibold text-saubio-forest">
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(event) => setFormState((prev) => ({ ...prev, isActive: event.target.checked }))}
              className="h-4 w-4"
            />
            Code actif
          </label>
          {errorMessage && (
            <p className="col-span-2 text-sm text-rose-600">{errorMessage}</p>
          )}
          <div className="col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl border border-saubio-forest bg-saubio-forest px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-saubio-forest/20 px-6 py-2 text-sm font-semibold text-saubio-forest"
            >
              Annuler
            </button>
          </div>
        </form>
  );

  let content = form;
  if (mode === 'edit') {
    if (detailQuery.isError) {
      const fetchError = detailQuery.error;
      content = (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">Impossible de charger ce code promo.</p>
          <p className="mt-1 text-rose-600/90">
            {fetchError instanceof Error ? fetchError.message : 'Une erreur inattendue est survenue.'}
          </p>
          <button
            type="button"
            className="mt-3 rounded-2xl border border-rose-300 px-3 py-2 font-semibold text-rose-800"
            onClick={() => detailQuery.refetch()}
          >
            Réessayer
          </button>
        </div>
      );
    } else if (detailQuery.isLoading || (promoId && !detailQuery.data)) {
      content = <Skeleton className="h-40 w-full rounded-2xl" />;
    }
  }

  return (
    <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">
            {mode === 'create' ? 'Nouveau code' : 'Modifier le code'}
          </p>
          <h2 className="text-2xl font-semibold text-saubio-forest">
            {mode === 'create' ? 'Créer un code promo' : formState.code || 'Chargement…'}
          </h2>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-saubio-slate/70 underline"
          onClick={onCancel}
        >
          Fermer
        </button>
      </div>
      {content}
    </SurfaceCard>
  );
}

export default function AdminPromoCodesPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]['value']>('all');
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const promoCodesQuery = useAdminPromoCodes({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: appliedSearch || undefined,
    page,
    pageSize,
  });

  const createMutation = useCreateAdminPromoCode();
  const updateMutation = useUpdateAdminPromoCode();
  const toggleMutation = useToggleAdminPromoCodeStatus();

  const [editorState, setEditorState] = useState<{ mode: 'create' | 'edit'; promoId?: string } | null>(null);

  const totalPages = promoCodesQuery.data ? Math.max(Math.ceil(promoCodesQuery.data.total / pageSize), 1) : 1;
  const rows = promoCodesQuery.data?.items ?? [];

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedSearch(searchDraft.trim());
    setPage(1);
  };

  const handleToggle = (record: AdminPromoCodeListItem) => {
    toggleMutation.mutate({ id: record.id, isActive: !record.isActive });
  };

  const handleSubmit = (payload: AdminPromoCodeMutationPayload, promoId?: string) => {
    if (editorState?.mode === 'edit' && promoId) {
      updateMutation.mutate(
        { id: promoId, payload },
        {
          onSuccess: () => setEditorState(null),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setEditorState(null),
      });
    }
  };

  const mutationErrorMessage =
    extractErrorMessage(createMutation.error) ?? extractErrorMessage(updateMutation.error);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Marketing & codes promo</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Gestion des codes promo</h1>
        <p className="text-sm text-saubio-slate/70">Créez, éditez et pilotez les coupons clients (conditions, usage, validité).</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form className="mb-4 flex flex-wrap gap-3" onSubmit={handleSearchSubmit}>
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-saubio-forest/10 bg-saubio-mist px-3">
            <Filter className="h-4 w-4 text-saubio-slate/60" />
            <input
              type="text"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Rechercher un code promo…"
              className="h-11 flex-1 border-none bg-transparent text-sm text-saubio-forest outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest"
          >
            Rechercher
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/10 bg-saubio-forest px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setEditorState({ mode: 'create' })}
          >
            <Plus className="h-4 w-4" />
            Créer un code
          </button>
        </form>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Statut</p>
            <select
              className="mt-1 w-full rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as (typeof STATUS_FILTERS)[number]['value']);
                setPage(1);
              }}
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Recherche appliquée</p>
            <p className="rounded-2xl border border-saubio-forest/10 px-3 py-2 text-sm text-saubio-slate/70">
              {appliedSearch || '—'}
            </p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Code</th>
                <th className="px-3 py-2 text-left font-semibold">Valeur</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Utilisations</th>
                <th className="px-3 py-2 text-left font-semibold">Validité</th>
                <th className="px-3 py-2 text-left font-semibold">Dernier usage</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodesQuery.isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={`promo-skeleton-${index}`} className="border-b border-saubio-forest/5">
                      <td colSpan={7} className="px-3 py-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : rows.length === 0
                  ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-saubio-slate/60">
                          Aucun code pour vos filtres.
                        </td>
                      </tr>
                    )
                  : (
                      rows.map((code) => {
                        const status = resolveStatus(code);
                        const value =
                          code.type === 'fixed'
                            ? formatEuro((code.valueCents ?? 0) / 100)
                            : `${code.valuePercent ?? 0} %`;
                        return (
                          <tr key={code.id} className="border-b border-saubio-forest/5 last:border-none">
                            <td className="px-3 py-2 font-semibold text-saubio-forest">{code.code}</td>
                            <td className="px-3 py-2">{value}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {code.usageCount}
                              {code.maxTotalUsages ? ` / ${code.maxTotalUsages}` : ''}
                            </td>
                            <td className="px-3 py-2 text-saubio-slate/60">
                              {formatDate(code.startsAt)} → {formatDate(code.endsAt)}
                            </td>
                            <td className="px-3 py-2 text-saubio-slate/60">{formatDate(code.lastUsedAt)}</td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-2xl border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest"
                                  onClick={() => setEditorState({ mode: 'edit', promoId: code.id })}
                                >
                                  <Pencil className="h-3.5 w-3.5" /> Modifier
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggle(code)}
                                  disabled={toggleMutation.isPending}
                                  className="inline-flex items-center gap-1 rounded-2xl border border-saubio-forest/20 px-3 py-1 text-xs font-semibold text-saubio-forest disabled:opacity-50"
                                >
                                  <Power className="h-3.5 w-3.5" /> {code.isActive ? 'Suspendre' : 'Activer'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-saubio-slate/60">
            {promoCodesQuery.data ? `${promoCodesQuery.data.items.length} résultat(s) sur ${promoCodesQuery.data.total}` : '—'}
          </p>
          <div className="flex items-center gap-3">
            <button
              className="rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Précédent
            </button>
            <span className="text-sm text-saubio-slate/70">
              Page {page} / {totalPages}
            </span>
            <button
              className="rounded-2xl border border-saubio-forest/20 px-4 py-2 text-sm font-semibold text-saubio-forest"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Suivant
            </button>
          </div>
        </div>
      </SurfaceCard>

      {editorState && (
        <PromoCodeEditor
          mode={editorState.mode}
          promoId={editorState.promoId}
          onCancel={() => setEditorState(null)}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          errorMessage={mutationErrorMessage}
        />
      )}
    </div>
  );
}
