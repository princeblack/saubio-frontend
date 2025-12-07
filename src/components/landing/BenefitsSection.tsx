'use client';

import { SectionContainer, SectionHeading, SectionTitle } from '@saubio/ui';
import { useTranslation } from 'react-i18next';
import { Award, Headphones, ShieldCheck, Users } from 'lucide-react';

const benefits = [
  { icon: Users, titleKey: 'benefits.match.title', bodyKey: 'benefits.match.body' },
  { icon: ShieldCheck, titleKey: 'benefits.insured.title', bodyKey: 'benefits.insured.body' },
  { icon: Award, titleKey: 'benefits.quality.title', bodyKey: 'benefits.quality.body' },
  { icon: Headphones, titleKey: 'benefits.support.title', bodyKey: 'benefits.support.body' },
];

export function BenefitsSection() {
  const { t } = useTranslation();

  return (
    <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white" id="benefits">
      <div className="text-center">
        <SectionHeading>{t('benefits.heading')}</SectionHeading>
        <SectionTitle align="center">{t('benefits.title')}</SectionTitle>
        <p className="mt-4 text-sm text-saubio-slate/80">{t('benefits.description')}</p>
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, titleKey, bodyKey }) => (
          <article key={titleKey} className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-saubio-mist/60">
              <Icon className="h-8 w-8 text-saubio-forest" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-saubio-forest">{t(titleKey)}</h3>
            <p className="mt-3 text-sm text-saubio-slate/80">{t(bodyKey)}</p>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
