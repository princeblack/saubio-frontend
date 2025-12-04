'use client';

import {
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
} from '@saubio/ui';
import { useTranslation } from 'react-i18next';

export function ServiceGrid() {
  const { t } = useTranslation();
  const services = t('services.items', { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  return (
    <SectionContainer
      as="section"
      padding="spacious"
      aria-labelledby="services-title"
      className="rounded-5xl bg-saubio-cream"
    >
      <div className="mb-12 space-y-4 text-center">
        <SectionHeading>{t('services.heading')}</SectionHeading>
        <SectionTitle id="services-title" align="center">
          {t('services.title')}
        </SectionTitle>
        <SectionDescription align="center">{t('services.description')}</SectionDescription>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.title}
            className="relative flex h-full flex-col rounded-4xl border border-saubio-moss/15 bg-white p-6 text-left shadow-soft-lg transition-transform hover:-translate-y-1"
          >
            <span className="mb-4 inline-flex rounded-full bg-saubio-mist px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-saubio-moss">
              {t('services.badge')}
            </span>
            <h3 className="text-xl font-semibold text-saubio-forest">{service.title}</h3>
            <p className="mt-3 text-sm text-saubio-slate/80">{service.description}</p>
            <div className="mt-auto pt-6 text-sm font-semibold text-saubio-forest">
              {t('services.cta')}
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
