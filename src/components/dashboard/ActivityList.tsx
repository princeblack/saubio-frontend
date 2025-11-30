'use client';

import { SurfaceCard, Stack } from '@saubio/ui';
import type { ReactNode } from 'react';

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  icon?: ReactNode;
  tone?: 'neutral' | 'accent' | 'positive';
}

interface ActivityListProps {
  title: string;
  items: ActivityItem[];
  emptyState?: ReactNode;
}

const toneClasses: Record<'neutral' | 'accent' | 'positive', string> = {
  neutral: 'bg-saubio-mist/30 text-saubio-forest',
  accent: 'bg-saubio-sun/20 text-saubio-forest',
  positive: 'bg-emerald-100 text-emerald-700',
};

export function ActivityList({ title, items, emptyState }: ActivityListProps) {
  return (
    <SurfaceCard variant="soft" padding="md" className="h-full">
      <Stack direction="row" justify="between" align="center" className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {title}
        </h3>
      </Stack>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-saubio-forest/20 bg-white/60 p-6 text-center text-sm text-saubio-slate/60">
          {emptyState ?? 'Aucune donnée disponible pour le moment.'}
        </div>
      ) : (
        <ul className="space-y-3 text-sm text-saubio-slate/80">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-2xl bg-white/80 p-3 shadow-soft-sm"
            >
              <span
                className={`mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  toneClasses[item.tone ?? 'neutral']
                }`}
              >
                {item.icon ?? '•'}
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-saubio-forest">{item.title}</p>
                  {item.meta ? (
                    <span className="text-xs uppercase tracking-widest text-saubio-slate/50">
                      {item.meta}
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="text-xs text-saubio-slate/70">{item.description}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}
