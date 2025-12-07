'use client';

import { SectionContainer, SectionTitle } from '@saubio/ui';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function CitiesSection() {
  const { t } = useTranslation();
  const defaultCities = useMemo(
    () => [...(t('cities.list', { returnObjects: true }) as string[])],
    [t]
  );
  const markers = t('cities.markers', { returnObjects: true }) as Array<{ top: string; left: string }>;
  const [cities, setCities] = useState(defaultCities);

  useEffect(() => {
    setCities(defaultCities);
    const controller = new AbortController();
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
    const endpoint = base ? `${base}/directory/cities` : '/api/directory/cities';

    fetch(endpoint, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data?.cities) && data.cities.length) {
          setCities(data.cities);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [defaultCities]);

  return (
    <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-saubio-mist/50 lg:flex" id="cities">
      <div className="relative hidden flex-1 lg:block">
        <svg viewBox="0 0 320 360" className="h-full w-full rounded-4xl border border-saubio-forest/10 bg-white p-6 text-saubio-forest/40">
          <path
            d="M165 30L185 48L210 50L225 75L215 100L230 125L215 150L230 185L215 215L225 250L210 278L225 305L205 330L175 318L150 335L130 320L110 330L95 300L105 270L90 235L100 205L90 175L100 140L90 115L105 90L95 60L120 45L140 50Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
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
        <Link href="/villes" className="mt-6 inline-flex text-sm font-semibold text-saubio-forest">
          {t('cities.link')}
        </Link>
      </div>
    </SectionContainer>
  );
}
