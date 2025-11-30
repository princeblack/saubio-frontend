'use client';

import { IconBadge } from '@saubio/ui';
import type { ReactNode } from 'react';

type Trend = {
  value: number;
  label: string;
};

export interface MetricCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: 'forest' | 'sun' | 'mist';
  trend?: Trend;
}

export function MetricCard({ label, value, icon, tone = 'forest', trend }: MetricCardProps) {
  const trendColor = trend
    ? trend.value >= 0
      ? 'text-emerald-600'
      : 'text-red-500'
    : undefined;
  const formattedTrend = trend
    ? `${trend.value > 0 ? '+' : ''}${trend.value.toFixed(1)}%`
    : undefined;

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-saubio-forest/10 bg-white p-6 shadow-soft-lg">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-saubio-slate/50">
          {label}
        </span>
        {icon ? <IconBadge tone={tone} size="sm">{icon}</IconBadge> : null}
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <span className="text-3xl font-semibold text-saubio-forest">{value}</span>
        {trend ? (
          <div className="flex flex-col items-end text-xs">
            <span className={`font-semibold ${trendColor}`}>{formattedTrend}</span>
            <span className="text-saubio-slate/60">{trend.label}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
