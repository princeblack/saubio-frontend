'use client';

import { SurfaceCard } from '@saubio/ui';
import { Loader2 } from 'lucide-react';
import {
  formatDateTime,
  useAdminNotificationTemplates,
} from '@saubio/utils';

const statusLabel = (status: string) => {
  switch (status) {
    case 'active':
    case 'published':
      return { label: 'Publié', tone: 'bg-emerald-50 text-emerald-900' };
    case 'disabled':
      return { label: 'Désactivé', tone: 'bg-saubio-slate/10 text-saubio-slate/70' };
    default:
      return { label: 'Brouillon', tone: 'bg-saubio-sun/10 text-saubio-sun/80' };
  }
};

export default function AdminCmsEmailPage() {
  const templatesQuery = useAdminNotificationTemplates();
  const templates = templatesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">CMS & pages</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Templates email</h1>
        <p className="text-sm text-saubio-slate/70">
          Transactionnels, marketing et notifications prestataires issus directement du module Notifications.
        </p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between text-xs text-saubio-slate/70">
          <p>Variables utilisables : {'{{firstname}}'}, {'{{booking.startAt}}'}, {'{{provider.name}}'}…</p>
          <a
            href="/admin/automation/templates"
            className="rounded-full border border-saubio-forest/20 px-4 py-1.5 font-semibold text-saubio-forest"
          >
            Créer / éditer
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Canaux actifs</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Dernière MAJ</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templatesQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-saubio-slate/60">
                    Aucun template enregistré.
                  </td>
                </tr>
              ) : (
                templates.map((template) => {
                  const tone = statusLabel(template.status.toLowerCase());
                  return (
                    <tr key={template.id} className="border-b border-saubio-forest/5 last-border-none">
                      <td className="px-3 py-2 font-semibold text-saubio-forest">
                        {template.name}
                        <span className="block text-xs text-saubio-slate/60">{template.description ?? template.key}</span>
                      </td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">
                        {template.activeChannels.length > 0 ? template.activeChannels.join(', ') : 'Aucun canal'}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.tone}`}>{tone.label}</span>
                      </td>
                      <td className="px-3 py-2 text-xs text-saubio-slate/60">{formatDateTime(template.updatedAt)}</td>
                      <td className="px-3 py-2 text-saubio-forest underline">Modifier</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
