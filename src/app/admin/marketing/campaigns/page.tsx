'use client';

import { SurfaceCard } from '@saubio/ui';
import { Plus } from 'lucide-react';

const CAMPAIGNS = [
  { name: 'Relance paniers abandonnés', type: 'Email', status: 'En cours', target: 'Clients ayant quitté après paiement', open: '45 %', click: '12 %', conv: '5,1 %' },
  { name: 'Push “week-end propre”', type: 'Push', status: 'Programmée', target: 'Clients inactifs 30 j', open: '—', click: '—', conv: '—' },
  { name: 'Campagne parrainage Q1', type: 'Email + In-app', status: 'Terminée', target: 'Clients > 2 missions', open: '52 %', click: '19 %', conv: '7,4 %' },
];

export default function AdminMarketingCampaignsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-saubio-slate/60">Marketing & codes promo</p>
        <h1 className="text-3xl font-semibold text-saubio-forest">Campagnes marketing & push</h1>
        <p className="text-sm text-saubio-slate/70">Configurez des emails, push, relances paniers abandonnés et analysez leurs performances.</p>
      </header>

      <SurfaceCard className="rounded-3xl border border-saubio-forest/10 bg-white/95 p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-saubio-forest">Campagnes actives</p>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-saubio-forest/20 px-4 py-2 text-xs font-semibold text-saubio-forest">
            <Plus className="h-4 w-4" />
            Nouvelle campagne
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-saubio-slate/80">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-saubio-slate/60">
                <th className="px-3 py-2 text-left font-semibold">Nom</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Statut</th>
                <th className="px-3 py-2 text-left font-semibold">Cible</th>
                <th className="px-3 py-2 text-left font-semibold">Ouverture</th>
                <th className="px-3 py-2 text-left font-semibold">Clics</th>
                <th className="px-3 py-2 text-left font-semibold">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((campaign) => (
                <tr key={campaign.name} className="border-b border-saubio-forest/5 last:border-none">
                  <td className="px-3 py-2 font-semibold text-saubio-forest">{campaign.name}</td>
                  <td className="px-3 py-2">{campaign.type}</td>
                  <td className="px-3 py-2">{campaign.status}</td>
                  <td className="px-3 py-2">{campaign.target}</td>
                  <td className="px-3 py-2">{campaign.open}</td>
                  <td className="px-3 py-2">{campaign.click}</td>
                  <td className="px-3 py-2">{campaign.conv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
