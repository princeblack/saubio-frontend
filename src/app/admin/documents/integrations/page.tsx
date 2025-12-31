'use client';

import { useMemo, useState } from 'react';
import { SurfaceCard } from '@saubio/ui';
import {
  useAdminIdentityDocumentTypes,
  useCreateIdentityDocumentTypeMutation,
  useUpdateIdentityDocumentTypeMutation,
  useDeleteIdentityDocumentTypeMutation,
} from '@saubio/utils';

const emptyForm = {
  code: '',
  labelFr: '',
  labelEn: '',
  labelDe: '',
  description: '',
  requiredFiles: 1,
  isRequired: true,
  countries: '',
};

export default function AdminIdentityDocumentTypesPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);

  const documentTypesQuery = useAdminIdentityDocumentTypes({ includeArchived });
  const createMutation = useCreateIdentityDocumentTypeMutation();
  const updateMutation = useUpdateIdentityDocumentTypeMutation();
  const deleteMutation = useDeleteIdentityDocumentTypeMutation();

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      code: form.code.trim().toLowerCase(),
      labelFr: form.labelFr.trim(),
      labelEn: form.labelEn.trim() || undefined,
      labelDe: form.labelDe.trim() || undefined,
      description: form.description.trim() || undefined,
      requiredFiles: Number(form.requiredFiles),
      isRequired: form.isRequired,
      applicableCountries: form.countries
        ? form.countries
            .split(',')
            .map((country) => country.trim().toUpperCase())
            .filter(Boolean)
        : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const type = documentTypesQuery.data?.find((entry) => entry.id === id);
    if (!type) return;
    setForm({
      code: type.code,
      labelFr: type.label.fr,
      labelEn: type.label.en ?? '',
      labelDe: type.label.de ?? '',
      description: type.description ?? '',
      requiredFiles: type.requiredFiles,
      isRequired: type.isRequired,
      countries: (type.applicableCountries ?? []).join(', '),
    });
    setEditingId(type.id);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const list = useMemo(() => documentTypesQuery.data ?? [], [documentTypesQuery.data]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Documents & identité</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Types de documents</h1>
        <p className="text-sm text-saubio-slate/70">Gérez les pièces acceptées côté prestataires et précisez les exigences.</p>
      </header>

      <SurfaceCard className="space-y-4 rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Code technique</span>
            <input
              type="text"
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              placeholder="ex: residence_permit"
              required={!editingId}
              disabled={Boolean(editingId)}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Libellé (FR)</span>
            <input
              type="text"
              value={form.labelFr}
              onChange={(event) => setForm((prev) => ({ ...prev, labelFr: event.target.value }))}
              required
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Libellé (EN)</span>
            <input
              type="text"
              value={form.labelEn}
              onChange={(event) => setForm((prev) => ({ ...prev, labelEn: event.target.value }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Libellé (DE)</span>
            <input
              type="text"
              value={form.labelDe}
              onChange={(event) => setForm((prev) => ({ ...prev, labelDe: event.target.value }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70 md:col-span-2">
            <span className="mb-1 block">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
              rows={2}
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <span className="mb-1 block">Fichiers requis</span>
            <select
              value={form.requiredFiles}
              onChange={(event) => setForm((prev) => ({ ...prev, requiredFiles: Number(event.target.value) }))}
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            >
              <option value={1}>1 fichier</option>
              <option value={2}>Recto / verso</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-saubio-slate/70">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(event) => setForm((prev) => ({ ...prev, isRequired: event.target.checked }))}
              className="h-4 w-4 rounded border-saubio-mist/70"
            />
            Obligatoire pour l’onboarding
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/70 md:col-span-2">
            <span className="mb-1 block">Pays concernés (codes ISO, séparés par des virgules)</span>
            <input
              type="text"
              value={form.countries}
              onChange={(event) => setForm((prev) => ({ ...prev, countries: event.target.value }))}
              placeholder="FR, DE, AT"
              className="w-full rounded-2xl border border-saubio-mist/70 px-3 py-2 text-sm"
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-saubio-forest px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {editingId ? 'Mettre à jour' : 'Ajouter le type'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-saubio-forest/30 px-6 py-2 text-sm font-semibold text-saubio-forest"
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between text-sm">
          <p className="font-semibold text-saubio-forest">Catalogue des pièces acceptées</p>
          <label className="flex items-center gap-2 text-xs text-saubio-slate/70">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(event) => setIncludeArchived(event.target.checked)}
              className="h-4 w-4 rounded border-saubio-mist/70"
            />
            Inclure les types archivés
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Code</th>
                <th className="px-3 py-2 text-left font-semibold">Libellé</th>
                <th className="px-3 py-2 text-left font-semibold">Requis</th>
                <th className="px-3 py-2 text-left font-semibold">Pays</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documentTypesQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={6}>
                    Chargement…
                  </td>
                </tr>
              ) : list.length ? (
                list.map((doc) => (
                  <tr key={doc.id} className="border-b border-saubio-forest/5 last-border-none">
                    <td className="px-3 py-2 font-semibold text-saubio-forest">{doc.code}</td>
                    <td className="px-3 py-2">{doc.label.fr}</td>
                    <td className="px-3 py-2">{doc.isRequired ? `${doc.requiredFiles} fichier(s)` : 'Optionnel'}</td>
                    <td className="px-3 py-2 text-xs">{doc.applicableCountries.length ? doc.applicableCountries.join(', ') : 'Tous'}</td>
                    <td className="px-3 py-2 text-xs">
                      {doc.isDefault ? 'Défaut' : doc.isActive ? 'Actif' : 'Archivé'}
                    </td>
                    <td className="px-3 py-2 space-x-3">
                      {!doc.isDefault ? (
                        <>
                          <button
                            type="button"
                            className="text-saubio-forest underline"
                            onClick={() => handleEdit(doc.id)}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="text-sm text-red-600 underline"
                            onClick={() =>
                              !deleteMutation.isPending &&
                              window.confirm('Archiver ce type ?') &&
                              deleteMutation.mutate(doc.id)
                            }
                          >
                            Supprimer
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-saubio-slate/60">Géré par défaut</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={6}>
                    Aucun type configuré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
