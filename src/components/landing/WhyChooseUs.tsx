'use client';

import { SectionContainer, SectionHeading, SectionTitle } from '@saubio/ui';
import { useTranslation } from 'react-i18next';

export function WhyChooseUs() {
  const { t } = useTranslation();
  const reasons = t('why.reasons', { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  return (
    <SectionContainer as="section" padding="spacious" aria-labelledby="why-choose-us">
      <div className="mb-12 text-center space-y-4">
        <SectionHeading>{t('why.heading')}</SectionHeading>
        <SectionTitle id="why-choose-us" align="center">
          {t('why.title')}
        </SectionTitle>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {reasons.map((reason) => (
          <div
            key={reason.title}
            className="space-y-3 rounded-4xl border border-saubio-moss/15 bg-white p-6 text-left shadow-soft-lg"
          >
            <h3 className="text-lg font-semibold text-saubio-forest">{reason.title}</h3>
            <p className="text-sm text-saubio-slate/80">{reason.description}</p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
