'use client';

import type { Metadata } from 'next';
import { SectionContainer, SectionDescription, SectionHeading, SectionTitle } from '@saubio/ui';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { useTranslation } from 'react-i18next';

export const metadata: Metadata = {
  title: 'Saubio – Services de nettoyage',
  description: 'Découvrez les offres résidentielles, professionnelles et spécialisées proposées par Saubio.',
};

export default function ServicesPage() {
  const { t } = useTranslation();
  const offerings = t('pages.services.offerings', {
    returnObjects: true,
  }) as Array<{ title: string; details: string[] }>;

  return (
    <>
      <SiteHeader />
      <main className="space-y-12 py-16">
        <SectionContainer as="section" padding="spacious" className="rounded-5xl bg-white shadow-soft-lg">
          <SectionHeading>{t('pages.services.heading')}</SectionHeading>
          <SectionTitle size="large">{t('pages.services.title')}</SectionTitle>
          <SectionDescription className="max-w-2xl">
            {t('pages.services.description')}
          </SectionDescription>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {offerings.map((offer) => (
              <article
                key={offer.title}
                className="rounded-4xl border border-saubio-moss/15 bg-saubio-cream/50 p-6 text-sm text-saubio-slate"
              >
                <h3 className="text-base font-semibold text-saubio-forest">{offer.title}</h3>
                <ul className="mt-4 space-y-2">
                  {offer.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </SectionContainer>
      </main>
      <SiteFooter />
    </>
  );
}
