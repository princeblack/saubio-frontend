'use client';

import { SectionContainer, SectionHeading, SectionTitle } from '@saubio/ui';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

const steps = [
  {
    titleKey: 'how.steps.plan.title',
    bodyKey: 'how.steps.plan.body',
  },
  {
    titleKey: 'how.steps.match.title',
    bodyKey: 'how.steps.match.body',
  },
  {
    titleKey: 'how.steps.relax.title',
    bodyKey: 'how.steps.relax.body',
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg" id="how-it-works">
      <div className="text-center">
        <SectionHeading>{t('how.heading', 'So funktioniert Saubio')}</SectionHeading>
        <SectionTitle align="center">{t('how.title', 'So einfach geht’s')}</SectionTitle>
        <p className="mt-4 text-sm text-saubio-slate/80">
          {t('how.description', 'In drei Schritten zur passenden Reinigung: Anfrage stellen, Matching bestätigen, entspannen.')} 
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.titleKey} className="flex h-full flex-col gap-4 rounded-4xl border border-saubio-moss/20 bg-saubio-cream/50 p-6 text-left">
            <div className="flex items-center gap-3 text-saubio-forest">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-base font-semibold">{t(step.titleKey)}</h3>
            </div>
            <p className="text-sm text-saubio-slate/80">{t(step.bodyKey)}</p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
