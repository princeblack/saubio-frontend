'use client';
import { SectionContainer, SectionHeading, SectionTitle } from '@saubio/ui';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

function groupCities(cities: string[]): Record<string, string[]> {
  return cities.reduce<Record<string, string[]>>((map, city) => {
    const key = city.charAt(0).toUpperCase();
    map[key] = map[key] ? [...map[key], city] : [city];
    return map;
  }, {});
}

export default function AllCitiesPage() {
  const { t } = useTranslation();
  const fallback = useMemo(() => t('cities.list', { returnObjects: true }) as string[], [t]);
  const [cities, setCities] = useState(fallback);

  useEffect(() => {
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
  }, [fallback]);

  const grouped = groupCities(cities);
  const alphabet = Object.keys(grouped).sort();

  return (
    <SectionContainer as="section" padding="spacious" className="pb-16 space-y-6">
      <div className="text-center">
        <SectionHeading>{t('cities.headingAll', 'Saubio')}</SectionHeading>
        <SectionTitle align="center">{t('cities.allTitle', 'Toutes les villes disponibles')}</SectionTitle>
        <p className="mt-4 text-sm text-saubio-slate/70">{t('cities.descriptionAll', 'Découvrez toutes les villes couvertes par nos équipes et partenaires en Allemagne.')}</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {alphabet.map((letter) => (
          <article key={letter}>
            <h3 className="text-base font-semibold text-saubio-forest">{letter}</h3>
            <ul className="mt-3 space-y-1 text-sm text-saubio-slate/80">
              {grouped[letter].map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="text-center">
        <Link href="/" className="text-sm font-semibold text-saubio-forest">
          {t('cities.backHome', 'Retour à l’accueil')}
        </Link>
      </div>
    </SectionContainer>
  );
}
