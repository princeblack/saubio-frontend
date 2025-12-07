'use client';

import { SectionContainer, SectionTitle } from '@saubio/ui';
import { useTranslation } from 'react-i18next';

export function CitiesSection() {
  const { t } = useTranslation();
  const cities = t('cities.list', { returnObjects: true }) as string[];
  const markers = t('cities.markers', { returnObjects: true }) as Array<{ top: string; left: string }>;

  return (
    <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-saubio-mist/50 lg:flex" id="cities">
      <div className="relative hidden flex-1 lg:block">
        <svg viewBox="0 0 320 360" className="h-full w-full rounded-4xl border border-saubio-forest/10 bg-white p-6 text-saubio-forest/40">
          <path
            d="M150 40C110 50 80 90 85 130C90 165 120 190 110 220C100 255 50 265 60 300C70 330 120 330 150 320C195 305 240 325 265 300C290 275 270 230 290 200C310 170 320 130 300 105C280 75 230 65 200 45C185 35 165 35 150 40Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {markers.map((marker, index) => (
            <circle key={index} cx={marker.left} cy={marker.top} r="6" fill="#0A3D2E" stroke="#FFE28A" strokeWidth="2" />
          ))}
        </svg>
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
