'use client';

import { SectionContainer, SectionTitle } from '@saubio/ui';
import { useTranslation } from 'react-i18next';

export function CitiesSection() {
  const { t } = useTranslation();
  const cities = t('cities.list', { returnObjects: true }) as string[];

  return (
    <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-saubio-mist/50 lg:flex" id="cities">
      <div className="flex-1 rounded-4xl bg-white/60 p-6 text-saubio-forest hidden lg:flex items-center justify-center">
        <div className="h-64 w-64 rounded-full border-4 border-saubio-forest/10 flex items-center justify-center">
          <div className="space-y-6 text-center text-sm text-saubio-forest/70">
            <p>{t('cities.mapText')}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 px-0 py-8 lg:px-12">
        <SectionTitle align="left" className="text-saubio-forest">
          {t('cities.title')}
        </SectionTitle>
        <div className="mt-6 grid gap-4 text-sm text-saubio-forest/80 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <span key={city}>• {city}</span>
          ))}
        </div>
        <a href="#" className="mt-6 inline-flex text-sm font-semibold text-saubio-forest">
          {t('cities.link')}
        </a>
      </div>
    </SectionContainer>
  );
}
