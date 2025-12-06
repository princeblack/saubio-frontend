'use client';

import { SectionContainer, SectionHeading, SectionTitle } from '@saubio/ui';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Send, MapPin } from 'lucide-react';

const stepConfig = [
  { icon: MapPin, titleKey: 'how.steps.plan.title', bodyKey: 'how.steps.plan.body' },
  { icon: CalendarCheck, titleKey: 'how.steps.match.title', bodyKey: 'how.steps.match.body' },
  { icon: Send, titleKey: 'how.steps.relax.title', bodyKey: 'how.steps.relax.body' },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white" id="how-it-works">
      <div className="text-center">
        <SectionHeading>{t('how.heading', 'So funktioniert Saubio')}</SectionHeading>
        <SectionTitle align="center">{t('how.title', 'So einfach geht’s')}</SectionTitle>
        <p className="mt-4 text-sm text-saubio-slate/80">
          {t('how.description', 'In drei Schritten zur passenden Reinigung: Anfrage stellen, Matching bestätigen, entspannen.')} 
        </p>
      </div>
      <div className="mt-10 grid gap-10 sm:grid-cols-3">
        {stepConfig.map(({ icon: Icon, titleKey, bodyKey }) => (
          <div key={titleKey} className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-saubio-cream">
              <Icon className="h-10 w-10 text-saubio-forest" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-saubio-forest">{t(titleKey)}</h3>
            <p className="mt-3 text-sm text-saubio-slate/80">{t(bodyKey)}</p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
