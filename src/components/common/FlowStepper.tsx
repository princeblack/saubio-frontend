import { ReactNode } from 'react';
import { SurfaceCard } from '@saubio/ui';

export type FlowStepperStep<T extends string> = {
  id: T;
  label: ReactNode;
  description?: ReactNode;
};

export type FlowStepperProps<T extends string> = {
  steps: FlowStepperStep<T>[];
  activeStepId: T;
  className?: string;
};

export function FlowStepper<T extends string>({ steps, activeStepId, className }: FlowStepperProps<T>) {
  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeStepId));

  return (
    <SurfaceCard padding="none" className={`px-5 py-4 ${className ?? ''}`}>
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {steps.map((step, index) => {
          const status =
            index < activeIndex ? 'completed' : index === activeIndex ? 'current' : 'upcoming';
          const stepNumber = index + 1;
          return (
            <li
              key={step.id}
              className="flex flex-1 items-start gap-3 sm:items-center"
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition
                  ${
                    status === 'completed'
                      ? 'border-saubio-forest bg-saubio-forest text-white'
                      : status === 'current'
                      ? 'border-saubio-forest bg-white text-saubio-forest'
                      : 'border-saubio-forest/30 text-saubio-slate/50'
                  }
                `}
              >
                {stepNumber}
              </span>
              <div className="flex-1 text-sm">
                <p
                  className={`font-semibold ${
                    status === 'completed' || status === 'current'
                      ? 'text-saubio-forest'
                      : 'text-saubio-slate/60'
                  }`}
                >
                  {step.label}
                </p>
                {step.description ? (
                  <p className="text-xs text-saubio-slate/60">{step.description}</p>
                ) : null}
              </div>
              {index < steps.length - 1 ? (
                <div className="hidden h-[1px] flex-1 sm:block">
                  <div
                    className={`h-full w-full border-t ${
                      index < activeIndex ? 'border-saubio-forest' : 'border-saubio-forest/20'
                    }`}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </SurfaceCard>
  );
}
