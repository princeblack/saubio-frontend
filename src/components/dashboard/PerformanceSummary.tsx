'use client';

import { SurfaceCard, Stack } from '@saubio/ui';

export interface PerformanceMetric {
  label: string;
  value: number;
  target?: number;
  unit?: string;
}

interface PerformanceSummaryProps {
  title: string;
  metrics: PerformanceMetric[];
}

export function PerformanceSummary({ title, metrics }: PerformanceSummaryProps) {
  return (
    <SurfaceCard className="h-full" padding="md" variant="cream">
      <Stack direction="row" justify="between" align="center" className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-saubio-slate/50">
          {title}
        </h3>
      </Stack>
      <div className="space-y-4">
        {metrics.map((metric) => {
          const target = metric.target ?? 100;
          const percentage = Math.min(Math.round((metric.value / target) * 100), 100);

          return (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-saubio-slate/70">
                <span className="font-semibold uppercase tracking-[0.2em] text-saubio-slate/60">
                  {metric.label}
                </span>
                <span className="font-semibold text-saubio-forest">
                  {metric.value}
                  {metric.unit ?? ''}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-saubio-forest transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
