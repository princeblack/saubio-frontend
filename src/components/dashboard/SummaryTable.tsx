'use client';

import { SurfaceCard } from '@saubio/ui';

export interface SummaryRow {
  id: string;
  label: string;
  value: string;
  helper?: string;
}

interface SummaryTableProps {
  title: string;
  rows: SummaryRow[];
  emptyLabel?: string;
}

export function SummaryTable({ title, rows, emptyLabel }: SummaryTableProps) {
  return (
    <SurfaceCard padding="md" variant="soft" className="h-full">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
        {title}
      </h3>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/70 p-6 text-center text-sm text-saubio-slate/60">
          {emptyLabel ?? 'Aucune donnée disponible.'}
        </div>
      ) : (
        <ul className="space-y-3 text-sm">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-soft-sm"
            >
              <div className="space-y-1">
                <p className="font-semibold text-saubio-forest">{row.label}</p>
                {row.helper ? (
                  <p className="text-xs text-saubio-slate/60">{row.helper}</p>
                ) : null}
              </div>
              <span className="text-sm font-semibold text-saubio-forest">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}
